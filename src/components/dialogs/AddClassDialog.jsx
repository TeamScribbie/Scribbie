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
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [enrollmentLimit, setEnrollmentLimit] = useState('');

  useEffect(() => {
    if (!open) {
      setClassName('');
      setClassCode('');
      setEnrollmentLimit('');
    }
  }, [open]);

  const handleCreateClick = () => {
    if (className.trim() && classCode.trim() && enrollmentLimit.trim()) {
      onAddClass({ name: className, code: classCode, limit: enrollmentLimit });
      onClose();
    } else {
      console.log('Please fill all fields');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="dialog-title">Create a class</DialogTitle>
      <DialogContent className="dialog-content">
        <TextField
          autoFocus
          margin="dense"
          label="Class Name"
          fullWidth
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          variant="outlined"
        />
        <TextField
          margin="dense"
          label="Class Code"
          fullWidth
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          variant="outlined"
        />
        <TextField
          margin="dense"
          label="Enrollment Limit"
          fullWidth
          type="number"
          value={enrollmentLimit}
          onChange={(e) => setEnrollmentLimit(e.target.value)}
          variant="outlined"
          InputProps={{ inputProps: { min: 1 } }}
        />
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreateClick}
          variant="contained"
          className="dialog-create-button"
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
  onAddClass: PropTypes.func.isRequired,
};

export default AddClassDialog;