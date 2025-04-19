import React, { useState } from 'react';
import { Button, TextField, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png';

const StudentLogin = () => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log('Student Login:', idNumber, password);
    navigate('/student-homepage');
  };

  return (
    <div style={{
      backgroundColor: '#FFFBE0',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <img 
      src={bookImage} 
      alt="Books" 
      style={{
      position: 'absolute', 
      bottom: '0px', 
      right: '0px', 
      width: '300px'
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
          fontWeight: 'bold'
        }}>
          Login
        </div>

        {/* Form Area */}
        <div style={{
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Typography variant="h5" gutterBottom>
            Practice and Learn with Scribbie!
          </Typography>

          {/* Toggle to Teacher Login */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '999px',
            border: '2px solid #451513',
            overflow: 'hidden',
            margin: '15px 0',
            display: 'flex'
          }}>
            <button
              onClick={() => navigate('/student-login')}
              style={{
                padding: '8px 16px',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: '#451513',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              Student
            </button>
            <button
              onClick={() => navigate('/teacher-login')}
              style={{
                padding: '8px 16px',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: '#451513',
                fontWeight: 'bold'
              }}
            >
              Teacher
            </button>
          </div>

          <TextField
            label="ID Number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            fullWidth
            margin="normal"
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

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            InputProps={{
              style: {
                backgroundColor: '#FFDE9A',
                border: '1px solid #451513',
                borderRadius: '4px',
                fontSize: '14px',
                height: '50px',
              },
            }}
            style={{ width: '80%', marginBottom: '20px' }}
          />

          <Button
            onClick={handleLogin}
            style={{ backgroundColor: '#451513', color: 'white', marginTop: '10px', width: '40%' }}
          >
            Login
          </Button>

          <Typography style={{ marginTop: '15px' }}>
            <Link
              component="button"
              onClick={() => navigate('/student-register')}
              style={{ color: '#451513' }}
            >
              No Account yet? <strong>Register Here</strong>
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
