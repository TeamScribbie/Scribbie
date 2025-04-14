import React, { useState } from 'react';
import { Button, TextField, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png';

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
        borderRadius: '10px',
        backgroundColor: '#FFFBE0', // Ensure container has same bg color
        
      }}>
        <img src={bookImage} alt="Books" style={{
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          width: '350px'
        }} />

        <Typography variant="h4" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
          SCRIBBIE
        </Typography>

        {['email', 'firstName', 'lastName', 'teacherId', 'password', 'verifyPassword', 'businessCode'].map((field) => (
          <TextField
            key={field}
            name={field}
            label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
            size="small"
            value={formData[field]}
            onChange={handleChange}
            fullWidth
            margin="dense"
            variant="outlined"
            style={{ backgroundColor: '#FFDE9A' }}
          />
        ))}

        <Button
          onClick={handleRegister}
          style={{
            backgroundColor: '#451513',
            color: 'white',
            marginTop: '20px',
            width: '50%',
          }}
        >
          Register
        </Button>

        <Typography style={{ marginTop: '10px' }}>
          <Link href="/teacher-login" style={{ color: '#451513' }}>
            Already have an account? <strong>Login here</strong>
          </Link>
        </Typography>
      </div>
    </div>
  );
};

export default TeacherRegistration;
