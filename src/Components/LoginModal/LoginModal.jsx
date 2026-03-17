"use client";
import {
  GetOTPApi,
  userRegisterApi,
  verifyOTPApi,
  forgotPasswordApi,
} from "@/store/actions/campaign";
import { signupLoaded } from "@/store/reducer/authSlice";
import { Fcmtoken, settingsData } from "@/store/reducer/settingsSlice";
import FirebaseData from "@/utils/Firebase";
import { handleFirebaseAuthError, translate } from "@/utils/helper";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import { PhoneNumberUtil } from "google-libphonenumber";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle, FcPhoneAndroid } from "react-icons/fc";
import { RiCloseCircleLine, RiMailSendFill } from "react-icons/ri";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

// Reusable Google Sign-In Button
const GoogleSignInButton = ({ onClick, icon, text }) => (
  <div className="mt-4 w-full" onClick={onClick}>
    <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-medium py-3.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm active:scale-[0.98]">
      <div className="flex items-center justify-center bg-gray-50 p-1.5 rounded-full">{icon}</div>
      <span className="text-base text-gray-800 font-semibold">{text}</span>
    </button>
  </div>
);

// Reusable Footer Links
const FooterLinks = () => (
  <span className="text-xs text-gray-500">
    {translate("byclick")}{" "}
    <Link href="/terms-and-condition" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">{translate("terms&condition")}</Link>{" "}
    <span className="mx-1"> {translate("and")} </span>{" "}
    <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-700 font-medium transition-colors"> {translate("privacyPolicy")} </Link>
  </span>
);

// Phone Login Form Component
const PhoneLoginForm = ({
  value,
  setValue,
  onSignUp,
  ShowGoogleLogin,
  handleEmailLoginshow,
  CompanyName,
  handleGoogleSignup,
  ShowPhoneLogin,
  showLoader,
}) => (
  <div className="w-full space-y-6">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSignUp(e);
      }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h4 className="text-2xl font-bold text-gray-900">{translate("enterMobile")}</h4>
        <p className="text-gray-500 text-sm">{translate("sendCode")}</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700" htmlFor="phone">
          {translate("phoneNumber")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <PhoneInput
            defaultCountry={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
            international
            value={value}
            onChange={setValue}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all !bg-gray-50"
          />
        </div>
      </div>
      <div className="w-full mt-6">
        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold flex justify-center items-center py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed" disabled={showLoader}>
          {showLoader ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            translate("continue")
          )}
        </button>
      </div>
    </form>

    {ShowGoogleLogin && (
      <div className="flex items-center justify-center space-x-4 my-8">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-sm text-gray-400 font-medium px-2">{translate("or")}</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
    )}

    <GoogleSignInButton
      onClick={handleEmailLoginshow}
      icon={<RiMailSendFill size={20} className="text-primary-600" />}
      text={translate("CWE")}
    />

    {ShowGoogleLogin && (
      <>
        {!ShowPhoneLogin && (
          <div className="text-center space-y-2 mt-8">
            <h4 className="text-xl font-bold text-gray-900">
              {translate("loginTo")} {CompanyName}
            </h4>
            <p className="text-gray-500 text-sm">{translate("connectWithGoogle")}</p>
          </div>
        )}
        <GoogleSignInButton
          onClick={handleGoogleSignup}
          icon={<FcGoogle size={20} />}
          text={translate("CWG")}
        />
      </>
    )}
  </div>
);

// OTP Form Component
const OTPForm = ({
  phonenum,
  otp,
  setOTP,
  handleConfirm,
  showLoader,
  isCounting,
  timeLeft,
  formatTime,
  handleResendOTP,
  wrongNumber,
  wrongEmail,
  isEmailOtpEnabled,
  emailOtp = "", // Initialize as a string
  setEmailOtp,
  handleEmailOtpVerification,
  emailTimeLeft,
  isEmailCounting,
  email,
}) => {
  const inputRefs = useRef(Array(6).fill(null)); // Initialize with 6 null values
  const [focusedIndex, setFocusedIndex] = useState(-1); // Initialize with -1 (no focus)
  // Handle phone OTP input change
  const handlePhoneOtpChange = (event, index) => {
    const value = event.target.value;
    if (!isNaN(value) && value !== "") {
      setOTP((prevOTP) => {
        const newOTP = prevOTP.split(""); // Convert string to array
        newOTP[index] = value;
        return newOTP.join(""); // Convert back to string
      });

      // Move focus to the next input field if available
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
        setFocusedIndex(index + 1); // Update focused index
      }
    }
  };

  // Handle email OTP input change
  const handleEmailOtpChange = (event, index) => {
    const value = event.target.value;
    if (!isNaN(value) && value !== "") {
      setEmailOtp((prevOTP) => {
        const newOTP = prevOTP.split(""); // Convert string to array
        newOTP[index] = value;
        return newOTP.join(""); // Convert back to string
      });

      // Move focus to the next input field if available
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
        setFocusedIndex(index + 1); // Update focused index
      }
    }
  };
  // Handle phone OTP backspace and Enter key
  const handlePhoneOtpKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setOTP((prevOTP) => {
        const newOTP = prevOTP.split(""); // Convert string to array
        newOTP[index] = ""; // Clear the current input
        return newOTP.join(""); // Convert back to string
      });

      // Move focus to the previous input field if the current field is empty
      if (index > 0 && !otp[index]) {
        inputRefs.current[index - 1].focus();
        setFocusedIndex(index - 1); // Update focused index
      } else {
        inputRefs.current[index].focus(); // Keep focus on the current input field
        setFocusedIndex(index); // Update focused index
      }
    } else if (event.key === "Enter") {
      // If the Enter key is pressed and all OTP fields are filled
      if (
        index === 5 &&
        otp.length === 6 &&
        otp.split("").every((digit) => digit !== "")
      ) {
        handleConfirm(); // Trigger the phone OTP verification function
      }
    }
  };

  // Handle email OTP backspace and Enter key
  const handleEmailOtpKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setEmailOtp((prevOTP) => {
        const newOTP = prevOTP.split(""); // Convert string to array
        newOTP[index] = ""; // Clear the current input
        return newOTP.join(""); // Convert back to string
      });

      // Move focus to the previous input field if the current field is empty
      if (index > 0 && !emailOtp[index]) {
        inputRefs.current[index - 1].focus();
        setFocusedIndex(index - 1); // Update focused index
      } else {
        inputRefs.current[index].focus(); // Keep focus on the current input field
        setFocusedIndex(index); // Update focused index
      }
    } else if (event.key === "Enter") {
      // If the Enter key is pressed and all OTP fields are filled
      if (
        index === 5 &&
        emailOtp.length === 6 &&
        emailOtp.split("").every((digit) => digit !== "")
      ) {
        handleEmailOtpVerification(event); // Trigger the email OTP verification function
      }
    }
  };

  return (
    <form className="w-full space-y-8 py-4">
      <div className="text-center space-y-3">
        <h4 className="text-3xl font-bold text-gray-900">{translate("otpVerification")}</h4>
        <p className="text-gray-500 text-sm">
          {email ? translate("enterOtpSentToEmail") : translate("enterOtp")}
          <br/>
          <span className="font-semibold text-gray-800 text-base block mt-2">{email ? email : phonenum}</span>
        </p>
        
        {email ? (
          <button type="button" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors mt-2" onClick={wrongEmail}>
            {translate("wrongEmail")}
          </button>
        ) : (
          <button type="button" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors mt-2" onClick={wrongNumber}>
            {translate("wrongNumber")}
          </button>
        )}
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-center gap-2 sm:gap-4 my-8" dir="ltr">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold text-gray-900 bg-gray-50 border ${focusedIndex === index ? "border-primary-500 ring-4 ring-primary-500/20 bg-white" : "border-gray-200"} rounded-xl focus:outline-none transition-all`}
            type="text"
            maxLength={1}
            value={
              isEmailOtpEnabled
                ? emailOtp[index] || "" 
                : otp[index] || ""
            }
            onChange={
              isEmailOtpEnabled
                ? (e) => handleEmailOtpChange(e, index)
                : (e) => handlePhoneOtpChange(e, index)
            }
            onKeyDown={
              isEmailOtpEnabled
                ? (e) => handleEmailOtpKeyDown(e, index)
                : (e) => handlePhoneOtpKeyDown(e, index)
            }
            onFocus={() => setFocusedIndex(index)} 
            onBlur={() => setFocusedIndex(-1)} 
            ref={(inputRef) => (inputRefs.current[index] = inputRef)} 
          />
        ))}
      </div>

      {/* Resend OTP Section */}
      <div className="text-center text-sm font-medium">
        {isEmailOtpEnabled ? (
          !isEmailCounting ? (
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              {translate("resendOtp")}
            </button>
          ) : (
            <span className="text-gray-500 cursor-not-allowed">{formatTime(emailTimeLeft)}</span>
          )
        ) : // Phone OTP Resend
        !isCounting ? (
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            {translate("resendOtp")}
          </button>
        ) : (
          <span className="text-gray-500 cursor-not-allowed">{formatTime(timeLeft)}</span>
        )}
      </div>

      {/* Continue Button */}
      <div className="mt-8">
        <button
          type="button"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-md shadow-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          onClick={(e) =>
            isEmailOtpEnabled ? handleEmailOtpVerification(e) : handleConfirm(e)
          }
        >
          {showLoader ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span>{translate("confirm")}</span>
          )}
        </button>
      </div>
    </form>
  );
};

// Register Form Component
const RegisterForm = ({
  registerFormData,
  handleRegisterInputChange,
  handleRegisterPhoneChange,
  handleRegisterUser,
  handleSignIn,
  showLoader,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h4 className="text-2xl font-bold text-gray-900">{translate("registerNow")}</h4>
      </div>
      <form onSubmit={handleRegisterUser} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="name">
            {translate("username")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder={translate("enterUsername")}
            value={registerFormData?.name}
            onChange={handleRegisterInputChange}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="email">
            {translate("email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder={translate("enterEmail")}
            value={registerFormData?.email}
            onChange={handleRegisterInputChange}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="phone">{translate("phoneNumber")}</label>
          <PhoneInput
            defaultCountry={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
            international
            value={registerFormData?.phone}
            onChange={handleRegisterPhoneChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all !bg-gray-50 focus-within:!bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
            {translate("password")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder={translate("enterPassword")}
              value={registerFormData?.password}
              onChange={handleRegisterInputChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="confirmPassword">
            {translate("confirmPassword")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder={translate("enterConfirmPassword")}
              value={registerFormData?.confirmPassword}
              onChange={handleRegisterInputChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold flex justify-center items-center py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed" disabled={showLoader}>
            {showLoader ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              translate("register")
            )}
          </button>
        </div>

        <p className="text-center text-sm font-medium text-gray-600 mt-6">
          {translate("alreadyHaveAccount")}{" "}
          <button type="button" className="text-primary-600 hover:text-primary-700 font-bold transition-colors" onClick={handleSignIn}>
            {translate("signIn")}
          </button>
        </p>
      </form>
    </div>
  );
};

// Forgot Password Form Component
const ForgotPasswordForm = ({ onSubmit, showLoader, onBackToLogin }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center space-y-2 mb-8">
          <h4 className="text-2xl font-bold text-gray-900">{translate("forgotPassword")}</h4>
          <p className="text-gray-500 text-sm">{translate("enterEmailForReset")}</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="forgot-email">
            {translate("email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="forgot-email"
            name="email"
            placeholder={translate("enterEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold flex justify-center items-center py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed" disabled={showLoader}>
            {showLoader ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              translate("submit")
            )}
          </button>
        </div>

        <p className="text-center text-sm font-medium mt-6">
          <button type="button" onClick={onBackToLogin} className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
            ← {translate("backToLogin")}
          </button>
        </p>
      </form>
    </div>
  );
};

// Email Login Form Component
const EmailLoginForm = ({
  signInFormData,
  handleSignInInputChange,
  SignInWithEmail,
  handlesignUp,
  ShowGoogleLogin,
  ShowPhoneLogin,
  handlePhoneLogin,
  handleGoogleSignup,
  showLoader,
  emailReverify,
  onForgotPasswordClick,
  handleResendOTP,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h4 className="text-2xl font-bold text-gray-900">{translate("signIn")}</h4>
      </div>
      <form className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="email">
            {translate("email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder={translate("enterEmail")}
            value={signInFormData?.email}
            onChange={handleSignInInputChange}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
            {translate("password")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder={translate("enterPassword")}
              value={signInFormData?.password}
              onChange={handleSignInInputChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            onClick={onForgotPasswordClick}
          >
            {translate("forgotPassword")}
          </button>
        </div>

        <div className="pt-4">
          {emailReverify ? (
            <button
              type="button"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold flex justify-center items-center py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleResendOTP}
              disabled={showLoader}
            >
              {showLoader ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                translate("resendVerificationCode")
              )}
            </button>
          ) : (
            <button
              type="button"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold flex justify-center items-center py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={(e) => SignInWithEmail(e)}
            >
              {showLoader ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                translate("signIn")
              )}
            </button>
          )}
        </div>

        <p className="text-center text-sm font-medium text-gray-600 mt-6">
          {translate("dontHaveAccount")}{" "}
          <button type="button" className="text-primary-600 hover:text-primary-700 font-bold transition-colors" onClick={handlesignUp}>
            {translate("registerNow")}
          </button>
        </p>
      </form>

      <div className="mt-6">
        {ShowGoogleLogin && (
          <div className="flex items-center justify-center space-x-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 font-medium px-2">{translate("or")}</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
        )}
        {ShowPhoneLogin && (
          <GoogleSignInButton
            onClick={handlePhoneLogin}
            icon={<FcPhoneAndroid size={20} />}
            text={translate("CWP")}
          />
        )}
        {ShowGoogleLogin && (
          <GoogleSignInButton
            onClick={handleGoogleSignup}
            icon={<FcGoogle size={20} />}
            text={translate("CWG")}
          />
        )}
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, asPage = false }) => {
  const SettingsData = useSelector(settingsData);
  const isDemo = SettingsData?.demo_mode;
  const CompanyName = SettingsData?.company_name;

  const ShowPhoneLogin = SettingsData?.number_with_otp_login === "1";
  const ShowGoogleLogin = SettingsData?.social_login === "1";
  const ShowEmailLogin = SettingsData?.email_password_login === "1";
  const isFirebaseOtp = SettingsData?.otp_service_provider === "firebase";
  const isTwilloOtp = SettingsData?.otp_service_provider === "twilio";

  const DefaultToPhoneLogin = !ShowPhoneLogin && !ShowGoogleLogin;
  const navigate = useRouter();
  const { authentication } = FirebaseData();
  const FcmToken = useSelector(Fcmtoken);
  const DemoNumber = "+911234567890";
  const DemoOTP = "123456";

  const [showLoginContent, setShowLoginContent] = useState(false);
  const [showOTPContent, setShowOtpContent] = useState(false);
  const [showRegisterContent, setShowRegisterContent] = useState(false);
  const [showEmailContent, setShowEmailContent] = useState(true);

  const [phonenum, setPhonenum] = useState();
  const [value, setValue] = useState(isDemo ? DemoNumber : "");
  const phoneUtil = PhoneNumberUtil.getInstance();
  const [otp, setOTP] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isCounting, setIsCounting] = useState(false);
  const inputRefs = useRef([]);
  const otpInputRef = useRef(null);

  const [isEmailOtpEnabled, setIsEmailOtpEnabled] = useState(false); // State to track email OTP
  const [emailOtp, setEmailOtp] = useState(""); // Initialize as an array of 6 emp
  const [emailTimeLeft, setEmailTimeLeft] = useState(120); // 2 minutes in seconds
  const [isEmailCounting, setIsEmailCounting] = useState(false); // State to track email OTP coun

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [emailReverify, setEmailReverify] = useState(false);

  // Handle countdown logic
  useEffect(() => {
    let timer;
    if (isCounting && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
      setTimeLeft(0);
      setIsCounting(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, timeLeft]);

  useEffect(() => {
    let timer;
    if (isEmailCounting && emailTimeLeft > 0) {
      timer = setInterval(() => {
        setEmailTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (emailTimeLeft === 0) {
      clearInterval(timer);
      setIsEmailCounting(false);
    }
    return () => clearInterval(timer);
  }, [isEmailCounting, emailTimeLeft]);

  const handleResendOTP = async () => {
    setShowLoader(true);
    try {
      if (isEmailOtpEnabled) {
        // Handle email OTP resend
        await GetOTPApi({
          email: signInFormData?.email || registerFormData?.email,
          onSuccess: (res) => {
            toast.success(res?.message);
            // Ensure these state updates happen after successful API call
            setShowEmailContent(false);
            setShowOtpContent(true);
            setEmailTimeLeft(120); // 10 minutes
            setIsEmailCounting(true); // Explicitly set to true
            setEmailOtp(""); // Reset email OTP input
            setShowLoader(false);
          },
          onError: (err) => {
            console.error(err);
            toast.error(err?.message || translate("failedToSendOTP"));
            // Reset counting if API fails
            setIsEmailCounting(false);
            setEmailTimeLeft(0);
            setShowLoader(false);
          },
        });
      } else {
        // Handle phone OTP resend
        if (isFirebaseOtp) {
          try {
            let appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(
              authentication,
              phonenum,
              appVerifier
            );
            window.confirmationResult = confirmationResult;
            toast.success(translate("otpSentsuccess"));

            if (isDemo) {
              setOTP(DemoOTP);
            }
            setTimeLeft(120);
            setIsCounting(true);
            setOTP(""); // Reset phone OTP input
            setShowLoader(false);
          } catch (error) {
            console.error("Firebase OTP error:", error);
            const errorCode = error.code;
            handleFirebaseAuthError(errorCode);
            setIsCounting(false);
            setTimeLeft(0);
            setShowLoader(false);
          }
        } else if (isTwilloOtp) {
          try {
            const parsedNumber = parsePhoneNumber(phonenum);
            const formattedNumber = parsedNumber.format("E.164").slice(1);

            await GetOTPApi({
              number: formattedNumber,
              onSuccess: (res) => {
                toast.success(res?.message);
                setTimeLeft(120);
                setIsCounting(true);
                setOTP(""); // Reset phone OTP input
                setShowLoader(false);
              },
              onError: (error) => {
                console.error(error);
                toast.error(error?.message || translate("failedToSendOTP"));
                setIsCounting(false);
                setTimeLeft(0);
                setShowLoader(false);
              },
            });
          } catch (error) {
            console.error("Twilio OTP error:", error);
            toast.error(translate("failedToSendOTP"));
            setIsCounting(false);
            setTimeLeft(0);
            setShowLoader(false);
          }
        }
      }
    } catch (error) {
      setShowLoader(false);
      console.error("Resend OTP error:", error);
      toast.error(translate("failedToSendOTP"));
      // Reset all counting states in case of error
      if (isEmailOtpEnabled) {
        setIsEmailCounting(false);
        setEmailTimeLeft(0);
      } else {
        setIsCounting(false);
        setTimeLeft(0);
      }
    }
  };

  const wrongNumber = (e) => {
    e.preventDefault();
    setShowOtpContent(false);
    setShowLoginContent(true);
    setTimeLeft(0);
    setIsCounting(false);
  };
  const wrongEmail = (e) => {
    e.preventDefault();
    setShowOtpContent(false);
    setShowLoginContent(false);
    setShowEmailContent(true);
    setTimeLeft(0);
    setIsCounting(false);
  };

  const generateRecaptcha = () => {
    if (!window?.recaptchaVerifier) {
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          authentication,
          recaptchaContainer,
          {
            size: "invisible",
            callback: (response) => {},
          }
        );
      } else {
        console.error("recaptcha-container element not found");
      }
    }
  };

  useEffect(() => {
    if (isOpen || asPage) {
      generateRecaptcha();
      // setShowLoader(true);
      return () => {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          } catch (error) {
            console.error("Error clearing recaptchaVerifier:", error);
          }
        }

        const recaptchaContainer = document.getElementById(
          "recaptcha-container"
        );
        if (recaptchaContainer) {
          recaptchaContainer.remove();
        }
      };
    }
  }, [isOpen, asPage]);

  const generateOTPWithTwilio = async (phoneNumber) => {
    setShowLoader(true);
    const parsedNumber = parsePhoneNumber(phoneNumber);
    const formattedNumber = parsedNumber.format("E.164").slice(1);
    try {
      GetOTPApi({
        number: formattedNumber,
        onSuccess: (res) => {
          setShowLoginContent(false);
          setShowOtpContent(true);
          setTimeLeft(120);
          setIsCounting(true);
          toast.success(res?.message);
          setShowLoader(false);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error?.message);
          setShowLoader(false);
        },
      });
    } catch (error) {
      console.error("Error generating OTP with Twilio:", error);
      toast.error(error.message || translate("otpSendFailed"));
      setShowLoader(false);
    }
  };

  const onSignUp = async (e) => {
    e.preventDefault();
    if (!value) {
      toast.error(translate("enterPhoneNumber"));
      return;
    }

    try {
      const phoneNumber = phoneUtil.parseAndKeepRawInput(value, "ZZ");
      if (!phoneUtil.isValidNumber(phoneNumber)) {
        toast.error(translate("validPhonenum"));
        return;
      }

      setShowLoader(true); // Set loader before any async operations
      setPhonenum(value);

      if (isFirebaseOtp) {
        await generateOTP(value);
      } else if (isTwilloOtp) {
        await generateOTPWithTwilio(value);
      }

      // Only change views after successful OTP generation
      setShowLoginContent(false);
      setShowOtpContent(true);

      if (isDemo) {
        setValue(DemoNumber);
      } else {
        setValue("");
      }
    } catch (error) {
      console.error("Error parsing phone number:", error);
      toast.error(translate("validPhonenum"));
      setShowLoader(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const response = await signInWithPopup(authentication, provider);
      signupLoaded({
        name: response?.user?.displayName,
        email: response?.user?.email,
        type: "0",
        auth_id: response?.user?.uid,
        profile: response?.user?.photoURL,
        fcm_id: FcmToken,
        onSuccess: (res) => {
          if (!res.error) {
            toast.success(res.message);
            onCloseLogin();
          }
        },
        onError: (err) => {
          if (
            err ===
            "Account Deactivated by Administrative please connect to them"
          ) {
            onCloseLogin();
            Swal.fire({
              title: translate("opps"),
              text: translate("accountDeactivatedByAdmin"),
              icon: "warning",
              showCancelButton: false,
              customClass: {
                confirmButton: "Swal-confirm-buttons",
                cancelButton: "Swal-cancel-buttons",
              },
              confirmButtonText: translate("ok"),
            }).then((result) => {
              if (result.isConfirmed) {
                navigate.push("/contact-us");
              }
            });
          }
        },
      });
    } catch (error) {
      console.error(error);
      toast.error(translate("popupCancel"));
    }
  };

  const onCloseLogin = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (asPage) {
      navigate.push("/");
    } else if (onClose) {
      onClose();
    }
    setShowOtpContent(false);
    setOTP("");
    setTimeLeft(0);
    setIsCounting(false);
    setShowLoginContent(true);
  };

  const generateOTP = async (phoneNumber) => {
    if (!window.recaptchaVerifier) {
      console.error("window.recaptchaVerifier is null, unable to generate OTP");
      setShowLoader(false);
      return;
    }

    try {
      let appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        authentication,
        phoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      toast.success(translate("otpSentsuccess"));

      if (isDemo) {
        setOTP(DemoOTP);
      }
      setTimeLeft(120);
      setIsCounting(true);
      setShowLoader(false);
    } catch (error) {
      console.error("Error generating OTP:", error);
      const errorCode = error.code;
      handleFirebaseAuthError(errorCode);
      setShowLoader(false);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (otp === "") {
      toast.error(translate("pleaseEnterOtp"));
      return;
    }
    setShowLoader(true);
    if (isFirebaseOtp) {
      let confirmationResult = window.confirmationResult;
      confirmationResult
        .confirm(otp)
        .then(async (result) => {
          signupLoaded({
            mobile: result.user.phoneNumber.replace("+", ""),
            type: "1",
            auth_id: result.user.uid,
            fcm_id: FcmToken,
            onSuccess: (res) => {
              if (!res.error) {
                setShowLoader(false);
                toast.success(res.message);
                onCloseLogin();
              }
            },
            onError: (err) => {
              setShowLoader(false);
              console.log(err);
              if (
                err ===
                "Account Deactivated by Administrative please connect to them"
              ) {
                onCloseLogin();
                Swal.fire({
                  title: translate("opps"),
                  text: translate("accountDeactivatedByAdmin"),
                  icon: "warning",
                  showCancelButton: false,
                  customClass: {
                    confirmButton: "Swal-confirm-buttons",
                    cancelButton: "Swal-cancel-buttons",
                  },
                  confirmButtonText: translate("ok"),
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate.push("/contact-us");
                  }
                });
              }
            },
          });
        })
        .catch((error) => {
          setShowLoader(false);
          console.log(error);
          const errorCode = error.code;
          handleFirebaseAuthError(errorCode);
        });
    } else if (isTwilloOtp) {
      try {
        verifyOTPApi({
          number: phonenum,
          otp: otp,
          onSuccess: (res) => {
            signupLoaded({
              mobile: phonenum?.replace("+", ""),
              type: "1",
              auth_id: res.auth_id,
              onSuccess: (res) => {
                if (!res.error) {
                  setShowLoader(false);
                  toast.success(res.message);
                  onCloseLogin();
                }
              },
              onError: (err) => {
                console.log(err);
                setShowLoader(false);
                toast.error(err);
                if (
                  err ===
                  "Account Deactivated by Administrative please connect to them"
                ) {
                  onCloseLogin();
                  Swal.fire({
                    title: translate("opps"),
                    text: translate("accountDeactivatedByAdmin"),
                    icon: "warning",
                    showCancelButton: false,
                    customClass: {
                      confirmButton: "Swal-confirm-buttons",
                      cancelButton: "Swal-cancel-buttons",
                    },
                    confirmButtonText: translate("ok"),
                  }).then((result) => {
                    if (result.isConfirmed) {
                      navigate.push("/contact-us");
                    }
                  });
                }
              },
            });
          },
          onError: (error) => {
            console.log(error);
            toast.error(error);
            setShowLoader(false);
          },
        });
      } catch (error) {
        console.error("Error verifying OTP with Twilio:", error);
        toast.error(error.message || translate("otpVerificationFailed"));
        setShowLoader(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const handlesignUp = () => {
    setShowRegisterContent(true);
    setShowLoginContent(false);
    setShowEmailContent(false);
    setShowOtpContent(false);
    setShowForgotPassword(false);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setShowRegisterContent(false);
    setShowOtpContent(false);
    setShowLoginContent(true);
    setShowEmailContent(false);
  };

  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [signInFormData, setSignInFormData] = useState({
    email: "",
    password: "",
  });

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;

    setRegisterFormData({
      ...registerFormData,
      [name]: value,
    });
  };

  const handleSignInInputChange = (e) => {
    const { name, value } = e.target;
    // Check if the field being changed is the email
    if (name === "email") {
      if (value !== signInFormData.email) {
        setEmailReverify(false); // Email has been changed, set reverify flag
      }
    }

    setSignInFormData({
      ...signInFormData,
      [name]: value,
    });
  };

  const handleRegisterPhoneChange = (value) => {
    setRegisterFormData({
      ...registerFormData,
      phone: value,
    });
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();

    // Validation checks
    if (registerFormData?.password.length < 6) {
      toast.error(translate("passwordLengthError"));
      return;
    }

    if (registerFormData?.password !== registerFormData?.confirmPassword) {
      toast.error(translate("passwordsNotMatch"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerFormData?.email)) {
      toast.error(translate("invalidEmail"));
      return;
    }

    // if (!registerFormData?.phone) {
    //   toast.error(translate("phoneRequired"));
    //   return;
    // }

    // Set loader to true before the API call
    setShowLoader(true);

    try {
      const formattedPhone =
        registerFormData?.phone && registerFormData?.phone.replace("+", "");
      // Make the API call
      await userRegisterApi({
        name: registerFormData?.name,
        email: registerFormData?.email,
        mobile: formattedPhone ? formattedPhone : "",
        password: registerFormData?.password,
        re_password: registerFormData?.confirmPassword,
        onSuccess: (res) => {
          setIsEmailOtpEnabled(true);
          setShowRegisterContent(false);
          setShowOtpContent(true);
          setEmailTimeLeft(120);
          setIsEmailCounting(true);
          toast.success(translate("otpSentToEmail"));
          setShowLoader(false);
        },
        onError: (err) => {
          console.error(err);
          toast.error(err.message);
          setShowLoader(false);
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(translate("registrationFailed"));
      setShowLoader(false);
    }
  };
  const handleEmailLoginshow = (e) => {
    e.preventDefault();
    setShowEmailContent(true);
    setShowLoginContent(false);
  };

  const SignInWithEmail = async (e) => {
    e.preventDefault();

    if (!signInFormData?.email || !signInFormData?.password) {
      toast.error(translate("allFieldsRequired"));
      return;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      signInFormData?.email
    );
    if (!isEmailValid) {
      toast.error(translate("invalidEmail"));
      return;
    }

    setShowLoader(true);

    try {
      await signupLoaded({
        type: "3",
        email: signInFormData?.email,
        password: signInFormData?.password,
        fcm_id: FcmToken,
        onSuccess: (res) => {
          if (!res.error) {
            setShowLoader(false);
            toast.success(res.message);
            onCloseLogin();
          }
        },
        onError: (error) => {
          console.log("error while login with email", error);
          if (error.message === "Email is not verified") {
            setShowLoader(false);
            setEmailReverify(true);
            setIsEmailOtpEnabled(true);
            toast.error(translate("pleaseVerifyEmail"));
          } else if (
            error.message ===
            "Account Deactivated by Administrative please connect to them"
          ) {
            setShowLoader(false);
            Swal.fire({
              title: translate("opps"),
              text: translate("accountDeactivatedByAdmin"),
              icon: "warning",
              showCancelButton: false,
              customClass: {
                confirmButton: "Swal-confirm-buttons",
                cancelButton: "Swal-cancel-buttons",
              },
              confirmButtonText: translate("ok"),
            }).then((result) => {
              if (result.isConfirmed) {
                navigate.push("/contact-us");
              }
            });
          } else {
            toast.error(error.message || translate("loginFailed"));
            setShowLoader(false);
          }
        },
      });
    } catch (error) {
      console.error("SignInWithEmail error:", error);
      toast.error(translate("somethingWentWrong"));
      setShowLoader(false);
    }
  };

  const handleEmailOtpVerification = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // const otpValue = emailOtp.join(""); // Join the array into a string
    if (emailOtp === "") {
      toast.error(translate("pleaseEnterOTP"));
      return;
    }
    setShowLoader(true);
    try {
      // Call the API to verify the email OTP
      verifyOTPApi({
        email: registerFormData?.email
          ? registerFormData?.email
          : signInFormData?.email,
        otp: emailOtp,
        onSuccess: (res) => {
          toast.success(res?.message);
          setShowOtpContent(false); // Hide OTP section
          setShowEmailContent(true); // Show email login form
          setEmailReverify(false);
          setIsEmailOtpEnabled(false);
          setShowLoader(false);
        },
        onError: (err) => {
          console.log(err);
          toast.error(err.message || "OTP verification failed");
          setShowLoader(false);
        },
      });
    } catch (error) {
      console.log(error);
      setShowLoader(false);
    }
  };

  const handlePhoneLogin = (e) => {
    e.preventDefault();
    setShowLoginContent(true);
    setShowEmailContent(false);
    setShowOtpContent(false);
    setShowRegisterContent(false);
  };

  const handleForgotPasswordSubmit = async (email) => {
    if (!email) {
      toast.error(translate("pleaseEnterEmail"));
      return;
    }

    setShowLoader(true);

    try {
      await forgotPasswordApi({
        email: email,
        onSuccess: (response) => {
          toast.success(
            response?.message || translate("passwordResetEmailSent")
          );
          // Reset form and show email login screen
          setSignInFormData({ email: "", password: "" });
          setShowForgotPassword(false);
          setShowEmailContent(true);
          setShowLoginContent(false);
          setShowOtpContent(false);
          setShowRegisterContent(false);
          setShowLoader(false);
        },
        onError: (error) => {
          toast.error(error.message || translate("failedToSendResetEmail"));
          setShowLoader(false);
        },
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(translate("somethingWentWrong"));
      setShowLoader(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setShowEmailContent(false);
    setShowLoginContent(false);
    setShowOtpContent(false);
    setShowRegisterContent(false);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowEmailContent(true);
  };

  const authBodyContent = showForgotPassword ? (
    <ForgotPasswordForm
      onSubmit={handleForgotPasswordSubmit}
      showLoader={showLoader}
      onBackToLogin={handleBackToLogin}
    />
  ) : showEmailContent ? (
    <EmailLoginForm
      signInFormData={signInFormData}
      handleSignInInputChange={handleSignInInputChange}
      SignInWithEmail={(e) => SignInWithEmail(e)}
      handlesignUp={handlesignUp}
      ShowGoogleLogin={ShowGoogleLogin}
      ShowPhoneLogin={ShowPhoneLogin}
      handlePhoneLogin={handlePhoneLogin}
      handleGoogleSignup={handleGoogleSignup}
      showLoader={showLoader}
      emailReverify={emailReverify}
      onForgotPasswordClick={handleForgotPasswordClick}
      handleResendOTP={handleResendOTP}
      formatTime={formatTime}
    />
  ) : showRegisterContent ? (
    <RegisterForm
      registerFormData={registerFormData}
      handleRegisterInputChange={handleRegisterInputChange}
      handleRegisterPhoneChange={handleRegisterPhoneChange}
      handleRegisterUser={handleRegisterUser}
      handleSignIn={handleSignIn}
      showLoader={showLoader}
    />
  ) : showLoginContent ? (
    <PhoneLoginForm
      value={value}
      setValue={setValue}
      onSignUp={onSignUp}
      ShowGoogleLogin={ShowGoogleLogin}
      handleEmailLoginshow={handleEmailLoginshow}
      CompanyName={CompanyName}
      handleGoogleSignup={handleGoogleSignup}
      ShowPhoneLogin={ShowPhoneLogin}
      showLoader={showLoader}
    />
  ) : showOTPContent ? (
    <OTPForm
      phonenum={phonenum}
      wrongNumber={wrongNumber}
      wrongEmail={wrongEmail}
      otp={otp}
      setOTP={setOTP}
      handleConfirm={handleConfirm}
      showLoader={showLoader}
      timeLeft={timeLeft}
      isEmailOtpEnabled={isEmailOtpEnabled}
      emailOtp={emailOtp}
      email={
        registerFormData?.email
          ? registerFormData?.email
          : signInFormData?.email
      }
      setEmailOtp={setEmailOtp}
      handleEmailOtpVerification={handleEmailOtpVerification}
      isEmailCounting={isEmailCounting}
      emailTimeLeft={emailTimeLeft}
      formatTime={formatTime}
      isCounting={isCounting}
      handleResendOTP={handleResendOTP}
    />
  ) : null;

  if (asPage) {
    return (
      <section className="auth-page p-0">
        <div className="auth-page__bg" aria-hidden="true" />
        <div className="auth-page__layout">
          <div className="auth-page__form">
            <div className="auth-page__form-inner">
              <Link href="/" className="auth-page__back" aria-label={translate("backToHome")}>
                <RiCloseCircleLine size={24} />
                <span>{translate("backToHome")}</span>
              </Link>
              <div className="auth-page__body">
                {authBodyContent}
              </div>
              <div className="auth-page__footer">
                <FooterLinks />
              </div>
            </div>
          </div>
          <div className="auth-page__image" aria-hidden="true">
            <div className="auth-page__image-content">
              <div className="auth-page__image-badge">
                {CompanyName || "Welcome"}
              </div>
              <p className="auth-page__image-text">
                {translate("login&Register")}
              </p>
            </div>
          </div>
          <div className="auth-page__image-mobile" aria-hidden="true">
            <span className="auth-page__image-mobile-text">{CompanyName || "Welcome"}</span>
          </div>
        </div>
        <div id="recaptcha-container" style={{ display: "none" }}></div>
      </section>
    );
  }

  return (
    <>
      <Modal
        show={isOpen}
        onHide={onCloseLogin}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="auth-modal"
        backdrop="static"
        contentClassName="rounded-3xl border-0 shadow-2xl overflow-hidden pointer-events-auto"
        dialogClassName="max-w-md mx-auto pointer-events-none"
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onCloseLogin}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 bg-white/50 backdrop-blur-sm"
          >
            <RiCloseCircleLine size={28} />
          </button>
        </div>
        <Modal.Body className="p-6 sm:p-10 pt-12 relative bg-white">
          {authBodyContent}
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-100 bg-gray-50/80 p-5 sm:p-6 text-center justify-center m-0">
          <FooterLinks />
        </Modal.Footer>
        <div id="recaptcha-container" style={{ display: "none" }}></div>
      </Modal>
    </>
  );
};

export default LoginModal;
