import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Checkbox, IconButton, Box, FormControlLabel, Typography, Button, Link as MuiLink } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Audiotrack from '@mui/icons-material/Audiotrack';
import ClearIcon from '@mui/icons-material/Clear';

const InlineChoiceForm = ({
                              choice,
                              choiceIndex,
                              onChoiceChange,
                              onDeleteChoice,
                              onFileChange,
                              onFileRemove, // New prop for handling file removal
                              isLoading,
                              backendUrl
                          }) => {
    const handleTextChange = (e) => {
        onChoiceChange(choiceIndex, { ...choice, choiceText: e.target.value });
    };

    const handleCorrectChange = (e) => {
        onChoiceChange(choiceIndex, { ...choice, isCorrect: e.target.checked });
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mb: 1,
            p: 2,
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            bgcolor: choice.isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
        }}>
            {/* Top row for text, checkbox, and delete */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    control={<Checkbox size="small" checked={!!choice.isCorrect} onChange={handleCorrectChange} disabled={isLoading} />}
                    label="Correct"
                    sx={{ mr: 1, whiteSpace: 'nowrap' }}
                />
                <IconButton onClick={() => onDeleteChoice(choiceIndex)} color="error" size="small" disabled={isLoading} title="Delete Choice">
                    <DeleteIcon />
                </IconButton>
            </Box>

            {/* Bottom row for file management */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Image Upload Section */}
                <Box>
                    <Button component="label" size="small" startIcon={<PhotoCamera />} disabled={isLoading}>
                        Image
                        <input type="file" hidden accept="image/*" onChange={(e) => onFileChange(choiceIndex, 'imageFile', e.target.files[0])} />
                    </Button>
                    {choice.imageFile ? (
                        <Typography variant="caption" sx={{ ml: 1 }}>{choice.imageFile.name}</Typography>
                    ) : choice.imagePath ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MuiLink href={`${backendUrl}${choice.imagePath}`} target="_blank" variant="caption" sx={{ ml: 1 }}>
                                Current Image
                            </MuiLink>
                            <IconButton size="small" onClick={() => onFileRemove(choiceIndex, 'image')} disabled={isLoading}>
                                <ClearIcon fontSize="inherit" />
                            </IconButton>
                        </Box>
                    ) : null}
                </Box>

                {/* Audio Upload Section */}
                <Box>
                    <Button component="label" size="small" startIcon={<Audiotrack />} disabled={isLoading}>
                        Audio
                        <input type="file" hidden accept="audio/*" onChange={(e) => onFileChange(choiceIndex, 'audioFile', e.target.files[0])} />
                    </Button>
                    {choice.audioFile ? (
                        <Typography variant="caption" sx={{ ml: 1 }}>{choice.audioFile.name}</Typography>
                    ) : choice.audioPath ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MuiLink href={`${backendUrl}${choice.audioPath}`} target="_blank" variant="caption" sx={{ ml: 1 }}>
                                Current Audio
                            </MuiLink>
                            <IconButton size="small" onClick={() => onFileRemove(choiceIndex, 'audio')} disabled={isLoading}>
                                <ClearIcon fontSize="inherit" />
                            </IconButton>
                        </Box>
                    ) : null}
                </Box>
            </Box>
        </Box>
    );
};

InlineChoiceForm.propTypes = {
    choice: PropTypes.object.isRequired,
    choiceIndex: PropTypes.number.isRequired,
    onChoiceChange: PropTypes.func.isRequired,
    onDeleteChoice: PropTypes.func.isRequired,
    onFileChange: PropTypes.func.isRequired,
    onFileRemove: PropTypes.func.isRequired, // New prop
    isLoading: PropTypes.bool,
    backendUrl: PropTypes.string.isRequired,
};

export default InlineChoiceForm;