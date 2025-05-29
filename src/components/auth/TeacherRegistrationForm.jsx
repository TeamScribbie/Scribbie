// src/components/auth/TeacherRegistrationForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const formatLabel = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

const TeacherRegistrationForm = ({ formData, onChange, onSubmit /*, isLoading */ }) => {
  const fields = ['email', 'firstName', 'lastName', 'teacherId', 'password', 'verifyPassword', 'businessCode'];

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
    // You can enable disabling logic based on isLoading prop if needed
    <form className="teacher-registration-form-container" onSubmit={onSubmit}>
      {fields.map((field) => {
        const isPasswordField = field.toLowerCase().includes('password');
        const inputType = isPasswordField
          ? (showPasswordFields[field] ? 'text' : 'password')
          : field === 'email'
          ? 'email'
          : 'text';

        return (
          <TextField
            key={field}
            name={field}
            label={formData[field] ? '' : formatLabel(field)} // Hide label if input has value
            type={inputType}
            size="small"
            value={formData[field]}
            onChange={onChange}
            fullWidth
            margin="dense"
            variant="outlined"
            className={`registration-input-field ${formData[field] ? 'hide-label' : ''}`}
            InputLabelProps={{ shrink: false }}
            // disabled={isLoading} // Uncomment if using isLoading prop
            InputProps={
              isPasswordField
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword(field)}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          aria-label={showPasswordFields[field] ? 'Hide password' : 'Show password'}
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
      <Button
        type="submit"
        variant="contained"
        className="registration-button"
        // disabled={isLoading} // Uncomment if using isLoading prop
      >
        Register
      </Button>
    </form>
  );
};

TeacherRegistrationForm.propTypes = {
  formData: PropTypes.shape({
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    teacherId: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    verifyPassword: PropTypes.string.isRequired,
    businessCode: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // isLoading: PropTypes.bool, // Add if passing isLoading prop
};

export default TeacherRegistrationForm;
