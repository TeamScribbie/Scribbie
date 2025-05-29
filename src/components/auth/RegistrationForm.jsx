// src/components/auth/RegistrationForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const formatLabel = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

const RegistrationForm = ({ formData, onChange, onSubmit }) => {
  const fields = ['studentId', 'firstName', 'lastName', 'password', 'verifyPassword'];

  // State to track password visibility per field
  const [showPasswordFields, setShowPasswordFields] = useState({});

  const handleClickShowPassword = (field) => {
    setShowPasswordFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <form className="registration-form-container" onSubmit={onSubmit}>
      {fields.map((field) => {
        const isPasswordField = field.toLowerCase().includes('password');

        return (
          <TextField
            key={field}
            name={field}
            label={formData[field] ? '' : formatLabel(field)} // Hide label if value exists
            type={isPasswordField ? (showPasswordFields[field] ? 'text' : 'password') : 'text'}
            size="small"
            value={formData[field]}
            onChange={onChange}
            fullWidth
            margin="dense"
            variant="outlined"
            className={`registration-input-field ${formData[field] ? 'hide-label' : ''}`}
            InputLabelProps={{ shrink: false }}
            InputProps={
              isPasswordField
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword(field)}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          aria-label={
                            showPasswordFields[field] ? 'Hide password' : 'Show password'
                          }
                        >
                          {showPasswordFields[field] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                : undefined
            }
          />
        );
      })}
      <Button type="submit" variant="contained" className="registration-button">
        Register
      </Button>
    </form>
  );
};

RegistrationForm.propTypes = {
  formData: PropTypes.shape({
    studentId: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    verifyPassword: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RegistrationForm;
