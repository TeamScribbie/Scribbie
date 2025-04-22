// src/components/auth/TeacherRegistrationForm.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button, TextField } from '@mui/material';

// Helper function to format field names for labels (can be moved to a utils file)
const formatLabel = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

const TeacherRegistrationForm = ({ formData, onChange, onSubmit }) => {
  // Fields specific to Teacher Registration based on the original code
  const fields = ['email', 'firstName', 'lastName', 'teacherId', 'password', 'verifyPassword'];

  return (
    <form className="teacher-registration-form-container" onSubmit={onSubmit}>
      {fields.map((field) => (
        <TextField
          key={field}
          name={field} // Name matches the key in formData
          label={formatLabel(field)}
          type={field.includes('password') ? 'password' : (field === 'email' ? 'email' : 'text')} // Set type for password/email
          size="small"
          value={formData[field]}
          onChange={onChange} // Use the single handler from parent
          fullWidth
          margin="dense"
          variant="outlined"
          className="registration-input-field" // Reuse class name
          InputLabelProps={{ shrink: true }}
        />
      ))}
      <Button
        type="submit"
        variant="contained"
        className="registration-button" // Reuse class name
      >
        Register
      </Button>
    </form>
  );
};

TeacherRegistrationForm.propTypes = {
  // Define prop types based on the fields used
  formData: PropTypes.shape({
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    teacherId: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    verifyPassword: PropTypes.string.isRequired,
    // businessCode: PropTypes.string, // Add if you re-introduce this field later
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TeacherRegistrationForm;