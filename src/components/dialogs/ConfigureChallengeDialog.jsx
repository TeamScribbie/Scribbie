import React, { useState, useEffect } from 'react';
import { configureChallengeForLesson, getChallengeConfigurationForLesson } from '../../services/challengeService';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';

const ConfigureChallengeDialog = ({ open, onClose, lessonDefinitionId, onConfigured }) => {
    // State to hold the selected challenge type from the dropdown
    const [challengeType, setChallengeType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // List of available challenge types, mirroring your backend ENUM
    const challengeTypes = [
        'MATCHING', 'PUZZLE', 'QUIZ_MCQ', 'FILL_BLANKS',
        'READING', 'BALLOONGAME', 'MEMORYGAME', 'WORDFEAST'
    ];

    useEffect(() => {
        // When the dialog opens, fetch the existing configuration, if any
        if (open) {
            setIsLoading(true);
            getChallengeConfigurationForLesson(lessonDefinitionId)
                .then(response => {
                    if (response.data && response.data.challengeType) {
                        setChallengeType(response.data.challengeType);
                    }
                })
                .catch(err => {
                    // It's okay if it fails (404), means no challenge is configured yet
                    console.log("No existing challenge config or error fetching:", err);
                    setChallengeType(''); // Reset on open if no config found
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [open, lessonDefinitionId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!challengeType) {
            setError("Please select a challenge type.");
            return;
        }
        setError('');
        setIsLoading(true);

        const configData = {
            challengeType: challengeType,
        };

        try {
            const response = await configureChallengeForLesson(lessonDefinitionId, configData);
            onConfigured(response.data); // Callback to parent component
            onClose(); // Close dialog on success
        } catch (err) {
            console.error("Failed to configure challenge:", err);
            setError('Failed to configure challenge. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{challengeType ? 'Edit Challenge' : 'Configure New Challenge'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="challenge-type-label">Challenge Type</InputLabel>
                            <Select
                                labelId="challenge-type-label"
                                id="challengeType"
                                value={challengeType}
                                label="Challenge Type"
                                onChange={(e) => setChallengeType(e.target.value)}
                                required
                            >
                                {challengeTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="secondary" disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" color="primary" variant="contained" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ConfigureChallengeDialog;