// src/components/dialogs/JoinClassDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography, // Added for helper text
} from '@mui/material';

const JoinClassDialog = ({ open, onClose, onJoinClass }) => {
  const [classCode, setClassCode] = useState('');

  useEffect(() => {
    if (!open) {
      setClassCode(''); // Clear code when closing
    }
  }, [open]);

  const handleJoinClick = () => {
    if (classCode.trim()) {
      onJoinClass(classCode.trim()); // Pass trimmed code up
      onClose(); // Close after attempting join
    } else {
      console.log('Please enter a class code');
      // Add user feedback here later
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="join-dialog-title">Join a Class</DialogTitle>
      <DialogContent className="join-dialog-content">
         <Typography variant="body2" gutterBottom>
            Enter the code provided by your teacher.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Class Code"
          fullWidth
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions className="join-dialog-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleJoinClick}
          variant="contained"
          className="join-dialog-button"
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
};

JoinClassDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onJoinClass: PropTypes.func.isRequired, // Callback with the entered code
};

export default JoinClassDialog;