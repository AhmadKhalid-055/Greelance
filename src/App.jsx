import { useState, useEffect, useRef } from "react";
import "./App.css";
import { IMAGES } from "./assets/images";
import { supabase } from "./supabaseClient";

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

function OTPScreen({ onBack, onVerifySuccess, emailToVerify }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(29);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [attempts, setAttempts] = useState(3);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle digit input
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last digit
    setOtp(newOtp);
    // Clear error when user starts typing
    if (otpError) setOtpError(false);
    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace to go to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (!canResend) return;
    try {
      if (typeof supabase.auth.resend === "function") {
        await supabase.auth.resend({
          type: "signup",
          email: emailToVerify
        });
      } else {
        // Fallback for mock client
        alert(`Resending code to ${emailToVerify}...`);
      }
      setTimer(29);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      setOtpError(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle submit — verifies OTP code against Supabase Auth
  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < 4) return; // don't submit incomplete code
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailToVerify,
        token: code,
        type: "signup"
      });

      if (error) {
        setOtpError(true);
        setAttempts((prev) => Math.max(prev - 1, 0));
      } else {
        setOtpError(false);
        setVerified(true);
      }
    } catch (err) {
      setOtpError(true);
    }
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="otp-page">
      {/* Logo — top-left */}
      <div className="otp-logo-container">
        <img src={IMAGES.logo} className="otp-logo-img" alt="Greelance Logo" />
      </div>

      {/* OTP content wrapper — positions the card */}
      <div className="otp-content-wrapper">
        {/* White card */}
        <div className="otp-card">
          {verified ? (
            /* ===== VERIFIED STATE ===== */
            <>
              {/* Green checkmark circle */}
              <div className="verified-icon">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <path d="M20 36L32 48L52 24" stroke="#22D3A6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Verified title */}
              <h2 className="verified-title">Verified</h2>

              {/* Subtitle */}
              <p className="verified-subtitle">OTP Verified Successfully</p>

              {/* Proceed button */}
              <button className="otp-submit-btn verified-proceed-btn" onClick={onVerifySuccess}>Proceed</button>
            </>
          ) : (
            /* ===== OTP ENTRY STATE ===== */
            <>
              {/* Enter OTP title */}
              <h2 className="otp-title">Enter OTP</h2>

              {/* Subtitle */}
              <p className="otp-subtitle">We Have Sent OTP To Your Email</p>

              {/* 4 OTP digit circles */}
              <div className="otp-digits-group">
                {otp.map((digit, index) => (
                  <div className={`otp-digit-circle${otpError ? " otp-error" : ""}`} key={index}>
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-digit-input"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      autoFocus={index === 0}
                    />
                  </div>
                ))}
              </div>

              {/* Error message — shown on wrong OTP */}
              {otpError && (
                <div className="otp-error-msg">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#E53935"/>
                    <text x="8" y="12" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Lexend, sans-serif">!</text>
                  </svg>
                  <span>Error! Wrong code. Only {attempts} attempts are possible</span>
                </div>
              )}

              {/* Bottom row: Resend Code + Timer on left, Submit on right */}
              <div className="otp-bottom-row">
                <div className="otp-resend-group">
                  <span
                    className={`otp-resend-text${canResend ? " active" : ""}`}
                    onClick={handleResend}
                  >
                    Resend Code
                  </span>
                  <span className="otp-timer">{formatTime(timer)}</span>
                </div>
                <button className="otp-submit-btn" onClick={handleSubmit}>Submit</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Upload Resume Screen Component

function UploadResumeScreen({ onBack, onLogout, onNavigateSetup }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setTimeout(() => {
        onNavigateSetup(); // Auto navigate on file select
      }, 1000);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const steps = [
    { label: "Step 1", title: "Upload Resume", active: true, done: false },
    { label: "Step 2", title: "Setup Profile", active: false, done: false },
    { label: "Step 3", title: "Choose Skill", active: false, done: false },
    { label: "Step 4", title: "Connect Wallet", active: false, done: false },
    { label: "Step 5", title: "Complete Profile", active: false, done: false }
  ];

  return (
    <div className="upload-resume-page">
      {/* Top navigation header */}
      <div className="top-nav-bar">
        {/* Green back arrow */}
        <button className="nav-back-btn" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Steps navigation bar */}
        <div className="steps-container">
          {steps.map((step, idx) => (
            <div key={idx} className={`step-item${step.active ? " active" : ""}`}>
              <span className="step-label">{step.label}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Logout exit button */}
        <button className="nav-logout-btn" onClick={onLogout} aria-label="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="#050A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
      />

      {/* Dashed upload container */}
      <div className="dashed-upload-box" onClick={triggerFileSelect}>
        {/* Document illustration */}
        <div className="upload-illustration">
          <svg width="187" height="194.25" viewBox="0 0 187 194.25" fill="none">
            {/* Soft background circle */}
            <circle cx="93.5" cy="97" r="70" fill="#E6EFFF" opacity="0.6"/>
            
            {/* Browser / Page frame layout */}
            <rect x="25" y="45" width="137" height="104" rx="6" fill="#FFFFFF" stroke="#D2D4FF" strokeWidth="2"/>
            <rect x="25" y="45" width="137" height="24" rx="6" fill="#F3F7FF"/>
            <circle cx="34" cy="57" r="2.5" fill="#D2D4FF"/>
            <circle cx="42" cy="57" r="2.5" fill="#D2D4FF"/>
            <circle cx="50" cy="57" r="2.5" fill="#D2D4FF"/>

            {/* Sidebar element in illustration */}
            <rect x="33" y="78" width="28" height="60" rx="3" fill="#050A5F"/>
            <circle cx="47" cy="88" r="6" fill="#FFFFFF" opacity="0.3"/>
            <rect x="39" y="100" width="16" height="3" rx="1.5" fill="#FFFFFF" opacity="0.3"/>
            <rect x="39" y="108" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.2"/>
            <rect x="39" y="114" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.2"/>
            <rect x="39" y="120" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.2"/>
            
            {/* PDF File card */}
            <g transform="translate(68, 85)">
              <rect x="0" y="0" width="46" height="42" rx="4" fill="#FFFFFF" stroke="#E6EFFF" strokeWidth="1.5"/>
              <rect x="6" y="24" width="16" height="12" rx="2" fill="#22D3A6"/>
              <text x="14" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="700" fontFamily="Lexend, sans-serif">PDF</text>
              <line x1="6" y1="8" x2="32" y2="8" stroke="#22D3A6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="6" y1="14" x2="40" y2="14" stroke="#D2D4FF" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="6" y1="18" x2="40" y2="18" stroke="#D2D4FF" strokeWidth="1.5" strokeLinecap="round"/>
            </g>

            {/* Word DOC File card */}
            <g transform="translate(108, 92)">
              <rect x="0" y="0" width="46" height="42" rx="4" fill="#FFFFFF" stroke="#E6EFFF" strokeWidth="1.5"/>
              <rect x="6" y="24" width="16" height="12" rx="2" fill="#3038BD"/>
              <text x="14" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="700" fontFamily="Lexend, sans-serif">DOC</text>
              <line x1="6" y1="8" x2="26" y2="8" stroke="#3038BD" strokeWidth="2" strokeLinecap="round"/>
              <line x1="6" y1="14" x2="40" y2="14" stroke="#D2D4FF" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="6" y1="18" x2="35" y2="18" stroke="#D2D4FF" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
          </svg>
        </div>

        {/* Upload hint text */}
        <p className="upload-hint-text">
          <span className="upload-asterisk">*</span>You can upload any PDF or Word File
        </p>

        {/* Display file name if uploaded */}
        {fileName && (
          <p className="uploaded-file-name">
            Selected: <strong>{fileName}</strong>
          </p>
        )}

        {/* Buttons row */}
        <div className="upload-buttons-row" onClick={(e) => e.stopPropagation()}>
          {/* Upload Resume Button */}
          <button className="upload-action-btn" onClick={triggerFileSelect}>
            <span>Upload Resume</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 16V17C4 18.8565 4.7375 20.637 6.05025 21.9497C7.363 23.2625 9.14348 24 11 24H13C14.8565 24 16.637 23.2625 17.9497 21.9497C19.2625 20.637 20 18.8565 20 17V16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M12 18V2M12 2L6 8M12 2L18 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Create Manually Button */}
          <button className="create-manually-btn" onClick={onNavigateSetup}>
            Create Manually
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 2: Setup Profile Screen Component
function SetupProfileScreen({ flow, onBack, onLogout, onNext }) {
  // Personal Info Form State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    countryResidence: "",
    countryCitizenship: "",
    phoneNumber: "",
    phoneCountryCode: "+1",
    englishProficiency: "",
    noticePeriod: "",
    jobCommitment: "",
    hourlyRate: ""
  });

  const [selectedFlag, setSelectedFlag] = useState("us");

  const handlePhoneCountryChange = (e) => {
    const code = e.target.value;
    setPersonalInfo({ ...personalInfo, phoneCountryCode: code });
    if (code === "+1") setSelectedFlag("us");
    else if (code === "+92") setSelectedFlag("pk");
    else if (code === "+44") setSelectedFlag("gb");
  };

  // Education list state
  const [educationList, setEducationList] = useState(() => {
    if (flow === "resume") {
      return [
        { id: 1, degree: "Bachelor in UX Designing", university: "University Of Punjab College of Art & Design", startMonth: "September", startYear: "2013", endMonth: "September", endYear: "2015" }
      ];
    }
    return [];
  });

  // Experience list state
  const [experienceList, setExperienceList] = useState(() => {
    if (flow === "resume") {
      return [
        { id: 1, position: "Network Support Engineer", workPlace: "Central Texas College", startMonth: "September", startYear: "2013", endMonth: "September", endYear: "2015", currentlyWorking: true, description: "" },
        { id: 2, position: "", workPlace: "Central Texas College", startMonth: "September", startYear: "2013", endMonth: "September", endYear: "2013", currentlyWorking: false, description: "" }
      ];
    }
    return [];
  });

  // Certifications list state
  const [certificationsList, setCertificationsList] = useState(() => {
    if (flow === "resume") {
      return [
        { id: 1, certificateName: "Certificate of Appreciation", certificateLink: "http://jdbhcwucqpjkndckjwchouwhjcuo", fileName: "" }
      ];
    }
    return [];
  });

  // Portfolio list state
  const [portfolioList, setPortfolioList] = useState(() => {
    if (flow === "resume") {
      return [
        { id: 1, title: "", link: "", description: "", fileName: "" }
      ];
    }
    return [];
  });

  // Handle additions
  const addEducation = () => {
    setEducationList([...educationList, { id: Date.now(), degree: "", university: "", startMonth: "September", startYear: "2013", endMonth: "September", endYear: "2013" }]);
  };

  const removeEducation = (id) => {
    setEducationList(educationList.filter(item => item.id !== id));
  };

  const addExperience = () => {
    setExperienceList([...experienceList, { id: Date.now(), position: "", workPlace: "", startMonth: "September", startYear: "2013", endMonth: "September", endYear: "2013", currentlyWorking: false, description: "" }]);
  };

  const removeExperience = (id) => {
    setExperienceList(experienceList.filter(item => item.id !== id));
  };

  const addCertification = () => {
    setCertificationsList([...certificationsList, { id: Date.now(), certificateName: "", certificateLink: "", fileName: "" }]);
  };

  const removeCertification = (id) => {
    setCertificationsList(certificationsList.filter(item => item.id !== id));
  };

  const addPortfolio = () => {
    setPortfolioList([...portfolioList, { id: Date.now(), title: "", link: "", description: "", fileName: "" }]);
  };

  const removePortfolio = (id) => {
    setPortfolioList(portfolioList.filter(item => item.id !== id));
  };

  const steps = [
    { label: "Step 1", title: "Upload Resume", active: false, done: true },
    { label: "Step 2", title: "Setup Profile", active: true, done: false },
    { label: "Step 3", title: "Choose Skill", active: false, done: false },
    { label: "Step 4", title: "Connect Wallet", active: false, done: false },
    { label: "Step 5", title: "Complete Profile", active: false, done: false }
  ];

  return (
    <div className="setup-profile-page">
      {/* Top navigation header */}
      <div className="top-nav-bar">
        {/* Green back arrow */}
        <button className="nav-back-btn" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Steps navigation bar */}
        <div className="steps-container">
          {steps.map((step, idx) => (
            <div key={idx} className={`step-item${step.active ? " active" : ""}${step.done ? " done" : ""}`}>
              <span className="step-label">{step.label}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Logout exit button */}
        <button className="nav-logout-btn" onClick={onLogout} aria-label="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="#050A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Main scrollable form canvas */}
      <div className="form-canvas-container">
        
        {/* ==========================================
            1. PERSONAL INFORMATION SECTION
           ========================================== */}
        <div className="form-section">
          <h2 className="section-heading">Personal Information<span className="red-asterisk">*</span></h2>
          
          <div className="fields-grid">
            <div className="field-block">
              <label className="field-label">First Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                className="input-box form-input"
                value={personalInfo.firstName}
                onChange={e => setPersonalInfo({...personalInfo, firstName: e.target.value})}
              />
            </div>

            <div className="field-block">
              <label className="field-label">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                className="input-box form-input"
                value={personalInfo.lastName}
                onChange={e => setPersonalInfo({...personalInfo, lastName: e.target.value})}
              />
            </div>

            <div className="field-block">
              <label className="field-label">Country of Residence</label>
              <input
                type="text"
                placeholder="Select country"
                className="input-box form-input"
                value={personalInfo.countryResidence}
                onChange={e => setPersonalInfo({...personalInfo, countryResidence: e.target.value})}
              />
            </div>

            <div className="field-block">
              <label className="field-label">Country of Citizenship</label>
              <input
                type="text"
                placeholder="Select country"
                className="input-box form-input"
                value={personalInfo.countryCitizenship}
                onChange={e => setPersonalInfo({...personalInfo, countryCitizenship: e.target.value})}
              />
            </div>

            <div className="field-block">
              <label className="field-label">Phone Number</label>
              <div className="phone-input-wrapper">
                <div className="phone-flag-container">
                  <img 
                    src={`https://flagcdn.com/w20/${selectedFlag}.png`} 
                    alt="Flag" 
                    className="phone-flag-img"
                  />
                  <svg className="phone-chevron" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#3038BD" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <select 
                  className="phone-country-select-hidden"
                  value={personalInfo.phoneCountryCode}
                  onChange={handlePhoneCountryChange}
                >
                  <option value="+1">US</option>
                  <option value="+92">PK</option>
                  <option value="+44">GB</option>
                </select>
                <span className="phone-country-prefix">{personalInfo.phoneCountryCode}</span>
                <input
                  type="text"
                  placeholder="201 555 -0123"
                  className="input-box form-input phone-number-field"
                  value={personalInfo.phoneNumber}
                  onChange={e => setPersonalInfo({...personalInfo, phoneNumber: e.target.value})}
                />
              </div>
            </div>

            <div className="field-block">
              <label className="field-label">English Proficiency</label>
              <select
                className={`input-box form-select${!personalInfo.englishProficiency ? " placeholder-active" : ""}`}
                value={personalInfo.englishProficiency}
                onChange={e => setPersonalInfo({...personalInfo, englishProficiency: e.target.value})}
              >
                <option value="">Select</option>
                <option value="Native">Native / Bilingual</option>
                <option value="Fluent">Fluent</option>
                <option value="Conversational">Conversational</option>
              </select>
            </div>

            <div className="field-block">
              <label className="field-label">Notice period to resign from current job</label>
              <select
                className={`input-box form-select${!personalInfo.noticePeriod ? " placeholder-active" : ""}`}
                value={personalInfo.noticePeriod}
                onChange={e => setPersonalInfo({...personalInfo, noticePeriod: e.target.value})}
              >
                <option value="">Select</option>
                <option value="Immediate">Immediate</option>
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
              </select>
            </div>

            <div className="field-block">
              <label className="field-label">Which type of job commitment do you prefer?</label>
              <select
                className={`input-box form-select${!personalInfo.jobCommitment ? " placeholder-active" : ""}`}
                value={personalInfo.jobCommitment}
                onChange={e => setPersonalInfo({...personalInfo, jobCommitment: e.target.value})}
              >
                <option value="">Select</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="field-block">
              <label className="field-label">What's your preferred hourly rate in U.S. dollars?</label>
              <input
                type="text"
                placeholder="Enter rate (e.g. 50)"
                className="input-box form-input"
                value={personalInfo.hourlyRate}
                onChange={e => setPersonalInfo({...personalInfo, hourlyRate: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            2. EDUCATION SECTION
           ========================================== */}
        <div className={`form-section ${educationList.length === 0 ? 'empty-section' : ''}`}>
          <div className="section-header-row">
            <h2 className="section-heading">Education</h2>
            <button className="add-item-btn" onClick={addEducation}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="add-btn-svg">
                <circle cx="6" cy="6" r="5.5" stroke="white" strokeWidth="1"/>
                <path d="M6 3.5V8.5M3.5 6H8.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span>Add Education</span>
            </button>
          </div>

          <div className="section-cards-list">
            {educationList.map((edu, idx) => (
              <div key={edu.id} className="info-card-container education-card">
                {/* Delete button */}
                <button className="card-delete-btn" onClick={() => removeEducation(edu.id)} aria-label="Delete entry">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#050A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className="card-fields-row">
                  <div className="field-block card-field">
                    <label className="field-label">Degree</label>
                    <select
                      className="input-box form-select"
                      value={edu.degree}
                      onChange={e => {
                        const newList = [...educationList];
                        newList[idx].degree = e.target.value;
                        setEducationList(newList);
                      }}
                    >
                      <option value="">Select degree</option>
                      <option value="Bachelor in UX Designing">Bachelor in UX Designing</option>
                      <option value="Master in Computer Science">Master in Computer Science</option>
                    </select>
                  </div>

                  <div className="field-block card-field-double">
                    <label className="field-label">University</label>
                    <input
                      type="text"
                      className="input-box form-input"
                      placeholder="University Of Punjab College of Art & Design"
                      value={edu.university}
                      onChange={e => {
                        const newList = [...educationList];
                        newList[idx].university = e.target.value;
                        setEducationList(newList);
                      }}
                    />
                  </div>

                  <div className="field-block date-range-field">
                    <label className="field-label">Starting from</label>
                    <div className="date-dropdowns">
                      <select
                        className="input-box form-select date-select"
                        value={edu.startMonth}
                        onChange={e => {
                          const newList = [...educationList];
                          newList[idx].startMonth = e.target.value;
                          setEducationList(newList);
                        }}
                      >
                        <option value="September">September</option>
                        <option value="January">January</option>
                      </select>
                      <select
                        className="input-box form-select date-select"
                        value={edu.startYear}
                        onChange={e => {
                          const newList = [...educationList];
                          newList[idx].startYear = e.target.value;
                          setEducationList(newList);
                        }}
                      >
                        <option value="2013">2013</option>
                        <option value="2014">2014</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-block date-range-field">
                    <label className="field-label">Ending</label>
                    <div className="date-dropdowns">
                      <select
                        className="input-box form-select date-select"
                        value={edu.endMonth}
                        onChange={e => {
                          const newList = [...educationList];
                          newList[idx].endMonth = e.target.value;
                          setEducationList(newList);
                        }}
                      >
                        <option value="September">September</option>
                        <option value="January">January</option>
                      </select>
                      <select
                        className="input-box form-select date-select"
                        value={edu.endYear}
                        onChange={e => {
                          const newList = [...educationList];
                          newList[idx].endYear = e.target.value;
                          setEducationList(newList);
                        }}
                      >
                        <option value="2015">2015</option>
                        <option value="2016">2016</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            3. EXPERIENCE SECTION
           ========================================== */}
        <div className={`form-section ${experienceList.length === 0 ? 'empty-section' : ''}`}>
          <div className="section-header-row">
            <h2 className="section-heading">Experience</h2>
            <button className="add-item-btn" onClick={addExperience}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="add-btn-svg">
                <circle cx="6" cy="6" r="5.5" stroke="white" strokeWidth="1"/>
                <path d="M6 3.5V8.5M3.5 6H8.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span>Add Experience</span>
            </button>
          </div>

          <div className="section-cards-list">
            {experienceList.map((exp, idx) => (
              <div key={exp.id} className="info-card-container experience-card">
                {/* Delete button */}
                <button className="card-delete-btn" onClick={() => removeExperience(exp.id)} aria-label="Delete entry">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#050A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className="card-fields-row">
                  <div className="field-block card-field">
                    <label className="field-label">Position</label>
                    <select
                      className="input-box form-select"
                      value={exp.position}
                      onChange={e => {
                        const newList = [...experienceList];
                        newList[idx].position = e.target.value;
                        setExperienceList(newList);
                      }}
                    >
                      <option value="">Select position</option>
                      <option value="Network Support Engineer">Network Support Engineer</option>
                      <option value="UX/UI Designer">UX/UI Designer</option>
                    </select>
                  </div>

                  <div className="field-block card-field">
                    <label className="field-label">Work Place</label>
                    <input
                      type="text"
                      className="input-box form-input"
                      placeholder="Central Texas College"
                      value={exp.workPlace}
                      onChange={e => {
                        const newList = [...experienceList];
                        newList[idx].workPlace = e.target.value;
                        setExperienceList(newList);
                      }}
                    />
                  </div>

                  <div className="field-block date-range-field">
                    <label className="field-label">Starting from</label>
                    <div className="date-dropdowns">
                      <select
                        className="input-box form-select date-select"
                        value={exp.startMonth}
                        onChange={e => {
                          const newList = [...experienceList];
                          newList[idx].startMonth = e.target.value;
                          setExperienceList(newList);
                        }}
                      >
                        <option value="September">September</option>
                        <option value="January">January</option>
                      </select>
                      <select
                        className="input-box form-select date-select"
                        value={exp.startYear}
                        onChange={e => {
                          const newList = [...experienceList];
                          newList[idx].startYear = e.target.value;
                          setExperienceList(newList);
                        }}
                      >
                        <option value="2013">2013</option>
                        <option value="2014">2014</option>
                      </select>
                    </div>
                  </div>

                  {!exp.currentlyWorking ? (
                    <div className="field-block date-range-field">
                      <label className="field-label">Ending</label>
                      <div className="date-dropdowns">
                        <select
                          className="input-box form-select date-select"
                          value={exp.endMonth}
                          onChange={e => {
                            const newList = [...experienceList];
                            newList[idx].endMonth = e.target.value;
                            setExperienceList(newList);
                          }}
                        >
                          <option value="September">September</option>
                          <option value="January">January</option>
                        </select>
                        <select
                          className="input-box form-select date-select"
                          value={exp.endYear}
                          onChange={e => {
                            const newList = [...experienceList];
                            newList[idx].endYear = e.target.value;
                            setExperienceList(newList);
                          }}
                        >
                          <option value="2015">2015</option>
                          <option value="2016">2016</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="field-block date-range-placeholder"></div>
                  )}

                  {/* Currently working checkbox */}
                  <div className="checkbox-block">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exp.currentlyWorking}
                        onChange={e => {
                          const newList = [...experienceList];
                          newList[idx].currentlyWorking = e.target.checked;
                          setExperienceList(newList);
                        }}
                        className="custom-checkbox"
                      />
                      <span>Currently Working</span>
                    </label>
                  </div>
                </div>

                {/* Description textarea */}
                <div className="card-textarea-row">
                  <div className="field-block textarea-block">
                    <label className="field-label">Description</label>
                    <textarea
                      placeholder="Type your comments..."
                      className="form-textarea"
                      value={exp.description}
                      onChange={e => {
                        const newList = [...experienceList];
                        newList[idx].description = e.target.value;
                        setExperienceList(newList);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            4. CERTIFICATIONS SECTION
           ========================================== */}
        <div className={`form-section ${certificationsList.length === 0 ? 'empty-section' : ''}`}>
          <div className="section-header-row">
            <h2 className="section-heading">Certifications</h2>
            <button className="add-item-btn" onClick={addCertification}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="add-btn-svg">
                <circle cx="6" cy="6" r="5.5" stroke="white" strokeWidth="1"/>
                <path d="M6 3.5V8.5M3.5 6H8.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span>Add Certification</span>
            </button>
          </div>

          <div className="section-cards-list">
            {certificationsList.map((cert, idx) => (
              <div key={cert.id} className="info-card-container certification-card">
                <button className="card-delete-btn" onClick={() => removeCertification(cert.id)} aria-label="Delete entry">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#050A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className="card-fields-row align-center">
                  <div className="field-block card-field">
                    <label className="field-label">Certificate name</label>
                    <input
                      type="text"
                      className="input-box form-input"
                      placeholder="Certificate of Appreciation"
                      value={cert.certificateName}
                      onChange={e => {
                        const newList = [...certificationsList];
                        newList[idx].certificateName = e.target.value;
                        setCertificationsList(newList);
                      }}
                    />
                  </div>

                  <div className="field-block card-field-double">
                    <label className="field-label">Certificate Link</label>
                    <input
                      type="text"
                      className="input-box form-input"
                      placeholder="http://link-to-certificate.com"
                      value={cert.certificateLink}
                      onChange={e => {
                        const newList = [...certificationsList];
                        newList[idx].certificateLink = e.target.value;
                        setCertificationsList(newList);
                      }}
                    />
                  </div>

                  {/* Upload Certificate Dashed Button */}
                  <div className="cert-upload-wrapper">
                    <div 
                      className="dashed-mini-upload"
                      onClick={() => document.getElementById(`cert-file-${cert.id}`)?.click()}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#050A5F" strokeWidth="1.5"/>
                        <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#050A5F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{cert.fileName ? cert.fileName.slice(0, 15) + "..." : "Upload Certificate"}</span>
                    </div>
                    <input
                      id={`cert-file-${cert.id}`}
                      type="file"
                      style={{ display: "none" }}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          const newList = [...certificationsList];
                          newList[idx].fileName = e.target.files[0].name;
                          setCertificationsList(newList);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            5. PORTFOLIO SECTION
           ========================================== */}
        <div className={`form-section ${portfolioList.length === 0 ? 'empty-section' : ''}`}>
          <div className="section-header-row">
            <h2 className="section-heading">Portfolio</h2>
            <button className="add-item-btn" onClick={addPortfolio}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="add-btn-svg">
                <circle cx="6" cy="6" r="5.5" stroke="white" strokeWidth="1"/>
                <path d="M6 3.5V8.5M3.5 6H8.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span>Add Portfolio</span>
            </button>
          </div>

          <div className="section-cards-list">
            {portfolioList.map((port, idx) => (
              <div key={port.id} className="info-card-container portfolio-card">
                <button className="card-delete-btn" onClick={() => removePortfolio(port.id)} aria-label="Delete entry">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#050A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Grid layout containing fields and upload on right */}
                <div className="portfolio-content-grid">
                  <div className="portfolio-fields-col">
                    <div className="field-row">
                      <div className="field-block portfolio-field">
                        <label className="field-label">Title</label>
                        <input
                          type="text"
                          className="input-box form-input"
                          placeholder="Project title"
                          value={port.title}
                          onChange={e => {
                            const newList = [...portfolioList];
                            newList[idx].title = e.target.value;
                            setPortfolioList(newList);
                          }}
                        />
                      </div>

                      <div className="field-block portfolio-field">
                        <label className="field-label">Portfolio Link</label>
                        <div className="link-input-wrapper">
                          <input
                            type="text"
                            className="input-box form-input link-field"
                            placeholder="http://"
                            value={port.link}
                            onChange={e => {
                              const newList = [...portfolioList];
                              newList[idx].link = e.target.value;
                              setPortfolioList(newList);
                            }}
                          />
                          <span className="globe-icon">🌐</span>
                        </div>
                      </div>
                    </div>

                    <div className="field-block full-width">
                      <label className="field-label">Description</label>
                      <textarea
                        placeholder="Type your comments..."
                        className="form-textarea portfolio-textarea"
                        value={port.description}
                        onChange={e => {
                          const newList = [...portfolioList];
                          newList[idx].description = e.target.value;
                          setPortfolioList(newList);
                        }}
                      />
                    </div>
                  </div>

                  {/* Right side upload box */}
                  <div className="portfolio-upload-col">
                    <div 
                      className="dashed-portfolio-upload"
                      onClick={() => document.getElementById(`port-file-${port.id}`)?.click()}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" fill="#E6EFFF"/>
                        <path d="M9 17L12 14L15 17M12 14V20" stroke="#22D3A6" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="12" cy="8" r="2" fill="#22D3A6"/>
                      </svg>
                      <span className="upload-port-label">{port.fileName ? port.fileName.slice(0, 15) + "..." : "Upload Portfolio"}</span>
                      <span className="upload-port-hint">* You can upload any PDF or JPEG</span>
                    </div>
                    <input
                      id={`port-file-${port.id}`}
                      type="file"
                      style={{ display: "none" }}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          const newList = [...portfolioList];
                          newList[idx].fileName = e.target.files[0].name;
                          setPortfolioList(newList);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation Button */}
        <div className="form-bottom-row">
          <button className="otp-submit-btn setup-next-btn" onClick={onNext}>Next</button>
        </div>

      </div>
    </div>
  );
}

// Helper for Step 3 Category Logos
function getCategoryIcon(name) {
  switch (name) {
    case "E Commerce Skills":
      return (
        <img
          src="/ecommerce_logo.png"
          alt="E Commerce Skills"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Cybersecurity Engineer":
      return (
        <img
          src="/cybersecurity_logo.png"
          alt="Cybersecurity Engineer"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Cloud Computing Engineer":
      return (
        <img
          src="/cloud_computing_logo.png"
          alt="Cloud Computing Engineer"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Digital Marketing Expert":
      return (
        <img
          src="/digital_marketing_logo.png"
          alt="Digital Marketing Expert"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Software Engineering":
      return (
        <img
          src="/software_engineering_logo.png"
          alt="Software Engineering"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "IT Staffing":
      return (
        <img
          src="/it_staffing_logo.png"
          alt="IT Staffing"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Data Center security":
      return (
        <img
          src="/data_center_security_logo.png"
          alt="Data Center security"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Artificial Intelligence":
      return (
        <img
          src="/artificial_intelligence_logo.png"
          alt="Artificial Intelligence"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Business Intelligence":
      return (
        <img
          src="/business_intelligence_logo.png"
          alt="Business Intelligence"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Decision Intelligence":
      return (
        <img
          src="/decision_intelligence_logo.png"
          alt="Decision Intelligence"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Robotics":
      return (
        <img
          src="/robotics_logo.png"
          alt="Robotics"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Virtual/Augmented":
      return (
        <img
          src="/virtual_augmented_logo.png"
          alt="Virtual/Augmented"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Systems Engineering":
      return (
        <img
          src="/systems_engineering_logo.png"
          alt="Systems Engineering"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Cryptocurrency":
      return (
        <img
          src="/cryptocurrency_logo.png"
          alt="Cryptocurrency"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Fintech":
      return (
        <img
          src="/fintech_logo.png"
          alt="Fintech"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Autonomous Systems":
      return (
        <img
          src="/autonomous_systems_logo.png"
          alt="Autonomous Systems"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Machine Learning":
      return (
        <img
          src="/machine_learning_logo.png"
          alt="Machine Learning"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Electric-Vehicle Technology":
      return (
        <img
          src="/ev_technology_logo.png"
          alt="Electric-Vehicle Technology"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Internet of Things":
      return (
        <img
          src="/internet_of_things_logo.png"
          alt="Internet of Things"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Recycle-Energy":
      return (
        <img
          src="/recycle_energy_logo.png"
          alt="Recycle-Energy"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Smart-Home":
      return (
        <img
          src="/smart_home_logo.png"
          alt="Smart-Home"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Quantum Computing":
      return (
        <img
          src="/quantum_computing_logo.png"
          alt="Quantum Computing"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    case "Blockchain":
      return (
        <img
          src="/blockchain_logo.png"
          alt="Blockchain"
          style={{ width: "33px", height: "33px", objectFit: "contain" }}
        />
      );
    default:
      return null;
  }
}

const categoryWidths = {
  "E Commerce Skills": "213px",
  "Cybersecurity Engineer": "252.75px",
  "Cloud Computing Engineer": "279.75px",
  "Digital Marketing Expert": "263.25px",
  "Software Engineering": "240.75px",
  "IT Staffing": "159px",
  "Data Center security": "232.5px",
  "Artificial Intelligence": "236.25px",
  "Business Intelligence": "236.25px",
  "Decision Intelligence": "235.5px",
  "Robotics": "141.75px",
  "Virtual/Augmented": "223.5px",
  "Systems Engineering": "235.5px",
  "Cryptocurrency": "194.25px",
  "Fintech": "132.75px",
  "Autonomous Systems": "229.5px",
  "Machine Learning": "212.25px",
  "Electric-Vehicle Technology": "284.25px",
  "Internet of Things": "213.75px",
  "Recycle-Energy": "194.25px",
  "Smart-Home": "174px",
  "Quantum Computing": "235.5px",
  "Blockchain": "159.75px"
};

// Step 3: Choose Skill Screen Component
function ChooseSkillScreen({ onBack, onLogout, onNext }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedSub, setSelectedSub] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState(["Retail Media", "Programmatic", "Network", "Product Design"]);
  const [suggestVal, setSuggestVal] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const categories = [
    { name: "E Commerce Skills", icon: "🛒" },
    { name: "Cybersecurity Engineer", icon: "🛡️" },
    { name: "Cloud Computing Engineer", icon: "☁️" },
    { name: "Digital Marketing Expert", icon: "📢" },
    { name: "Software Engineering", icon: "💻" },
    { name: "IT Staffing", icon: "👥" },
    { name: "Data Center security", icon: "🏢" },
    { name: "Artificial Intelligence", icon: "🧠" },
    { name: "Business Intelligence", icon: "💼" },
    { name: "Decision Intelligence", icon: "📊" },
    { name: "Robotics", icon: "🤖" },
    { name: "Virtual/Augmented", icon: "🕶️" },
    { name: "Systems Engineering", icon: "⚙️" },
    { name: "Cryptocurrency", icon: "🪙" },
    { name: "Fintech", icon: "💳" },
    { name: "Autonomous Systems", icon: "🚗" },
    { name: "Machine Learning", icon: "🧬" },
    { name: "Electric-Vehicle Technology", icon: "⚡" },
    { name: "Internet of Things", icon: "🔌" },
    { name: "Recycle-Energy", icon: "♻️" },
    { name: "Smart-Home", icon: "🏠" },
    { name: "Quantum Computing", icon: "⚛️" },
    { name: "Blockchain", icon: "⛓️" }
  ];

  const subCategoriesData = {
    "E Commerce Skills": [
      { name: "Shopify Specialist", skills: ["Liquid Template Coding", "Shopify Apps Integration", "Shopify Theme Customization", "Shopify API Setup", "Product Design"] },
      { name: "WooCommerce Specialist", skills: ["WordPress Plugins", "WooCommerce Custom Hooks", "Store Performance", "Payment Gateway Setup"] },
      { name: "Magento Developer", skills: ["Magento 2 extension development", "Database Optimization", "KnockoutJS", "Magento Cloud"] },
      { name: "E-commerce Marketing", skills: ["Google Shopping Ads", "SEO for Shopify", "Email Flows & Automation", "Customer Retention Sales"] },
      { name: "Product Lister", skills: ["Amazon Listing Optimization", "eBay Listing Manager", "Catalog Management", "Inventory Control"] },
      { name: "Retail Operations", skills: ["Inventory Logistics", "E-commerce Customer Support", "Vendor Management", "Order Fulfilment"] }
    ],
    "Cybersecurity Engineer": [
      { name: "Penetration Tester", skills: ["Kali Linux Testing", "Metasploit Framework", "OWASP Top 10 Auditing", "Burp Suite Pro"] },
      { name: "Incident Responder", skills: ["SIEM Logs Monitoring", "Log Analytics Analysis", "Threat Hunting", "Forensic Investigation"] },
      { name: "Security Architect", skills: ["Identity Access Management (IAM)", "Zero Trust Architecture", "Cloud Security Rules", "Data Encryption Setup"] },
      { name: "Compliance Specialist", skills: ["GDPR Compliance Audit", "SOC 2 Type II Auditing", "PCI-DSS Certification", "HIPAA Health Auditing"] },
      { name: "Application Security", skills: ["SAST Code Auditing", "DAST Active Testing", "Secure Code Review", "WAF Configuration"] },
      { name: "Network Security", skills: ["Firewall Configuration", "Intrusion Detection (IDS)", "VPN Setup", "Network Segmentation"] }
    ],
    "Cloud Computing Engineer": [
      { name: "AWS Cloud Architect", skills: ["AWS IAM Policy Setup", "CloudFormation Templates", "Terraform Provider Setup", "AWS Lambda Coding"] },
      { name: "Google Cloud Architect", skills: ["BigQuery Admin Config", "Google Kubernetes Engine (GKE)", "GCP IAM Policies", "Dataflow Transformation"] },
      { name: "Azure Solutions Specialist", skills: ["Azure Active Directory", "ARM Templates", "Azure Functions Coding", "Synapse Analytics Integration"] },
      { name: "DevOps Engineer", skills: ["CI/CD Pipeline Setup", "Docker Containerization", "Kubernetes Clustering", "Helm Chart Deployment"] },
      { name: "Cloud Migration", skills: ["Database Migration Service", "Lift-and-Shift Strategy", "VM Conversion Setup", "Cloud Cost Optimization"] },
      { name: "Cloud Security", skills: ["Prisma Cloud Setup", "KMS Key Configuration", "VPC Flow Logs", "Sentinel Policies"] }
    ],
    "Digital Marketing Expert": [
      { name: "SEO Specialist", skills: ["Keyword Search Mapping", "On-page Text Optimization", "Backlink Building outreach", "Technical Site SEO"] },
      { name: "PPC Advertising", skills: ["Google Search Ads Campaign", "Facebook Retargeting Ads", "A/B Banner Testing", "ROAS Optimization"] },
      { name: "Social Media Manager", skills: ["Social Content Scheduling", "Community Moderation", "Instagram Growth Strategy", "TikTok Ads Campaign"] },
      { name: "Content Marketer", skills: ["Copywriting & Blogs", "Newsletter Design", "Lead Magnet Ebooks", "SEO Content Auditing"] },
      { name: "Analytics Expert", skills: ["Google Analytics 4 setup", "Google Tag Manager tracking", "UTM Link Configuration", "Looker Studio Dashboard"] },
      { name: "Affiliate Marketer", skills: ["Affiliate Network Setup", "Partner Outreach", "Commission Tracking Integration", "Referral Campaign Design"] }
    ],
    "Software Engineering": [
      { name: "Frontend Developer", skills: ["React JS Coding", "HTML5/CSS3 Styling", "Vite Config Optimization", "JavaScript ES6 Coding", "TypeScript Typings"] },
      { name: "Backend Developer", skills: ["Node.js Server Design", "Express JS Routing", "Python Django Code", "PostgreSQL Database", "REST API Development"] },
      { name: "Full Stack Engineer", skills: ["React & Node Integration", "Database Schema Design", "Git Version Control", "State Management Logic"] },
      { name: "Mobile Developer", skills: ["React Native Setup", "Flutter Widget Design", "iOS App Store Deploy", "Android SDK Config"] },
      { name: "Embedded Systems", skills: ["C/C++ Embedded Coding", "Microcontroller Setup", "Arduino Board Control", "RTOS Task Scheduling"] },
      { name: "QA Engineer", skills: ["Jest Unit Testing", "Cypress E2E Testing", "Selenium Test Suite", "Manual Bug Reporting"] }
    ],
    "IT Staffing": [
      { name: "Technical Recruiter", skills: ["Technical Candidate Sourcing", "LinkedIn Recruiter Querying", "Developer Interviewing", "Resume Screening Analysis"] },
      { name: "HR Specialist", skills: ["Employee Onboarding System", "HR Policy Writing", "Employee Relations Advice", "Benefits Administration"] },
      { name: "Contract Sourcing", skills: ["Freelancer Network Sourcing", "SOW Contract Drafting", "Hourly Billing Auditing", "Upwork Sourcing"] },
      { name: "Talent Acquisition", skills: ["Employer Brand Building", "ATS Pipeline Configuration", "Diversity Hiring Initiatives", "Job Description Copy"] },
      { name: "Staffing Operations", skills: ["VMS Platform Management", "Payroll Compliance Auditing", "Background Checks Coordination", "Timesheet Auditing"] },
      { name: "Executive Search", skills: ["C-Level Executive Headhunting", "Compensation Package Negotiation", "Candidate Assessment Reports", "Market Mapping"] }
    ],
    "Data Center security": [
      { name: "Physical Security Specialist", skills: ["Biometric Access Control", "CCTV Video Auditing", "Mantraps Access Protocol", "Intrusion Detection Alarms"] },
      { name: "Infrastructure Security", skills: ["Network Rack Locking", "Power System Redundancy", "HVAC Monitoring & Security", "Environmental Sensor Alarms"] },
      { name: "Network Architecture", skills: ["Data Center Firewall Config", "DDoS Mitigation Routing", "IP Address Management (IPAM)", "VLAN Isolation Setup"] },
      { name: "Compliance auditor", skills: ["SOC 1 Type II Compliance", "ISO 27001 Controls Audit", "NIST SP 800-53 Mapping", "Risk Assessment Reviews"] },
      { name: "Virtualization Security", skills: ["VMware ESXi Hardening", "Hyper-V Security Config", "SDN Microsegmentation", "Container Hardening"] },
      { name: "Disaster Recovery", skills: ["Offsite Backup Encryption", "RTO/RPO SLA Planning", "DR Drill Execution", "Data Replication Config"] }
    ],
    "Artificial Intelligence": [
      { name: "Generative AI Engineer", skills: ["LLM Fine-Tuning Setup", "Prompt Engineering Prompts", "RAG Pipeline Development", "Vector DB Indexing"] },
      { name: "Computer Vision Engineer", skills: ["OpenCV Processing", "YOLO Object Detection", "Image Segmentation Models", "PyTorch Model Training"] },
      { name: "NLP Engineer", skills: ["NLTK Tokenization Text", "HuggingFace Transformer Models", "NER Sequence Labelling", "Sentiment Analysis Classification"] },
      { name: "AI Consultant", skills: ["AI Feasibility Studies", "AI Ethics Audit", "Vendor Selection Advisory", "ROI Analysis for AI"] },
      { name: "MLOps Engineer", skills: ["Kubeflow Orchestration", "MLflow Experiment Tracking", "Triton Model Server Setup", "Model Drift Monitoring"] },
      { name: "Conversational AI", skills: ["Dialogflow Chatbots", "Rasa Core Framework", "NLU Intent Recognition", "Voice Assistant Integration"] }
    ],
    "Business Intelligence": [
      { name: "BI Developer", skills: ["PowerBI Report Authoring", "DAX Query Writing", "Tableau Dashboard Layout", "SQL Data Extraction"] },
      { name: "ETL Developer", skills: ["dbt Pipeline Dataform", "Airflow DAG Orchestration", "Informatica PowerCenter", "SSIS Package Setup"] },
      { name: "Data Analyst", skills: ["Cohort Analysis Studies", "Funnel Conversion Reports", "Key Performance Indicator (KPI) Design", "Pivot Table Auditing"] },
      { name: "Data Architect", skills: ["Star Schema Modelling", "Snowflake Schema Design", "Data Dictionary Creation", "Enterprise Data Warehouse Setup"] },
      { name: "Reporting Analyst", skills: ["Scheduled Report Automation", "Ad-Hoc SQL Queries", "Data Verification Controls", "Excel Macro Sheets"] },
      { name: "BI Administrator", skills: ["Tableau Server Admin", "PowerBI Gateway Configuration", "Workspace Permissions Management", "Data Refresh Scheduling"] }
    ],
    "Decision Intelligence": [
      { name: "Decision Analyst", skills: ["Decision Tree Modelling", "Multi-Criteria Evaluation", "Trade-Off Analysis Matrix", "Stakeholder Alignment Sessions"] },
      { name: "Simulation Engineer", skills: ["Agent-Based Simulation", "Monte Carlo Methods", "System Dynamics Modeling", "Scenario Planning Analysis"] },
      { name: "Behavioral Scientist", skills: ["Nudge Design Experiments", "User Bias Mitigation", "Customer Motivation Studies", "Choice Architecture Mapping"] },
      { name: "Risk Assessment Specialist", skills: ["Failure Modes Analysis (FMEA)", "Operational Risk Modelling", "Sensitivity Analysis Graphs", "Stress Testing Models"] },
      { name: "Policy Designer", skills: ["Regulatory Compliance Models", "Policy Impact Assessment", "Feedback Loop Modeling", "Objective Function Optimization"] },
      { name: "Data Science Strategist", skills: ["Predictive Analytics Strategy", "Prescriptive Analytics Setup", "Metric Framework Mapping", "Hypothesis Test Design"] }
    ],
    "Robotics": [
      { name: "Robotics Software Engineer", skills: ["ROS (Robot Operating System)", "C++ Motion Planning", "SLAM Navigation Algorithms", "URDF Robot Modeling"] },
      { name: "Control Systems Engineer", skills: ["PID Controller Tuning", "State-Space Model Design", "MATLAB Simulink Control", "Motor Driver Setup"] },
      { name: "Robotics Hardware Engineer", skills: ["CAD Chassis Design", "Actuator Selection Config", "Sensor Integration Circuit", "PCB Layout Routing"] },
      { name: "Computer Vision Specialist", skills: ["Point Cloud Library (PCL)", "3D Camera Calibration", "Depth Map Processing", "Visual Odometry Setup"] },
      { name: "Automation Programmer", skills: ["PLC Programming Logic", "SCADA HMI Integration", "Industrial Arm Setup", "Fanuc/Kuka Programming"] },
      { name: "Embedded Firmware", skills: ["C Embedded Coding", "RTOS Task Scheduling", "SPI/I2C Protocol Communication", "CAN Bus Interface Setup"] }
    ],
    "Virtual/Augmented": [
      { name: "Unity Developer", skills: ["Unity C# Gameplay Coding", "Universal Render Pipeline", "Unity Physics Tuning", "AR Foundation ARKit"] },
      { name: "Unreal Developer", skills: ["Unreal Blueprints Scripting", "C++ Engine Customization", "Lumen Lighting Setup", "Niagara Particle Effects"] },
      { name: "3D Asset Artist", skills: ["Blender 3D Modeling", "Maya Polygon Modeling", "Substance Painter Texturing", "Low-Poly Model Optimization"] },
      { name: "AR Application Engineer", skills: ["WebXR API WebGL", "8th Wall WebAR Development", "ARKit Face Tracking", "Spark AR Studio Filters"] },
      { name: "VR Game Designer", skills: ["VR Interaction System", "Locomotion System Design", "Spatial Audio Config", "Quest Device Optimization"] },
      { name: "Technical Artist", skills: ["Custom Shader Graph Coding", "Character Rigging Controls", "VFX Graph Effects", "Performance Profiling Render"] }
    ],
    "Systems Engineering": [
      { name: "Systems Architect", skills: ["MBSE SysML Modelling", "Requirements Management Sys", "Functional Allocation Schema", "Interface Control (ICD)"] },
      { name: "Integration Engineer", skills: ["System Integration Testing", "Hardware-Software Co-design", "Diagnostic Log Parsing", "Test Bench Calibration"] },
      { name: "Safety Engineer", skills: ["ISO 26262 Automotive Safety", "Hazard Analysis (HAZOP)", "FMEA Safety Controls", "ASIL Level Allocation"] },
      { name: "Systems Analyst", skills: ["Trade-Off Study Matrix", "System Lifecycle Planning", "Reliability Modeling MTBF", "Performance Modeling"] },
      { name: "Verification Engineer", skills: ["Test Case Scripting", "Hardware-in-the-Loop (HIL)", "Verification Matrix Trace", "Defect Tracking JIRA"] },
      { name: "Configuration Manager", skills: ["Version Control Strategy", "Change Request Workflows", "Build Release Management", "BOM Bill of Materials"] }
    ],
    "Cryptocurrency": [
      { name: "Smart Contract Developer", skills: ["Solidity Code Auditing", "Hardhat Test Suites", "Foundry Test Scripting", "Ethers.js Client Scripting"] },
      { name: "DeFi Protocol Engineer", skills: ["Automated Market Maker (AMM)", "Liquidity Pool Architecture", "Flash Loan Integration", "Yield Farming Logic"] },
      { name: "Tokenomics Specialist", skills: ["Token Utility Mapping", "Inflation/Deflation Models", "Governance Model Setup", "Game Theory Scenarios"] },
      { name: "Crypto Security Auditor", skills: ["Slither Static Analysis", "Mythril Security Scans", "Reentrancy Vulnerability Audit", "Signature Replay Protection"] },
      { name: "Web3 Frontend Engineer", skills: ["RainbowKit Wallet Integration", "Wagmi React Hooks", "Viem Client Interaction", "IPFS Hosting Deploy"] },
      { name: "Cryptographic Researcher", skills: ["Zero-Knowledge Proofs (ZKP)", "Multi-Party Computation (MPC)", "ECDSA Key Management", "Merkle Tree Validation"] }
    ],
    "Fintech": [
      { name: "Payment Gateway Integrator", skills: ["Stripe API Webhooks", "Adyen Payment Interface", "PCI-DSS Compliance Hardening", "ACH Bank Transfer Setup"] },
      { name: "Trading Systems Engineer", skills: ["FIX Protocol Messaging", "Low-Latency C++ Trading", "Market Data Feed Parsing", "Order Execution Routing"] },
      { name: "Wealthtech Developer", skills: ["Robo-Advisory Algorithm", "Portfolio Rebalancing Logic", "Plaid API Bank Linking", "Tax-Loss Harvesting Systems"] },
      { name: "Risk & Fraud Analyst", skills: ["KYC/AML API Integration", "Transaction Monitoring Logic", "Anomaly Detection Models", "Chargeback Dispute Handling"] },
      { name: "Regtech Specialist", skills: ["Regulatory Reporting Systems", "GDPR Data Encryption", "Audit Log Security", "Transaction Ledger Systems"] },
      { name: "Open Banking Engineer", skills: ["PSD2 Compliance APIs", "OAuth2 Token Authorization", "Bank Statement Scraping", "Financial Schema Parsing"] }
    ],
    "Autonomous Systems": [
      { name: "AD Algorithms Engineer", skills: ["Sensor Fusion Kalman Filter", "Path Planning A* Dijkstra", "Behavioral State Machines", "MPC Predictive Control"] },
      { name: "Perception Engineer", skills: ["LiDAR Point Cloud Seg", "Radar Object Classification", "Camera-LiDAR Calibration", "Deep Learning Tracking"] },
      { name: "Localization Engineer", skills: ["HD Map Matching (Lanelet)", "RTK GNSS Navigation", "IMU Dead Reckoning", "Visual Inertial Odometry"] },
      { name: "ADAS Safety Engineer", skills: ["ISO 26262 Compliance", "Hazard Identification HAZOP", "FMEA Failure Diagnostics", "SOTIF ISO 21448 Safety"] },
      { name: "Simulation Specialist", skills: ["Carla Simulator Env", "IPG CarMaker Setup", "Virtual Sensor Simulation", "Scenario Library Design"] },
      { name: "HIL Testing Engineer", skills: ["dSPACE Hardware Config", "RTOS Real-time Loop", "CANoe Vector Simulation", "Automated Regression Tests"] }
    ],
    "Machine Learning": [
      { name: "ML Research Scientist", skills: ["PyTorch Deep Learning", "TensorFlow Custom Layers", "Paper Implementation Code", "Custom Loss Functions"] },
      { name: "Data Scientist", skills: ["Pandas Data Wrangling", "Scikit-Learn Regression", "A/B Hypothesis Testing", "Feature Engineering Pipeline"] },
      { name: "NLP Practitioner", skills: ["HuggingFace Transformers", "Tokenizer Text Pipelines", "NER Sequence Labelling", "Word Embeddings Word2Vec"] },
      { name: "MLOps Engineer", skills: ["Kubeflow Pipeline Deploy", "DVC Data Versioning", "BentoML Model Packaging", "Prometheus Model Monitoring"] },
      { name: "Deep Learning Specialist", skills: ["CNN Architectures Vision", "RNN/LSTM Time Series", "Autoencoders Compression", "GAN Generative Models"] },
      { name: "Reinforcement Learning", skills: ["Gym Environment Config", "Q-Learning Bellman Logic", "DQN Policy Gradient", "Ray RLlib Framework"] }
    ],
    "Electric-Vehicle Technology": [
      { name: "BMS Firmware Engineer", skills: ["BMS SoC Estimation", "Cell Balancing Control", "Thermal Management Firmware", "Battery State of Health"] },
      { name: "Power Electronics Engineer", skills: ["Inverter Hardware Design", "DC-DC Converter Config", "IGBT/SiC Driver Selection", "EMI/EMC Filter Design"] },
      { name: "Motor Control Engineer", skills: ["FOC Control Tuning", "Space Vector PWM (SVPWM)", "Resolver Sensor Calibration", "Permanent Magnet AC Control"] },
      { name: "EV Powertrain System", skills: ["Powertrain Layout Model", "Drive Cycle Simulation", "Gear Ratio Selection Study", "Traction Control Logic"] },
      { name: "Charging Infrastructure", skills: ["CCS Combo Protocol ISO 15118", "OCPP Protocol Server", "AC/DC Fast Charging Control", "Grid Load Balancing"] },
      { name: "EV Battery Packaging", skills: ["Cell Array Layout CAD", "Battery Module Thermal Pack", "Crash Safety Structure", "Busbar Resistance Design"] }
    ],
    "Internet of Things": [
      { name: "ESP32 Developer", skills: ["ESP32 C FreeRTOS", "STM32 Cube HAL Program", "Nordic nRF52 BLE Code", "Low-Power Sleep Modes"] },
      { name: "IoT Cloud Architect", skills: ["MQTT Broker Mosquitto", "AWS IoT Core Policy", "ThingsBoard Custom Rules", "InfluxDB Time-Series Data"] },
      { name: "Hardware Prototyper", skills: ["Altium PCB Design Layout", "Schematic Entry Design", "Soldering Debug Skills", "Oscilloscope Measurement"] },
      { name: "IoT Network Engineer", skills: ["LoRaWAN Gateway Config", "Zigbee Mesh Routing", "BLE Advertising Config", "Cellular LTE-M Setup"] },
      { name: "IoT Security Specialist", skills: ["Secure Boot Firmware", "TLS Certificate Setup", "OTA Firmware Signing", "Hardware Security Modules"] },
      { name: "Edge AI Developer", skills: ["TensorFlow Lite Micro", "Edge Impulse Training", "MCU Inference Optimizations", "TinyML Classification"] }
    ],
    "Recycle-Energy": [
      { name: "Solar Systems Engineer", skills: ["PVsyst Energy Modeling", "PV Array Strings Design", "Solar Inverter Selection", "Net Metering Integration"] },
      { name: "Wind Turbine specialist", skills: ["Aerodynamic Simulation", "Turbine Pitch Control", "Generator Synchronization", "SCADA Wind Park Control"] },
      { name: "Smart Grid Architect", skills: ["Microgrid Controller Config", "Peak Shaving Management", "Grid Frequency Control", "IEEE 1547 Grid Standard"] },
      { name: "Energy Storage Designer", skills: ["LiFePO4 Battery Storage", "Supercapacitor Power Pack", "Thermal Runaway Prevention", "Hybrid Energy Manager"] },
      { name: "Bioenergy Engineer", skills: ["Anaerobic Digester Design", "Biogas Scrubber Config", "Biomass Boiler Tuning", "Feedstock Yield Analysis"] },
      { name: "Energy Auditor", skills: ["ASHRAE Level II Audit", "Building Envelope Thermal", "HVAC Efficiency Analysis", "Energy Data Log Logging"] }
    ],
    "Smart-Home": [
      { name: "Home Automation Installer", skills: ["Home Assistant YAML", "KNX Bus System Program", "Lutron Lighting Scenes", "Crestron Integration"] },
      { name: "Smart Device Developer", skills: ["Matter Protocol SDK", "Zigbee Cluster Library", "Z-Wave Command Classes", "Wi-Fi Provisioning App"] },
      { name: "Smart Home Security", skills: ["IP Camera RTSP Streaming", "Zigbee Door Sensors", "Keyless Entry Smart Lock", "Privacy Shield Security"] },
      { name: "Audio/Video Integrator", skills: ["Multiroom Audio Matrix", "Sonos API Integration", "AV Receiver RS232 Setup", "Control4 System Config"] },
      { name: "HVAC Automation", skills: ["Nest Thermostat API", "BACnet IP HVAC Control", "Relay Control Wiring", "Humidity Sensor Control"] },
      { name: "Voice Assistant Developer", skills: ["Alexa Custom Skill SDK", "Google Home Action API", "Local Voice Processing", "Siri Shortcuts Mapping"] }
    ],
    "Quantum Computing": [
      { name: "Quantum Software Developer", skills: ["Qiskit Quantum Circuit", "PennyLane Hybrid ML", "Cirq Program Layout", "Quantum Gates Matrix"] },
      { name: "Quantum Algorithms Research", skills: ["Shor's/Grover's Algorithm", "VQE Quantum Chemistry", "QAOA Combinatorial Optim", "Error Correction Surface"] },
      { name: "Quantum Hardware Scientist", skills: ["Superconducting Qubits", "Ion Trap Configuration", "Dilution Refrigerator Control", "RF Pulse Calibration"] },
      { name: "Quantum Cryptography", skills: ["QKD Protocol Setup", "Post-Quantum Cryptography", "Lattice-Based Encryption", "Quantum Random Generator"] },
      { name: "Quantum Simulator Dev", skills: ["GPU Tensor Network Sim", "Hamiltonian Simulation", "Noise Model Emulation", "Qubit State Vector Math"] },
      { name: "Quantum Control Engineer", skills: ["Qubit Readout Discriminator", "Pulse Sequence Optimization", "Arbitrary Waveform Gen", "Decoherence Mitigation"] }
    ],
    "Blockchain": [
      { name: "L1/L2 Protocol Developer", skills: ["Go-Ethereum Client Mods", "Rust Substrate Pallets", "Consensus Engine (PoW/PoS)", "EVM Bytecode Internals"] },
      { name: "Smart Contract Auditor", skills: ["Solidity Code Auditing", "Slither/MythX Analysis", "Formal Verification Coq", "Attack Vector Vectoring"] },
      { name: "Web3 Integration Engineer", skills: ["Ethers.js Client Scripting", "Wagmi Wallet Integration", "The Graph GraphQL API", "IPFS Storage Setup"] },
      { name: "Token Architect", skills: ["ERC-20/ERC-721/ERC-1155", "Token Vesting Schedule", "Staking Reward Pools", "DAO Governance Model"] },
      { name: "Cryptography Engineer", skills: ["BLS Signature Schemes", "Zero-Knowledge Circuit SNARK", "Homomorphic Encryption", "Hash Function Keccak"] },
      { name: "Hyperledger Specialist", skills: ["Chaincode Go Development", "Hyperledger Fabric Config", "Private Channel Setup", "CouchDB Query Writing"] }
    ]
  };

  const getSubCategories = (categoryName) => {
    return subCategoriesData[categoryName] || [
      { name: `${categoryName} Specialist`, skills: [`${categoryName} Skill A`, `${categoryName} Skill B`] }
    ];
  };

  const getSubCategorySkills = () => {
    const subObj = getSubCategories(activeCategory?.name).find(s => s.name === selectedSub);
    return subObj ? subObj.skills : [];
  };

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    const subs = getSubCategories(cat.name);
    setSelectedSub(subs[0]?.name || "");
  };

  const handleRemoveCategory = () => {
    setActiveCategory(null);
    setSelectedSub("");
  };

  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      if (selectedSkills.length >= 15) {
        alert("You can only select 15 skills in total");
        return;
      }
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const steps = [
    { label: "Step 1", title: "Upload Resume", active: false, done: true },
    { label: "Step 2", title: "Setup Profile", active: false, done: true },
    { label: "Step 3", title: "Choose Skill", active: true, done: false },
    { label: "Step 4", title: "Connect Wallet", active: false, done: false },
    { label: "Step 5", title: "Complete Profile", active: false, done: false }
  ];

  return (
    <div className="choose-skill-page">
      {/* Top navigation header */}
      <div className="top-nav-bar">
        {/* Green back arrow */}
        <button className="nav-back-btn" onClick={activeCategory ? handleRemoveCategory : onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Steps navigation bar */}
        <div className="steps-container">
          {steps.map((step, idx) => (
            <div key={idx} className={`step-item${step.active ? " active" : ""}${step.done ? " done" : ""}`}>
              <span className="step-label">{step.label}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Logout exit button */}
        <button className="nav-logout-btn" onClick={onLogout} aria-label="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="#050A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {activeCategory === null ? (
        /* 1. Category Grid View */
        <div className="skill-canvas-container">
          <h2 className="category-title">Category<span className="red-asterisk">*</span></h2>
          <p className="category-subtitle">Select a category from the following.</p>

          <div className="category-grid">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                className="category-item-btn"
                style={{ width: categoryWidths[cat.name] || "auto" }}
                onClick={() => handleSelectCategory(cat)}
              >
                <span className="category-icon">{getCategoryIcon(cat.name)}</span>
                <span className="category-text">{cat.name}</span>
              </button>
            ))}
          </div>

          <button className="otp-submit-btn skill-next-btn" onClick={onNext}>Next</button>
        </div>
      ) : (
        /* 2. Subcategory & Skills Details View */
        <div className="skill-canvas-container detail-view">
          {/* Selected Category card */}
          <div className="detail-section">
            <h2 className="detail-heading">Category<span className="red-asterisk">*</span></h2>
            <div className="selected-category-pill">
              <div className="selected-category-left">
                <span className="category-icon">{getCategoryIcon(activeCategory.name)}</span>
                <span className="category-text">{activeCategory.name}</span>
              </div>
              <button className="category-pill-close-btn" onClick={handleRemoveCategory} aria-label="Remove category">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#3038BD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Sub Category */}
          <div className="detail-section">
            <h2 className="detail-heading">Sub Category<span className="red-asterisk">*</span></h2>
            <p className="detail-subtitle">Select a category from the following.</p>
            <div className="subcategory-pills-row">
              {getSubCategories(activeCategory.name).map((sub, idx) => {
                const isSelected = selectedSub === sub.name;
                // For "E Commerce Skills" mapping, show "E Commerce Skills" label for all matching mock
                const displayName = activeCategory.name === "E Commerce Skills" ? "E Commerce Skills" : sub.name;
                return (
                  <button
                    key={idx}
                    className={`subcategory-pill-btn${isSelected ? " selected" : ""}`}
                    onClick={() => setSelectedSub(sub.name)}
                  >
                    {displayName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills dropdown */}
          <div className="detail-section">
            <h2 className="detail-heading">Skills</h2>
            <div className="skills-dropdown-block">
              <div className="custom-dropdown-wrapper">
                <div 
                  className="custom-dropdown-header" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>Select</span>
                  <span className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="#3038BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                
                {dropdownOpen && (
                  <div className="custom-dropdown-options-list">
                    {getSubCategorySkills().map((sk, idx) => {
                      const isSelected = selectedSkills.includes(sk);
                      return (
                        <div 
                          key={idx} 
                          className="custom-dropdown-option-row"
                          onClick={() => handleToggleSkill(sk)}
                        >
                          <div className={`custom-dropdown-checkbox${isSelected ? " checked" : ""}`}>
                            {isSelected && (
                              <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="custom-dropdown-option-text">{sk}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="skills-hint-notice">
                <span className="upload-asterisk">*</span>You can only select 15 skills in total
              </p>
              
              {/* Display selected skills tags */}
              {selectedSkills.length > 0 && (
                <div className="suggested-pills-list selected-skills-list">
                  {selectedSkills.map((sk, idx) => (
                    <span key={idx} className="suggested-green-pill" onClick={() => handleRemoveSkill(sk)}>
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suggest missing skill */}
          <div className="detail-section">
            <h2 className="detail-heading">Suggest missing skill</h2>
            <div className="suggest-input-block">
              <input
                type="text"
                className="input-box form-input suggest-missing-input"
                placeholder="Suggest missing skill"
                value={suggestVal}
                onChange={(e) => setSuggestVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (suggestVal.trim()) {
                      const val = suggestVal.trim();
                      if (!suggestedSkills.includes(val)) {
                        setSuggestedSkills([...suggestedSkills, val]);
                      }
                      setSuggestVal("");
                    }
                  }
                }}
              />
              <div className="suggested-pills-list">
                {suggestedSkills.map((tag, idx) => (
                  <span
                    key={idx}
                    className="suggested-green-pill"
                    onClick={() => setSuggestedSkills(suggestedSkills.filter(t => t !== tag))}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Next Button */}
          <div className="skill-bottom-row">
            <button className="otp-submit-btn skill-next-btn" onClick={onNext}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 4: Connect Wallet Screen Component
function ConnectWalletScreen({ onBack, onLogout, onNext }) {
  const [activeWallet, setActiveWallet] = useState("MetaMask");
  const [uniqueAddress, setUniqueAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const steps = [
    { label: "Step 1", title: "Upload Resume", active: false, done: true },
    { label: "Step 2", title: "Setup Profile", active: false, done: true },
    { label: "Step 3", title: "Choose Skill", active: false, done: true },
    { label: "Step 4", title: "Connect Wallet", active: true, done: false },
    { label: "Step 5", title: "Complete Profile", active: false, done: false }
  ];

  return (
    <div className="connect-wallet-page">
      {/* Top navigation header */}
      <div className="top-nav-bar">
        {/* Green back arrow */}
        <button className="nav-back-btn" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Steps navigation bar */}
        <div className="steps-container">
          {steps.map((step, idx) => (
            <div key={idx} className={`step-item${step.active ? " active" : ""}${step.done ? " done" : ""}`}>
              <span className="step-label">{step.label}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Logout exit button */}
        <button className="nav-logout-btn" onClick={onLogout} aria-label="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="#050A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Main content area */}
      <div className="wallet-canvas-container">
        <h2 className="wallet-title">Connect Wallet</h2>
        <p className="wallet-subtitle">
          Select a wallet you want to connect for your payment method. You can change the wallet after a sign in too.
        </p>

        {/* Wallet Options Row */}
        <div className="wallet-options-row">
          {/* CoinBase */}
          <button 
            className={`wallet-card-btn${activeWallet === "CoinBase" ? " selected" : ""}`}
            onClick={() => setActiveWallet("CoinBase")}
          >
            <img src="/coinbase_logo_card.png" alt="CoinBase" className="wallet-card-image" />
          </button>

          {/* Fortmatic */}
          <button 
            className={`wallet-card-btn${activeWallet === "Fortmatic" ? " selected" : ""}`}
            onClick={() => setActiveWallet("Fortmatic")}
          >
            <img src="/fortmatic_logo_card.png" alt="Fortmatic" className="wallet-card-image" />
          </button>

          {/* MetaMask */}
          <button 
            className={`wallet-card-btn${activeWallet === "MetaMask" ? " selected" : ""}`}
            onClick={() => setActiveWallet("MetaMask")}
          >
            <img src="/metamask_logo_card.png" alt="MetaMask" className="wallet-card-image" />
          </button>
        </div>

        {/* Inputs Fields Row */}
        <div className="wallet-fields-row">
          <div className="wallet-field-block">
            <label className="wallet-field-label">Unique Address</label>
            <input 
              type="text" 
              className="wallet-input-box" 
              placeholder="Enter unique address"
              value={uniqueAddress}
              onChange={(e) => setUniqueAddress(e.target.value)}
            />
          </div>

          <div className="wallet-field-block">
            <label className="wallet-field-label">First Name</label>
            <input 
              type="text" 
              className="wallet-input-box" 
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="wallet-field-block">
            <label className="wallet-field-label">Last Name</label>
            <input 
              type="text" 
              className="wallet-input-box" 
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        {/* Bottom next button */}
        <button className="otp-submit-btn wallet-next-btn" onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

// Step 5: Complete Profile Screen Component
function CompleteProfileScreen({ onBack, onLogout, onNext }) {
  const [profilePic, setProfilePic] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastClosing, setToastClosing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  
  // Modal states
  const [zoomVal, setZoomVal] = useState(50);
  const [isErrorState, setIsErrorState] = useState(true);
  const [tempProfilePic, setTempProfilePic] = useState(null);

  const fileInputRef = useRef(null);

  const steps = [
    { label: "Step 1", title: "Upload Resume", active: false, done: true },
    { label: "Step 2", title: "Setup Profile", active: false, done: true },
    { label: "Step 3", title: "Choose Skill", active: false, done: true },
    { label: "Step 4", title: "Connect Wallet", active: false, done: true },
    { label: "Step 5", title: "Complete Profile", active: true, done: false }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setTempProfilePic(uploadEvent.target.result);
        setShowEditModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (isErrorState) return;
    setProfilePic(tempProfilePic);
    setShowEditModal(false);
  };

  const handleTrash = () => {
    setTempProfilePic(null);
    setProfilePic(null);
    setShowEditModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleModifyWithAI = () => {
    setIsPolishing(true);
    setTimeout(() => {
      setAboutText(
        "Highly skilled and results-oriented professional with extensive experience in executing complex projects. Proven track record of delivering top-tier solutions, collaborating with cross-functional teams, and driving digital transformation. Adept at leveraging state-of-the-art tools and methodologies to achieve project goals."
      );
      setIsPolishing(false);
    }, 1000);
  };

  const handlePreview = () => {
    setShowToast(true);
    setToastClosing(false);
    // Hide toast after 3 seconds, then trigger next
    setTimeout(() => {
      setToastClosing(true);
      setTimeout(() => {
        setShowToast(false);
        onNext();
      }, 500); // fade out transition
    }, 3000);
  };

  const closeToast = () => {
    setToastClosing(true);
    setTimeout(() => {
      setShowToast(false);
    }, 500);
  };

  return (
    <div className="complete-profile-page">
      {/* Top navigation header */}
      <div className="top-nav-bar">
        {/* Green back arrow */}
        <button className="nav-back-btn" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Steps navigation bar */}
        <div className="steps-container">
          {steps.map((step, idx) => (
            <div key={idx} className={`step-item${step.active ? " active" : ""}${step.done ? " done" : ""}`}>
              <span className="step-label">{step.label}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Logout exit button */}
        <button className="nav-logout-btn" onClick={onLogout} aria-label="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="#050A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />

      {/* Main content area container */}
      <div className="profile-canvas-container">
        <h2 className="profile-title">Complete Profile</h2>
        <p className="profile-subtitle">
          Upload your photo and write about your work to start your Greelance journey.
        </p>

        {/* Profile Picture Box / Preview */}
        <div className="profile-picture-section">
          {profilePic ? (
            <div className="profile-pic-preview-container">
              <img
                src={profilePic}
                alt="Profile Preview"
                className="profile-pic-circle-img"
              />
              <button
                type="button"
                className="profile-pic-edit-pencil-btn"
                onClick={() => {
                  setTempProfilePic(profilePic);
                  setShowEditModal(true);
                }}
                aria-label="Edit Profile Picture"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#050A5F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="profile-upload-container">
              <div className="profile-upload-dashed-box" onClick={triggerFileUpload}>
                <div className="profile-upload-card-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" fill="#F3F7FF" stroke="#3038BD" strokeWidth="1.5" />
                    <circle cx="12" cy="10" r="2.5" stroke="#3038BD" strokeWidth="1.5" />
                    <path d="M7 17.5c0-1.5 2-2.5 5-2.5s5 1 5 2.5" stroke="#3038BD" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="profile-upload-main-label">Upload Profile Picture</span>
                <div className="profile-upload-tray-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3038BD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
              </div>
              <span className="profile-upload-sub-label-outside">
                <span className="asterisk-green">*</span>You can upload any JPEG or PNG
              </span>
            </div>
          )}
        </div>

        {/* About label and AI button row */}
        <div className="profile-about-header-row">
          <label className="profile-about-label">About</label>
          <button
            type="button"
            className="modify-ai-btn"
            onClick={handleModifyWithAI}
            disabled={isPolishing}
          >
            {isPolishing ? "Polishing..." : "Modify With AI"}
          </button>
        </div>

        {/* Textarea bio input */}
        <textarea
          className="profile-about-textarea"
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          placeholder="Write text here"
        />

        {/* Preview Button bottom row */}
        <div className="profile-bottom-row">
          <button 
            type="button" 
            className={`otp-submit-btn profile-preview-btn${(!profilePic || !aboutText.trim()) ? " disabled" : ""}`} 
            onClick={handlePreview}
            disabled={!profilePic || !aboutText.trim()}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Floating success toast notification */}
      {showToast && (
        <div className={`profile-toast-container${toastClosing ? " toast-slide-out" : " toast-slide-in"}`}>
          <div className="toast-content">
            <div className="toast-checkmark-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22D3A6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="toast-text-block">
              <span className="toast-main-title">Profile Set Successfully</span>
              <span className="toast-sub-title">Your profile is all set</span>
            </div>
            <span className="toast-time">1:20 PM</span>
            <button type="button" className="toast-close-btn" onClick={closeToast} aria-label="Close notification">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Picture Modal Overlay */}
      {showEditModal && (
        <div className="profile-overlay-backdrop">
          <div className="profile-modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-left">
                <span className="modal-title">Edit Profile Picture</span>
                {isErrorState && (
                  <div className="modal-error-badge">
                    <span className="modal-error-exclamation">!</span>
                    <span className="modal-error-text">Error! This picture is not upto the requirements.</span>
                  </div>
                )}
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowEditModal(false)} aria-label="Close modal">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Left Column: Crop Circle, Zoom slider, Trash */}
              <div className="modal-body-left">
                <div className={`modal-crop-circle-container${isErrorState ? " error-state" : ""}`}>
                  {tempProfilePic ? (
                    <>
                      {/* Blurred bottom image */}
                      <img
                        src={tempProfilePic}
                        alt="Crop Preview Blurred"
                        style={{
                          transform: `scale(${1 + zoomVal / 100})`
                        }}
                        className="crop-img-blurred"
                      />
                      {/* Clear top image masked to vertical ellipse */}
                      <img
                        src={tempProfilePic}
                        alt="Crop Preview Clear"
                        style={{
                          transform: `scale(${1 + zoomVal / 100})`
                        }}
                        className="crop-img-clear"
                      />
                    </>
                  ) : (
                    <div className="modal-crop-placeholder">No image</div>
                  )}
                  <div className="crop-dashed-oval"></div>
                </div>

                {/* Zoom Slider area */}
                <div className="modal-zoom-container">
                  <span className="zoom-label">Zoom</span>
                  <div className="zoom-slider-row">
                    <button type="button" className="zoom-adjust-btn" onClick={() => setZoomVal(Math.max(0, zoomVal - 10))} aria-label="Zoom out">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#050A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={zoomVal}
                      onChange={(e) => setZoomVal(Number(e.target.value))}
                      className="zoom-range-slider"
                    />
                    <button type="button" className="zoom-adjust-btn" onClick={() => setZoomVal(Math.min(100, zoomVal + 10))} aria-label="Zoom in">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#050A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Trash Icon */}
                <button type="button" className="modal-trash-btn" onClick={handleTrash} aria-label="Delete image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#050A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>

              {/* Right Column: Instructions, Smaller circle previews */}
              <div className="modal-body-right">
                <div className="modal-instructions-block">
                  <h3 className="modal-instructions-title">Show clients the best version of yourself!</h3>
                  <p className="modal-instructions-text">
                    Must be an actual photo of you. Logos, clip-art, group photos, and digitally-altered images are not allowed.
                  </p>
                </div>

                {/* Smaller preview circular variations */}
                <div className="modal-small-previews-row">
                  {/* 80px */}
                  <div className="small-preview-circle-wrapper" style={{ width: "80px", height: "80px" }}>
                    <div className="small-preview-circle" style={{ width: "80px", height: "80px" }}>
                      {tempProfilePic && (
                        <img
                          src={tempProfilePic}
                          alt="preview-80"
                          style={{
                            transform: `scale(${1 + zoomVal / 100})`,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* 60px */}
                  <div className="small-preview-circle-wrapper" style={{ width: "60px", height: "60px" }}>
                    <div className="small-preview-circle" style={{ width: "60px", height: "60px" }}>
                      {tempProfilePic && (
                        <img
                          src={tempProfilePic}
                          alt="preview-60"
                          style={{
                            transform: `scale(${1 + zoomVal / 100})`,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* 40px */}
                  <div className="small-preview-circle-wrapper" style={{ width: "40px", height: "40px" }}>
                    <div className="small-preview-circle" style={{ width: "40px", height: "40px" }}>
                      {tempProfilePic && (
                        <img
                          src={tempProfilePic}
                          alt="preview-40"
                          style={{
                            transform: `scale(${1 + zoomVal / 100})`,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* 24px */}
                  <div className="small-preview-circle-wrapper" style={{ width: "24px", height: "24px" }}>
                    <div className="small-preview-circle" style={{ width: "24px", height: "24px" }}>
                      {tempProfilePic && (
                        <img
                          src={tempProfilePic}
                          alt="preview-24"
                          style={{
                            transform: `scale(${1 + zoomVal / 100})`,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulation error state toggle button for easier inspection */}
                <div className="simulation-error-toggle">
                  <button
                    type="button"
                    className="toggle-error-state-btn"
                    onClick={() => setIsErrorState(!isErrorState)}
                  >
                    {isErrorState ? "🟢 Switch to Normal State" : "🔴 Switch to Error State (Requirements check)"}
                  </button>
                </div>

                {/* Save button */}
                <button
                  type="button"
                  className={`modal-save-btn${isErrorState ? " disabled" : ""}`}
                  onClick={handleSave}
                  disabled={isErrorState}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 8. Right Section — all elements are direct children of .right
// so their absolute coordinates match Figma (relative to .right, not signupCard)
function RightSection({ onNavigateOtp, onNavigateUpload, setEmailToVerify }) {
  const [page, setPage] = useState("select"); // "select" | "signup" | "signin" | "forgot-password"
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Signup input fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Sign-in input fields state
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [signinError, setSigninError] = useState("");

  // Clear error when user types
  const handleEmailChange = (e) => { setEmail(e.target.value); setErrorMsg(""); };
  const handlePasswordChange = (e) => { setPassword(e.target.value); setErrorMsg(""); };
  const handleConfirmChange = (e) => { setConfirmPassword(e.target.value); setErrorMsg(""); };

  // Validate and submit signup to Supabase Auth
  const handleSignUp = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter a password");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    if (!confirmPassword) {
      setErrorMsg("Please confirm your password");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setErrorMsg("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: selectedOption ? selectedOption.toLowerCase() : "freelancer",
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setEmailToVerify(email.trim());
        onNavigateOtp();
      }
    } catch (err) {
      setErrorMsg("An error occurred during signup.");
    }
  };

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
              onChange={handleEmailChange}
            />

            {/* Password */}
            <label className="input-label password-label">Password</label>
            <input
              type="password"
              className="input-box password-input"
              placeholder="Enter password"
              value={password}
              onChange={handlePasswordChange}
            />

            {/* Confirm Password */}
            <label className="input-label confirm-label">Confirm Password</label>
            <input
              type="password"
              className="input-box confirm-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={handleConfirmChange}
            />

            {/* Password Validation Note */}
            <p className="validation-note">
              *Password must contain 8 characters, uppercase letters, lower case letters, numbers, symbols
            </p>

            {/* Validation Error Message */}
            {errorMsg && <p className="signup-error-msg">{errorMsg}</p>}

            {/* Sign Up Button — validates then navigates to OTP */}
            <button className="nextButton signup-btn" onClick={handleSignUp}>Sign Up</button>

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
        ) : page === "forgot-password" ? (
          <>
            {/* Reset Password Title */}
            <h2 className="signup-title-new">Reset Password</h2>
            <p className="welcome" style={{ fontSize: "14px", marginTop: "10px", marginBottom: "15px" }}>
              Enter your email address and we will send you a simulated link to reset your password.
            </p>

            {/* Email Address */}
            <label className="input-label email-label">Email Address</label>
            <input
              type="email"
              className="input-box email-input"
              placeholder="johnsmith@gmail.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
            />

            {errorMsg && <p className="signup-error-msg">{errorMsg}</p>}

            {/* Send Reset Link Button */}
            <button
              className="nextButton"
              style={{ marginTop: "15px" }}
              onClick={async () => {
                if (!email.trim()) {
                  setErrorMsg("Please enter your email address");
                  return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                  setErrorMsg("Please enter a valid email address");
                  return;
                }
                setErrorMsg("");
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
                  if (error) {
                    setErrorMsg(error.message);
                  } else {
                    setPage("signin");
                  }
                } catch (err) {
                  setErrorMsg("An error occurred.");
                }
              }}
            >
              Send Reset Link
            </button>

            {/* Back to Sign In Link */}
            <p className="signin signup-page-signin" style={{ marginTop: "20px" }}>
              Remember your password?
              <span onClick={() => setPage("signin")}> Sign In</span>
            </p>
          </>
        ) : (
          <>
            {/* Welcome Back Title */}
            <h2 className="signup-title-new">Welcome Back!</h2>

            {/* Email Address */}
            <label className="input-label email-label">Email Address</label>
            <input
              type="email"
              className="input-box email-input"
              placeholder="johnsmith@gmail.com"
              value={signinEmail}
              onChange={(e) => { setSigninEmail(e.target.value); setSigninError(""); }}
            />

            {/* Password */}
            <label className="input-label password-label">Password</label>
            <div className="signin-password-wrapper">
              <input
                type={showSigninPassword ? "text" : "password"}
                className="input-box signin-password-input"
                placeholder="Enter password"
                value={signinPassword}
                onChange={(e) => { setSigninPassword(e.target.value); setSigninError(""); }}
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowSigninPassword(!showSigninPassword)}
                aria-label={showSigninPassword ? "Hide password" : "Show password"}
              >
                {showSigninPassword ? (
                  /* Eye open icon */
                  <svg width="16.5" height="12" viewBox="0 0 20 14" fill="none">
                    <path d="M10 1C5.45 1 1.57 3.95 0 8c1.57 4.05 5.45 7 10 7s8.43-2.95 10-7c-1.57-4.05-5.45-7-10-7z" stroke="#D0D2ED" strokeWidth="1.5" fill="none"/>
                    <circle cx="10" cy="8" r="3" stroke="#D0D2ED" strokeWidth="1.5" fill="none"/>
                  </svg>
                ) : (
                  /* Eye closed icon */
                  <svg width="16.5" height="12" viewBox="0 0 20 14" fill="none">
                    <path d="M10 1C5.45 1 1.57 3.95 0 8c1.57 4.05 5.45 7 10 7s8.43-2.95 10-7c-1.57-4.05-5.45-7-10-7z" stroke="#D0D2ED" strokeWidth="1.5" fill="none"/>
                    <circle cx="10" cy="8" r="3" stroke="#D0D2ED" strokeWidth="1.5" fill="none"/>
                    <line x1="2" y1="1" x2="18" y2="13" stroke="#D0D2ED" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Forget Password Link */}
            <p className="forget-password-link" style={{ cursor: "pointer" }} onClick={() => setPage("forgot-password")}>Forget Password?</p>

            {/* Sign In Validation Error */}
            {signinError && <p className="signin-error-msg">{signinError}</p>}

            {/* Sign In Button */}
            <button
              className="nextButton signin-btn"
              onClick={async () => {
                if (!signinEmail.trim()) { setSigninError("Please enter your email address"); return; }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signinEmail.trim())) { setSigninError("Please enter a valid email address"); return; }
                if (!signinPassword) { setSigninError("Please enter your password"); return; }
                
                setSigninError("");
                try {
                  const { data, error } = await supabase.auth.signInWithPassword({
                    email: signinEmail.trim(),
                    password: signinPassword,
                  });

                  if (error) {
                    if (error.code === "email_not_verified" || error.message.includes("verified")) {
                      setSigninError("Email not verified. Redirecting to verification OTP screen.");
                      setEmailToVerify(signinEmail.trim());
                      setTimeout(() => {
                        onNavigateOtp();
                      }, 1500);
                    } else {
                      setSigninError(error.message);
                    }
                  } else {
                    onNavigateUpload();
                  }
                } catch (err) {
                  setSigninError("An error occurred during sign in.");
                }
              }}
            >Sign In</button>

            {/* Don't have an account? Sign Up */}
            <p className="signin signup-page-signin">
              Don't have an account?
              <span onClick={() => setPage("signup")}> Sign Up</span>
            </p>

            {/* Social sign in text */}
            <p className="socialText">You can also signin with</p>

            {/* Social icons */}
            <SocialIcons />
          </>
        )}
      </div>
    </div>
  );
}

// 9. Main App Component (Landing Page)
// --- NEW SECURITY DEMONSTRATION COMPONENTS ---

function ResetPasswordScreen({ onResetSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword) {
      setErrorMsg("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onResetSuccess();
        }, 2000);
      }
    } catch (err) {
      setErrorMsg("Failed to update password.");
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-logo-container">
        <img src={IMAGES.logo} className="otp-logo-img" alt="Greelance Logo" />
      </div>
      <div className="otp-content-wrapper">
        <div className="otp-card">
          {success ? (
            <>
              <div className="verified-icon">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <path d="M20 36L32 48L52 24" stroke="#22D3A6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="verified-title">Updated!</h2>
              <p className="verified-subtitle">Password reset successfully. Redirecting...</p>
            </>
          ) : (
            <>
              <h2 className="otp-title" style={{ fontSize: "28px" }}>Reset Password</h2>
              <p className="otp-subtitle">Enter your new secure password below</p>
              
              <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "8px", margin: "20px 0" }}>
                <label className="input-label" style={{ alignSelf: "flex-start" }}>New Password</label>
                <input
                  type="password"
                  className="input-box"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(""); }}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                
                <label className="input-label" style={{ alignSelf: "flex-start", marginTop: "10px" }}>Confirm Password</label>
                <input
                  type="password"
                  className="input-box"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(""); }}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {errorMsg && (
                <p className="signup-error-msg" style={{ margin: "5px 0 15px 0" }}>{errorMsg}</p>
              )}

              <button className="otp-submit-btn" onClick={handleSubmit} style={{ width: "100%" }}>
                Update Password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeDashboard({ session, onLogout, onNavigateOnboarding, onNavigateAdmin }) {
  const user = session?.user;
  const role = user?.user_metadata?.role || "freelancer";
  const accessToken = session?.access_token;
  const expiresAt = session?.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString() : "N/A";

  return (
    <div className="right">
      <div className="right-content-wrapper">
        {/* Logo */}
        <div className="logo-container">
          <img src={IMAGES.logo} className="logo-img" alt="Greelance Logo" />
        </div>

        {/* White Card */}
        <div style={{
          position: "absolute",
          top: "138.75px",
          left: 0,
          width: "442.5px",
          height: "544.5px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, .08)",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          boxSizing: "border-box",
          fontFamily: "Lexend, sans-serif"
        }}>
          <h2 style={{ fontSize: "24px", color: "#050A5F", fontWeight: "600", margin: "0 0 4px 0", textAlign: "center" }}>Welcome Back!</h2>
          <p style={{ fontSize: "12px", color: "#22D3A6", margin: "0 0 20px 0", fontWeight: "500", textAlign: "center" }}>Logged in successfully</p>

          <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "10px", textAlign: "left", fontSize: "13px" }}>
            <div style={{ padding: "8px 12px", background: "#F3F7FF", borderRadius: "8px", border: "1px solid #D2D4FF" }}>
              <strong style={{ color: "#050A5F" }}>Email:</strong> <span style={{ color: "#333", float: "right" }}>{user?.email}</span>
            </div>
            
            <div style={{ padding: "8px 12px", background: "#F3F7FF", borderRadius: "8px", border: "1px solid #D2D4FF" }}>
              <strong style={{ color: "#050A5F" }}>Role:</strong> <span style={{ color: "#3038BD", fontWeight: "bold", textTransform: "capitalize", float: "right" }}>{role}</span>
            </div>

            <div style={{ padding: "10px 12px", background: "#F3F7FF", borderRadius: "8px", border: "1px solid #D2D4FF" }}>
              <strong style={{ color: "#050A5F", display: "block", marginBottom: "4px" }}>Access Token:</strong>
              <div style={{ 
                fontSize: "10px", 
                color: "#666", 
                background: "#E6EFFF", 
                padding: "6px", 
                borderRadius: "4px", 
                maxHeight: "50px", 
                overflowY: "auto",
                wordBreak: "break-all",
                fontFamily: "monospace"
              }}>
                {accessToken}
              </div>
              <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
                <strong>Expires:</strong> {expiresAt}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "10px", marginTop: "auto", marginBottom: "10px" }}>
            <button 
              className="nextButton" 
              onClick={onNavigateOnboarding} 
              style={{ position: "static", width: "100%", height: "45px", margin: 0 }}
            >
              Go to Profile Onboarding
            </button>

            {role === "admin" && (
              <button 
                className="nextButton" 
                onClick={onNavigateAdmin} 
                style={{ position: "static", width: "100%", height: "45px", margin: 0, background: "#3038BD" }}
              >
                Admin Console
              </button>
            )}

            <button 
              onClick={onLogout} 
              style={{ 
                width: "100%", 
                height: "45px",
                background: "transparent",
                border: "1.5px solid #E53935", 
                color: "#E53935", 
                borderRadius: "8px", 
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "Lexend, sans-serif"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminConsole({ onBack }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Read mock users list
    const mockUsers = JSON.parse(localStorage.getItem("mock_supabase_users") || "[]");
    setUsers(mockUsers);
  }, []);

  return (
    <div className="otp-page" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div className="otp-logo-container" style={{ position: "relative", marginBottom: "20px" }}>
        <img src={IMAGES.logo} className="otp-logo-img" alt="Greelance Logo" />
      </div>
      
      <div className="otp-card" style={{ width: "100%", maxWidth: "700px", padding: "25px", background: "white", borderRadius: "16px", border: "1px solid #D2D4FF" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="otp-title" style={{ fontSize: "28px", color: "#050A5F", margin: 0 }}>Admin Console</h2>
          <button className="create-manually-btn" onClick={onBack} style={{ margin: 0, padding: "8px 16px" }}>Back</button>
        </div>
        
        <p className="otp-subtitle" style={{ textAlign: "left", marginBottom: "15px" }}>
          <strong>Authorization check passed:</strong> Only users with the <code>admin</code> role can view this console.
        </p>

        <div style={{ overflowX: "auto", marginTop: "10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Lexend, sans-serif", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F3F7FF", borderBottom: "2px solid #D2D4FF" }}>
                <th style={{ padding: "12px", color: "#050A5F" }}>ID</th>
                <th style={{ padding: "12px", color: "#050A5F" }}>Email</th>
                <th style={{ padding: "12px", color: "#050A5F" }}>Role</th>
                <th style={{ padding: "12px", color: "#050A5F" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#666" }}>No registered users found. Try registering a few accounts.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #E6EFFF" }}>
                    <td style={{ padding: "12px", color: "#666" }}>{u.id}</td>
                    <td style={{ padding: "12px", color: "#333" }}>{u.email}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: u.role === "admin" ? "#E6EFFF" : "#F3F7FF",
                        color: u.role === "admin" ? "#3038BD" : "#666"
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ 
                        color: u.isVerified ? "#22D3A6" : "#E53935",
                        fontWeight: "bold"
                      }}>
                        {u.isVerified ? "Verified" : "Pending OTP"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 9. Main App Component (Landing Page)
export default function App() {
  const [currentView, setCurrentView] = useState("landing"); // "landing" | "otp" | "upload-resume" | "setup-profile" | "choose-skill" | "admin-console" | "reset-password"
  const [profileFlow, setProfileFlow] = useState("manual"); // "resume" | "manual"
  
  // Supabase Auth and Session State
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Initialize and subscribe to Auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    // Check mock recovery token in search params
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    if (token && typeof supabase.auth.verifyMockResetToken === "function") {
      const verified = supabase.auth.verifyMockResetToken(token);
      if (verified) {
        setCurrentView("reset-password");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Handle session state changes (sign-in, sign-out, token refresh, recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsAuthLoading(false);

      if (event === "PASSWORD_RECOVERY") {
        setCurrentView("reset-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Protected Routes Guard
  const protectedViews = ["upload-resume", "setup-profile", "choose-skill", "connect-wallet", "complete-profile", "admin-console"];
  useEffect(() => {
    if (!isAuthLoading && !session && protectedViews.includes(currentView)) {
      setCurrentView("landing");
    }
  }, [currentView, session, isAuthLoading]);

  // Sign out helper
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView("landing");
  };

  if (isAuthLoading) {
    return (
      <div className="otp-page">
        <h2 className="otp-title">Loading...</h2>
      </div>
    );
  }

  if (currentView === "admin-console") {
    return (
      <AdminConsole onBack={() => setCurrentView("landing")} />
    );
  }

  if (currentView === "reset-password") {
    return (
      <ResetPasswordScreen onResetSuccess={handleLogout} />
    );
  }

  if (currentView === "otp") {
    return (
      <OTPScreen
        onBack={() => setCurrentView("landing")}
        emailToVerify={emailToVerify}
        onVerifySuccess={() => {
          setProfileFlow("resume");
          setCurrentView("upload-resume");
        }}
      />
    );
  }

  if (currentView === "upload-resume") {
    return (
      <UploadResumeScreen
        onBack={() => setCurrentView("landing")}
        onLogout={handleLogout}
        onNavigateSetup={(flowType) => {
          setProfileFlow(flowType);
          setCurrentView("setup-profile");
        }}
      />
    );
  }

  if (currentView === "setup-profile") {
    return (
      <SetupProfileScreen
        flow={profileFlow}
        onBack={() => setCurrentView("upload-resume")}
        onLogout={handleLogout}
        onNext={() => setCurrentView("choose-skill")}
      />
    );
  }

  if (currentView === "choose-skill") {
    return (
      <ChooseSkillScreen
        onBack={() => setCurrentView("setup-profile")}
        onLogout={handleLogout}
        onNext={() => setCurrentView("connect-wallet")}
      />
    );
  }

  if (currentView === "connect-wallet") {
    return (
      <ConnectWalletScreen
        onBack={() => setCurrentView("choose-skill")}
        onLogout={handleLogout}
        onNext={() => setCurrentView("complete-profile")}
      />
    );
  }

  if (currentView === "complete-profile") {
    return (
      <CompleteProfileScreen
        onBack={() => setCurrentView("connect-wallet")}
        onLogout={handleLogout}
        onNext={() => {
          alert("Profile Onboarding Completed Successfully! Returning to Landing.");
          setCurrentView("landing");
        }}
      />
    );
  }

  return (
    <div className="landing">
      <LeftSection />
      {session ? (
        <WelcomeDashboard
          session={session}
          onLogout={handleLogout}
          onNavigateOnboarding={() => {
            setProfileFlow("resume");
            setCurrentView("upload-resume");
          }}
          onNavigateAdmin={() => setCurrentView("admin-console")}
        />
      ) : (
        <RightSection
          onNavigateOtp={() => setCurrentView("otp")}
          setEmailToVerify={setEmailToVerify}
          onNavigateUpload={() => {
            setProfileFlow("resume");
            setCurrentView("upload-resume");
          }}
        />
      )}
    </div>
  );
}
