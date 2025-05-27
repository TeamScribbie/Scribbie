// src/components/dialogs/DeleteLessonDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
    Alert
} from '@mui/material';

const DeleteLessonDialog = ({ open, onClose, onConfirmDelete, isLoading, lessonTitle, error }) => {
    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()}>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to permanently delete the lesson "{lessonTitle}"? This action cannot be undone.
                </DialogContentText>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button onClick={onConfirmDelete} color="error" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}>
                    {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeleteLessonDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirmDelete: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    lessonTitle: PropTypes.string,
    error: PropTypes.string,
};

export default DeleteLessonDialog;