// src/page/teacher/TeacherRegistration.jsx
import React, { useState } from 'react';
import { Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png'; // Ensure path is correct
// Import the new Teacher specific form
import TeacherRegistrationForm from '../../components/auth/TeacherRegistrationForm';
// Import the new CSS
import '../../styles/TeacherRegistration.css';

const TeacherRegistration = () => {
  const navigate = useNavigate();

  // State based on the fields in the original component
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    teacherId: '',
    password: '',
    verifyPassword: '',
    // businessCode: '', // Keep if needed later
  });

  // Reusable change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleRegister = (event) => {
    event.preventDefault();
    // Add validation here (e.g., passwords match)
    console.log('Registering teacher:', formData);
    // --- API Call would go here ---
    navigate('/teacher-login'); // Navigate after "attempt"
  };

  return (
    // Use specific container class or adapt general one
    <div className="teacher-registration-container">
      {/* Reuse general card style */}
      <div className="registration-card">
        {/* Reuse general header style */}
        <div className="registration-header">
          Register
        </div>

        {/* Reuse general content style */}
        <div className="registration-content">
          <Typography variant="h5" className="registration-title-teacher">
            Welcome to Scribbie, Teacher!
          </Typography>

          {/* Use the TeacherRegistrationForm component */}
          <TeacherRegistrationForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleRegister}
          />

          {/* Reuse link styles */}
          <Typography className="login-link-container">
            <Link href="/teacher-login" className="login-link">
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