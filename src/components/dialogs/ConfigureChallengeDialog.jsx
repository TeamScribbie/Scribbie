// src/components/dialogs/ConfigureChallengeDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    CircularProgress, Typography, Box, FormControl, InputLabel, Select, MenuItem,
    FormHelperText
} from '@mui/material';

const CHALLENGE_TYPES = ["HEALTH_BASED", "TIME_BASED"];

const ConfigureChallengeDialog = ({ open, onClose, onSave, existingConfig, isLoading, error }) => {
    const [challengeType, setChallengeType] = useState('');
    const [initialHealth, setInitialHealth] = useState('');
    const [initialQuestionTimeSeconds, setInitialQuestionTimeSeconds] = useState('');
    // REMOVED: timeReductionPerCorrectSeconds state
    // REMOVED: minQuestionTimeSeconds state
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (open) {
            setFormErrors({});
            if (existingConfig) {
                setChallengeType(existingConfig.challengeType || CHALLENGE_TYPES[0]);
                setInitialHealth(existingConfig.initialHealth?.toString() || '');
                setInitialQuestionTimeSeconds(existingConfig.initialQuestionTimeSeconds?.toString() || '');
                // REMOVED: setTimeReductionPerCorrectSeconds(existingConfig.timeReductionPerCorrectSeconds?.toString() || '');
                // REMOVED: setMinQuestionTimeSeconds(existingConfig.minQuestionTimeSeconds?.toString() || '');
            } else {
                setChallengeType(CHALLENGE_TYPES[0]);
                setInitialHealth('');
                setInitialQuestionTimeSeconds('');
                // REMOVED: setTimeReductionPerCorrectSeconds('');
                // REMOVED: setMinQuestionTimeSeconds('');
            }
        }
    }, [open, existingConfig]);

    const validateForm = () => {
        const errors = {};
        if (!challengeType) errors.challengeType = "Challenge Type is required.";

        const health = parseInt(initialHealth, 10);
        const initialTime = parseInt(initialQuestionTimeSeconds, 10);
        // REMOVED: minTime and reduction parsing

        if (challengeType === "HEALTH_BASED") {
            if (!initialHealth.trim() || health <= 0) {
                errors.initialHealth = "Initial Health must be a positive number for Health-Based challenges.";
            }
        }
        if (!initialQuestionTimeSeconds.trim() || initialTime <= 0) {
            errors.initialQuestionTimeSeconds = "Initial Question Time must be a positive number.";
        }
        // REMOVED: Validation for timeReduction and minQuestionTimeSeconds
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const configData = {
            challengeType,
            initialHealth: challengeType === "HEALTH_BASED" ? parseInt(initialHealth, 10) : null,
            initialQuestionTimeSeconds: parseInt(initialQuestionTimeSeconds, 10),
            // REMOVED: timeReductionPerCorrectSeconds from payload
            // REMOVED: minQuestionTimeSeconds from payload
        };
        onSave(configData);
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                {existingConfig ? 'Edit Challenge Configuration' : 'Add New Challenge Configuration'}
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
                <FormControl fullWidth margin="dense" required error={!!formErrors.challengeType}>
                    <InputLabel id="challenge-type-label">Challenge Type</InputLabel>
                    <Select
                        labelId="challenge-type-label"
                        value={challengeType}
                        label="Challenge Type"
                        onChange={(e) => setChallengeType(e.target.value)}
                        disabled={isLoading}
                    >
                        {CHALLENGE_TYPES.map(type => (
                            <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                        ))}
                    </Select>
                    {formErrors.challengeType && <FormHelperText>{formErrors.challengeType}</FormHelperText>}
                </FormControl>

                {challengeType === "HEALTH_BASED" && (
                    <TextField margin="dense" label="Initial Health" type="number" fullWidth variant="outlined"
                        value={initialHealth} onChange={(e) => setInitialHealth(e.target.value)}
                        disabled={isLoading} required InputProps={{ inputProps: { min: 1 }}}
                        error={!!formErrors.initialHealth} helperText={formErrors.initialHealth}/>
                )}

                <TextField margin="dense" label="Initial Question Time (seconds)" type="number" fullWidth variant="outlined"
                    value={initialQuestionTimeSeconds} onChange={(e) => setInitialQuestionTimeSeconds(e.target.value)}
                    disabled={isLoading} required InputProps={{ inputProps: { min: 1 }}}
                    error={!!formErrors.initialQuestionTimeSeconds} helperText={formErrors.initialQuestionTimeSeconds}/>

                {/* REMOVED TextField for Time Reduction */}
                {/* REMOVED TextField for Minimum Question Time */}

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} color="primary">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isLoading}
                    sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' }, position: 'relative' }}>
                    {isLoading ? <CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} /> : 'Save Configuration'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ConfigureChallengeDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    existingConfig: PropTypes.shape({
        challengeType: PropTypes.string,
        initialHealth: PropTypes.number,
        initialQuestionTimeSeconds: PropTypes.number,
        // REMOVED: timeReductionPerCorrectSeconds: PropTypes.number,
        // REMOVED: minQuestionTimeSeconds: PropTypes.number,
    }),
    isLoading: PropTypes.bool,
    error: PropTypes.string,
};

export default ConfigureChallengeDialog;