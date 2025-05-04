import axios from "axios";
import React, { useState } from "react";
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { login } = useAuth();
  const { theme } = useTheme(); 
  const isDark = theme === "dark";

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
      const response = await axios.post(`${apiURL}/register`, dataToSend);

      const { token } = response.data;
      login(token);

      const result = response.data;

      if (response.status === 201) {
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

        navigate("/dashboard");
      } else {
        setError(result.message || "Registration failed");
        setSuccess("");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error?.response?.data?.message || "Something went wrong!");
      setSuccess("");
    }
  };

  return (
    <div className="container py-5">
       <div className="row justify-content-center">
       <div className="col-md-6">
       <div className={`card ${isDark ? "bg-dark text-white" : "bg-light text-dark"} shadow border-0`}>
    <div className="card-body p-4">
      <h2 className="mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name:</label>
          <input
            type="text"
            className={`form-control ${isDark ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Gender:</label>
          <select
          className={`form-control ${isDark ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
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
            className={`form-control ${isDark ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
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
            className={`form-control ${isDark ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
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
            className={`form-control ${isDark ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
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
            className={`form-control ${isDark ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </div>

      </form>

      <div className="text-center mt-3">
              <p>
                Already registered?{" "}
                <Link to="/login" className={`text-decoration-none ${isDark ? "text-info" : "text-primary"}`}>
                  Login here
                </Link>
              </p>
              <button
                onClick={() => navigate("/")}
                className={`btn mt-2 ${isDark ? "btn-outline-light" : "btn-outline-dark"}`}
              >
                Back to Home
              </button>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {success && <div className="alert alert-success mt-3">{success}</div>}
    </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Register;
