import { useState } from "react";
import "./App.css";
import { IMAGES } from "./assets/images";

// 1. Common Button Component for Right Signup Card
function Button({ title, isSelected, onClick }) {
  return (
    <button
      className={`customButton${isSelected ? " selected" : ""}`}
      type="button"
      onClick={onClick}
    >
      <span>{title}</span>
      {isSelected && (
        <span className="check-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="9" fill="white" fillOpacity="0.3"/>
            <path d="M5 9.5L7.5 12L13 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </button>
  );
}

// 6. Left Section Layout containing the AI-generated image
function LeftSection() {
  return (
    <div className="left">
      <div className="left-content-wrapper">
        <img src={IMAGES.hero} className="left-hero-img" alt="Decentralized Talent Network" />
      </div>
    </div>
  );
}

// 7. Social Icons for Right Signup Card
function SocialIcons() {
  return (
    <div className="social">
      <div className="icon linkedIn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </div>
      <div className="icon google">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
      <div className="icon apple">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      </div>
    </div>
  );
}

// 8. Right Section — all elements are direct children of .right
// so their absolute coordinates match Figma (relative to .right, not signupCard)
function RightSection() {
  const [page, setPage] = useState("select"); // "select" | "signup" | "signin" | "otp"
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Input fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const options = ["Freelancer", "Employer", "Agency", "Service Provider", "Affiliate Marketer", "Investor"];

  return (
    <div className="right">
      <div className="right-content-wrapper">
        {/* Logo — absolutely positioned in wrapper */}
        <div className="logo-container">
          <img src={IMAGES.logo} className="logo-img" alt="Greelance Logo" />
        </div>

        {/* White card background box (visual only) */}
        <div className="signupCard"></div>

        {page === "select" ? (
          <>
            {/* Welcome text */}
            <p className="welcome">
              Thanks for your interest in Greelance! Before we get started, how do you want to sign up in Greelance?
            </p>

            {/* Options group */}
            <div className="options-group">
              {options.map((opt) => (
                <Button
                  key={opt}
                  title={opt}
                  isSelected={selectedOption === opt}
                  onClick={() => setSelectedOption(opt)}
                />
              ))}
            </div>

            {/* Next button */}
            <button className="nextButton" onClick={() => setPage("signup")}>Next</button>

            {/* Sign In link */}
            <p className="signin">
              Already have an account?
              <span onClick={() => setPage("signin")}> Sign In</span>
            </p>

            {/* Social sign in text */}
            <p className="socialText">You can also sign in with</p>

            {/* Social icons */}
            <SocialIcons />
          </>
        ) : page === "signup" ? (
          <>
            {/* Create Account Title */}
            <h2 className="signup-title-new">Create Account</h2>

            {/* Email Address */}
            <label className="input-label email-label">Email Address</label>
            <input
              type="email"
              className="input-box email-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <label className="input-label password-label">Password</label>
            <input
              type="password"
              className="input-box password-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Confirm Password */}
            <label className="input-label confirm-label">Confirm Password</label>
            <input
              type="password"
              className="input-box confirm-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Password Validation Note */}
            <p className="validation-note">
              *Password must contain 8 characters, uppercase letters, lower case letters, numbers, symbols
            </p>

            {/* Sign Up Button */}
            <button className="nextButton signup-btn" onClick={() => setPage("otp")}>Sign Up</button>

            {/* Already have an account? Sign In Link */}
            <p className="signin signup-page-signin">
              Already have an account?
              <span onClick={() => setPage("signin")}> Sign In</span>
            </p>

            {/* Social sign in text */}
            <p className="socialText">You can also sign in with</p>

            {/* Social icons */}
            <SocialIcons />
          </>
        ) : page === "otp" ? (
          <div className="page-overlay">
            <h2 className="signup-title">Enter OTP Code</h2>
            <p className="page-subtitle">We have sent a verification code to your email.</p>
            <button className="nextButton page-back-btn" onClick={() => setPage("signup")}>Back</button>
          </div>
        ) : (
          <div className="page-overlay">
            <h2 className="signup-title">Sign In</h2>
            <p className="page-subtitle">Welcome back to Greelance.</p>
            <button className="nextButton page-back-btn" onClick={() => setPage("select")}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

// 9. Main App Component (Landing Page)
export default function App() {
  return (
    <div className="landing">
      <LeftSection />
      <RightSection />
    </div>
  );
}
