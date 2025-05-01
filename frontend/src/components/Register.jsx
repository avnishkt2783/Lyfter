import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

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
       <div className="card shadow-sm border-0">
    <div className="card-body p-4">
      <h2 className="mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Gender:</label>
          <select
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
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Register
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "20px",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
        <p>
          Already Registered : <Link to="/login">Login</Link>
        </p>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Register;
