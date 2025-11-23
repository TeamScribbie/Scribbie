import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { submitChallengeAttempt, getCurrentChallengeProgressByLessonDef } from '../../services/challengeService';
import summaryChallengeBg from '../../assets/summary-challenge-bg.jpg';

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
                    <Alert severity="error">Could not load challenge results.</Alert>
                    <Button onClick={() => navigate('/student-homepage')} sx={{ mt: 2 }}>Go Back</Button>
                </Box>
            </Box>
        );
    }
    
    if (initialLoading) {
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
                 <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                     <CircularProgress />
                     <Typography sx={{ ml: 2 }}>Loading summary...</Typography>
                 </Box>
             </Box>
        );
    }

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
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    mt: '70px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Paper
                    elevation={10}
                    sx={{
                        textAlign: 'center',
                        p: { xs: 3, md: 4 },
                        bgcolor: 'rgba(255, 255, 255, 0.96)',
                        borderRadius: 4,
                        width: '100%',
                        maxWidth: '720px',
                        boxShadow: '0 20px 55px rgba(15, 23, 42, 0.35)',
                        border: '1px solid rgba(251, 191, 36, 0.55)',
                        backdropFilter: 'blur(18px)',
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
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #FDB10D 0%, #f9b121 50%, #FFD966 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        🏆 Challenge Complete! 🏆
                    </Typography>
                    <Typography variant="h5" sx={{ my: 2, color: '#FACC15', fontWeight: 'bold' }}>
                        Your Score: {score?.toLocaleString() ?? 'N/A'}
                    </Typography>
                    {existingProgress && (
                         <Typography variant="body2" sx={{ mb: 2, color: '#4B5563' }}>
                             Previous Best: {existingProgress.totalScore.toLocaleString()}
                         </Typography>
                    )}
                    <Grid
                        container
                        spacing={2}
                        justifyContent="center"
                        sx={{ my: 3 }}
                    >
                        <Grid item xs={12} sm={4}>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255, 255, 255, 0.96)',
                                    border: '1px solid rgba(96, 165, 250, 0.4)',
                                    boxShadow: '0 12px 30px rgba(148, 163, 184, 0.35)',
                                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px) scale(1.03)',
                                        boxShadow: '0 18px 40px rgba(96, 165, 250, 0.55)',
                                        bgcolor: 'rgba(239, 246, 255, 0.98)'
                                    }
                                }}
                            >
                                <Typography variant="body2" sx={{ color: '#4B5563', mb: 0.5, fontWeight: 600 }}>
                                    Highest Streak
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0F172A' }}>
                                    {highestStreak ?? 0}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255, 255, 255, 0.96)',
                                    border: '1px solid rgba(96, 165, 250, 0.4)',
                                    boxShadow: '0 12px 30px rgba(148, 163, 184, 0.35)',
                                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px) scale(1.03)',
                                        boxShadow: '0 18px 40px rgba(96, 165, 250, 0.55)',
                                        bgcolor: 'rgba(239, 246, 255, 0.98)'
                                    }
                                }}
                            >
                                <Typography variant="body2" sx={{ color: '#4B5563', mb: 0.5, fontWeight: 600 }}>
                                    Answered
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0F172A' }}>
                                    {questionsAnswered ?? 0}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255, 255, 255, 0.96)',
                                    border: '1px solid rgba(96, 165, 250, 0.4)',
                                    boxShadow: '0 12px 30px rgba(148, 163, 184, 0.35)',
                                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px) scale(1.03)',
                                        boxShadow: '0 18px 40px rgba(96, 165, 250, 0.55)',
                                        bgcolor: 'rgba(239, 246, 255, 0.98)'
                                    }
                                }}
                            >
                                <Typography variant="body2" sx={{ color: '#4B5563', mb: 0.5, fontWeight: 600 }}>
                                    Time Taken
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0F172A' }}>
                                    {Math.round(timeTaken) ?? 0}s
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {isSubmitting && <CircularProgress sx={{ my: 2 }} />}
                    {submitError && <Alert severity="error" sx={{ my: 2 }}>{submitError}</Alert>}

                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleSubmitAndExit}
                            disabled={isSubmitting || initialLoading}
                            sx={{
                                bgcolor: '#F97316',
                                color: '#111827',
                                px: 3,
                                py: 1.4,
                                borderRadius: 999,
                                fontWeight: 'bold',
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
                            {isSubmitting ? 'Saving...' : 'Save Score & Exit'}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleShowLeaderboard}
                            disabled={isSubmitting || initialLoading}
                            sx={{
                                bgcolor: '#22c55e',
                                color: '#052e16',
                                px: 3,
                                py: 1.4,
                                borderRadius: 999,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: '0 10px 28px rgba(34, 197, 94, 0.55)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#16a34a',
                                    transform: 'translateY(-2px) scale(1.02)',
                                    boxShadow: '0 14px 32px rgba(22, 163, 74, 0.65)'
                                },
                                '&:active': {
                                    transform: 'translateY(0px) scale(0.99)',
                                    boxShadow: '0 8px 22px rgba(22, 163, 74, 0.45)'
                                }
                            }}
                        >
                           Show Leaderboard
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleRetryChallenge}
                            disabled={isSubmitting}
                            sx={{
                                borderColor: '#3B82F6',
                                color: '#1D4ED8',
                                px: 3,
                                py: 1.3,
                                borderRadius: 999,
                                fontWeight: 'bold',
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
                           Retry Challenge
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ChallengeSummaryPage;