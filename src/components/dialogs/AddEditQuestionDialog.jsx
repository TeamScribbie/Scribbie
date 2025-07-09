// Context/Scribbie frontend/src/components/dialogs/AddEditQuestionDialog.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    CircularProgress, Typography, Box, Checkbox, FormControlLabel, IconButton, Link as MuiLink,
    List, Divider, Alert
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera'; // Keep this import
import Audiotrack from '@mui/icons-material/Audiotrack'; // Keep this import
import ClearIcon from '@mui/icons-material/Clear'; // Keep this import
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { useAuth } from '../../context/AuthContext';
import InlineChoiceForm from '../teacher/editor/InlineChoiceForm'; // Import this

const AddEditQuestionDialog = ({
                                   open,
                                   onClose,
                                   onSave,
                                   existingQuestion,
                                   activityNodeTypeId, // This prop seems unused in the dialog itself but is part of original
                                   isLoading: isParentLoading,
                                   orderIndexForNewQuestion
                               }) => {
    const { authState } = useAuth();
    const backendBaseUrl = 'http://localhost:8080'; // Ensure this matches your backend config

    const [questionText, setQuestionText] = useState('');
    const [isInstructional, setIsInstructional] = useState(false);

    // --- RE-ENABLED/UPDATED STATE FOR QUESTION-LEVEL FILES ---
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [questionImageUrl, setQuestionImageUrl] = useState(null); // Stores backend path for existing image
    const [questionSoundUrl, setQuestionSoundUrl] = useState(null); // Stores backend path for existing audio
    const [removeImage, setRemoveImage] = useState(false); // Flag to signal image removal
    const [removeAudio, setRemoveAudio] = useState(false); // Flag to signal audio removal
    const [imagePreview, setImagePreview] = useState(null); // For new image file preview

    const [choices, setChoices] = useState([]);

    const imageInputRef = useRef(null); // Used for resetting file input
    const audioInputRef = useRef(null); // Used for resetting file input

    const [dialogError, setDialogError] = useState(null);

    const isLoading = isParentLoading; // Use isParentLoading as the primary loading state

    useEffect(() => {
        if (open) {
            setDialogError(null);
            if (existingQuestion) {
                setQuestionText(existingQuestion.questionText || '');
                setIsInstructional(existingQuestion.instructional || false);
                // Set existing URLs from backend
                setQuestionImageUrl(existingQuestion.questionImageUrl || null);
                setQuestionSoundUrl(existingQuestion.questionSoundUrl || null);
                // Set initial preview for existing image if available
                setImagePreview(existingQuestion.questionImageUrl ? `${backendBaseUrl}${existingQuestion.questionImageUrl}` : null);

                // Initialize choices with temp IDs and file flags
                setChoices((existingQuestion.choices || []).map(c => ({
                    ...c,
                    tempChoiceId: c.choiceId || `temp-c-${Date.now()}-${Math.random()}`, // Ensure a tempId for new choices during edit
                    isNew: !c.choiceId, // True if choice doesn't have an ID from backend
                    isModified: false,
                    isDeleted: false,
                    imageFile: null, // No new file initially
                    audioFile: null, // No new file initially
                    removeImage: false, // Not removing initially
                    removeAudio: false, // Not removing initially
                })));
            } else {
                // Reset for new question
                setQuestionText('');
                setIsInstructional(false);
                setQuestionImageUrl(null);
                setQuestionSoundUrl(null);
                setImagePreview(null);
                setRemoveImage(false);
                setRemoveAudio(false);
                setChoices([]);
            }
            // Clear any previously selected new files
            setImageFile(null);
            setAudioFile(null);
            if (imageInputRef.current) imageInputRef.current.value = "";
            if (audioInputRef.current) audioInputRef.current.value = "";
        }
    }, [open, existingQuestion, backendBaseUrl, orderIndexForNewQuestion]); // Added orderIndexForNewQuestion to dependency array

    // Effect to clean up temporary object URLs when imagePreview changes or component unmounts
    useEffect(() => {
        const currentPreview = imagePreview;
        return () => {
            if (currentPreview && currentPreview.startsWith('blob:')) {
                URL.revokeObjectURL(currentPreview);
            }
        };
    }, [imagePreview]);


    // --- RE-ENABLED/UPDATED QUESTION-LEVEL FILE HANDLERS ---
    const handleQuestionFileChange = (event, fileType) => {
        const file = event.target.files[0];
        if (!file) return;

        if (fileType === 'image') {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview); // Clean up old blob URL
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); // Create new blob URL for preview
            setQuestionImageUrl(null); // Clear existing URL, new file will override
            setRemoveImage(false); // Ensure removal flag is off
        } else if (fileType === 'audio') {
            setAudioFile(file);
            setQuestionSoundUrl(null); // Clear existing URL, new file will override
            setRemoveAudio(false); // Ensure removal flag is off
        }
    };

    const handleQuestionFileRemove = (fileType) => {
        if (fileType === 'image') {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview); // Clean up blob URL
            }
            setImageFile(null); // Clear selected new file
            setImagePreview(null); // Clear preview
            setQuestionImageUrl(null); // Clear existing backend URL
            setRemoveImage(true); // Flag for backend to remove image
            if (imageInputRef.current) imageInputRef.current.value = ""; // Reset file input
        } else if (fileType === 'audio') {
            setAudioFile(null); // Clear selected new file
            setQuestionSoundUrl(null); // Clear existing backend URL
            setRemoveAudio(true); // Flag for backend to remove audio
            if (audioInputRef.current) audioInputRef.current.value = ""; // Reset file input
        }
    };

    // --- CHOICE-LEVEL HANDLERS (already look correct from previous context) ---
    const handleChoiceFileChange = (index, field, file) => {
        setChoices(prev =>
            prev.map((choice, idx) =>
                idx === index ? { ...choice, [field]: file, isModified: true } : choice
            )
        );
    };

    // This handler will now also receive the 'fileType' ('image' or 'audio')
    // and will set the corresponding remove flag for the choice.
    const handleChoiceFileRemove = (index, fileType) => {
        setChoices(prev =>
            prev.map((choice, idx) => {
                if (idx === index) {
                    const updated = { ...choice, isModified: true };
                    if (fileType === 'image') {
                        updated.imagePath = null; // Clear current image path from entity
                        updated.imageFile = null; // Clear any newly selected file
                        updated.removeImage = true; // Signal backend to remove existing image
                    } else if (fileType === 'audio') {
                        updated.audioPath = null; // Clear current audio path from entity
                        updated.audioFile = null; // Clear any newly selected file
                        updated.removeAudio = true; // Signal backend to remove existing audio
                    }
                    return updated;
                }
                return choice;
            })
        );
    };

    const handleAddChoice = () => {
        setChoices(prev => [
            ...prev,
            {
                tempChoiceId: `new-dialog-c-${Date.now()}`,
                choiceText: '',
                isCorrect: false,
                isNew: true,
                isModified: false,
                isDeleted: false,
                imageFile: null,
                audioFile: null,
                removeImage: false,
                removeAudio: false,
            }
        ]);
    };

    const handleChoiceChange = (index, updatedChoiceData) => {
        setChoices(prev => prev.map((c, idx) =>
            idx === index ? { ...c, ...updatedChoiceData, isModified: !c.isNew || c.isModified } : c
        ));
    };

    const handleDeleteChoice = (index) => {
        setChoices(prev => {
            const choiceToDelete = prev[index];
            if (choiceToDelete.isNew) {
                // If it's a new choice not yet saved, simply filter it out
                return prev.filter((_, idx) => idx !== index);
            } else {
                // If it's an existing choice, mark it as deleted
                return prev.map((c, idx) => idx === index ? { ...c, isDeleted: true, isModified: true } : c);
            }
        });
    };


    const handleSubmitDialog = async () => {
        if (!questionText.trim()) {
            setDialogError("Question text is required.");
            return;
        }

        const hasBlankChoice = choices.some(
            choice => !choice.isDeleted && choice.choiceText.trim() === ''
        );
        if (hasBlankChoice) {
            setDialogError("All active choices must have text.");
            return;
        }

        setDialogError(null);

        const payload = {
            ...(existingQuestion && { questionId: existingQuestion.questionId }),
            questionText: questionText.trim(),
            instructional: isInstructional,
            orderIndex: existingQuestion ? existingQuestion.orderIndex : orderIndexForNewQuestion,
            removeImage,
            removeAudio,
            // ✨ Add original filenames so backend can map them
            questionImageUrl: imageFile?.name || questionImageUrl || undefined,
            questionSoundUrl: audioFile?.name || questionSoundUrl || undefined,
            imageFile: imageFile || undefined,
            audioFile: audioFile || undefined,
            choices: choices
                .filter(c => !c.isDeleted || c.isModified)
                .map(c => ({
                    choiceId: c.isNew ? null : c.choiceId,
                    choiceText: c.choiceText,
                    isCorrect: c.isCorrect,
                    isDeleted: c.isDeleted,
                    imagePath: c.imagePath || undefined,
                    audioPath: c.audioPath || undefined,
                    removeImage: c.removeImage || undefined,
                    removeAudio: c.removeAudio || undefined,
                    imageFile: c.imageFile || undefined,
                    audioFile: c.audioFile || undefined,
                    // ✨ Add these so backend can map choice files
                    imageFileName: c.imageFile?.name || c.imagePath || undefined,
                    audioFileName: c.audioFile?.name || c.audioPath || undefined,
                })),
        };

        console.log("✅ Submitting question payload with filenames:", payload);

        onSave(payload);
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="md" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                {existingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
                <TextField autoFocus margin="dense" label="Question Text" type="text" fullWidth multiline rows={3}
                           value={questionText} onChange={(e) => setQuestionText(e.target.value)} disabled={isLoading} required sx={{ mb: 2 }} />
                <FormControlLabel control={<Checkbox checked={isInstructional} onChange={(e) => setIsInstructional(e.target.checked)} disabled={isLoading} />}
                                  label="Instructional (exclude from Challenges, but can still have choices)" sx={{ mb: 2 }} />

                {/* --- RE-ENABLED QUESTION-LEVEL MEDIA SECTION --- */}
                <Divider sx={{ my: 2 }}>Question Media</Divider>
                <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    {/* Question Image Section */}
                    <Box>
                        <Button component="label" startIcon={<PhotoCamera />} disabled={isLoading}>
                            Question Image
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleQuestionFileChange(e, 'image')}
                                ref={imageInputRef} // Attach ref for clearing
                            />
                        </Button>
                        {imageFile ? (
                            // Preview for newly selected image
                            <Box sx={{ mt: 1, position: 'relative', width: 120 }}>
                                <img src={imagePreview} alt="Preview" style={{ width: '100%', borderRadius: 4 }} />
                                <IconButton onClick={() => handleQuestionFileRemove('image')} size="small" sx={{ position: 'absolute', top: -10, right: -10 }}><ClearIcon fontSize="small" /></IconButton>
                            </Box>
                        ) : (questionImageUrl && !removeImage) ? (
                            // Link for existing image
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <MuiLink href={`${backendBaseUrl}${questionImageUrl}`} target="_blank" variant="caption" sx={{ ml: 1 }}>
                                    Current Image
                                </MuiLink>
                                <IconButton onClick={() => handleQuestionFileRemove('image')} size="small" sx={{ ml: 0.5 }}><ClearIcon fontSize="inherit" /></IconButton>
                            </Box>
                        ) : null}
                        {imageFile && <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>New: {imageFile.name}</Typography>}
                    </Box>

                    {/* Question Audio Section */}
                    <Box>
                        <Button component="label" startIcon={<Audiotrack />} disabled={isLoading}>
                            Question Audio
                            <input
                                type="file"
                                hidden
                                accept="audio/*"
                                onChange={(e) => handleQuestionFileChange(e, 'audio')}
                                ref={audioInputRef} // Attach ref for clearing
                            />
                        </Button>
                        {audioFile ? (
                            // Display filename for newly selected audio
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>New: {audioFile.name}</Typography>
                        ) : (questionSoundUrl && !removeAudio) ? (
                            // Link for existing audio
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <MuiLink href={`${backendBaseUrl}${questionSoundUrl}`} target="_blank" variant="caption" sx={{ ml: 1 }}>
                                    Current Audio
                                </MuiLink>
                                <IconButton onClick={() => handleQuestionFileRemove('audio')} size="small" sx={{ ml: 0.5 }}><ClearIcon fontSize="inherit" /></IconButton>
                            </Box>
                        ) : null}
                        {audioFile && <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>New: {audioFile.name}</Typography>}
                    </Box>
                </Box>
                {/* --- END RE-ENABLED QUESTION-LEVEL MEDIA SECTION --- */}

                <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: '#451513' }}>Choices</Typography>
                        <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={handleAddChoice} disabled={isLoading}>Add Choice</Button>
                    </Box>
                    <List>
                        {choices.filter(c => !c.isDeleted).map((choice, choiceIdx) => (
                            <InlineChoiceForm
                                key={choice.choiceId || choice.tempChoiceId}
                                choice={choice}
                                choiceIndex={choiceIdx}
                                onChoiceChange={handleChoiceChange}
                                onDeleteChoice={handleDeleteChoice}
                                onFileChange={handleChoiceFileChange}
                                onFileRemove={handleChoiceFileRemove} // Pass this handler to InlineChoiceForm
                                isQuestionInstructional={isInstructional} // Pass instructional flag
                                isLoading={isLoading}
                                backendUrl={backendBaseUrl} // Pass backendUrl for existing file links
                            />
                        ))}
                    </List>
                    {choices.filter(c => !c.isDeleted).length === 0 && (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 1 }}>No choices yet. Click "Add Choice".</Typography>
                    )}
                </>

                {dialogError && <Alert severity="error" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{dialogError}</Alert>}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => { if (!isLoading) onClose(); }} disabled={isLoading} color="primary">Cancel</Button>
                <Button onClick={handleSubmitDialog} variant="contained" disabled={isLoading || !questionText.trim()}
                        sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' }, position: 'relative' }}>
                    {isLoading ? <CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} /> : (existingQuestion ? 'Save Changes' : 'Add Question')}
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
    activityNodeTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Adjusted PropTypes to allow string/number
    isLoading: PropTypes.bool,
    orderIndexForNewQuestion: PropTypes.number,
};

export default AddEditQuestionDialog;