// src/components/auth/RegistrationForm.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button, TextField } from '@mui/material';

// Helper function to format field names for labels
const formatLabel = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

const RegistrationForm = ({ formData, onChange, onSubmit }) => {
  const fields = ['studentId', 'firstName', 'lastName', 'password', 'verifyPassword'];

  return (
    <form className="registration-form-container" onSubmit={onSubmit}>
      {fields.map((field) => (
        <TextField
          key={field}
          name={field} // Name matches the key in formData
          label={formatLabel(field)}
          type={field.includes('password') ? 'password' : 'text'} // Set type for password fields
          size="small" // As per original
          value={formData[field]}
          onChange={onChange} // Use the single handler passed from parent
          fullWidth
          margin="dense" // As per original
          variant="outlined"
          className="registration-input-field"
          InputLabelProps={{ shrink: true }} // Keep label floated
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