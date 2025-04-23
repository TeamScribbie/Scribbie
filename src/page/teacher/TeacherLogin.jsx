// src/page/teacher/TeacherLogin.jsx
import React, { useState } from 'react';
// Import Alert and CircularProgress
import { Typography, Link, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png';
import UserTypeToggle from '../../components/auth/UserTypeToggle';
import LoginForm from '../../components/auth/LoginForm';
import '../../styles/TeacherLogin.css';

// Import the specific API function
import { loginTeacher } from '../../services/authService';

const TeacherLogin = () => {
  const [idNumber, setIdNumber] = useState(''); // Assuming identifier is ID number for now
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

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
      console.log('Attempting teacher login with:', idNumber);
      // Call the teacher login API function
      const userData = await loginTeacher(idNumber, password); // Use idNumber as identifier

      console.log('Teacher Login Successful:', userData);

      // --- TODO: Store User Data/Token ---
      // Store teacher data/token similar to student login.
      // Example: authContext.login(userData);

      // Navigate to teacher homepage on success
      navigate('/teacher-homepage');

    } catch (err) {
      console.error('Teacher Login Failed:', err);
      setError(err.message || 'Login failed. Please check your ID/Email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="teacher-login-container">
      <div className="login-card">
        <div className="login-header">
          Login
        </div>

        <div className="login-content">
          <Typography variant="h5" className="login-title-teacher">
            Welcome back, Teacher!
          </Typography>

          <UserTypeToggle activeTab="Teacher" onTabSwitch={handleTabSwitch} />

          {/* Display error message */}
          {error && (
            <Alert severity="error" sx={{ width: '80%', mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* Use LoginForm, passing the async handler */}
          <LoginForm
            idNumber={idNumber} // Keep prop name generic for reuse
            password={password}
            onIdChange={(e) => setIdNumber(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleLogin}
            // Pass isLoading if LoginForm handles disabling fields
            // isLoading={isLoading}
          />

          {/* Show loading indicator */}
           {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
           )}

          <Typography className="register-link-container-teacher">
            <Link
                href="/teacher-register"
                className="register-link"
                // Disable link while loading
                style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
            >
              No Account yet? <strong>Register Here</strong>
            </Link>
          </Typography>
        </div>
      </div>

      <img
        src={bookImage}
        alt="Books"
        className="book-image-teacher"
      />
    </div>
  );
};

export default TeacherLogin;