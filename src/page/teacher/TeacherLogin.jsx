// src/page/teacher/TeacherLogin.jsx
import React, { useState } from 'react';
import { Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png'; // Ensure path is correct
import UserTypeToggle from '../../components/auth/UserTypeToggle'; // Reuse toggle
import LoginForm from '../../components/auth/LoginForm'; // Reuse form
import '../../styles/TeacherLogin.css'; // Import the new CSS

const TeacherLogin = () => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Updated handler to navigate based on the clicked tab
  const handleTabSwitch = (tab) => {
    if (tab === 'Student') {
      navigate('/student-login');
    } else {
      // Optional: Could reload or do nothing if Teacher tab is clicked again
      // navigate('/teacher-login'); // Usually not needed if already on the page
    }
  };

  // Handle form submission
  const handleLogin = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    console.log('Teacher Login Attempt:', idNumber, password);
    // --- API Call would go here ---
    // Navigate to teacher homepage after "attempt"
    navigate('/teacher-homepage');
  };

  return (
    // Use specific container class if needed, or reuse general login container style
    <div className="teacher-login-container">
      {/* Reuse general login card style */}
      <div className="login-card">
        {/* Reuse general login header style */}
        <div className="login-header">
          Login
        </div>

        {/* Reuse general login content style */}
        <div className="login-content">
          <Typography variant="h5" className="login-title-teacher">
            Welcome back, Teacher!
          </Typography>

          {/* Reuse the UserTypeToggle component, passing 'Teacher' as active */}
          <UserTypeToggle activeTab="Teacher" onTabSwitch={handleTabSwitch} />

          {/* Reuse the LoginForm component */}
          <LoginForm
            idNumber={idNumber}
            password={password}
            onIdChange={(e) => setIdNumber(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleLogin}
          />

          <Typography className="register-link-container-teacher">
             {/* Reuse general register link style */}
            <Link href="/teacher-register" className="register-link">
              No Account yet? <strong>Register Here</strong>
            </Link>
          </Typography>
        </div>
      </div>

      <img
        src={bookImage}
        alt="Books"
        className="book-image-teacher" // Use specific image class if needed
      />
    </div>
  );
};

export default TeacherLogin;