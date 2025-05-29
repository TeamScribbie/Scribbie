// src/components/auth/RegistrationForm.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button, TextField } from '@mui/material';

const formatLabel = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') 
    .replace(/^./, (str) => str.toUpperCase()); 
};

const RegistrationForm = ({ formData, onChange, onSubmit }) => {
  const fields = ['studentId', 'firstName', 'lastName', 'password', 'verifyPassword'];

  return (
    <form className="registration-form-container" onSubmit={onSubmit}>
      {fields.map((field) => (
<TextField
  key={field}
  name={field}
  label={formData[field] ? '' : formatLabel(field)}  // Hide label if value exists
  type={field.includes('password') ? 'password' : 'text'}
  size="small"
  value={formData[field]}
  onChange={onChange}
  fullWidth
  margin="dense"
  variant="outlined"
  className={`registration-input-field ${formData[field] ? 'hide-label' : ''}`} // Add class to hide label
  InputLabelProps={{ shrink: false }} // Disable default label shrink to avoid label overlap
/>
      ))}
      <Button
        type="submit"
        variant="contained"
        className="registration-button"
      >
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