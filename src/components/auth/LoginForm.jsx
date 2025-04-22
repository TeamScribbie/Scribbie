// src/components/auth/LoginForm.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button, TextField } from '@mui/material';

const LoginForm = ({
  idNumber,
  password,
  onIdChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <form className="login-form-container" onSubmit={onSubmit}>
      <TextField
        label="ID Number"
        value={idNumber}
        onChange={onIdChange}
        fullWidth
        margin="normal" // Keep MUI margin for spacing consistency
        variant="outlined"
        className="login-input-field" // Apply custom background/border styles
        InputLabelProps={{ shrink: true }} // Keep label floated
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        fullWidth
        margin="normal"
        variant="outlined"
        className="login-input-field"
        InputLabelProps={{ shrink: true }}
      />

      <Button
        type="submit" // Make button submit the form
        variant="contained" // Use MUI variant for consistency
        className="login-button"
      >
        Login
      </Button>
    </form>
  );
};

LoginForm.propTypes = {
  idNumber: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  onIdChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default LoginForm;