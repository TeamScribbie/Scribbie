import React, { useState } from 'react';
import { Button, TextField, Typography, Link } from '@mui/material';

const TeacherLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Logging in with:', email, password);
  };

  return (
    <div style={{ 
      backgroundColor: '#FFFBE0', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'
    }}>
      <div style={{ 
        backgroundColor: '', 
        padding: '20px', 
        width: '40%', 
        borderRadius: '8px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center'
      }}>
        <Typography variant="h4" gutterBottom>
        Practice and Learn with Scribbie!
        </Typography>

        <TextField
          label="Email:"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '60%', 
            marginBottom: '0.5px'
          }}
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
          label="Password:"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '60%', 
            marginBottom: '0.5px'
          }}
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
          halfWidth
        >
          Login
        </Button>

        <Typography style={{ marginTop: '10px' }}>
            <Link href="#" style={{ color: '#451513' }}>
             No Account yet? <strong>Register Here</strong>
             </Link>
        </Typography>
      </div>
    </div>
  );
};

export default TeacherLogin;
