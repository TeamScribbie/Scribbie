// src/page/student/StudentLogin.jsx
import React, { useState } from 'react';
// Import Alert, CircularProgress, Skeleton, and Dialog for feedback
import { Typography, Link, Alert, CircularProgress, Box, Skeleton, Dialog, DialogContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import scribbieLogo from '../../assets/ScribbieLogoV2.png';
import studentLoginBg from '../../assets/studentlogin-bg.png';
import mascot from '../../assets/mascot.png';
import owlMascot from '../../assets/owl-mascot.png';

import UserTypeToggle from '../../components/auth/UserTypeToggle';
import LoginForm from '../../components/auth/LoginForm';
import '../../styles/StudentLogin.css';
import { useAuth } from '../../context/AuthContext';

// Import the API function
import { loginStudent } from '../../services/authService';

const StudentLogin = () => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error message
  const [showSuccess, setShowSuccess] = useState(false); // Success dialog state
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTabSwitch = (tab) => {
    if (tab === 'Teacher') {
      navigate('/teacher-login');
    }
  };

  // Updated handleLogin function
  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors

    try {
      console.log('Attempting student login with:', idNumber);
      // Call the API service function
      const userData = await loginStudent(idNumber, password);

      console.log('Student Login Successful:', userData);
      login(userData, 'Student'); // Pass user data and type
      setIsLoading(false);
      setShowSuccess(true);
      
      // Navigate to the homepage after showing success
      setTimeout(() => {
        navigate('/student-homepage');
      }, 1500);

    } catch (err) {
      console.error('Student Login Failed:', err);
      // Set a user-friendly error message
      // You might want to check err.message for specific backend errors
      setError(err.message || 'Login failed. Please check your ID and password.');
      setIsLoading(false); // Stop loading on error
    }
  };

  return (
    <div 
      className="student-login-container"
      style={{
        backgroundColor: 'white',
        backgroundImage: `url(${studentLoginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.9
      }}
    >
      <div className="scribbie-logo-container">
        <img src={scribbieLogo} alt="Scribbie Logo" className="ScribbieLogoV2" />
      </div>

      <div className="login-grid">
        <div className="login-form-section">
          <UserTypeToggle activeTab="Student" onTabSwitch={handleTabSwitch} />

          {/* Display error message if login failed */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* Show loading skeleton or form */}
          {isLoading ? (
            <Box sx={{ width: '100%', maxWidth: '800px' }}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px', mb: 3 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px', mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: '8px', flex: 1 }} />
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: '8px', flex: 1 }} />
              </Box>
            </Box>
          ) : (
            <LoginForm
              idNumber={idNumber}
              password={password}
              onIdChange={(e) => setIdNumber(e.target.value)}
              onPasswordChange={(e) => setPassword(e.target.value)}
              onSubmit={handleLogin}
            />
          )}

          <div className="button-container">
            <button
              onClick={() => navigate('/student-register')}
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

      {/* Success Dialog */}
      <Dialog
        open={showSuccess}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            minWidth: '320px',
          }
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: '#FDB10D',
                animation: 'scaleIn 0.5s ease-out',
                '@keyframes scaleIn': {
                  '0%': {
                    transform: 'scale(0)',
                    opacity: 0,
                  },
                  '50%': {
                    transform: 'scale(1.2)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#1f2937',
                animation: 'fadeInUp 0.5s ease-out 0.3s backwards',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              Login Successful!
            </Typography>
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '16px',
                animation: 'fadeInUp 0.5s ease-out 0.5s backwards',
              }}
            >
              Welcome back! Redirecting...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentLogin;