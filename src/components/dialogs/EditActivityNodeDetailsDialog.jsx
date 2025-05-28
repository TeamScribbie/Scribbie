import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
    Alert,
    Box // Box is a good alternative for simple layouts
} from '@mui/material';

const EditActivityNodeDetailsDialog = ({ open, onClose, onSave, isLoading, error, node }) => {
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        if (open && node) {
            setTitle(node.activityTitle || '');
            setInstructions(node.instructions || '');
        }
    }, [open, node]);

    const handleSave = () => {
        if (!title.trim()) {
            alert("Activity Node Title (Name) is required.");
            return;
        }
        onSave({ activityTitle: title, instructions: instructions });
    };

    return (
        <Dialog open={open} onClose={() => !isLoading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#FFE8A3', color: '#451513' }}>
                Edit Activity Node Details
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#FFFAF0', paddingTop: '20px !important' }}>

                {/* --- Start of Changed Block --- */}
                {/* We removed the Grid container to ensure a simple top-down layout */}
                <Box sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="nodeEditTitle"
                        label="Activity Node Title (Name)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                    <TextField
                        margin="dense"
                        id="nodeEditInstructions"
                        label="Instructions"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        disabled={isLoading}
                        sx={{ mt: 2 }} // Added margin-top for spacing
                    />
                </Box>
                {/* --- End of Changed Block --- */}

                {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#FFFAF0', p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} sx={{ color: '#451513' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={isLoading || !title.trim()}
                    sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' } }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EditActivityNodeDetailsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    node: PropTypes.shape({
        activityNodeTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        activityTitle: PropTypes.string,
        instructions: PropTypes.string,
        activityType: PropTypes.string,
        orderIndex: PropTypes.number,
        lessonDefinition: PropTypes.object
    }),
};

export default EditActivityNodeDetailsDialog;