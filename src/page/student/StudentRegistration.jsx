// src/page/student/StudentRegistration.jsx
import React, { useState } from 'react';
import { Typography, Link } from '@mui/material'; // Keep Link for the bottom link
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png'; // Ensure path is correct
import RegistrationForm from '../../components/auth/RegistrationForm'; // Import the new form
import '../../styles/StudentRegistration.css'; // Import the new CSS

const StudentRegistration = () => {
  const navigate = useNavigate();

  // Keep the state structure as it was
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    password: '',
    verifyPassword: '',
  });

  // Keep the single handler - it works because input 'name' matches state keys
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleRegister = (event) => {
    event.preventDefault(); // Prevent default form submission
    // Add validation logic here if needed (e.g., check if passwords match)
    console.log('Registering student:', formData);
    // --- API Call would go here ---
    // Navigate after "attempt"
    navigate('/student-login');
  };

  return (
    <div className="student-registration-container">
      <div className="registration-card">
        <div className="registration-header">
          Register
        </div>

        <div className="registration-content">
          <Typography variant="h5" className="registration-title">
            Welcome to Scribbie, Student!
          </Typography>

          {/* Use the RegistrationForm component */}
          <RegistrationForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleRegister}
          />

          <Typography className="login-link-container">
            <Link href="/student-login" className="login-link">
              Already have an account? <strong>Login here</strong>
            </Link>
          </Typography>
        </div>
      </div>
      <img
        src={bookImage}
        alt="Books"
        className="book-image-registration"
      />
    </div>
  );
};

export default StudentRegistration;