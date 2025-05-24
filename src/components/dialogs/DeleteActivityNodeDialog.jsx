// src/components/dialogs/DeleteActivityNodeDialog.jsx
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

const DeleteActivityNodeDialog = ({ open, onClose, onConfirmDelete, isLoading, nodeTitle, error }) => {
    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()}>
            <DialogTitle>Delete Activity Node</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to permanently delete the activity node "{nodeTitle}"? This will also delete all associated questions and cannot be undone.
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

DeleteActivityNodeDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirmDelete: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    nodeTitle: PropTypes.string,
    error: PropTypes.string,
};

export default DeleteActivityNodeDialog;