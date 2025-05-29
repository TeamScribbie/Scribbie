import React from 'react';
import PropTypes from 'prop-types';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Typography,
    Box
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsScoreIcon from '@mui/icons-material/SportsScore';

const ChallengeConfirmDialog = ({ 
    open, 
    onClose, 
    onViewLeaderboard, 
    onPlayChallenge,
    lessonTitle
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#FFFBE0',
                    borderRadius: '16px',
                    p: 2
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    textAlign: 'center',
                    color: '#451513',
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontWeight: 'bold',
                    pb: 1
                }}
            >
                Challenge Time! 🏆
            </DialogTitle>

            <DialogContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: '#451513',
                            mb: 2,
                            fontWeight: 'medium'
                        }}
                    >
                        Are you ready to take on the challenge for
                    </Typography>
                    <Typography 
                        sx={{ 
                            color: '#FF6D00',
                            fontWeight: 'bold',
                            fontSize: 'clamp(1.1rem, 3vw, 1.4rem)'
                        }}
                    >
                        {lessonTitle}
                    </Typography>
                </Box>

                <Typography 
                    sx={{ 
                        textAlign: 'center',
                        color: '#666',
                        mb: 2
                    }}
                >
                    Test your knowledge, compete with others, and aim for the top spot on the leaderboard!
                </Typography>
            </DialogContent>

            <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 3 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={onPlayChallenge}
                    startIcon={<SportsScoreIcon />}
                    sx={{
                        bgcolor: '#451513',
                        color: 'white',
                        p: 1.5,
                        '&:hover': {
                            bgcolor: '#2F0F0D'
                        }
                    }}
                >
                    Start Challenge
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={onViewLeaderboard}
                    startIcon={<EmojiEventsIcon />}
                    sx={{
                        borderColor: '#451513',
                        color: '#451513',
                        p: 1.5,
                        '&:hover': {
                            borderColor: '#2F0F0D',
                            bgcolor: 'rgba(69, 21, 19, 0.04)'
                        }
                    }}
                >
                    View Leaderboard
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ChallengeConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onViewLeaderboard: PropTypes.func.isRequired,
    onPlayChallenge: PropTypes.func.isRequired,
    lessonTitle: PropTypes.string.isRequired
};

export default ChallengeConfirmDialog;
