import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import bookImage from '../assets/book.png';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Logging in with:', id, password);
    navigate("/student-homepage");
  };

  return (
    <div style={{ 
      backgroundColor: '#FFFBE0', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* Teacher Login Button (Upper Right) */}
      <Button 
        onClick={() => navigate('/teacher-login')}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          backgroundColor: '#451513', 
          color: 'white' 
        }}
      >
        Teacher Login
      </Button>

      <div style={{ textAlign: 'center', width: '40%' }}>
        {/* Book Image */}
        <img src={bookImage} alt="Books" style={{ 
          position: 'absolute', 
          bottom: '0px', 
          right: '0px', 
          width: '480px' 
        }} />

        <Typography variant="h4" gutterBottom>
          Practice and Learn with Scribbie!
        </Typography>

        <TextField
          label="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <Button 
          onClick={handleLogin}
          style={{ 
            backgroundColor: '#451513', 
            color: 'white', 
            marginTop: '20px', 
            width: '100%' 
          }}
        >
          Login
        </Button>

        <Typography style={{ marginTop: '10px' }}>
          <Link to="/student-register" style={{ color: '#451513', fontWeight: 'bold', textDecoration: 'none' }}>
            No Account yet? <strong>Register Here</strong>
          </Link>
        </Typography>
      </div>
    </div>
  );
};

export default StudentLogin;
