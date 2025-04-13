import React, { useState } from 'react';
import { Button, TextField, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../../assets/book.png';

const TeacherLogin = () => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return (
    <div style={{ 
      backgroundColor: '#FFFBE0', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      position: 'relative'  
    }}>
      <img 
        src={bookImage} 
        alt="Books" 
        style={{
          position: 'absolute', 
          bottom: '0px', 
          right: '0px', 
          width: '350px'
        }}
      />

      <div style={{ 
        padding: '20px', 
        width: '40%', 
        borderRadius: '8px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center'
      }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, Teacher!
        </Typography>

        <TextField
          label="ID"
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          style={{ width: '60%', marginBottom: '10px', backgroundColor: '#FFDE9A' }}
          variant="outlined"
        />
        
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '60%', marginBottom: '10px', backgroundColor: '#FFDE9A' }}
          variant="outlined"
        />
        
        <Button
          onClick={() => navigate('/teacher-homepage')}
          style={{ 
          backgroundColor: '#451513', 
          color: 'white', 
          marginTop: '20px', 
          width: '30%' 
          }}
        >
          Login
        </Button>

        <Typography style={{ marginTop: '10px' }}>
          <Link href="/teacher-register" style={{ color: '#451513' }}>
             No Account yet? <strong>Register Here</strong>
          </Link>
        </Typography>

        <Button 
          onClick={() => navigate('/student-login')}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#451513',
            color: 'white'
          }}
        >
          Access as Student
        </Button>
      </div>
    </div>
  );
};

export default TeacherLogin;
