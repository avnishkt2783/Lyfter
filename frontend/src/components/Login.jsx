import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Login = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiURL}/login`, formData);

      const { token } = response.data;
      login(token);

      const result = response.data;

      if (response.status === 200) {
        setSuccess(result.message);
        setError("");
        setFormData({
          email: "",
          password: "",
        });

        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
        setSuccess("");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error?.response?.data?.message || "Something went wrong!");
      setSuccess("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
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
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Login
        </button>
        {/* Add a Back Button */}
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
          New User : <Link to="/register">Register</Link>
        </p>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default Login;
