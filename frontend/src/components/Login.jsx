import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/login', formData);

      const result = response.data;

      if (response.status === 200) {
        setSuccess('Login successful!');
        setError('');
        setFormData({
          email: '',
          password: ''
        });

        // Redirect to home page after successful login
        setTimeout(() => {
          navigate('/'); // Redirect to home page
        }, 2000); // Delay to show success message for 2 seconds
      } else {
        setError(result.message || 'Login failed');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong!');
      setSuccess('');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Login</button>
      </form>

      {/* Add a Back Button */}
      <button 
        onClick={() => navigate('/')} 
        style={{ marginTop: '20px', backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}
      >
        Back to Home
      </button>
    </div>
  );
};

export default Login;
