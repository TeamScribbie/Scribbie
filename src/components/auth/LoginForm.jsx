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
      <div className="form-field">
        <label className="field-label">ID NUMBER:</label>
        <TextField
          value={idNumber}
          onChange={onIdChange}
          placeholder="00-0000-000"
          variant="outlined"
          className="login-input-field"
          InputProps={{
            disableUnderline: true,
          }}
        />
      </div>

      <div className="form-field">
        <label className="field-label">PASSWORD:</label>
        <TextField
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={onPasswordChange}
          placeholder="**********"
          variant="outlined"
          className="login-input-field"
          InputProps={{
            disableUnderline: true,
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
      </div>
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
