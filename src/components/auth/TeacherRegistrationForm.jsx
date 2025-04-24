// src/components/auth/TeacherRegistrationForm.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button, TextField } from '@mui/material';

const formatLabel = (fieldName) => {
  // ... (keep existing helper function) ...
    return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

const TeacherRegistrationForm = ({ formData, onChange, onSubmit /*, isLoading */ }) => {
  // Add 'businessCode' to the fields array
  const fields = ['email', 'firstName', 'lastName', 'teacherId', 'password', 'verifyPassword', 'businessCode'];

  return (
    // Add disabling logic if needed based on isLoading prop
    <form className="teacher-registration-form-container" onSubmit={onSubmit}>
      {fields.map((field) => (
        <TextField
          key={field}
          name={field}
          label={formatLabel(field)}
          type={field.includes('password') ? 'password' : (field === 'email' ? 'email' : 'text')}
          size="small"
          value={formData[field]}
          onChange={onChange}
          fullWidth
          margin="dense"
          variant="outlined"
          className="registration-input-field"
          InputLabelProps={{ shrink: true }}
          // disabled={isLoading} // Disable field if loading
        />
      ))}
      <Button
        type="submit"
        variant="contained"
        className="registration-button"
        // disabled={isLoading} // Disable button if loading
      >
        Register
      </Button>
    </form>
  );
};

// Update propTypes to include businessCode
TeacherRegistrationForm.propTypes = {
  formData: PropTypes.shape({
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    teacherId: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    verifyPassword: PropTypes.string.isRequired,
    businessCode: PropTypes.string.isRequired, // Add businessCode
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // isLoading: PropTypes.bool, // Add if passing isLoading prop
};

export default TeacherRegistrationForm;