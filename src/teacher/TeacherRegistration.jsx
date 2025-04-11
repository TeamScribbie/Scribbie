import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../assets/book.png';

const TeacherRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    teacherId: '',
    password: '',
    verifyPassword: '',
    businessCode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    console.log('Registering teacher:', formData);
    navigate("/teacher-login");
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
        width: '350px',
        padding: '20px',
        borderRadius: '10px'
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
          name="email"
          label="Email"
          size="small"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="dense"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="firstName"
          label="First Name"
          size="small"
          value={formData.firstName}
          onChange={handleChange}
          fullWidth
          margin="dense"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="lastName"
          label="Last Name"
          size="small"
          value={formData.lastName}
          onChange={handleChange}
          fullWidth
          margin="dense"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="teacherId"
          label="Teacher ID"
          size="small"
          value={formData.teacherId}
          onChange={handleChange}
          fullWidth
          margin="dense"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          size="small"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="dense"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="verifyPassword"
          label="Verify Password"
          type="password"
          size="small"
          value={formData.verifyPassword}
          onChange={handleChange}
          fullWidth
          margin="dense"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="businessCode"
          label="Business Code"
          size="small"
          value={formData.businessCode}
          onChange={handleChange}
          fullWidth
          margin="dense"
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

export default TeacherRegistration;
