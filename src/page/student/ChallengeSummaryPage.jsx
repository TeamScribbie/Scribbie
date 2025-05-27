// AI Context/Frontend/page/student/ChallengeSummaryPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Grid } from '@mui/material';
// Import the new service function and the existing submit function
import { submitChallengeAttempt, getCurrentChallengeProgressByLessonDef } from '../../services/challengeService';

const ChallengeSummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [existingProgress, setExistingProgress] = useState(null); // To store fetched existing progress

    const results = location.state;

    // Destructure results safely after checking if results exist
    const {
        score,
        status, // 'COMPLETED' or 'FAILED' from GameChallengeLogic
        highestStreak,
        questionsAnswered,
        lessonDefinitionId,
        classroomId,
        timeTaken
    } = results || {};


    // Fetch existing progress when the component mounts or when crucial data is available
    useEffect(() => {
        const fetchExisting = async () => {
            if (!lessonDefinitionId || !authState.token) {
                console.warn("ChallengeSummaryPage: lessonDefinitionId or token missing, cannot fetch existing progress.");
                setInitialLoading(false); // Stop loading if we can't fetch
                return;
            }
            setInitialLoading(true);
            try {
                console.log(`ChallengeSummaryPage: Fetching existing progress for lessonDefinitionId: ${lessonDefinitionId}`);
                const progress = await getCurrentChallengeProgressByLessonDef(lessonDefinitionId, authState.token);
                setExistingProgress(progress); // progress can be null if no prior attempt
                console.log("ChallengeSummaryPage: Existing progress fetched:", progress);
            } catch (err) {
                console.error("ChallengeSummaryPage: Error fetching existing challenge progress:", err);
                setSubmitError("Could not retrieve previous progress. Your current attempt score will be saved if it's your first or highest.");
            } finally {
                setInitialLoading(false);
            }
        };

        if (results && lessonDefinitionId) { // Ensure results and lessonDefinitionId are available
            fetchExisting();
        } else {
             console.warn("ChallengeSummaryPage: Results or lessonDefinitionId missing on mount.");
            setInitialLoading(false); 
        }
    }, [lessonDefinitionId, authState.token, results]); // Dependency on results to ensure it runs after state is set


    // Initial check for results object
    if (!results || score == null || !status || lessonDefinitionId == null) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', textAlign: 'center' }}>
                    <Alert severity="error">Could not load challenge results. Key data is missing.</Alert>
                    <Button onClick={() => navigate(classroomId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage')} sx={{ mt: 2 }}>
                        Go Back
                    </Button>
                </Box>
            </Box>
        );
    }

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
        if (status !== 'COMPLETED' && status !== 'FAILED') {
            setSubmitError("Cannot submit progress, challenge was not properly completed or failed.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        let shouldSubmitViaApi = false;
        if (!existingProgress) { // No previous attempt
            console.log("ChallengeSummaryPage: No existing progress. Will submit.");
            shouldSubmitViaApi = true;
        } else if (score > existingProgress.totalScore) { // Current score is better
            console.log(`ChallengeSummaryPage: New score (${score}) > existing score (${existingProgress.totalScore}). Will submit.`);
            shouldSubmitViaApi = true;
        } else { // Current score is not better
            console.log(`ChallengeSummaryPage: New score (${score}) <= existing score (${existingProgress.totalScore}). Skipping API submission, navigating directly.`);
            shouldSubmitViaApi = false;
        }

        if (shouldSubmitViaApi) {
            const submissionData = {
                lessonDefinitionId: lessonDefinitionId, // Backend uses this to find/create the ChallengeProgress
                totalScore: score,
                highestStreak: highestStreak,
                questionsAnswered: questionsAnswered,
                // status: status, // Backend can infer this or set it based on logic
                // challengeProgressId: existingProgress?.challengeProgressId, // Only if backend strictly needs it for updates and can't find via studentId/lessonDefId
            };

            try {
                console.log("ChallengeSummaryPage: Submitting Challenge Attempt to API:", submissionData);
                await submitChallengeAttempt(submissionData, authState.token);
                console.log("ChallengeSummaryPage: Submission successful!");
            } catch (err) {
                console.error("ChallengeSummaryPage: Failed to submit challenge progress:", err);
                setSubmitError(err.message || "Failed to save your challenge score. Please try again.");
                setIsSubmitting(false);
                return; // Stop execution if API submission fails
            }
        }

        // Navigate after successful submission or if submission was skipped
        setIsSubmitting(false);
        if (classroomId) {
            navigate(`/student/classroom/${classroomId}/lessons`);
        } else {
            navigate('/student-homepage');
        }
    };

    const isSuccess = status === 'COMPLETED';

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading summary and previous scores...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Paper elevation={4} sx={{ textAlign: 'center', p: { xs: 2, md: 4 }, bgcolor: 'white', borderRadius: 3, boxShadow: 5, width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: isSuccess ? 'green' : 'red', fontWeight: 'bold' }}>
                        {isSuccess ? '🏆 Challenge Complete! 🏆' : 'Try Again!'}
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
                            sx={{ borderColor: '#FFC107', color: '#FFC107', '&:hover': { borderColor: '#FFA000', bgcolor: 'rgba(255, 193, 7, 0.08)' } }}
                        >
                            Retry Challenge
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmitAndExit}
                            disabled={isSubmitting || initialLoading} // Disable if still loading existing progress too
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