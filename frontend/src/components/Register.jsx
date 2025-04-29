import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import axios from "axios";

const Register = () => {
  const navigate = useNavigate(); // Initialize the navigate hook

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if password and confirmPassword match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setSuccess("");
      return;
    }

    // Prepare data to send (exclude confirmPassword)
    const { confirmPassword, ...dataToSend } = formData;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/register",
        dataToSend
      );
      console.log(response);

      const result = response.data;
      console.log(result);

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

        // Redirect to home page after successful registration
        setTimeout(() => {
          navigate("/"); // Redirect to home page
        }, 2000); // Delay for success message visibility
      } else {
        setError(result.message || "Registration failed");
        setSuccess("");
      }
    } catch (error) {
      console.error("Error:", error);
      
      // Check if backend has specific error messages
      if (error.response && error.response.data) {
        const message = error.response.data.message;
        
        // Handle specific error messages
        if (message && message.includes("email")) {
          setError("Email already exists");
        } else if (message && message.includes("phone")) {
          setError("Phone number already exists");
        } else {
          setError(message || "Something went wrong!");
        }
      } else {
        setError("Something went wrong!");
      }
      setSuccess("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
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
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Phone No.:</label>
          <input
            type="text"
            name="phoneNo"
            value={formData.phoneNo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Confirm Password:</label>
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
      </form>
    </div>
  );
};

export default Register;
