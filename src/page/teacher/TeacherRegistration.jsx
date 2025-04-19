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
      <img
        src={bookImage}
        alt="Books"
        style={{
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          width: '350px',
        }}
      />

      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        width: '40%',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#451513',
          color: 'white',
          textAlign: 'center',
          padding: '15px 0',
          fontSize: '24px',
          fontWeight: 'bold',
        }}>
          Register
        </div>

        <div style={{
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Scribbie, Teacher!
          </Typography>

          {/* Form Fields */}
          {['email', 'firstName', 'lastName', 'teacherId', 'password', 'verifyPassword'].map((field) => (
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
              InputProps={{
                style: {
                  backgroundColor: '#FFDE9A',
                  border: '1px solid #451513',
                  borderRadius: '4px',
                  fontSize: '14px',
                  height: '50px',
                  padding: '0 12px',
                },
              }}
              style={{ width: '80%', marginBottom: '10px' }}
            />
          ))}

          <Button
            onClick={handleRegister}
            style={{
              backgroundColor: '#451513',
              color: 'white',
              marginTop: '20px',
              width: '40%',
            }}
          >
            Register
          </Button>

          <Typography style={{ marginTop: '15px' }}>
            <Link href="/teacher-login" style={{ color: '#451513' }}>
              Already have an account? <strong>Login here</strong>
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegistration;
