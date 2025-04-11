import React, { useState } from 'react';
import { Button, TextField, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImg from '../assets/book.png';

const StudentLogin = () => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log('Student Login:', idNumber, password);
    navigate('/student-homepage');
  };

  return (
    <div style={{ backgroundColor: '#FFFBE0', height: '100vh', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={() => navigate('/teacher-login')}
          style={{ backgroundColor: '#451513', color: 'white' }}
        >
          Teacher Login
        </Button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '90%',
      }}>
        <div style={{ width: '40%', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Practice and Learn with Scribbie!
          </Typography>

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
          />

          <Button
            onClick={handleLogin}
            style={{ backgroundColor: '#451513', color: 'white', marginTop: '20px' }}
            fullWidth
          >
            Login
          </Button>

          <Typography style={{ marginTop: '10px' }}>
            <Link
              component="button"
              onClick={() => navigate('/student-register')}
              style={{ color: '#451513' }}
            >
              No Account yet? <strong>Register Here</strong>
            </Link>
          </Typography>
        </div>

        <img src={bookImg} alt="Book" style={{ height: '300px', marginLeft: '40px' }} />
      </div>
    </div>
  );
};

export default StudentLogin;