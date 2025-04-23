// src/page/student/StudentLogin.jsx
import React, { useState } from 'react';
// Import Alert and CircularProgress for feedback
import { Typography, Link, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png';
import UserTypeToggle from '../../components/auth/UserTypeToggle';
import LoginForm from '../../components/auth/LoginForm';
import '../../styles/StudentLogin.css';

// Import the API function
import { loginStudent } from '../../services/authService';

const StudentLogin = () => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error message
  const navigate = useNavigate();

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

      // --- TODO: Store User Data/Token ---
      // In a real app, you would typically store the received user data
      // (like user ID, name, role, and authentication token if provided)
      // in a global state (Context, Redux, Zustand) or local storage
      // to keep the user logged in across the application.
      // Example: authContext.login(userData);

      // Navigate to the homepage on success
      navigate('/student-homepage');

    } catch (err) {
      console.error('Student Login Failed:', err);
      // Set a user-friendly error message
      // You might want to check err.message for specific backend errors
      setError(err.message || 'Login failed. Please check your ID and password.');
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
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

          <UserTypeToggle activeTab="Student" onTabSwitch={handleTabSwitch} />

          {/* Display error message if login failed */}
          {error && (
            <Alert severity="error" sx={{ width: '80%', mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* Pass onSubmit to LoginForm, which now calls the async handleLogin */}
          <LoginForm
            idNumber={idNumber}
            password={password}
            onIdChange={(e) => setIdNumber(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleLogin} // Use the updated handler
            // Disable form elements while loading (optional but good UX)
            // You might need to pass an `isLoading` prop to LoginForm to disable fields
          />

           {/* Show loading indicator */}
           {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
           )}


          <Typography className="register-link-container">
            <button
              onClick={() => navigate('/student-register')}
              className="register-link"
              disabled={isLoading} // Disable link while loading
            >
              No Account yet? <strong>Register Here</strong>
            </button>
          </Typography>
        </div>
      </div>

      <img
        src={bookImage}
        alt="Books"
        className="book-image"
      />
    </div>
  );
};

export default StudentLogin;