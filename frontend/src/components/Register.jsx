import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";

const Register = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [otpExpiryTime, setOtpExpiryTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  let timer;

  useEffect(() => {
    return () => clearInterval(timer);
  }, []);

  const startCooldown = () => {
    setResendCooldown(30);
    timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startOtpExpiryTimer = (durationInSeconds) => {
    const expiryTime = Date.now() + durationInSeconds * 1000;
    setOtpExpiryTime(expiryTime);

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.floor((expiryTime - now) / 1000);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        setError("OTP expired. Please resend OTP.");
        setOtp(""); // Optionally clear the OTP input
      } else {
        const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
        const seconds = String(secondsLeft % 60).padStart(2, "0");
        setTimeLeft(`${minutes}:${seconds}`);
      }
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const validateForm = () => {
  //   // REGEX
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setSuccess("");
      return;
    }

    const { confirmPassword, ...dataToSend } = formData;

    try {
      const res = await axios.post(`${apiURL}/register/request`, dataToSend);
      setSuccess("OTP sent to your email. Please verify.");
      setError("");
      setStep(2);
      startCooldown();
      startOtpExpiryTimer(10 * 60);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong!");
      setSuccess("");
    }
  };
  const handleOtpVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${apiURL}/register/verify`, {
        ...formData,
        otp,
      });

      const { token } = res.data;

      login(token);

      setSuccess("Registration successful!");
      setError("");
      setFormData({
        fullName: "",
        gender: "",
        email: "",
        phoneNo: "",
        password: "",
        confirmPassword: "",
      });
      setOtp("");
      setStep(1);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "OTP verification failed!");
      setSuccess("");
    }
  };
  const handleResendOtp = async () => {
    try {
      const res = await axios.post(`${apiURL}/register/resend`, {
        email: formData.email,
      });
      setSuccess("OTP resent to your email.");
      setError("");
      startCooldown();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP.");
      setSuccess("");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div
            className={`card ${
              isDark ? "bg-dark text-white" : "bg-light text-dark"
            } shadow border-0`}
          >
            <div className="card-body p-4">
              <h2 className="mb-4 text-center">Register</h2>
              {step === 1 && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Full Name:</label>
                    <input
                      type="text"
                      className={`form-control ${
                        isDark
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      } border-0`}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Gender:</label>
                    <select
                      className={`form-control ${
                        isDark
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      } border-0`}
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input
                      type="email"
                      className={`form-control ${
                        isDark
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      } border-0`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone No.:</label>
                    <input
                      type="text"
                      className={`form-control ${
                        isDark
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      } border-0`}
                      name="phoneNo"
                      value={formData.phoneNo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password:</label>
                    <input
                      type="password"
                      className={`form-control ${
                        isDark
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      } border-0`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm Password:</label>
                    <input
                      type="password"
                      className={`form-control ${
                        isDark
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      } border-0`}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                      Send OTP
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleOtpVerify}>
                  {/* OTP Expiry Timer Display */}
                  {timeLeft && (
                    <div className="text-center mb-2 text-muted">
                      OTP expires in: <strong>{timeLeft}</strong>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">
                      Enter OTP sent to your email:
                    </label>
                    <input
                      type="text"
                      name="otp"
                      className={`form-control ${
                        isDark
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      } border-0`}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-grid mb-2">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={timeLeft === "00:00"}
                    >
                      Verify & Register
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                    >
                      {resendCooldown > 0
                        ? `Resend OTP in ${resendCooldown}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}
              <div className="text-center mt-3">
                <p>
                  Already registered?{" "}
                  <Link
                    to="/login"
                    className={`text-decoration-none ${
                      isDark ? "text-info" : "text-primary"
                    }`}
                  >
                    Login here
                  </Link>
                </p>
                <button
                  onClick={() => navigate("/")}
                  className={`btn mt-2 ${
                    isDark ? "btn-outline-light" : "btn-outline-dark"
                  }`}
                >
                  Back to Home
                </button>
              </div>

              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {success && (
                <div className="alert alert-success mt-3">{success}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
