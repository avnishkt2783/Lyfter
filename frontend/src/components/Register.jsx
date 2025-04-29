import React, { useState } from "react";
import { useNavigate, Link} from "react-router-dom";
import axios from "axios";

const Register = () => {
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
  // const [user, setUser] = useState(null);

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
          navigate('/dashboard');
        }); 


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
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Register</h2>
      

      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required/>
        </div>

        <div>
          <label>Gender:</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required/>
        </div>

        <div>
          <label>Phone No.:</label>
          <input type="text" name="phoneNo" value={formData.phoneNo} onChange={handleChange} required/>
        </div>

        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required/>
        </div>

        <div>
          <label>Confirm Password:</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required/>
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>Register</button>
         {/* Add a Back Button */}
      <button onClick={() => navigate('/')} style={{ marginTop: '20px', backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Back to Home</button>
      <p>Already Registered : <Link to="/login">Login</Link></p>

      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default Register;