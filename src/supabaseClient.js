import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.trim() !== "" && 
  supabaseKey.trim() !== "";

let supabaseInstance;

if (isSupabaseConfigured) {
  // Real Supabase client initialization
  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase Client configured successfully in REAL mode.");
} else {
  // Mock Supabase Client implementation
  console.log("Supabase Client is NOT configured. Starting in LOCAL MOCK mode.");

  // Helper helpers
  const getUsers = () => JSON.parse(localStorage.getItem("mock_supabase_users") || "[]");
  const saveUsers = (users) => localStorage.setItem("mock_supabase_users", JSON.stringify(users));
  
  const getSession = () => JSON.parse(localStorage.getItem("mock_supabase_session") || "null");
  const saveSession = (session) => {
    if (session) {
      localStorage.setItem("mock_supabase_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("mock_supabase_session");
    }
  };

  const listeners = new Set();
  const triggerAuthEvent = (event, session) => {
    listeners.forEach((callback) => callback(event, session));
  };

  // Mock implementation matching @supabase/supabase-js auth surface
  supabaseInstance = {
    auth: {
      async signUp({ email, password, options = {} }) {
        // Password hashing simulation (basic base64 encode or similar simple check to represent secure transmission)
        const mockHashedPassword = btoa(password); 
        const role = options?.data?.role || "freelancer";
        
        const users = getUsers();
        if (users.find((u) => u.email === email.toLowerCase())) {
          return { data: { user: null, session: null }, error: { message: "User already exists." } };
        }

        // Generate 4 digit OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const newUser = {
          id: Math.random().toString(36).substring(2, 9),
          email: email.toLowerCase(),
          password: mockHashedPassword,
          role,
          isVerified: false,
          otpCode,
          otpExpiry: Date.now() + 15 * 60 * 1000, // 15 mins
        };

        users.push(newUser);
        saveUsers(users);

        // Simulated Email output
        console.log("\n=========================================");
        console.log(`[MOCK SUPABASE EMAIL SENT]`);
        console.log(`To: ${email}`);
        console.log(`Subject: Verify Your Email OTP`);
        console.log(`Your 4-Digit OTP Code: ${otpCode}`);
        console.log("=========================================\n");

        alert(`[MOCK EMAIL] OTP sent to ${email}. Check your browser developer console for the 4-digit code!`);

        return {
          data: {
            user: { id: newUser.id, email: newUser.email, user_metadata: { role } },
            session: null
          },
          error: null
        };
      },

      async verifyOtp({ email, token, type }) {
        const users = getUsers();
        const userIndex = users.findIndex((u) => u.email === email.toLowerCase());

        if (userIndex === -1) {
          return { data: { session: null, user: null }, error: { message: "User not found." } };
        }

        const user = users[userIndex];
        if (user.otpCode !== token) {
          return { data: { session: null, user: null }, error: { message: "Invalid verification code." } };
        }

        if (Date.now() > user.otpExpiry) {
          return { data: { session: null, user: null }, error: { message: "Verification code has expired." } };
        }

        // Verify user
        user.isVerified = true;
        user.otpCode = null;
        user.otpExpiry = null;
        users[userIndex] = user;
        saveUsers(users);

        // Generate session
        const session = {
          access_token: `mock_jwt_access_token_${Math.random().toString(36).substring(2)}`,
          refresh_token: `mock_jwt_refresh_token_${Math.random().toString(36).substring(2)}`,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { role: user.role }
          }
        };

        saveSession(session);
        triggerAuthEvent("SIGNED_IN", session);

        return { data: { session, user: session.user }, error: null };
      },

      async signInWithPassword({ email, password }) {
        const users = getUsers();
        const user = users.find((u) => u.email === email.toLowerCase());

        if (!user) {
          return { data: { session: null, user: null }, error: { message: "Invalid email or password." } };
        }

        if (!user.isVerified) {
          return { data: { session: null, user: null }, error: { message: "Email not verified.", code: "email_not_verified" } };
        }

        const mockHashed = btoa(password);
        if (user.password !== mockHashed) {
          return { data: { session: null, user: null }, error: { message: "Invalid email or password." } };
        }

        const session = {
          access_token: `mock_jwt_access_token_${Math.random().toString(36).substring(2)}`,
          refresh_token: `mock_jwt_refresh_token_${Math.random().toString(36).substring(2)}`,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { role: user.role }
          }
        };

        saveSession(session);
        triggerAuthEvent("SIGNED_IN", session);

        return { data: { session, user: session.user }, error: null };
      },

      async signOut() {
        const currentSession = getSession();
        saveSession(null);
        triggerAuthEvent("SIGNED_OUT", null);
        return { error: null };
      },

      async getSession() {
        const session = getSession();
        return { data: { session }, error: null };
      },

      async getUser() {
        const session = getSession();
        return { data: { user: session ? session.user : null }, error: null };
      },

      onAuthStateChange(callback) {
        listeners.add(callback);
        
        // Return unsubscribe function
        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback);
              }
            }
          }
        };
      },

      async resetPasswordForEmail(email, options = {}) {
        const users = getUsers();
        const user = users.find((u) => u.email === email.toLowerCase());

        if (!user) {
          // Hide account existence
          return { data: {}, error: null };
        }

        const resetToken = Math.random().toString(36).substring(2, 15);
        user.resetToken = resetToken;
        user.resetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        saveUsers(users);

        const resetLink = `${window.location.origin}/?resetToken=${resetToken}`;

        console.log("\n=========================================");
        console.log(`[MOCK SUPABASE EMAIL SENT]`);
        console.log(`To: ${email}`);
        console.log(`Subject: Reset Your Password`);
        console.log(`Reset Password Link: ${resetLink}`);
        console.log("=========================================\n");

        alert(`[MOCK EMAIL] Password Reset Link sent to ${email}. Check your browser developer console for the link!`);

        return { data: {}, error: null };
      },

      async updateUser(attributes) {
        const session = getSession();
        if (!session) {
          return { data: { user: null }, error: { message: "No active session." } };
        }

        if (attributes.password) {
          const users = getUsers();
          const userIndex = users.findIndex((u) => u.id === session.user.id);
          if (userIndex !== -1) {
            users[userIndex].password = btoa(attributes.password);
            users[userIndex].resetToken = null;
            users[userIndex].resetExpiry = null;
            saveUsers(users);
            
            // Log out user on password update in mock
            saveSession(null);
            triggerAuthEvent("SIGNED_OUT", null);
            return { data: { user: session.user }, error: null };
          }
        }
        return { data: { user: session.user }, error: null };
      },

      // Helper mock function to simulate verify reset password token on page load
      verifyMockResetToken(token) {
        const users = getUsers();
        const user = users.find((u) => u.resetToken === token && u.resetExpiry > Date.now());
        if (!user) return null;

        // Auto login with a temporary session that only lets them update password
        const tempSession = {
          access_token: `mock_jwt_reset_token_${token}`,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { role: user.role }
          }
        };
        saveSession(tempSession);
        triggerAuthEvent("SIGNED_IN", tempSession);
        return user;
      }
    }
  };
}

export const supabase = supabaseInstance;
export const isRealSupabase = isSupabaseConfigured;
