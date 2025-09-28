import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { submitChallengeAttempt, getCurrentChallengeProgressByLessonDef } from '../../services/challengeService';

const ChallengeSummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [existingProgress, setExistingProgress] = useState(null);

    const results = location.state;
    const { score, status, highestStreak, questionsAnswered, lessonDefinitionId, classroomId, timeTaken } = results || {};

    useEffect(() => {
        const fetchExisting = async () => {
            if (!lessonDefinitionId || !authState.token) {
                setInitialLoading(false);
                return;
            }
            setInitialLoading(true);
            try {
                const progress = await getCurrentChallengeProgressByLessonDef(lessonDefinitionId, authState.token);
                setExistingProgress(progress);
            } catch (err) {
                console.error("ChallengeSummaryPage: Error fetching existing challenge progress:", err);
                setSubmitError("Could not retrieve previous progress.");
            } finally {
                setInitialLoading(false);
            }
        };

        if (results && lessonDefinitionId) {
            fetchExisting();
        } else {
            setInitialLoading(false);
        }
    }, [lessonDefinitionId, authState.token, results]);

    const handleScoreSubmission = useCallback(async () => {
        if (!authState.token || (status !== 'COMPLETED' && status !== 'FAILED')) {
            setSubmitError("Cannot submit progress due to invalid status or missing token.");
            return false;
        }

        const shouldSubmitViaApi = !existingProgress || score > existingProgress.totalScore;

        if (shouldSubmitViaApi) {
            setIsSubmitting(true);
            setSubmitError(null);
            
            // ✨ FIXED: Provide default values for highestStreak and questionsAnswered ✨
            const submissionData = {
                lessonDefinitionId,
                totalScore: score,
                highestStreak: highestStreak || 0, // If highestStreak is undefined, send 0
                questionsAnswered: questionsAnswered || 0, // If questionsAnswered is undefined, send 0
            };

            try {
                await submitChallengeAttempt(submissionData, authState.token);
                setIsSubmitting(false);
                return true;
            } catch (err) {
                setSubmitError(err.message || "Failed to save your challenge score.");
                setIsSubmitting(false);
                return false;
            }
        }
        return true; 
    }, [authState.token, status, existingProgress, score, lessonDefinitionId, highestStreak, questionsAnswered]);

    const handleRetryChallenge = () => {
        navigate(`/student/lesson/${lessonDefinitionId}/challenge`, {
            state: { classroomId },
            replace: true
        });
    };

    const handleSubmitAndExit = async () => {
        const success = await handleScoreSubmission();
        if (success) {
            navigate(classroomId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage');
        }
    };

    const handleShowLeaderboard = async () => {
        const success = await handleScoreSubmission();
        if (success) {
            navigate(`/student/leaderboard/${lessonDefinitionId}`);
        }
    };

    if (!results || score == null || !status || lessonDefinitionId == null) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', textAlign: 'center' }}>
                    <Alert severity="error">Could not load challenge results.</Alert>
                    <Button onClick={() => navigate('/student-homepage')} sx={{ mt: 2 }}>Go Back</Button>
                </Box>
            </Box>
        );
    }
    
    if (initialLoading) {
        return (
             <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                 <Navbar />
                 <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                     <CircularProgress />
                     <Typography sx={{ ml: 2 }}>Loading summary...</Typography>
                 </Box>
             </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Paper elevation={4} sx={{ textAlign: 'center', p: { xs: 2, md: 4 }, bgcolor: 'white', borderRadius: 3, boxShadow: 5, width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: 'green', fontWeight: 'bold' }}>
                        🏆 Challenge Complete! 🏆
                    </Typography>
                    <Typography variant="h5" sx={{ my: 2, color: '#451513' }}>
                        Your Score: {score?.toLocaleString() ?? 'N/A'}
                    </Typography>
                    {existingProgress && (
                         <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                             Previous Best: {existingProgress.totalScore.toLocaleString()}
                         </Typography>
                    )}
                    <Grid container spacing={1} justifyContent="center" sx={{ my: 2 }}>
                        <Grid item xs={6} sm={4}><Typography variant="body1" sx={{ color: 'text.secondary' }}>Highest Streak:</Typography><Typography variant="h6">{highestStreak ?? 0}</Typography></Grid>
                        <Grid item xs={6} sm={4}><Typography variant="body1" sx={{ color: 'text.secondary' }}>Answered:</Typography><Typography variant="h6">{questionsAnswered ?? 0}</Typography></Grid>
                        <Grid item xs={12} sm={4}><Typography variant="body1" sx={{ color: 'text.secondary' }}>Time Taken:</Typography><Typography variant="h6">{Math.round(timeTaken) ?? 0}s</Typography></Grid>
                    </Grid>

                    {isSubmitting && <CircularProgress sx={{ my: 2 }} />}
                    {submitError && <Alert severity="error" sx={{ my: 2 }}>{submitError}</Alert>}

                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button variant="contained" onClick={handleSubmitAndExit} disabled={isSubmitting || initialLoading} sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' } }}>
                            {isSubmitting ? 'Saving...' : 'Save Score & Exit'}
                        </Button>
                        <Button variant="contained" color="secondary" onClick={handleShowLeaderboard} disabled={isSubmitting || initialLoading}>
                           Show Leaderboard
                        </Button>
                        <Button variant="outlined" onClick={handleRetryChallenge} disabled={isSubmitting}>
                           Retry Challenge
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ChallengeSummaryPage;