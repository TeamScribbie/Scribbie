// src/page/teacher/TeacherRegistration.jsx
import React, { useState } from 'react';
// Import Alert and CircularProgress
import { Typography, Link, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png';
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
    <div className="teacher-registration-container">
      <div className="registration-card">
        <div className="registration-header">
          Register
        </div>

        <div className="registration-content">
          <Typography variant="h5" className="registration-title-teacher">
            Welcome to Scribbie, Teacher!
          </Typography>

          {/* Display status messages */}
          {error && (
             <Alert severity="error" sx={{ width: '80%', mt: 1, mb: 1 }}>
               {error}
             </Alert>
           )}

          {/* Pass state and handler to the updated form */}
          <TeacherRegistrationForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleRegister}
            // isLoading={isLoading} // Pass if form handles disabling
          />

           {/* Show loading indicator */}
           {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
           )}

          <Typography className="login-link-container">
            <Link
                href="/teacher-login"
                className="login-link"
                 style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
            >
              Already have an account? <strong>Login here</strong>
            </Link>
          </Typography>
        </div>
      </div>
      <img
        src={bookImage}
        alt="Books"
        className="book-image-teacher-reg"
      />
    </div>
  );
};

export default TeacherRegistration;