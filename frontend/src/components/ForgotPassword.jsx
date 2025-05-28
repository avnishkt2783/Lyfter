import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRegex } from "../utils/Regex";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email → 2: OTP + New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setMessage("OTP sent to your email.");
      setStep(2);
      setCountdown(600); // 10 minutes countdown
    } catch (err) {
      setMessage(err.message);
    }
  };

    const validateForm = () => {
        // REGEX
          // const phoneRegex = getRegex("password");
      const passwordRegex = getRegex("password");
    
      if (!passwordRegex.test(newPassword)) {
       setError(
      "Password must be at least 8 characters, include a number and special character"
    );
        return false;
      }
    
    
     setError("");
      return true;
    
      }
    

  const handleResetPassword = async (e) => {
    e.preventDefault();

      if (!validateForm()) {
    setSuccess("");
    return;
  }
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password reset failed");

      setMessage("Password reset successfully. Redirecting to login...");
      setStep(0);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setCountdown(0);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: "500px" }}>
      <h3 className="mb-4">Forgot Password</h3>
      {message && <div className="alert alert-info">{message}</div>}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Send OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <label>Enter OTP</label>
            <input
              type="text"
              required
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              required
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-success">
            Reset Password
          </button>

          {countdown > 0 && (
            <p className="mt-3 text-muted">
              OTP valid for:{" "}
              {String(Math.floor(countdown / 60)).padStart(2, "0")}:
              {String(countdown % 60).padStart(2, "0")} minutes
            </p>
          )}

           {error && (
  <div className="alert alert-danger mt-3">
    {error}
  </div>
)}
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
