import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useAsyncError, useNavigate } from "react-router-dom";
import { AppContent } from "../Context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailsent, setIsEmailSent] = useState("");
  const [otp, setOtp] = useState(0);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      if (data.success) {
        setIsEmailSent(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp(otpArray.join(""));
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password',{email,otp,newPassword});

      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="px-6 sm:px-0 flex items-center justify-center min-h-screen  bg-gradient-to-br from-blue-200 to purple-100 to white-900">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="error"
        className="absolute left-5 sm:left-2 top-2 w-28 sm:w-44 cursor-pointer"
      />

      {!isEmailsent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your registered email address.
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              className="bg-transparent outline-none  text-white"
              type="email"
              placeholder="Email id"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-300 to-indigo-600 text-white hover:from-indigo-400 hover:to-indigo-700 hover:scale-105 hover:shadow-lg hover:border-2 hover:border-indigo-100 transition-all duration-200 ease-in-out">
            Submit
          </button>
        </form>
      )}

      {/*OTP input form*/}

      {!isOtpSubmitted && isEmailsent && (
        <form
          onSubmit={onSubmitOtp}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password OTP
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code send to your email id.
          </p>
          <div className="flex justify-between mb-8 " onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  required
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-300 to-indigo-600 text-white hover:from-indigo-400 hover:to-indigo-700 hover:scale-105 hover:shadow-lg hover:border-2 hover:border-indigo-100 transition-all duration-200 ease-in-out">
            Submit
          </button>
        </form>
      )}
      {/*Enter new password*/}

      {isOtpSubmitted && isEmailsent && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the new password below.
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              className="bg-transparent outline-none  text-white"
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-300 to-indigo-600 text-white hover:from-indigo-400 hover:to-indigo-700 hover:scale-105 hover:shadow-lg hover:border-2 hover:border-indigo-100 transition-all duration-200 ease-in-out">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;