// src/components/dialogs/EditLessonDialog.jsx
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
    Alert
} from '@mui/material';

const EditLessonDialog = ({ open, onClose, onUpdateLesson, isLoading, error, lesson }) => {
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDescription, setLessonDescription] = useState('');

    useEffect(() => {
        if (open && lesson) {
            setLessonTitle(lesson.lessonTitle || '');
            setLessonDescription(lesson.lessonDescription || '');
        }
    }, [open, lesson]);

    const handleSubmit = () => {
        if (!lessonTitle.trim()) {
            return;
        }
        onUpdateLesson({ lessonTitle, lessonDescription });
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                Edit Lesson
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#FFFAF0', paddingTop: '20px !important' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="editLessonTitle"
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
                    id="editLessonDescription"
                    label="Lesson Description"
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    disabled={isLoading}
                />
                {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#FFFAF0', p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} sx={{ color: '#451513' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isLoading || !lessonTitle.trim()}
                    sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' } }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EditLessonDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpdateLesson: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    lesson: PropTypes.shape({
        lessonDefinitionId: PropTypes.number,
        lessonTitle: PropTypes.string,
        lessonDescription: PropTypes.string,
    }),
};

export default EditLessonDialog;