// src/components/dialogs/AddClassDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

const AddClassDialog = ({ open, onClose, onAddClass }) => {
  const [classroomName, setClassroomName] = useState(''); // Renamed for clarity
  const [classroomCode, setClassroomCode] = useState(''); // Renamed for clarity
  // Removed enrollmentLimit as it's not in the CreateClassroomRequest schema
  // const [enrollmentLimit, setEnrollmentLimit] = useState('');

  useEffect(() => {
    // Reset fields when dialog opens/closes
    if (!open) {
      setClassroomName('');
      setClassroomCode('');
      // setEnrollmentLimit('');
    }
  }, [open]);

  const handleCreateClick = () => {
    // Validate based on CreateClassroomRequest schema (e.g., non-empty)
    if (classroomName.trim() && classroomCode.trim()) {
      // Pass the data in the structure expected by createClassroom service
      onAddClass({
          classroomName: classroomName.trim(),
          classroomCode: classroomCode.trim()
      });
      // Optionally keep the dialog open until the API call succeeds/fails in the parent
      // onClose(); // Consider moving onClose to the parent's success handler
    } else {
      // Add better user feedback here (e.g., helperText on TextField)
      console.log('Please fill all required fields');
      alert('Please enter both a Class Name and a Class Code.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="dialog-title">Create a class</DialogTitle>
      <DialogContent className="dialog-content">
        <TextField
          autoFocus
          margin="dense"
          label="Class Name" // Use the correct label
          fullWidth
          value={classroomName}
          onChange={(e) => setClassroomName(e.target.value)}
          variant="outlined"
          // Add required prop and error handling if needed
        />
        <TextField
          margin="dense"
          label="Class Code" // Use the correct label
          fullWidth
          value={classroomCode}
          onChange={(e) => setClassroomCode(e.target.value)}
          variant="outlined"
          // Add required prop and error handling if needed
        />
        {/* Removed Enrollment Limit field */}
        {/* <TextField ... /> */}
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreateClick}
          variant="contained"
          className="dialog-create-button"
          // Disable button during API call if loading state is passed down
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddClassDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddClass: PropTypes.func.isRequired, // Expects a function that takes { classroomName, classroomCode }
};

export default AddClassDialog;