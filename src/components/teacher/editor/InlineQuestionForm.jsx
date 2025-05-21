// src/components/teacher/editor/InlineQuestionForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box, TextField, Button, IconButton, Typography, Paper, Divider,
    Checkbox, FormControlLabel, Link as MuiLink
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ClearIcon from '@mui/icons-material/Clear';
import InlineChoiceForm from './InlineChoiceForm';


const InlineQuestionForm = ({
    question,
    questionIndex,
    onQuestionChange,
    onDeleteQuestion,
    isLoading,
    backendBaseUrl, // For displaying existing media
    publicPrefix    // For displaying existing media
}) => {
    // Local state for file previews if needed, or manage them within the question object
    const [imagePreview, setImagePreview] = useState(null);

    const imageInputRef = useRef(null);
    const soundInputRef = useRef(null);

    useEffect(() => {
        // If the question has an existing image URL and no new image file is staged, show existing image
        if (question.questionImageUrl && !question.newImageFile) {
            setImagePreview(`${backendBaseUrl}${publicPrefix}/${question.questionImageUrl}`);
        } else if (question.newImageFile) {
            // If a new image file is staged, create a preview URL for it
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(question.newImageFile);
        } else {
            setImagePreview(null); // No image
        }
    }, [question.questionImageUrl, question.newImageFile, backendBaseUrl, publicPrefix]);


    const handleInputChange = (field, value) => {
        onQuestionChange(questionIndex, { ...question, [field]: value, isModified: true });
    };

    const handleImageFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onQuestionChange(questionIndex, { ...question, newImageFile: file, questionImageUrl: null, isModified: true });
        }
    };

    const handleSoundFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onQuestionChange(questionIndex, { ...question, newSoundFile: file, questionSoundUrl: null, isModified: true });
        }
    };

    const clearMedia = (mediaType) => {
        if (mediaType === 'image') {
            onQuestionChange(questionIndex, { ...question, newImageFile: null, questionImageUrl: null, isModified: true });
            if (imageInputRef.current) imageInputRef.current.value = "";
            setImagePreview(null);
        } else if (mediaType === 'sound') {
            onQuestionChange(questionIndex, { ...question, newSoundFile: null, questionSoundUrl: null, isModified: true });
            if (soundInputRef.current) soundInputRef.current.value = "";
        }
    };

    const handleAddChoice = () => {
        const newChoice = {
            tempChoiceId: `new-c-${Date.now()}`, // Temporary ID for local state
            choiceText: 'New Choice',
            isCorrect: false,
            isNew: true,
        };
        const updatedChoices = [...(question.choices || []), newChoice];
        onQuestionChange(questionIndex, { ...question, choices: updatedChoices, isModified: true });
    };

    const handleChoiceChange = (choiceIndex, updatedChoice) => {
        const updatedChoices = (question.choices || []).map((ch, idx) =>
            idx === choiceIndex ? { ...ch, ...updatedChoice, isModified: ch.choiceId ? true : undefined, isNew: ch.isNew } : ch
        );
        onQuestionChange(questionIndex, { ...question, choices: updatedChoices, isModified: true });
    };

    const handleDeleteChoice = (choiceIndex) => {
        const choiceToDelete = (question.choices || [])[choiceIndex];
        let updatedChoices;
        if (choiceToDelete.isNew) { // If it's a new choice not yet saved
            updatedChoices = (question.choices || []).filter((_, idx) => idx !== choiceIndex);
        } else { // Mark existing choice for deletion
            updatedChoices = (question.choices || []).map((ch, idx) =>
                idx === choiceIndex ? { ...ch, isDeleted: true } : ch
            );
        }
        onQuestionChange(questionIndex, { ...question, choices: updatedChoices, isModified: true });
    };


    return (
        <Paper sx={{ p: 2, mb: 3, border: question.isNew ? '2px dashed green' : (question.isModified ? '2px dashed orange' : '1px solid #ccc') }} elevation={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ color: '#451513' }}>Question {questionIndex + 1}</Typography>
                <IconButton onClick={() => onDeleteQuestion(questionIndex)} color="error" disabled={isLoading} title="Delete Question">
                    <DeleteIcon />
                </IconButton>
            </Box>

            <TextField
                label="Question Text"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={question.questionText || ''}
                onChange={(e) => handleInputChange('questionText', e.target.value)}
                disabled={isLoading}
                sx={{ mb: 2 }}
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={!!question.instructional}
                        onChange={(e) => handleInputChange('instructional', e.target.checked)}
                        disabled={isLoading}
                    />
                }
                label="Instructional (no choices will be presented)"
                sx={{ mb: 2 }}
            />

            {/* Image Upload */}
            <Box sx={{ mb: 2, p: 1.5, border: '1px dashed #bdbdbd', borderRadius: '4px' }}>
                <Typography variant="subtitle2" gutterBottom>Question Image (Optional)</Typography>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`image-upload-${question.questionId || question.tempId}`}
                    type="file"
                    onChange={handleImageFileChange}
                    ref={imageInputRef}
                    disabled={isLoading}
                />
                <label htmlFor={`image-upload-${question.questionId || question.tempId}`}>
                    <Button variant="outlined" component="span" startIcon={<PhotoCamera />} size="small" disabled={isLoading}>
                        {question.newImageFile ? 'Change Image' : 'Upload Image'}
                    </Button>
                </label>
                {imagePreview && (
                    <Box sx={{ mt: 1, position: 'relative', maxWidth: '150px' }}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />
                        <IconButton onClick={() => clearMedia('image')} size="small" sx={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(255,255,255,0.8)' }} disabled={isLoading} title="Clear Image">
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
                {question.newImageFile && <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>New: {question.newImageFile.name}</Typography>}
                {!question.newImageFile && question.questionImageUrl && !imagePreview && (
                    <Box sx={{ mt: 1 }}>
                        <MuiLink href={`${backendBaseUrl}${publicPrefix}/${question.questionImageUrl}`} target="_blank" rel="noopener noreferrer" variant="caption">
                            Current Image: {question.questionImageUrl.split('/').pop()}
                        </MuiLink>
                        <IconButton onClick={() => clearMedia('image')} size="small" sx={{ ml: 0.5 }} disabled={isLoading} title="Remove Current Image">
                            <ClearIcon fontSize="inherit" />
                        </IconButton>
                    </Box>
                )}
            </Box>

            {/* Sound Upload */}
             <Box sx={{ mb: 2, p: 1.5, border: '1px dashed #bdbdbd', borderRadius: '4px' }}>
                <Typography variant="subtitle2" gutterBottom>Question Sound (Optional)</Typography>
                <input
                    accept="audio/*"
                    style={{ display: 'none' }}
                    id={`sound-upload-${question.questionId || question.tempId}`}
                    type="file"
                    onChange={handleSoundFileChange}
                    ref={soundInputRef}
                    disabled={isLoading}
                />
                <label htmlFor={`sound-upload-${question.questionId || question.tempId}`}>
                    <Button variant="outlined" component="span" startIcon={<AudiotrackIcon />} size="small" disabled={isLoading}>
                         {question.newSoundFile ? 'Change Sound' : 'Upload Sound'}
                    </Button>
                </label>
                {question.newSoundFile && (
                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" display="block">New: {question.newSoundFile.name}</Typography>
                        <IconButton onClick={() => clearMedia('sound')} size="small" sx={{ ml: 0.5 }} disabled={isLoading} title="Clear New Sound">
                           <ClearIcon fontSize="inherit" />
                        </IconButton>
                    </Box>
                )}
                {!question.newSoundFile && question.questionSoundUrl && (
                     <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                        <MuiLink href={`${backendBaseUrl}${publicPrefix}/${question.questionSoundUrl}`} target="_blank" rel="noopener noreferrer" variant="caption">
                            Current Sound: {question.questionSoundUrl.split('/').pop()}
                        </MuiLink>
                        <IconButton onClick={() => clearMedia('sound')} size="small" sx={{ ml: 0.5 }} disabled={isLoading} title="Remove Current Sound">
                           <ClearIcon fontSize="inherit" />
                        </IconButton>
                    </Box>
                )}
            </Box>


            {!question.instructional && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: '#451513' }}>Choices</Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={handleAddChoice}
                            disabled={isLoading}
                        >
                            Add Choice
                        </Button>
                    </Box>
                    {(question.choices || []).filter(c => !c.isDeleted).map((choice, choiceIdx) => (
                        <InlineChoiceForm
                            key={choice.choiceId || choice.tempChoiceId}
                            choice={choice}
                            choiceIndex={choiceIdx}
                            onChoiceChange={handleChoiceChange}
                            onDeleteChoice={handleDeleteChoice}
                            isQuestionInstructional={!!question.instructional}
                            isLoading={isLoading}
                        />
                    ))}
                    {(question.choices || []).filter(c => !c.isDeleted).length === 0 && (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 1 }}>No choices yet. Click "Add Choice".</Typography>
                    )}
                </>
            )}
        </Paper>
    );
};

InlineQuestionForm.propTypes = {
    question: PropTypes.shape({
        questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Can be tempId (string) or backend ID (number)
        questionText: PropTypes.string,
        instructional: PropTypes.bool,
        questionImageUrl: PropTypes.string,
        questionSoundUrl: PropTypes.string,
        choices: PropTypes.arrayOf(PropTypes.object),
        isNew: PropTypes.bool,
        isModified: PropTypes.bool,
        newImageFile: PropTypes.object, // Instance of File
        newSoundFile: PropTypes.object, // Instance of File
    }).isRequired,
    questionIndex: PropTypes.number.isRequired,
    onQuestionChange: PropTypes.func.isRequired,
    onDeleteQuestion: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    backendBaseUrl: PropTypes.string.isRequired,
    publicPrefix: PropTypes.string.isRequired,
};

export default InlineQuestionForm;