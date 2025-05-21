// src/components/teacher/editor/InlineChoiceForm.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Checkbox, IconButton, Box, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const InlineChoiceForm = ({ choice, choiceIndex, onChoiceChange, onDeleteChoice, isQuestionInstructional, isLoading }) => {
    if (isQuestionInstructional) {
        return null; // Do not render choices for instructional questions
    }

    const handleTextChange = (e) => {
        onChoiceChange(choiceIndex, { ...choice, choiceText: e.target.value });
    };

    const handleCorrectChange = (e) => {
        onChoiceChange(choiceIndex, { ...choice, isCorrect: e.target.checked });
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: '4px', bgcolor: choice.isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'transparent' }}>
            <TextField
                size="small"
                variant="outlined"
                placeholder="Choice Text"
                value={choice.choiceText || ''}
                onChange={handleTextChange}
                fullWidth
                disabled={isLoading}
                sx={{ flexGrow: 1 }}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        size="small"
                        checked={!!choice.isCorrect}
                        onChange={handleCorrectChange}
                        disabled={isLoading}
                    />
                }
                label="Correct"
                sx={{ mr: 1, whiteSpace: 'nowrap' }}
            />
            <IconButton onClick={() => onDeleteChoice(choiceIndex)} color="error" size="small" disabled={isLoading} title="Delete Choice">
                <DeleteIcon />
            </IconButton>
        </Box>
    );
};

InlineChoiceForm.propTypes = {
    choice: PropTypes.shape({
        choiceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Can be tempId (string) or backend ID (number)
        choiceText: PropTypes.string,
        isCorrect: PropTypes.bool,
        isNew: PropTypes.bool, // Flag for new choices not yet saved to backend
        isModified: PropTypes.bool, // Flag for existing choices that are modified
    }).isRequired,
    choiceIndex: PropTypes.number.isRequired,
    onChoiceChange: PropTypes.func.isRequired,
    onDeleteChoice: PropTypes.func.isRequired,
    isQuestionInstructional: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool,
};

export default InlineChoiceForm;