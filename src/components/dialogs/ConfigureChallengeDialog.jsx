import React, { useState, useEffect } from 'react';
// ✨ 1. Import useAuth to get the logged-in user's token
import { useAuth } from '../../context/AuthContext';
import { configureChallengeForLesson, getChallengeConfigurationForLesson } from '../../services/challengeService';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';

const ConfigureChallengeDialog = ({ open, onClose, lessonDefinitionId, onConfigured }) => {
    // ✨ 2. Get the authState which contains the token
    const { authState } = useAuth();
    const [challengeType, setChallengeType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const challengeTypes = [
        'MATCHING', 'PUZZLE', 'QUIZ_MCQ', 'FILL_BLANKS',
        'READING', 'BALLOONGAME', 'MEMORYGAME', 'WORDFEAST'
    ];

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            // ✨ 3. Pass the auth token when checking for an existing challenge
            getChallengeConfigurationForLesson(lessonDefinitionId, authState.token)
                .then(response => {
                    // This check is safer to prevent errors if response is unexpected
                    if (response && response.data && response.data.challengeType) {
                        setChallengeType(response.data.challengeType);
                    }
                })
                .catch(err => {
                    console.log("No existing challenge config or error fetching:", err.message);
                    setChallengeType('');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [open, lessonDefinitionId, authState.token]); // Add token to the dependency array

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
            const responseData = await configureChallengeForLesson(lessonDefinitionId, configData, authState.token);
            onConfigured(responseData); 
            onClose();
        } catch (err) {
            console.error("Failed to configure challenge:", err);
            setError(err.message || 'Failed to configure challenge. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // The JSX for the dialog remains exactly the same
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