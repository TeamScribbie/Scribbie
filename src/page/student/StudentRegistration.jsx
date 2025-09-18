// src/page/student/StudentRegistration.jsx
import React, { useState } from 'react';
// Import Alert and CircularProgress
import { Typography, Link, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png';
import scribbieLogo from '../../assets/ScribbieLogoV2.png';
import studentLoginBg from '../../assets/studentlogin-bg.png';
import MultiStepRegistration from '../../components/auth/MultiStepRegistration';
import '../../styles/StudentRegistration.css';

// Import the new API function
import { registerStudent } from '../../services/authService';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  // Optional: Add success message state
  // const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
     // Clear errors when user types
    if (error) setError(null);
    // if (success) setSuccess(null);
  };

  // Updated handler for registration
  const handleRegister = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    // setSuccess(null);
    setIsLoading(true); // Start loading

    // 1. Frontend Validation

    // Basic length check (mirroring some API constraints)
    if (formData.password.length < 8) {
       setError('Password must be at least 8 characters long.');
       setIsLoading(false);
       return;
    }
     if (formData.studentId.length < 4) {
       setError('Student ID must be at least 4 characters long.');
       setIsLoading(false);
       return;
    }
     if (formData.firstName.trim().length < 1 || formData.lastName.trim().length < 1) {
        setError('First and Last name are required.');
        setIsLoading(false);
        return;
     }


    // 2. API Call
    try {
      const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`; // Combine first and last name for API

      console.log('Attempting student registration with:', formData.studentId, name);
      const result = await registerStudent(formData.studentId, name, formData.password);

      console.log('Student Registration Successful:', result);
      // setSuccess('Registration successful! Redirecting to login...'); // Set success message

      // Redirect to login after a short delay to show success message
      setTimeout(() => {
        navigate('/student-login');
      }, 1500); // 1.5 second delay

    } catch (err) {
      console.error('Student Registration Failed:', err);
      // Use error message from API if available, otherwise generic message
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false); // Stop loading on error
    }
    // No need for finally block here as loading stops on success timeout or error catch
  };

  return (
    <div 
      className="student-registration-container"
      style={{
        backgroundColor: 'white',
        backgroundImage: `url(${studentLoginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="registration-content">
          <img 
            src={scribbieLogo} 
            alt="SCRIBBIE Logo" 
            className="scribbie-logo"
          />

           {/* Display status messages */}
           {error && (
             <Alert severity="error" sx={{ width: '80%', mt: 1, mb: 1 }}>
               {error}
             </Alert>
           )}

          {/* Pass onSubmit to the form */}
          <MultiStepRegistration
            formData={formData}
            onChange={handleChange}
            onSubmit={handleRegister}
            isLoading={isLoading}
          />

          {/* Show loading indicator */}
           {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
           )}

          <Typography className="login-link-container">
            <Link href="/student-login" className="login-link">
              Already have an account? <strong>Login here</strong>
            </Link>
          </Typography>
      </div>
    </div>
  );
};

export default StudentRegistration;