// src/page/student/ActivitySummaryPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { submitActivityProgress } from '../../services/lessonService'; // Import submission service

const ActivitySummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth(); // Get auth token for submission

    // --- State for submission ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // --- Extract data passed from ActivityPage ---
    const results = location.state;

    // Basic validation if state is missing
    if (!results) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', textAlign: 'center' }}>
                    <Alert severity="error">Could not load activity results. Please go back.</Alert>
                    <Button onClick={() => navigate('/student-homepage')} sx={{ mt: 2 }}>Go Home</Button>
                </Box>
            </Box>
        );
    }

    const {
        score, status, highestStreak, timeTaken,
        lessonProgressId, activityNodeTypeId, studentId,
        lessonId, activityId, classroomId // IDs for navigation/submission
    } = results;

    // --- Event Handlers ---
    const handleRestart = () => {
        console.log("Restarting activity:", activityId);
        // Navigate back to the specific activity page
        navigate(`/student/lesson/${lessonId}/activity/${activityId}`, {
            // Pass necessary state again, especially lessonProgressId
            state: {
                lessonProgressId: lessonProgressId,
                classroomId: classroomId // Pass classroomId if needed by ActivityPage
                // Don't pass instructions again unless needed for restart logic
            },
             replace: true // Optional: replace history entry so back button doesn't go to summary
        });
    };

    const handleSubmitAndContinue = async () => {
        if (!authState.token) {
             setSubmitError("Authentication token missing. Cannot save progress.");
             return;
        }
        setIsSubmitting(true);
        setSubmitError(null);

        const submissionData = {
            lessonProgressId: lessonProgressId,
            activityNodeTypeId: activityNodeTypeId,
            score: score,
            // Use a fixed accuracy for now, or calculate properly if possible
            accuracy: status === 'COMPLETED' ? 1.0 : 0.5, // Placeholder accuracy
            timeTakenSeconds: timeTaken || 0,
            highestStreak: highestStreak || 0,
            isFinished: status === 'COMPLETED'
        };

        try {
            console.log("Summary Page: Submitting Activity Progress:", submissionData);
            await submitActivityProgress(submissionData, authState.token);
            console.log("Summary Page: Submission successful!");

            // Navigate back to the Lesson Page for the specific classroom
            // *** Requires classroomId to be passed correctly from LessonPage -> ActivityPage -> SummaryPage ***
            if (classroomId) {
                navigate(`/student/classroom/${classroomId}/lessons`);
            } else {
                console.warn("ClassroomId not available, navigating to student homepage instead.");
                navigate('/student-homepage'); // Fallback navigation
            }

        } catch (err) {
            console.error("Summary Page: Failed to submit activity progress:", err);
            setSubmitError(err.message || "Failed to save progress. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    const isSuccess = status === 'COMPLETED';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 3, boxShadow: 5, width: '100%', maxWidth: '500px' }}>
                    <Typography variant="h4" gutterBottom sx={{ color: isSuccess ? '#388e3c' : '#d32f2f' }}>
                        {isSuccess ? '🎉 Activity Complete! 🎉' : 'Better Luck Next Time!'}
                    </Typography>
                    <Typography variant="h5" sx={{ my: 2 }}>
                        Final Score: {score?.toLocaleString() ?? 'N/A'}
                    </Typography>
                    {/* Optional: Display other stats like streak, time */}
                     <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                         Highest Streak: {highestStreak ?? 0}
                    </Typography>
                     <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                         Time Taken: {timeTaken ?? 0} seconds
                    </Typography>

                    {/* Submission Status */}
                    {isSubmitting && <CircularProgress sx={{ my: 2 }} />}
                    {submitError && <Alert severity="error" sx={{ my: 2 }}>{submitError}</Alert>}

                    {/* Action Buttons */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleRestart}
                            disabled={isSubmitting}
                            sx={{ borderColor: '#451513', color: '#451513', '&:hover': { borderColor: '#5d211f', bgcolor: 'rgba(69, 21, 19, 0.04)'} }}
                        >
                            Restart Activity
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmitAndContinue}
                            disabled={isSubmitting}
                             sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' } }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ActivitySummaryPage;