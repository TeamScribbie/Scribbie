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
  const [idError, setIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ id: false, password: false });

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const validateIdNumber = (value) => {
    if (!value || value.trim() === '') {
      return 'Student ID is required';
    }
    if (value.length < 4) {
      return 'Student ID must be at least 4 characters';
    }
    return '';
  };

  const validatePassword = (value) => {
    if (!value || value.trim() === '') {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  const handleIdBlur = () => {
    setTouched({ ...touched, id: true });
    setIdError(validateIdNumber(idNumber));
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    setPasswordError(validatePassword(password));
  };

  const handleIdChangeWithValidation = (e) => {
    onIdChange(e);
    if (touched.id) {
      setIdError(validateIdNumber(e.target.value));
    }
  };

  const handlePasswordChangeWithValidation = (e) => {
    onPasswordChange(e);
    if (touched.password) {
      setPasswordError(validatePassword(e.target.value));
    }
  };

  return (
    <form className="login-form-container" onSubmit={onSubmit}>
      <div className="form-field">
        <label className="field-label">ID NUMBER:</label>
        <TextField
          value={idNumber}
          onChange={handleIdChangeWithValidation}
          onBlur={handleIdBlur}
          placeholder="00-0000-000"
          variant="outlined"
          className="login-input-field"
          error={touched.id && !!idError}
          helperText={touched.id && idError}
          InputProps={{
            disableUnderline: true,
          }}
          FormHelperTextProps={{
            sx: {
              marginLeft: 0,
              marginTop: '4px',
              fontSize: '14px',
              color: '#ef4444'
            }
          }}
        />
      </div>

      <div className="form-field">
        <label className="field-label">PASSWORD:</label>
        <TextField
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChangeWithValidation}
          onBlur={handlePasswordBlur}
          placeholder="**********"
          variant="outlined"
          className="login-input-field"
          error={touched.password && !!passwordError}
          helperText={touched.password && passwordError}
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
          FormHelperTextProps={{
            sx: {
              marginLeft: 0,
              marginTop: '4px',
              fontSize: '14px',
              color: '#ef4444'
            }
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
