import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { submitChallengeAttempt } from '../../services/challengeService';

const ChallengeSummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const results = location.state;

    if (!results || results.challengeProgressId == null) { // Check for challengeProgressId
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', textAlign: 'center' }}>
                    <Alert severity="error">Could not load challenge results. Invalid data received.</Alert>
                    <Button onClick={() => navigate(results?.classroomId ? `/student/classroom/${results.classroomId}/lessons` : '/student-homepage')} sx={{ mt: 2 }}>
                        Go Back
                    </Button>
                </Box>
            </Box>
        );
    }

    const {
        challengeProgressId, // This is crucial
        score,
        status, // 'COMPLETED' or 'FAILED'
        highestStreak,
        questionsAnswered,
        lessonDefinitionId, // For retrying the same challenge
        classroomId,        // For navigating back to the lesson page of the classroom
        timeTaken
    } = results;

    const handleRetryChallenge = () => {
        console.log("Retrying challenge for lesson definition ID:", lessonDefinitionId);
        navigate(`/student/lesson/${lessonDefinitionId}/challenge`, {
            state: { classroomId }, // Pass classroomId again for back navigation context
            replace: true
        });
    };

    const handleSubmitAndExit = async () => {
        if (!authState.token) {
            setSubmitError("Authentication token missing. Cannot save progress.");
            return;
        }
        if (status !== 'COMPLETED' && status !== 'FAILED') { // Only submit if game actually ended
            setSubmitError("Cannot submit progress, challenge was not properly completed or failed.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        const submissionData = {
            challengeProgressId: challengeProgressId,
            totalScore: score,
            highestStreak: highestStreak,
            questionsAnswered: questionsAnswered,
        };

        try {
            console.log("ChallengeSummaryPage: Submitting Challenge Attempt:", submissionData);
            await submitChallengeAttempt(submissionData, authState.token);
            console.log("ChallengeSummaryPage: Submission successful!");

            if (classroomId) {
                navigate(`/student/classroom/${classroomId}/lessons`);
            } else {
                navigate('/student-homepage');
            }
        } catch (err) {
            console.error("ChallengeSummaryPage: Failed to submit challenge progress:", err);
            setSubmitError(err.message || "Failed to save your challenge score. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSuccess = status === 'COMPLETED';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, p: {xs: 2, sm:3 }, mt: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Paper elevation={4} sx={{ textAlign: 'center', p: {xs: 2, md: 4}, bgcolor: 'white', borderRadius: 3, boxShadow: 5, width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: isSuccess ? 'green' : 'red', fontWeight: 'bold' }}>
                        {isSuccess ? '🏆 Challenge Complete! 🏆' : 'Game Over!'}
                    </Typography>
                    <Typography variant="h5" sx={{ my: 2, color: '#451513' }}>
                        Final Score: {score?.toLocaleString() ?? 'N/A'}
                    </Typography>
                    <Grid container spacing={1} justifyContent="center" sx={{my: 2}}>
                        <Grid item xs={6} sm={4}>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>Highest Streak:</Typography>
                            <Typography variant="h6" sx={{ color: '#451513' }}>{highestStreak ?? 0}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>Answered:</Typography>
                            <Typography variant="h6" sx={{ color: '#451513' }}>{questionsAnswered ?? 0}</Typography>
                        </Grid>
                         <Grid item xs={12} sm={4}>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>Time Taken:</Typography>
                            <Typography variant="h6" sx={{ color: '#451513' }}>{Math.round(timeTaken) ?? 0}s</Typography>
                        </Grid>
                    </Grid>

                    {isSubmitting && <CircularProgress sx={{ my: 2 }} />}
                    {submitError && <Alert severity="error" sx={{ my: 2 }}>{submitError}</Alert>}

                    <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-around', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleRetryChallenge}
                            disabled={isSubmitting}
                            sx={{ borderColor: '#FFC107', color: '#FFC107', '&:hover': { borderColor: '#FFA000', bgcolor: 'rgba(255, 193, 7, 0.08)'} }}
                        >
                            Retry Challenge
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmitAndExit}
                            disabled={isSubmitting}
                            sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' } }}
                        >
                            {isSubmitting ? 'Saving Score...' : 'Save Score & Exit'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ChallengeSummaryPage;