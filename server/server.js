import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");
const EMAIL_LOG_PATH = path.join(__dirname, "simulated_emails.json");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with Credentials (essential for Secure Cookies)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Helper to read JSON DB
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { users: [] };
  }
}

// Helper to write JSON DB
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Helper to log simulated emails (OTP & Password Reset Link)
function logSimulatedEmail(email, subject, body, data) {
  try {
    let logs = [];
    if (fs.existsSync(EMAIL_LOG_PATH)) {
      const existing = fs.readFileSync(EMAIL_LOG_PATH, "utf8");
      logs = JSON.parse(existing);
    }
    const logEntry = {
      timestamp: new Date().toISOString(),
      email,
      subject,
      body,
      data,
    };
    logs.push(logEntry);
    fs.writeFileSync(EMAIL_LOG_PATH, JSON.stringify(logs, null, 2));

    // Also print directly to server console for visibility
    console.log("\n=========================================");
    console.log(`[SIMULATED EMAIL SENT TO: ${email}]`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY: ${body}`);
    console.log("=========================================\n");
  } catch (error) {
    console.error("Error logging simulated email:", error);
  }
}

// Token helpers
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || "freelancer" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
}

// CSRF Protection Middleware
// Checks if the X-CSRF-Token header matches the CSRF cookie value
// We will generate a CSRF token and set it in a cookie during auth handshakes.
function csrfProtection(req, res, next) {
  // GET, HEAD, OPTIONS requests don't modify state, so they are exempt
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies["csrfToken"];
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: "CSRF token validation failed." });
  }
  next();
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access Token is missing." });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Access Token is invalid or expired." });
    }
    req.user = decoded; // Contains id, email, role
    next();
  });
}

// Authorization Middleware
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: Insufficient privileges." });
    }
    next();
  };
}

// CSRF Token Generation endpoint
// Client calls this on page load / startup to obtain a valid CSRF token in a cookie and body
app.get("/api/auth/csrf-token", (req, res) => {
  const csrfToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false, // Must be readable by client JS to send in header (secure enough when paired with httpOnly session/refresh cookies)
    secure: false,   // Set to true in production over HTTPS
    sameSite: "lax",
    maxAge: 3600000, // 1 hour
  });
  
  res.json({ csrfToken });
});

// 1. Sign Up Endpoint (Auth)
app.post("/api/auth/signup", csrfProtection, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const db = readDB();
    const existingUser = db.users.find((u) => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: "User already exists with this email." });
    }

    // PASSWORD HASHING
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate random 4-digit OTP for Email Verification
    const emailOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "freelancer", // Default role
      isEmailVerified: false,
      emailVerificationOtp: emailOtp,
      otpExpiry: Date.now() + 15 * 60 * 1000, // 15 mins
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    // EMAIL VERIFICATION simulation
    logSimulatedEmail(
      newUser.email,
      "Verify Your Greelance Email",
      `Thank you for registering! Your 4-digit OTP code is: ${emailOtp}. It will expire in 15 minutes.`,
      { otp: emailOtp }
    );

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      email: newUser.email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 2. Email Verification Endpoint
app.post("/api/auth/verify-email", csrfProtection, (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.email === email.toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const user = db.users[userIndex];

  if (user.isEmailVerified) {
    return res.status(400).json({ error: "Email is already verified." });
  }

  if (user.emailVerificationOtp !== otp) {
    return res.status(400).json({ error: "Invalid OTP code." });
  }

  if (Date.now() > user.otpExpiry) {
    return res.status(400).json({ error: "OTP code has expired." });
  }

  // Clear OTP and verify email
  user.isEmailVerified = true;
  user.emailVerificationOtp = null;
  user.otpExpiry = null;

  db.users[userIndex] = user;
  writeDB(db);

  res.json({ message: "Email verified successfully. You can now login." });
});

// Resend OTP Endpoint
app.post("/api/auth/resend-otp", csrfProtection, (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.email === email.toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const user = db.users[userIndex];
  const emailOtp = Math.floor(1000 + Math.random() * 9000).toString();
  
  user.emailVerificationOtp = emailOtp;
  user.otpExpiry = Date.now() + 15 * 60 * 1000;
  
  db.users[userIndex] = user;
  writeDB(db);

  logSimulatedEmail(
    user.email,
    "Verify Your Greelance Email (Resend)",
    `Your new 4-digit OTP code is: ${emailOtp}. It will expire in 15 minutes.`,
    { otp: emailOtp }
  );

  res.json({ message: "OTP code has been resent successfully." });
});

// 3. Sign In Endpoint (Session & Cookies & Tokens)
app.post("/api/auth/signin", csrfProtection, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const db = readDB();
    const user = db.users.find((u) => u.email === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Verify Email check
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: "Email is not verified.", code: "EMAIL_NOT_VERIFIED" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Session Management: Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store Refresh Token in secure cookie (HttpOnly)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie (mitigates XSS)
      secure: false,   // In production, set to true to ensure HTTPS only
      sameSite: "lax", // Strict or Lax to help mitigate CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token expiry
    });

    res.json({
      message: "Sign In successful.",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4. Refresh Token Endpoint (Token Expiration & Silent Refresh)
app.post("/api/auth/refresh", (req, res) => {
  const refreshToken = req.cookies["refreshToken"];

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is missing." });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Refresh token is invalid or expired." });
    }

    const db = readDB();
    const user = db.users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(403).json({ error: "User associated with refresh token not found." });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
});

// 5. Sign Out / Logout Endpoint (Clears Session Cookies)
app.post("/api/auth/logout", csrfProtection, (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("csrfToken");
  res.json({ message: "Logged out successfully." });
});

// 6. Request Password Reset Endpoint (Forgot Password)
app.post("/api/auth/forgot-password", csrfProtection, (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.email === email.toLowerCase());

  if (userIndex === -1) {
    // For security, don't reveal that user does not exist. Say we sent a link if it exists.
    return res.json({ message: "If that email exists in our system, a password reset link has been sent." });
  }

  const user = db.users[userIndex];
  
  // Generate Reset Token
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry

  db.users[userIndex] = user;
  writeDB(db);

  // Link format (simulated redirecting back to our frontend)
  const resetLink = `http://localhost:5173/?resetToken=${resetToken}`;

  // Log the simulated email
  logSimulatedEmail(
    user.email,
    "Reset Your Greelance Password",
    `You requested a password reset. Click the following link to reset your password: ${resetLink}. This link is valid for 1 hour.`,
    { resetLink, resetToken }
  );

  res.json({ message: "If that email exists in our system, a password reset link has been sent." });
});

// 7. Reset Password Action Endpoint
app.post("/api/auth/reset-password", csrfProtection, async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required." });
  }

  const db = readDB();
  const userIndex = db.users.findIndex(
    (u) => u.resetPasswordToken === resetToken && u.resetPasswordExpiry > Date.now()
  );

  if (userIndex === -1) {
    return res.status(400).json({ error: "Invalid or expired password reset token." });
  }

  const user = db.users[userIndex];

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear reset fields
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;

  db.users[userIndex] = user;
  writeDB(db);

  res.json({ message: "Password has been reset successfully. You can now login with your new password." });
});

// 8. Protected API Endpoint (Authentication & Authorization demonstration)
// Only registered users with valid access tokens can query profile details
app.get("/api/user/profile", authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User details not found." });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    message: `Welcome, you are logged in as a ${user.role}.`
  });
});

// 9. Admin Endpoint (Requires Role: admin)
app.get("/api/admin/users", authenticateToken, requireRole("admin"), (req, res) => {
  const db = readDB();
  // Return metadata about users (exclude passwords)
  const usersList = db.users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    isEmailVerified: u.isEmailVerified,
    createdAt: u.createdAt,
  }));
  res.json({ users: usersList });
});

app.listen(PORT, () => {
  console.log(`Greelance Secure API listening at http://localhost:${PORT}`);
});
