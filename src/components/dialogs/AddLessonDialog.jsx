// src/components/dialogs/AddLessonDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, CircularProgress, Typography
    // REMOVED: FormControlLabel, Checkbox
} from '@mui/material';

const AddLessonDialog = ({ open, onClose, onAddLesson, isLoading, error }) => {
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDescription, setLessonDescription] = useState('');
    const [type, setType] = useState(''); // e.g., "REGULAR", "REVIEW"
    // REMOVED: const [isRandom, setIsRandom] = useState(false);

    useEffect(() => {
        if (open) {
            // Reset form when dialog opens
            setLessonTitle('');
            setLessonDescription('');
            setType('');
            // REMOVED: setIsRandom(false);
        }
    }, [open]);

    const handleSubmit = () => {
        if (!lessonTitle.trim()) {
            // Basic validation, can be enhanced with a local error state for the dialog
            alert("Lesson Title is required.");
            return;
        }
        onAddLesson({
            lessonTitle,
            lessonDescription,
            type,
            // REMOVED: isRandom
        });
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                Add New Lesson
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="lessonTitle"
                    label="Lesson Title"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    disabled={isLoading}
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    id="lessonDescription"
                    label="Lesson Description"
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    disabled={isLoading}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    id="lessonType"
                    label="Lesson Type (e.g., REGULAR, REVIEW)"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={isLoading}
                    sx={{ mb: 2 }}
                />
                {/* REMOVED FormControlLabel and Checkbox for isRandom */}
                {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                        bgcolor: '#451513',
                        '&:hover': { bgcolor: '#5d211f' },
                        position: 'relative'
                    }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        marginTop: '-12px', marginLeft: '-12px'
                    }} /> : 'Add Lesson'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AddLessonDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    // UPDATED: onAddLesson callback signature
    onAddLesson: PropTypes.func.isRequired, // Callback with { lessonTitle, lessonDescription, type }
    isLoading: PropTypes.bool,
    error: PropTypes.string,
};

export default AddLessonDialog;