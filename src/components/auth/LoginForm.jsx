// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const LoginForm = ({
  idNumber,
  password,
  onIdChange,
  onPasswordChange,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <form className="login-form-container" onSubmit={onSubmit}>
      <TextField
        label={idNumber ? '' : 'ID Number'}
        value={idNumber}
        onChange={onIdChange}
        fullWidth
        margin="normal"
        variant="outlined"
        className="login-input-field"
        InputLabelProps={{ shrink: false }}
      />

      <TextField
        label={password ? '' : 'Password'}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={onPasswordChange}
        fullWidth
        margin="normal"
        variant="outlined"
        className="login-input-field"
        InputLabelProps={{ shrink: false }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        variant="contained"
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
