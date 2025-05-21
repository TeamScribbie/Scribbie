// AI Context/Frontend/components/dialogs/AddCourseDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AddLessonDialog from '../../components/dialogs/AddLessonDialog'; 
import { createLessonDefinition } from '../../services/lessonService';
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

const AddCourseDialog = ({ open, onClose, onAddCourse, isLoading, error }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Clear form when dialog is closed/opened
    useEffect(() => {
        if (open) {
            setTitle('');
            setDescription('');
        }
    }, [open]);

    const handleSubmit = () => {
        if (!title.trim()) {
            // Basic validation, can be enhanced
            alert("Course Title is required.");
            return;
        }
        onAddCourse({ title, description });
    };

const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false);
const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
const [addLessonError, setAddLessonError] = useState(null);
const handleAddLesson = () => {
        setAddLessonError(null); // Clear previous errors
        setIsAddLessonDialogOpen(true);
    };
const handleConfirmAddLesson = async (lessonFormData) => {
        if (!authState.token || !courseId) {
            setAddLessonError("Authentication or Course ID missing.");
            return;
        }
        setIsSubmittingLesson(true);
        setAddLessonError(null);
        try {
            const newLesson = await createLessonDefinition(courseId, lessonFormData, authState.token);
            setLessons(prevLessons => [...prevLessons, newLesson]); // Add to local state
            setIsAddLessonDialogOpen(false);
            // Optionally show a success message
        } catch (err) {
            console.error("Error adding lesson:", err);
            setAddLessonError(err.message || "Failed to add lesson. Please try again.");
            // Dialog remains open to show the error
        } finally {
            setIsSubmittingLesson(false);
        }
    };
    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                Add New Course
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#FFFAF0', paddingTop: '20px !important' }}>
                {/* Optional: Add DialogContentText here if needed */}
                <TextField
                    autoFocus
                    margin="dense"
                    id="courseTitle"
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
                    id="courseDescription"
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
                {error && <DialogContentText color="error" sx={{mt:1}}>{error}</DialogContentText>}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#FFFAF0', p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} sx={{ color: '#451513' }}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={isLoading}
                    sx={{ 
                        bgcolor: '#451513', 
                        '&:hover': { bgcolor: '#5d211f' },
                        position: 'relative' // For loader positioning
                    }}
                >
                    {isLoading ? <CircularProgress size={24} sx={{ 
                                        color: 'white', 
                                        position: 'absolute', 
                                        top: '50%', 
                                        left: '50%', 
                                        marginTop: '-12px', 
                                        marginLeft: '-12px' 
                                    }} /> : 'Add Course'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AddCourseDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddCourse: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.string, // To display submission errors from parent
};

export default AddCourseDialog;