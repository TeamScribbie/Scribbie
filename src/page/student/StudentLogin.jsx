// src/page/student/StudentLogin.jsx
import React, { useState } from 'react';
import { Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png'; // Make sure this path is correct
import UserTypeToggle from '../../components/auth/UserTypeToggle'; // Import toggle
import LoginForm from '../../components/auth/LoginForm'; // Import form
import '../../styles/StudentLogin.css'; // Import the CSS

const StudentLogin = () => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Handler for the toggle (navigates to teacher login)
  const handleTabSwitch = (tab) => {
    if (tab === 'Teacher') {
      navigate('/teacher-login');
    }
    // No need to navigate if 'Student' is clicked, we are already here.
  };

  // Handle form submission
  const handleLogin = (event) => {
    event.preventDefault(); // Prevent default form submission
    console.log('Student Login Attempt:', idNumber, password);
    // --- API Call would go here ---
    // For now, navigate directly after "attempt"
    navigate('/student-homepage');
  };

  return (
    <div className="student-login-container">
      <div className="login-card">
        <div className="login-header">
          Login
        </div>

        <div className="login-content">
          <Typography variant="h5" className="login-title">
            Practice and Learn with Scribbie!
          </Typography>

          {/* Use the UserTypeToggle component */}
          <UserTypeToggle activeTab="Student" onTabSwitch={handleTabSwitch} />

          {/* Use the LoginForm component */}
          <LoginForm
            idNumber={idNumber}
            password={password}
            onIdChange={(e) => setIdNumber(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleLogin}
          />

          <Typography className="register-link-container">
            {/* Use ButtonBase or Link from MUI for better semantics if needed */}
            <button
              onClick={() => navigate('/student-register')}
              className="register-link"
            >
              No Account yet? <strong>Register Here</strong>
            </button>
          </Typography>
        </div>
      </div>

      {/* Image is positioned relative to the container */}
      <img
        src={bookImage}
        alt="Books"
        className="book-image"
      />
    </div>
  );
};

export default StudentLogin;