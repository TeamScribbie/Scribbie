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

const TeacherRegistrationForm = ({ formData, onChange, onSubmit, isLoading }) => {
  const fields = [
    { name: 'email', label: 'EMAIL:' },
    { name: 'firstName', label: 'FIRSTNAME:' },
    { name: 'lastName', label: 'LASTNAME:' },
    { name: 'teacherId', label: 'ID NUMBER:' },
    { name: 'password', label: 'PASSWORD:' },
    { name: 'verifyPassword', label: 'VERIFY PASSWORD:' },
    { name: 'businessCode', label: 'BUSINESS CODE:' }
  ];

  // Track show/hide password state per field, including businessCode
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
    <form className="teacher-registration-form-container" onSubmit={onSubmit}>
      {fields.map((field) => {
        const isPasswordField = field.name.toLowerCase().includes('password') || field.name === 'businessCode';

        const inputType = isPasswordField
          ? (showPasswordFields[field.name] ? 'text' : 'password')
          : field.name === 'email'
          ? 'email'
          : 'text';

        return (
          <div key={field.name} className="form-field">
            <label className="field-label">{field.label}</label>
            <TextField
              name={field.name}
              type={inputType}
              value={formData[field.name]}
              onChange={onChange}
              placeholder={field.name === 'email' || field.name === 'teacherId' ? '00-0000-000' : field.name.includes('password') || field.name === 'businessCode' ? '**********' : '00-0000-000'}
              variant="outlined"
              className="registration-input-field"
              disabled={isLoading}
              InputProps={
                isPasswordField
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleClickShowPassword(field.name)}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            aria-label={showPasswordFields[field.name] ? 'Hide password' : 'Show password'}
                          >
                            {showPasswordFields[field.name] ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  : undefined
              }
            />
          </div>
        );
      })}
      <div className="button-container">
        <button
          type="submit"
          className="confirm-button"
          disabled={isLoading}
        >
          CONFIRM
        </button>
      </div>
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
};

export default TeacherRegistrationForm;
