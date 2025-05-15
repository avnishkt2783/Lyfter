import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";

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

  console.log("Theme context:", useTheme());
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiURL}/login`, formData);

      const { token, theme } = response.data;
      login(token);

      if (theme) {
        toggleTheme(theme);
      } else {
        toggleTheme("dark");
      }

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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div
            className={`card ${
              isDark ? "bg-dark text-white" : "bg-light text-dark"
            } shadow border-0`}
          >
            <div className="card-body p-4">
              <h2 className="mb-4 text-center">Login</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    className={`form-control ${
                      isDark ? "bg-secondary text-white" : "bg-white text-dark"
                    } border-0`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password:</label>
                  <input
                    type="password"
                    className={`form-control ${
                      isDark ? "bg-secondary text-white" : "bg-white text-dark"
                    } border-0`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <p>
                  New User?{" "}
                  <Link
                    to="/register"
                    className={`text-decoration-none ${
                      isDark ? "text-info" : "text-primary"
                    }`}
                  >
                    Register here
                  </Link>
                </p>
                <p>
                  Forgot your Password?{" "}
                  <Link
                    to="/forgot-password"
                    className={`text-decoration-none ${
                      isDark ? "text-info" : "text-primary"
                    }`}
                  >
                    Reset here
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

export default Login;
