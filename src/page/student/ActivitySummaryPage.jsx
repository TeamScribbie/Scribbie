// src/page/student/ActivitySummaryPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import { Box, Typography, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { submitActivityProgress } from '../../services/lessonService';

// Import Material UI Icons
import SpeedIcon from '@mui/icons-material/Speed';  // For accuracy
import TimerIcon from '@mui/icons-material/Timer';  // For time taken
import WhatshotIcon from '@mui/icons-material/Whatshot';  // For streak
import StarsIcon from '@mui/icons-material/Stars';  // For Score display

const ActivitySummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const results = location.state;

    if (!results || typeof results.score === 'undefined' || !results.status || !results.lessonProgressId || !results.activityNodeTypeId) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', textAlign: 'center' }}>
                    <Alert severity="error">Could not load activity results. Essential data is missing.</Alert>
                    <Button onClick={() => navigate(results?.classroomId && results?.lessonDefinitionId ? `/student/classroom/${results.classroomId}/lessons` : '/student-homepage')} sx={{ mt: 2 }}>
                        Go Back to Lessons
                    </Button>
                </Box>
            </Box>
        );
    }

    const {
        score, status, highestStreak, timeTaken,
        lessonProgressId, activityNodeTypeId,
        lessonDefinitionId, classroomId, activityTitle
    } = results;

    const handleRestart = () => {
        navigate(`/student/lesson/${lessonDefinitionId}/activity-node/${activityNodeTypeId}/play`, {
            state: {
                lessonProgressId,
                classroomId,
                activityTitle,
            },
            replace: true
        });
    };

    const handleSubmitAndContinue = async () => {
        if (!authState.token || !authState.user?.identifier) {
            setSubmitError("Authentication error. Cannot save progress.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        const submissionData = {
            lessonProgressId: lessonProgressId,
            activityNodeTypeId: activityNodeTypeId,
            score: score,
            accuracy: results.accuracy ?? Math.round((score / ((results.questionsAttempted ?? 1) * 100)) * 100),
            timeTakenSeconds: timeTaken || 0,
            highestStreak: highestStreak || 0,
            isFinished: status === 'COMPLETED'
        };

        try {
            console.log("ActivitySummaryPage: Submitting Activity Progress:", submissionData);
            await submitActivityProgress(submissionData, authState.token);
            console.log("ActivitySummaryPage: Submission successful!");

            if (classroomId && lessonDefinitionId) {
                navigate(`/student/classroom/${classroomId}/lessons`);
            } else {
                console.warn("ClassroomId or LessonDefinitionId not available, navigating to student homepage.");
                navigate('/student-homepage');
            }
        } catch (err) {
            console.error("ActivitySummaryPage: Failed to submit activity progress:", err);
            setSubmitError(err.message || "Failed to save your progress. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Animated counters for score, time, and streak (accuracy is static)
    const [displayScore, setDisplayScore] = useState(0);
    const [displayTime, setDisplayTime] = useState(0);
    const [displayStreak, setDisplayStreak] = useState(0);
    const targetAccuracy = results.accuracy ?? Math.round((score / ((results.questionsAttempted ?? 1) * 100)) * 100);

    useEffect(() => {
        const duration = 2000; // 2 seconds
        const frameRate = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;
        const targetScore = score || 0;
        const targetTime = Math.round(timeTaken) ?? 0;
        const targetStreak = highestStreak ?? 0;
        const scoreStep = targetScore / totalFrames;
        const timeStep = targetTime / totalFrames;
        const streakStep = targetStreak / totalFrames;
        let raf;
        function animate() {
            frame++;
            setDisplayScore(prev => (frame < totalFrames ? Math.round(prev + scoreStep) : targetScore));
            setDisplayTime(prev => (frame < totalFrames ? Math.round(prev + timeStep) : targetTime));
            setDisplayStreak(prev => (frame < totalFrames ? Math.round(prev + streakStep) : targetStreak));
            if (frame < totalFrames) {
                raf = requestAnimationFrame(animate);
            } else {
                setDisplayScore(targetScore);
                setDisplayTime(targetTime);
                setDisplayStreak(targetStreak);
            }
        }
        animate();
        return () => raf && cancelAnimationFrame(raf);
    }, [score, timeTaken, highestStreak]);

    const isSuccess = status === 'COMPLETED';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0', overflow: 'auto' }}>
            <Navbar />
            <Box component="main" sx={{
                flexGrow: 1,
                p: { xs: 2, sm: 3 },
                mt: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'transparent',
            }}>
                <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <StarsIcon sx={{ fontSize: 36, color: '#FF6D00', mb: 1 }} />
                    <Typography variant="h4" component="h1" sx={{ color: '#451513', fontWeight: 'bold', mb: 1 }}>
                        Final Score
                    </Typography>
                    <Typography variant="h1" sx={{
                        fontWeight: 'bold',
                        color: '#451513',
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        mb: 2
                    }}>
                        {displayScore.toLocaleString()}
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 4, width: '100%', maxWidth: 600, justifyContent: 'center' }}>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 120,
                            minHeight: '100px',
                            boxShadow: 'none',
                            bgcolor: 'transparent',
                        }}>
                            <SpeedIcon sx={{ fontSize: 28, color: '#FF6D00', mb: 0.5 }} />
                            <Typography variant="subtitle1" sx={{ color: '#451513', mb: 0.5 }}>
                                Accuracy
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6D00' }}>
                                {targetAccuracy}%
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 120,
                            minHeight: '100px',
                            boxShadow: 'none',
                            bgcolor: 'transparent',
                        }}>
                            <TimerIcon sx={{ fontSize: 28, color: '#FF6D00', mb: 0.5 }} />
                            <Typography variant="subtitle1" sx={{ color: '#451513', mb: 0.5 }}>
                                Time Taken
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6D00' }}>
                                {displayTime}s
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 120,
                            minHeight: '100px',
                            boxShadow: 'none',
                            bgcolor: 'transparent',
                        }}>
                            <WhatshotIcon sx={{ fontSize: 28, color: '#FF6D00', mb: 0.5 }} />
                            <Typography variant="subtitle1" sx={{ color: '#451513', mb: 0.5 }}>
                                Highest Streak
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6D00' }}>
                                {displayStreak}x
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {isSubmitting && <CircularProgress sx={{ my: 2 }} />}
                {submitError && <Alert severity="error" sx={{ my: 2 }}>{submitError}</Alert>}

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'center',
                    gap: 2,
                    width: { xs: '100%', sm: 'auto' },
                    mb: 2
                }}>
                    <Button
                        variant="outlined"
                        onClick={handleRestart}
                        disabled={isSubmitting}
                        sx={{
                            borderColor: '#451513',
                            color: '#451513',
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            flex: { xs: '1', sm: '0 1 auto' },
                            minWidth: { sm: '160px' },
                            '&:hover': {
                                borderColor: '#2F0F0D',
                                bgcolor: 'rgba(69, 21, 19, 0.04)'
                            }
                        }}
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitAndContinue}
                        disabled={isSubmitting}
                        sx={{
                            bgcolor: '#451513',
                            color: 'white',
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            flex: { xs: '1', sm: '0 1 auto' },
                            minWidth: { sm: '160px' },
                            '&:hover': {
                                bgcolor: '#2F0F0D'
                            }
                        }}
                    >
                        {isSubmitting ? 'Saving...' : 'Submit'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ActivitySummaryPage;