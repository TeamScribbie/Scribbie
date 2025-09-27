// src/page/teacher/TeacherLogin.jsx
import React, { useState } from 'react';
// Import Alert and CircularProgress
import { Typography, Link, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import scribbieLogo from '../../assets/ScribbieLogoV2.png';
import UserTypeToggle from '../../components/auth/UserTypeToggle';
import LoginForm from '../../components/auth/LoginForm';
import '../../styles/TeacherLogin.css';
import { useAuth } from '../../context/AuthContext';


// Import the specific API function
import { loginTeacher } from '../../services/authService';

const TeacherLogin = () => {
  const [idNumber, setIdNumber] = useState(''); // Assuming identifier is ID number for now
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTabSwitch = (tab) => {
    if (tab === 'Student') {
      navigate('/student-login');
    }
  };

  // Updated handleLogin function
  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userData = await loginTeacher(idNumber, password);
      console.log('Teacher Login Successful:', userData);

      // Call context login function instead of TODO
      login(userData, 'Teacher'); // Pass user data and type

      navigate('/teacher-homepage');

    } catch (err) {
      console.error('Teacher Login Failed:', err);
      setError(err.message || 'Login failed. Please check your ID/Email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="teacher-login-container"
      style={{
        backgroundColor: 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="scribbie-logo-container">
        <img src={scribbieLogo} alt="Scribbie Logo" className="ScribbieLogoV2" />
      </div>

      <div className="login-grid">
        <div className="login-form-section">
          <UserTypeToggle activeTab="Teacher" onTabSwitch={handleTabSwitch} />

          {/* Display error message if login failed */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* Pass onSubmit to LoginForm, which now calls the async handleLogin */}
          <LoginForm
            idNumber={idNumber}
            password={password}
            onIdChange={(e) => setIdNumber(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleLogin}
          />

          {/* Show loading indicator */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          <div className="button-container">
            <button
              onClick={() => navigate('/teacher-register')}
              className="first-time-button"
              disabled={isLoading}
            >
              FIRST TIME HERE?
            </button>
            <button
              onClick={handleLogin}
              className="login-button"
              disabled={isLoading}
            >
              LOGIN
            </button>
          </div>
        </div>
      </div>
      
      <div className="bottom-graphic">
        <div className="color-bar orange"></div>
        <div className="color-bar blue"></div>
        <div className="color-bar red"></div>
      </div>
    </div>
  );
};

export default TeacherLogin;