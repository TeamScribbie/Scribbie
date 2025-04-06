import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../assets/book.png';

const StudentRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    studentId: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    console.log('Registering student:', formData);
    navigate("/student-login");
  };

  return (
    <div style={{ 
      backgroundColor: '#FFFBE0', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      position: 'relative',
    }}>
      <div style={{ 
        textAlign: 'center',
        width: '40%',
      }}>
        <img src={bookImage} alt="Books" style={{ 
          position: 'absolute', 
          bottom: '0px', 
          right: '0px', 
          width: '480px' 
        }} />
        
        <Typography variant="h4" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
          SCRIBBIE
        </Typography>

        <TextField
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="studentId"
          label="Student ID"
          value={formData.studentId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <Button 
          onClick={handleRegister} 
          style={{ 
            backgroundColor: '#F5B041', 
            color: 'white', 
            marginTop: '20px', 
            width: '100%' 
          }}
        >
          Register
        </Button>
      </div>
    </div>
  );
};

export default StudentRegistration;
