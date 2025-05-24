// src/components/dialogs/EditCourseDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
    Box,
    Alert
} from '@mui/material';

const EditCourseDialog = ({ open, onClose, onUpdateCourse, isLoading, error, course }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (open && course) {
            setTitle(course.title || '');
            setDescription(course.description || '');
        }
        if (!open) {
            setTitle('');
            setDescription('');
        }
    }, [open, course]);

    const handleSubmit = () => {
        if (!title.trim()) {
            // Basic validation, can be enhanced by passing a setError a la AddCourseDialog
            alert("Course Title is required.");
            return;
        }
        onUpdateCourse({ title, description });
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                Edit Course
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#FFFAF0', paddingTop: '20px !important' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="editCourseTitle"
                    label="Course Title"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    id="editCourseDescription"
                    label="Course Description"
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                />
                {error && <Alert severity="error" sx={{mt:1}}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#FFFAF0', p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} sx={{ color: '#451513' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isLoading || !title.trim()}
                    sx={{
                        bgcolor: '#451513',
                        '&:hover': { bgcolor: '#5d211f' },
                        position: 'relative'
                    }}
                >
                    {isLoading ? <CircularProgress size={24} sx={{
                        color: 'white',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px'
                    }} /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EditCourseDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpdateCourse: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    course: PropTypes.shape({
        courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        description: PropTypes.string,
    }),
};

export default EditCourseDialog;