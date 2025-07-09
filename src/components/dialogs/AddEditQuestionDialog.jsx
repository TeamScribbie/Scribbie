import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    CircularProgress, Typography, Box, Checkbox, FormControlLabel, IconButton,
    List, Divider, Alert, Link as MuiLink
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Audiotrack from '@mui/icons-material/Audiotrack';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuth } from '../../context/AuthContext';
import InlineChoiceForm from '../teacher/editor/InlineChoiceForm';

const AddEditQuestionDialog = ({
                                   open,
                                   onClose,
                                   onSave,
                                   existingQuestion,
                                   isLoading: isParentLoading,
                                   orderIndexForNewQuestion
                               }) => {
    const { authState } = useAuth();
    const backendBaseUrl = 'http://localhost:8080';

    const [questionData, setQuestionData] = useState(null);
    const [dialogError, setDialogError] = useState(null);

    // Effect to initialize state when the dialog opens
    useEffect(() => {
        if (open) {
            setDialogError(null);
            if (existingQuestion) {
                setQuestionData({
                    ...JSON.parse(JSON.stringify(existingQuestion)),
                    imageFile: null,
                    audioFile: null,
                    removeImage: false,
                    removeAudio: false,
                    imagePreview: existingQuestion.questionImageUrl ? `${backendBaseUrl}${existingQuestion.questionImageUrl}` : null,
                    choices: (existingQuestion.choices || []).map(c => ({
                        ...c,
                        tempId: c.choiceId || `temp-${Date.now()}-${Math.random()}`,
                        imageFile: null,
                        audioFile: null,
                        removeImage: false,
                        removeAudio: false
                    }))
                });
            } else {
                setQuestionData({
                    isNew: true,
                    questionText: '',
                    instructional: false,
                    orderIndex: orderIndexForNewQuestion,
                    choices: [],
                });
            }
        }
    }, [open, existingQuestion, backendBaseUrl, orderIndexForNewQuestion]);

    // Effect to clean up temporary preview URLs
    useEffect(() => {
        const previewUrl = questionData?.imagePreview;
        const isBlob = previewUrl && previewUrl.startsWith('blob:');
        return () => {
            if (isBlob) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [questionData?.imagePreview]);

    const handleChange = (field, value) => {
        setQuestionData(prev => ({ ...prev, [field]: value }));
    };

    // --- Question-Level File Handlers ---
    const handleQuestionFileChange = (event, fileType) => {
        const file = event.target.files[0];
        if (!file) return;

        setQuestionData(prev => {
            const newState = { ...prev };
            if (fileType === 'image') {
                if (newState.imagePreview?.startsWith('blob:')) URL.revokeObjectURL(newState.imagePreview);
                newState.imageFile = file;
                newState.imagePreview = URL.createObjectURL(file);
                newState.removeImage = false;
            } else {
                newState.audioFile = file;
                newState.removeAudio = false;
            }
            return newState;
        });
    };

    const handleQuestionFileRemove = (fileType) => {
        setQuestionData(prev => {
            const newState = { ...prev };
            if (fileType === 'image') {
                if (newState.imagePreview?.startsWith('blob:')) URL.revokeObjectURL(newState.imagePreview);
                newState.imageFile = null;
                newState.imagePreview = null;
                newState.questionImageUrl = null; // Also clear the backend path
                newState.removeImage = true;
            } else {
                newState.audioFile = null;
                newState.questionSoundUrl = null; // Also clear the backend path
                newState.removeAudio = true;
            }
            return newState;
        });
    };

    // --- Choice-Level Handlers ---
    const handleAddChoice = () => {
        const newChoice = { tempId: `new-c-${Date.now()}`, choiceText: '', isCorrect: false, isNew: true };
        setQuestionData(prev => ({ ...prev, choices: [...(prev.choices || []), newChoice] }));
    };

    const handleChoiceChange = (index, updatedData) => {
        setQuestionData(prev => ({
            ...prev,
            choices: prev.choices.map((c, i) => i === index ? { ...c, ...updatedData, isModified: !c.isNew } : c)
        }));
    };

    const handleDeleteChoice = (index) => {
        setQuestionData(prev => {
            const updatedChoices = prev.choices.filter((c, i) => i !== index);
            return { ...prev, choices: updatedChoices };
        });
    };

    const handleChoiceFileChange = (index, field, file) => {
        setQuestionData(prev => ({
            ...prev,
            choices: prev.choices.map((c, i) => {
                if (i === index) {
                    const updatedChoice = { ...c, [field]: file, isModified: true };
                    if (field === 'imageFile') updatedChoice.removeImage = false;
                    if (field === 'audioFile') updatedChoice.removeAudio = false;
                    return updatedChoice;
                }
                return c;
            })
        }));
    };

    const handleChoiceFileRemove = (index, fileType) => {
        setQuestionData(prev => ({
            ...prev,
            choices: prev.choices.map((c, i) => {
                if (i === index) {
                    const updated = { ...c, isModified: true };
                    if (fileType === 'image') {
                        updated.imagePath = null;
                        updated.imageFile = null;
                        updated.removeImage = true;
                    } else {
                        updated.audioPath = null;
                        updated.audioFile = null;
                        updated.removeAudio = true;
                    }
                    return updated;
                }
                return c;
            })
        }));
    };

    const handleSubmitDialog = () => {
        if (!questionData.questionText.trim()) {
            setDialogError("Question text is required.");
            return;
        }
        setDialogError(null);
        onSave(questionData);
    };

    if (!questionData) return null;

    return (
        <Dialog open={open} onClose={() => !isParentLoading && onClose()} maxWidth="md" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                {questionData.isNew ? 'Add New Question' : 'Edit Question'}
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
                <TextField autoFocus fullWidth multiline rows={3} margin="dense" label="Question Text"
                           value={questionData.questionText} onChange={(e) => handleChange('questionText', e.target.value)} disabled={isParentLoading} />
                <FormControlLabel control={<Checkbox checked={questionData.instructional} onChange={(e) => handleChange('instructional', e.target.checked)} />}
                                  label="Instructional" />

                <Divider sx={{ my: 2 }}>Question Media</Divider>
                <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Box>
                        <Button component="label" startIcon={<PhotoCamera />} disabled={isParentLoading}>Question Image</Button>
                        <input type="file" hidden accept="image/*" onChange={(e) => handleQuestionFileChange(e, 'image')} />
                        {questionData.imagePreview && (
                            <Box sx={{ mt: 1, position: 'relative', width: 120 }}>
                                <img src={questionData.imagePreview} alt="Preview" style={{ width: '100%', borderRadius: 4 }} />
                                <IconButton onClick={() => handleQuestionFileRemove('image')} size="small" sx={{ position: 'absolute', top: -10, right: -10 }}><ClearIcon fontSize="small" /></IconButton>
                            </Box>
                        )}
                    </Box>
                    <Box>
                        <Button component="label" startIcon={<Audiotrack />} disabled={isParentLoading}>Question Audio</Button>
                        <input type="file" hidden accept="audio/*" onChange={(e) => handleQuestionFileChange(e, 'audio')} />
                        {questionData.audioFile && <Typography variant="caption" display="block">New: {questionData.audioFile.name}</Typography>}
                        {!questionData.audioFile && questionData.questionSoundUrl && !questionData.removeAudio && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MuiLink href={`${backendBaseUrl}${questionData.questionSoundUrl}`} target="_blank">Current Audio</MuiLink>
                                <IconButton onClick={() => handleQuestionFileRemove('audio')} size="small"><ClearIcon fontSize="inherit" /></IconButton>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }}>Choices</Divider>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddChoice} disabled={isParentLoading}>Add Choice</Button>
                <List>
                    {questionData.choices.filter(c => !c.isDeleted).map((choice, index) => (
                        <InlineChoiceForm
                            key={choice.tempId || choice.choiceId}
                            choice={choice}
                            choiceIndex={index}
                            onChoiceChange={handleChoiceChange}
                            onDeleteChoice={handleDeleteChoice}
                            onFileChange={handleChoiceFileChange}
                            onFileRemove={handleChoiceFileRemove}
                            isLoading={isParentLoading}
                            backendUrl={backendBaseUrl}
                        />
                    ))}
                </List>

                {dialogError && <Alert severity="error" sx={{ mt: 2 }}>{dialogError}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isParentLoading}>Cancel</Button>
                <Button onClick={handleSubmitDialog} variant="contained" disabled={isParentLoading}>
                    {isParentLoading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AddEditQuestionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    existingQuestion: PropTypes.object,
    isLoading: PropTypes.bool,
    orderIndexForNewQuestion: PropTypes.number,
};

export default AddEditQuestionDialog;