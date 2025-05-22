// src/components/dialogs/DeleteChallengeDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress
} from '@mui/material';

const DeleteChallengeDialog = ({ open, onClose, onConfirmDelete, isLoading, lessonTitle }) => {
    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFCDD2', color: '#D32F2F' }}>
                Confirm Challenge Deletion
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
                <DialogContentText>
                    Are you sure you want to delete the challenge configuration for the lesson
                    <Typography component="span" fontWeight="bold" display="block" sx={{ mt: 1 }}>
                        "{lessonTitle || 'this lesson'}"?
                    </Typography>
                    This action cannot be undone. Any custom questions associated *only* with this challenge might also be removed (depending on backend setup).
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirmDelete}
                    variant="contained"
                    color="error"
                    disabled={isLoading}
                    sx={{ position: 'relative' }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} /> : 'Delete Challenge'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeleteChallengeDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirmDelete: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    lessonTitle: PropTypes.string,
};

export default DeleteChallengeDialog;