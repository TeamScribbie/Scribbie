import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, CircularProgress, Typography, Box,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const ACTIVITY_TYPES = [
    "MATCHING", "PUZZLE", "QUIZ_MCQ", "FILL_BLANKS", "WRITING_PROMPT"
];

const AddActivityNodeDialog = ({ open, onClose, onConfirm, isLoading, error }) => {
    // highlight-start
    const [activityTitle, setActivityTitle] = useState(''); // Add state for title
    // highlight-end
    const [activityType, setActivityType] = useState('');
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        if (open) {
            // highlight-start
            setActivityTitle(''); // Reset title
            // highlight-end
            setActivityType('');
            setInstructions('');
        }
    }, [open]);

    const handleSubmit = () => {
        // highlight-start
        if (!activityTitle.trim()) {
            alert("Activity Title is required.");
            return;
        }
        // highlight-end
        if (!activityType) {
            alert("Activity Type is required.");
            return;
        }
        onConfirm({
            // highlight-start
            activityTitle: activityTitle.trim(), // Pass title
            // highlight-end
            activityType,
            instructions,
        });
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                Add New Activity Node
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important' }}>
                {/* highlight-start */}
                <TextField
                    autoFocus // Keep autoFocus on the first field
                    margin="dense"
                    id="activityTitle"
                    label="Activity Title"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    disabled={isLoading}
                    required
                    sx={{ mb: 2 }}
                />
                {/* highlight-end */}

                <FormControl fullWidth margin="dense" required sx={{ mb: 2 }} disabled={isLoading}>
                    <InputLabel id="activity-type-label">Activity Type</InputLabel>
                    <Select
                        labelId="activity-type-label"
                        id="activityType"
                        value={activityType}
                        label="Activity Type" // This is important for the label to float correctly
                        onChange={(e) => setActivityType(e.target.value)}
                    >
                        <MenuItem value="" disabled><em>Select an activity type</em></MenuItem>
                        {ACTIVITY_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    margin="dense"
                    id="activityInstructions"
                    label="Instructions (Optional)"
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    disabled={isLoading}
                    sx={{ mb: 2 }}
                />
                {error && <Typography color="error" sx={{ mt: 1, mb: 1 }}>{error}</Typography>}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    // highlight-start
                    disabled={isLoading || !activityType || !activityTitle.trim()} // Also disable if title is empty
                    // highlight-end
                    sx={{
                        bgcolor: '#451513',
                        '&:hover': { bgcolor: '#5d211f' },
                        position: 'relative'
                    }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        marginTop: '-12px', marginLeft: '-12px'
                    }} /> : 'Add Activity Node'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

AddActivityNodeDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    // highlight-start
    onConfirm: PropTypes.func.isRequired, // Callback now includes activityTitle
    // highlight-end
    isLoading: PropTypes.bool,
    error: PropTypes.string,
};

export default AddActivityNodeDialog;