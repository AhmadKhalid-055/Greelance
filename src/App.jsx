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
      <div className="icon linkedIn">in</div>
      <div className="icon google">G</div>
      <div className="icon apple">&#63743;</div>
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
