// src/page/student/ActivitySummaryPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Paper } from '@mui/material';
import { submitActivityProgress } from '../../services/lessonService';
import summaryChallengeBg from '../../assets/summary-challenge-bg.jpg';

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
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundImage: `url(${summaryChallengeBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                <Navbar className="sidebar-closed" />
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
            accuracy: targetAccuracy,
            timeTakenSeconds: timeTaken || 0,
            highestStreak: highestStreak || 0,
            isFinished: status === 'COMPLETED'
        };

        try {
            console.log("ActivitySummaryPage: Submitting Activity Progress:", submissionData);
            await submitActivityProgress(submissionData, authState.token);
            console.log("ActivitySummaryPage: Submission successful!");
            // Backend automatically unlocks next activity node via unlockNextActivityNode()

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

    // Prefer the accuracy value computed by the game itself. If it's missing:
    // - For COMPLETED runs, estimate from score and questionsAttempted / questionsAnswered
    // - For FAILED or unknown runs, show 0% so summary matches the idea of an unsuccessful attempt.
    const rawAccuracy = (typeof results.accuracy === 'number' && !Number.isNaN(results.accuracy))
        ? results.accuracy
        : null;
    const questionsForAccuracy = results.questionsAttempted ?? results.questionsAnswered ?? null;
    const estimatedAccuracy = (!rawAccuracy && status === 'COMPLETED' && questionsForAccuracy && questionsForAccuracy > 0)
        ? Math.max(0, Math.min(100, Math.round((Math.floor(score / 100) / questionsForAccuracy) * 100)))
        : 0;
    const targetAccuracy = rawAccuracy !== null
        ? Math.round(rawAccuracy)
        : estimatedAccuracy;

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
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundImage: `url(${summaryChallengeBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'auto'
        }}>
            <Navbar className="sidebar-closed" />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    mt: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Paper
                    elevation={10}
                    sx={{
                        width: '100%',
                        maxWidth: 720,
                        borderRadius: 4,
                        p: { xs: 3, sm: 4 },
                        bgcolor: 'rgba(255, 255, 255, 0.96)',
                        boxShadow: '0 20px 55px rgba(15, 23, 42, 0.35)',
                        border: '1px solid rgba(251, 191, 36, 0.55)',
                        backdropFilter: 'blur(18px)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 247, 237, 0.98))',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                        transformOrigin: 'center center',
                        '&:hover': {
                            transform: 'translateY(-4px) scale(1.01)',
                            boxShadow: '0 26px 70px rgba(251, 191, 36, 0.45)'
                        },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at top left, rgba(251, 191, 36, 0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.35), transparent 55%)',
                            pointerEvents: 'none'
                        }
                    }}
                >
                    <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <StarsIcon sx={{ fontSize: 44, color: '#FACC15', mb: 1 }} />

                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: '900',
                                background: 'linear-gradient(135deg, #FDB10D 0%, #FF6D00 50%, #f97316 85%, #FFD966 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}
                        >
                            Final Score
                        </Typography>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: '900',
                                color: '#0F172A',
                                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                                mb: 2
                            }}
                        >
                            {displayScore.toLocaleString()}
                        </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 4, width: '100%', maxWidth: 600, justifyContent: 'center' }}>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 120,
                                minHeight: '100px',
                                bgcolor: 'rgba(255, 255, 255, 0.96)',
                                border: '1px solid rgba(96, 165, 250, 0.4)',
                                boxShadow: '0 12px 30px rgba(148, 163, 184, 0.35)',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px) scale(1.03)',
                                    boxShadow: '0 18px 40px rgba(96, 165, 250, 0.55)',
                                    bgcolor: 'rgba(239, 246, 255, 0.98)'
                                }
                            }}>
                                <SpeedIcon sx={{ fontSize: 28, color: '#3B82F6', mb: 0.5 }} />
                                <Typography variant="subtitle1" sx={{ color: '#4B5563', mb: 0.5, fontWeight: 600 }}>
                                    Accuracy
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0F172A' }}>
                                    {targetAccuracy}%
                                </Typography>
                            </Box>

                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 120,
                                minHeight: '100px',
                                bgcolor: 'rgba(255, 255, 255, 0.96)',
                                border: '1px solid rgba(96, 165, 250, 0.4)',
                                boxShadow: '0 12px 30px rgba(148, 163, 184, 0.35)',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px) scale(1.03)',
                                    boxShadow: '0 18px 40px rgba(96, 165, 250, 0.55)',
                                    bgcolor: 'rgba(239, 246, 255, 0.98)'
                                }
                            }}>
                                <TimerIcon sx={{ fontSize: 28, color: '#10B981', mb: 0.5 }} />
                                <Typography variant="subtitle1" sx={{ color: '#4B5563', mb: 0.5, fontWeight: 600 }}>
                                    Time Taken
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0F172A' }}>
                                    {displayTime}s
                                </Typography>
                            </Box>

                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 120,
                                minHeight: '100px',
                                bgcolor: 'rgba(255, 255, 255, 0.96)',
                                border: '1px solid rgba(96, 165, 250, 0.4)',
                                boxShadow: '0 12px 30px rgba(148, 163, 184, 0.35)',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px) scale(1.03)',
                                    boxShadow: '0 18px 40px rgba(96, 165, 250, 0.55)',
                                    bgcolor: 'rgba(239, 246, 255, 0.98)'
                                }
                            }}>
                                <WhatshotIcon sx={{ fontSize: 28, color: '#F97316', mb: 0.5 }} />
                                <Typography variant="subtitle1" sx={{ color: '#4B5563', mb: 0.5, fontWeight: 600 }}>
                                    Highest Streak
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0F172A' }}>
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
                                borderColor: '#3B82F6',
                                color: '#1D4ED8',
                                px: 4,
                                py: 1.5,
                                borderRadius: 999,
                                fontWeight: 'bold',
                                flex: { xs: '1', sm: '0 1 auto' },
                                minWidth: { sm: '160px' },
                                textTransform: 'none',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
                                '&:hover': {
                                    borderColor: '#1D4ED8',
                                    bgcolor: 'rgba(59, 130, 246, 0.08)',
                                    transform: 'translateY(-2px) scale(1.02)',
                                    boxShadow: '0 12px 26px rgba(59, 130, 246, 0.35)'
                                },
                                '&:active': {
                                    transform: 'translateY(0px) scale(0.99)',
                                    boxShadow: '0 6px 18px rgba(59, 130, 246, 0.25)'
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
                                bgcolor: '#F97316',
                                color: '#111827',
                                px: 4,
                                py: 1.5,
                                borderRadius: 999,
                                fontWeight: 'bold',
                                flex: { xs: '1', sm: '0 1 auto' },
                                minWidth: { sm: '160px' },
                                textTransform: 'none',
                                boxShadow: '0 10px 30px rgba(248, 113, 22, 0.55)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#ea580c',
                                    transform: 'translateY(-2px) scale(1.02)',
                                    boxShadow: '0 14px 34px rgba(234, 88, 12, 0.65)'
                                },
                                '&:active': {
                                    transform: 'translateY(0px) scale(0.99)',
                                    boxShadow: '0 8px 22px rgba(234, 88, 12, 0.45)'
                                }
                            }}
                        >
                            {isSubmitting ? 'Saving...' : 'Submit'}
                        </Button>
                    </Box>
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

                </Paper>
            </Box>
        </Box>
    );
};

export default ActivitySummaryPage;