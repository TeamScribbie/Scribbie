// src/page/teacher/TeacherRegistration.jsx
import React, { useState } from 'react';
// Import Alert and CircularProgress
import { Typography, Link, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import scribbieLogo from '../../assets/ScribbieLogoV2.png';
import TeacherRegistrationForm from '../../components/auth/TeacherRegistrationForm';
import '../../styles/TeacherRegistration.css';

// Import the new API function
import { registerTeacher } from '../../services/authService';

const TeacherRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    teacherId: '',
    password: '',
    verifyPassword: '',
    businessCode: '', // Add businessCode to state
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); // Clear error on input change
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Frontend Validation
    if (formData.password !== formData.verifyPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    // Add other checks (lengths, required fields) based on API spec if desired
     if (!formData.businessCode.trim()) {
      setError('Business Code is required.');
      setIsLoading(false);
      return;
    }
    // ... add other validation rules ...

    // Prepare data for API (combine names, ensure all fields exist)
    const apiData = {
        teacherId: formData.teacherId,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email,
        password: formData.password,
        businessCode: formData.businessCode,
        } 

    // API Call
    try {
      console.log('Attempting teacher registration with:', apiData);
      const result = await registerTeacher(apiData); // Pass the prepared data object
      console.log('Teacher Registration Successful:', result);

      // Redirect to login page after success
       setTimeout(() => {
        navigate('/teacher-login');
      }, 1500);

    } catch (err) {
      console.error('Teacher Registration Failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
       setIsLoading(false);
    }
     // No finally block needed here, handled by error or timeout
  };

  return (
    <div 
      className="teacher-registration-container"
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

      <div className="registration-grid">
        <div className="registration-form-section">
          {/* Display status messages */}
          {error && (
             <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 1 }}>
               {error}
             </Alert>
           )}

          {/* Pass state and handler to the updated form */}
          <TeacherRegistrationForm
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

export default TeacherRegistration;