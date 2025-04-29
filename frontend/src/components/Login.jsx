import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
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
          navigate("/"); // Redirect to home page
        }, 1000); // Delay for success message visibility
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

  // Back to Home Button function
  const goHome = () => {
    navigate("/"); // Manually navigate to the home page
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

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
      </form>

      {/* Back to Home Button */}
      <button onClick={goHome} style={{ marginTop: "10px", display: "block" }}>
        Back to Home
      </button>
    </div>
  );
};

export default Login;
