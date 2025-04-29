import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const Login = () => {
  const navigate = useNavigate(); // Initialize the navigate hook

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/api/login", formData);
      const result = response.data;
      console.log(result);

      if (response.status === 200) {
        setSuccess(result.message);
        setError("");
        // Redirect to the home page after successful login
        setTimeout(() => {
          navigate("/dashboard"); // Redirect to home page
        }); 
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
          <input type="email" name="email" value={formData.email} onChange={handleChange} required/>
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required/>
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Login
        </button>
      {/* Back to Home Button */}
      <button onClick= {() => navigate("/")} style={{ marginTop: "10px", display: "block" }}>
        Back to Home
      </button>

      <p>New User : <Link to="/register">Register</Link></p>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default Login;