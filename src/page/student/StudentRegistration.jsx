// src/page/student/StudentRegistration.jsx
import React, { useState } from 'react';
// Import Alert, CircularProgress, and Dialog components
import { Typography, Link, Alert, CircularProgress, Box, Dialog, DialogContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  const [showSuccess, setShowSuccess] = useState(false); // Success dialog state

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
      setIsLoading(false);
      setShowSuccess(true);

      // Redirect to login after showing success animation
      setTimeout(() => {
        navigate('/student-login');
      }, 2500); // 2.5 second delay to show animation

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

          <Typography className="login-link-container">
            <Link href="/student-login" className="login-link">
              Already have an account? <strong>Login here</strong>
            </Link>
          </Typography>
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
              Registration Successful!
            </Typography>
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '16px',
                animation: 'fadeInUp 0.5s ease-out 0.5s backwards',
              }}
            >
              Redirecting to login page...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentRegistration;