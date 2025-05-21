// AI Context/Frontend/components/dialogs/AddEditQuestionDialog.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    CircularProgress, Typography, Box, Checkbox, FormControlLabel, IconButton, Link as MuiLink,
    List, Divider
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ClearIcon from '@mui/icons-material/Clear';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { useAuth } from '../../context/AuthContext';
import { uploadMediaFile } from '../../services/mediaService';
import InlineChoiceForm from '../teacher/editor/InlineChoiceForm';

const AddEditQuestionDialog = ({
    open,
    onClose,
    onSave,
    existingQuestion,
    activityNodeTypeId,
    isLoading: isParentLoading,
    orderIndexForNewQuestion // This will be set by the parent
}) => {
    const { authState } = useAuth();
    const backendBaseUrl = 'http://localhost:8080';
    const publicPrefix = authState.config?.uploadPublicPathPrefix || '/media-content';

    const [questionText, setQuestionText] = useState('');
    const [isInstructional, setIsInstructional] = useState(false);
    // currentOrderIndex state is removed from dialog's direct management
    // It will be passed in via existingQuestion.orderIndex or orderIndexForNewQuestion

    const [imageFile, setImageFile] = useState(null);
    const [soundFile, setSoundFile] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const [existingSoundUrl, setExistingSoundUrl] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [choices, setChoices] = useState([]);

    const imageInputRef = useRef(null);
    const soundInputRef = useRef(null);

    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [dialogError, setDialogError] = useState(null);

    const isLoading = isParentLoading || isUploadingMedia;

    useEffect(() => {
        if (open) {
            setDialogError(null);
            if (existingQuestion) {
                setQuestionText(existingQuestion.questionText || '');
                setIsInstructional(existingQuestion.instructional || false);
                // orderIndex is now part of existingQuestion, no need to set it in dialog state
                setExistingImageUrl(existingQuestion.questionImageUrl || null);
                setExistingSoundUrl(existingQuestion.questionSoundUrl || null);
                setImagePreview(existingQuestion.questionImageUrl ? `${backendBaseUrl}${publicPrefix}/${existingQuestion.questionImageUrl}` : null);
                setChoices((existingQuestion.choices || []).map(c => ({
                    ...c,
                    tempChoiceId: c.choiceId || `temp-c-${Date.now()}-${Math.random()}`,
                    isNew: !c.choiceId,
                    isModified: false,
                    isDeleted: false
                })));
            } else { // New question
                setQuestionText('');
                setIsInstructional(false);
                setExistingImageUrl(null);
                setExistingSoundUrl(null);
                setImagePreview(null);
                setChoices([]);
            }
            setImageFile(null);
            setSoundFile(null);
        }
    }, [open, existingQuestion, backendBaseUrl, publicPrefix]);

    // ... (media handling, choice management handlers remain the same) ...
    const handleImageFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setExistingImageUrl(null);
        }
    };
    const clearImage = () => {
        setImageFile(null); setImagePreview(null); setExistingImageUrl(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };
    const handleSoundFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSoundFile(file);
            setExistingSoundUrl(null);
        }
    };
    const clearSound = () => {
        setSoundFile(null); setExistingSoundUrl(null);
        if (soundInputRef.current) soundInputRef.current.value = "";
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
            const choice = prev[index];
            if (choice.isNew) {
                return prev.filter((_, idx) => idx !== index);
            } else {
                return prev.map((c, idx) => idx === index ? { ...c, isDeleted: true, isModified: true } : c);
            }
        });
    };

    const handleSubmitDialog = async () => {
        if (!questionText.trim()) {
            setDialogError("Question text is required.");
            return;
        }
        setDialogError(null);
        setIsUploadingMedia(true);

        let finalImageUrl = existingImageUrl;
        let finalSoundUrl = existingSoundUrl;

        try {
            if (imageFile) {
                const imgRes = await uploadMediaFile(imageFile, 'image', authState.token);
                finalImageUrl = imgRes.filePath;
            }
            if (soundFile) {
                const soundRes = await uploadMediaFile(soundFile, 'sound', authState.token);
                finalSoundUrl = soundRes.filePath;
            }
        } catch (err) {
            setDialogError(`Media upload failed: ${err.message}`);
            setIsUploadingMedia(false);
            return;
        }
        setIsUploadingMedia(false);

        const questionPayload = {
            ...(existingQuestion && { questionId: existingQuestion.questionId }),
            questionText: questionText.trim(),
            instructional: isInstructional,
            questionImageUrl: finalImageUrl,
            questionSoundUrl: finalSoundUrl,
            // Use orderIndex from existingQuestion if editing, or from prop if new
            orderIndex: existingQuestion ? existingQuestion.orderIndex : orderIndexForNewQuestion,
            choices: choices.map(c => ({
                choiceId: c.isNew ? null : c.choiceId,
                choiceText: c.choiceText,
                isCorrect: c.isCorrect,
                isDeleted: c.isDeleted,
            })),
            isNew: !existingQuestion,
            isModified: !!existingQuestion,
        };
        onSave(questionPayload);
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="md" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                {existingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
                <TextField autoFocus margin="dense" label="Question Text" type="text" fullWidth multiline rows={3}
                    value={questionText} onChange={(e) => setQuestionText(e.target.value)} disabled={isLoading} required sx={{ mb: 2 }} />
                {/* TextField for orderIndex REMOVED */}
                <FormControlLabel control={<Checkbox checked={isInstructional} onChange={(e) => setIsInstructional(e.target.checked)} disabled={isLoading} />}
                    label="Instructional (exclude from Challenges, but can still have choices)" sx={{ mb: 2 }} />

                {/* Image Upload UI (as before) */}
                <Box sx={{ mb: 2, p: 1.5, border: '1px dashed #bdbdbd', borderRadius: '4px' }}>
                    <Typography variant="subtitle2" gutterBottom>Question Image</Typography>
                    <input accept="image/*" style={{ display: 'none' }} id={`dialog-image-upload-${existingQuestion?.questionId || 'new'}`} type="file" onChange={handleImageFileChange} ref={imageInputRef} disabled={isLoading} />
                    <label htmlFor={`dialog-image-upload-${existingQuestion?.questionId || 'new'}`}>
                        <Button variant="outlined" component="span" startIcon={<PhotoCamera />} size="small" disabled={isLoading}>Upload Image</Button>
                    </label>
                    {imagePreview && (<Box sx={{ mt: 1, position: 'relative', maxWidth: '150px' }}><img src={imagePreview} alt="Preview" style={{ width: '100%' }} /><IconButton onClick={clearImage} size="small" sx={{ position: 'absolute', top: 0, right: 0 }} disabled={isLoading}><ClearIcon fontSize="small" /></IconButton></Box>)}
                    {imageFile && <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>New: {imageFile.name}</Typography>}
                    {!imageFile && existingImageUrl && !imagePreview && (<Box sx={{ mt: 1 }}><MuiLink href={`${backendBaseUrl}${publicPrefix}/${existingImageUrl}`} target="_blank">Current: {existingImageUrl.split('/').pop()}</MuiLink><IconButton onClick={clearImage} size="small" sx={{ ml: 0.5 }} disabled={isLoading}><ClearIcon fontSize="inherit" /></IconButton></Box>)}
                </Box>

                {/* Sound Upload UI (as before) */}
                <Box sx={{ mb: 2, p: 1.5, border: '1px dashed #bdbdbd', borderRadius: '4px' }}>
                    <Typography variant="subtitle2" gutterBottom>Question Sound</Typography>
                    <input accept="audio/*" style={{ display: 'none' }} id={`dialog-sound-upload-${existingQuestion?.questionId || 'new'}`} type="file" onChange={handleSoundFileChange} ref={soundInputRef} disabled={isLoading} />
                    <label htmlFor={`dialog-sound-upload-${existingQuestion?.questionId || 'new'}`}>
                        <Button variant="outlined" component="span" startIcon={<AudiotrackIcon />} size="small" disabled={isLoading}>Upload Sound</Button>
                    </label>
                    {soundFile && (<Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}><Typography variant="caption">New: {soundFile.name}</Typography><IconButton onClick={clearSound} size="small" sx={{ ml: 0.5 }} disabled={isLoading}><ClearIcon fontSize="inherit" /></IconButton></Box>)}
                    {!soundFile && existingSoundUrl && (<Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}><MuiLink href={`${backendBaseUrl}${publicPrefix}/${existingSoundUrl}`} target="_blank">Current: {existingSoundUrl.split('/').pop()}</MuiLink><IconButton onClick={clearSound} size="small" sx={{ ml: 0.5 }} disabled={isLoading}><ClearIcon fontSize="inherit" /></IconButton></Box>)}
                </Box>

                {/* Choices Management Section (as before) */}
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
                                isQuestionInstructional={false}
                                isLoading={isLoading}
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
    activityNodeTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    isLoading: PropTypes.bool,
    orderIndexForNewQuestion: PropTypes.number, // Ensure this prop is received
};

export default AddEditQuestionDialog;