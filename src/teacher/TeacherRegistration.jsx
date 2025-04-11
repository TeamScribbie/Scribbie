import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bookImage from '../assets/book.png';

const TeacherRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
<<<<<<< HEAD
    email: '',
    firstName: '',
    lastName: '',
    teacherId: '',
    password: '',
    verifyPassword: '',
    businessCode: '',
=======
    lastName: '',
    firstName: '',
    studentId: '',
    password: '',
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
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
<<<<<<< HEAD
        width: '350px',
        padding: '20px',
        borderRadius: '10px'
=======
        width: '40%',
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
      }}>
        <img src={bookImage} alt="Books" style={{ 
          position: 'absolute', 
          bottom: '0px', 
          right: '0px', 
<<<<<<< HEAD
          width: '300px' 
        }} />
        
        <Typography variant="h3" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
=======
          width: '480px' 
        }} />
        
        <Typography variant="h4" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
          SCRIBBIE
        </Typography>

        <TextField
          name="email"
          label="Email"
<<<<<<< HEAD
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
=======
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="lastName"
          label="Last Name"
<<<<<<< HEAD
          size="small"
          value={formData.lastName}
          onChange={handleChange}
          fullWidth
          margin="dense"
=======
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
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="teacherId"
          label="Teacher ID"
<<<<<<< HEAD
          size="small"
          value={formData.teacherId}
          onChange={handleChange}
          fullWidth
          margin="dense"
=======
          value={formData.teacherId}
          onChange={handleChange}
          fullWidth
          margin="normal"
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
          name="password"
          label="Password"
          type="password"
<<<<<<< HEAD
          size="small"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="dense"
=======
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
<<<<<<< HEAD
          name="verifyPassword"
          label="Verify Password"
          type="password"
          size="small"
          value={formData.verifyPassword}
          onChange={handleChange}
          fullWidth
          margin="dense"
=======
          name="verifypassword"
          label="VerifyPassword"
          type="password"
          value={formData.verifypassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <TextField
<<<<<<< HEAD
          name="businessCode"
          label="Business Code"
          size="small"
          value={formData.businessCode}
          onChange={handleChange}
          fullWidth
          margin="dense"
=======
          name="businesscode"
          label="Business Code"
          value={formData.businesscode}
          onChange={handleChange}
          fullWidth
          margin="normal"
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
          variant="outlined"
          style={{ backgroundColor: '#FFDE9A' }}
        />

        <Button 
          onClick={handleRegister} 
          style={{ 
<<<<<<< HEAD
            backgroundColor: '#451513', 
=======
            backgroundColor: '#F5B041', 
>>>>>>> a71a5f7cf023dcc390fb16c5f353e61869c1f964
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
