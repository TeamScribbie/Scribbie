// src/components/dialogs/DeleteCourseDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    CircularProgress,
    Box
} from '@mui/material';

const DeleteCourseDialog = ({ open, onClose, onConfirmDelete, courseName, isLoading }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [isMatch, setIsMatch] = useState(false);

    useEffect(() => {
        if (open) {
            setConfirmationText(''); // Reset on open
        }
    }, [open]);

    useEffect(() => {
        setIsMatch(confirmationText === courseName);
    }, [confirmationText, courseName]);

    const handleConfirm = () => {
        if (isMatch) {
            onConfirmDelete();
        }
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFCDD2', color: '#D32F2F' }}> {/* Warning/Error Theme */}
                Confirm Deletion
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
                <DialogContentText sx={{ mb: 2 }}>
                    To confirm deletion, please type the exact name of the course:
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'black', display: 'block', mt: 1 }}>
                        {courseName}
                    </Box>
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="courseNameConfirmation"
                    label="Type course name to confirm"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    disabled={isLoading}
                    error={confirmationText !== '' && !isMatch}
                    helperText={confirmationText !== '' && !isMatch ? "Course name does not match." : ""}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="error" // Error color for delete button
                    disabled={!isMatch || isLoading}
                    sx={{ position: 'relative' }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px'
                    }} /> : 'Delete Course'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeleteCourseDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirmDelete: PropTypes.func.isRequired,
    courseName: PropTypes.string, // Can be null initially
    isLoading: PropTypes.bool,
};

DeleteCourseDialog.defaultProps = {
    courseName: '',
    isLoading: false,
};

export default DeleteCourseDialog;