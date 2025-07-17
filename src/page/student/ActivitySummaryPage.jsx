// Updated ActivitySummaryPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import {
  Box, Typography, Button, CircularProgress, Alert, Grid, Paper, Tooltip
} from '@mui/material';
import { submitActivityProgress } from '../../services/lessonService';
import Confetti from 'react-confetti'; // npm install react-confetti

import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarsIcon from '@mui/icons-material/Stars';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';

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
      state: { lessonProgressId, classroomId, activityTitle },
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
      lessonProgressId,
      activityNodeTypeId,
      score,
      accuracy: results.accuracy ?? Math.round((score / ((results.questionsAttempted ?? 1) * 100)) * 100),
      timeTakenSeconds: timeTaken || 0,
      highestStreak: highestStreak || 0,
      isFinished: status === 'COMPLETED'
    };

    try {
      await submitActivityProgress(submissionData, authState.token);
      navigate(`/student/classroom/${classroomId}/lessons`);
    } catch (err) {
      setSubmitError(err.message || "Failed to save your progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [displayScore, setDisplayScore] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [displayStreak, setDisplayStreak] = useState(0);
  const targetAccuracy = results.accuracy ?? Math.round((score / ((results.questionsAttempted ?? 1) * 100)) * 100);

  useEffect(() => {
    const duration = 2000;
    const totalFrames = 60;
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
      setDisplayScore(prev => frame < totalFrames ? Math.round(prev + scoreStep) : targetScore);
      setDisplayTime(prev => frame < totalFrames ? Math.round(prev + timeStep) : targetTime);
      setDisplayStreak(prev => frame < totalFrames ? Math.round(prev + streakStep) : targetStreak);
      if (frame < totalFrames) raf = requestAnimationFrame(animate);
    }
    animate();
    return () => raf && cancelAnimationFrame(raf);
  }, [score, timeTaken, highestStreak]);

  const isSuccess = status === 'COMPLETED';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0', overflow: 'auto' }}>
      <Navbar />
      {isSuccess && <Confetti numberOfPieces={150} recycle={false} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'url(/summary-bg.jpg) no-repeat center/cover',
        }}
      >
        <img src="/mascot.png" alt="Mascot" style={{ width: 750, position: 'absolute', bottom: 0, right: 20 }} />

        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <StarsIcon sx={{ fontSize: 36, color: '#FF6D00', mb: 1 }} />
          <Typography variant="h4" sx={{ color: '#451513', fontWeight: 'bold' }}>Final Score</Typography>
          <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#451513', fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
            {displayScore.toLocaleString()}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4, maxWidth: 800 }} justifyContent="center">
          {[{
            label: 'Accuracy',
            value: `${targetAccuracy}%`,
            icon: <SpeedIcon color="warning" />
          }, {
            label: 'Speed',
            value: `${displayTime}s`,
            icon: <TimerIcon color="warning" />
          }, {
            label: 'Best Streak!',
            value: `${displayStreak}x`,
            icon: <WhatshotIcon color="warning" />
          }].map(({ label, value, icon }, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper elevation={4} sx={{ p: 2, borderRadius: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 1 }}>{icon}</Box>
                <Typography variant="subtitle1" sx={{ color: '#451513', fontWeight: 'bold' }}>{label}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6D00' }}>{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {isSubmitting && <CircularProgress sx={{ my: 2 }} />}
        {submitError && <Alert severity="error" sx={{ my: 2 }}>{submitError}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
          <Button
            startIcon={<ReplayIcon />}
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
              '&:hover': {
                transform: 'scale(1.05)',
                borderColor: '#2F0F0D',
                bgcolor: 'rgba(69, 21, 19, 0.04)'
              }
            }}
          >
            Try Again
          </Button>
          <Button
            startIcon={<SendIcon />}
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
              '&:hover': {
                bgcolor: '#2F0F0D',
                transform: 'scale(1.05)'
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
