// src/page/student/ActivityPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import ActivityGameLogic from '../../components/student/ActivityGameLogic';
import { getActivityNodeTypeDetails } from '../../services/activityService';
import { CircularProgress, Alert, Typography, Box, Button } from '@mui/material';

const ActivityPage = () => {
    const { lessonId, activityId } = useParams(); // activityId is the activityNodeTypeId
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [activityData, setActivityData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const lessonProgressId = location.state?.lessonProgressId;
    const activityInstructions = location.state?.activityInstructions;
    // We need classroomId if we want to navigate back to the specific lesson page
    const classroomId = location.state?.classroomId; // <-- Make sure to pass this from LessonPage if needed

    // --- Data Fetching (Modified to use Placeholder - remember to restore later) ---
    const fetchActivityData = useCallback(async () => {
        // (Keep placeholder logic or restore API call as needed)
         console.log(`Using placeholder data for Activity ID: ${activityId}`);
         const placeholderData = { /* ... placeholder data ... */
            activityNodeTypeId: parseInt(activityId) || 99,
            activityType: 'QUIZ_MCQ',
            orderIndex: 1,
            instructions: activityInstructions || "Answer the placeholder questions!",
            questions: [ /* ... placeholder questions ... */
             { questionId: 901, questionText: "Why is it not working?", questionImageUrl: null, questionSoundUrl: null, choices: [ { choiceId: 1001, choiceText: "Idk", isCorrect: false }, { choiceId: 1002, choiceText: "Test", isCorrect: false }, { choiceId: 1003, choiceText: "404 Error", isCorrect: false }, { choiceId: 1004, choiceText: "All Of the Above", isCorrect: true } ] },
             { questionId: 902, questionText: "Why is it not working? (2)", questionImageUrl: null, questionSoundUrl: null, choices: [ { choiceId: 1005, choiceText: "Idk", isCorrect: false }, { choiceId: 1006, choiceText: "Test", isCorrect: false }, { choiceId: 1007, choiceText: "404 Error", isCorrect: false }, { choiceId: 1008, choiceText: "All Of the Above", isCorrect: true } ] },
             { questionId: 903, questionText: "Why is it not working? (3)", questionImageUrl: null, questionSoundUrl: null, choices: [ { choiceId: 1009, choiceText: "Idk", isCorrect: false }, { choiceId: 1010, choiceText: "Test", isCorrect: false }, { choiceId: 1011, choiceText: "404 Error", isCorrect: false }, { choiceId: 1012, choiceText: "All Of the Above", isCorrect: true } ] },
             { questionId: 904, questionText: "Why is it not working? (4)", questionImageUrl: null, questionSoundUrl: null, choices: [ { choiceId: 1013, choiceText: "Idk", isCorrect: false }, { choiceId: 1014, choiceText: "Test", isCorrect: false }, { choiceId: 1015, "choiceText": "404 Error", isCorrect: false }, { choiceId: 1016, choiceText: "All Of the Above", isCorrect: true } ] },
             { questionId: 905, questionText: "Why is it not working? (5)", questionImageUrl: null, questionSoundUrl: null, choices: [ { choiceId: 1017, choiceText: "Idk", isCorrect: false }, { choiceId: 1018, choiceText: "Test", isCorrect: false }, { choiceId: 1019, choiceText: "404 Error", isCorrect: false }, { choiceId: 1020, choiceText: "All Of the Above", isCorrect: true } ] }
            ]
         };
         setTimeout(() => { setActivityData(placeholderData); setIsLoading(false); setError(null); }, 500);
    }, [activityId, authState.token, activityInstructions]);

    useEffect(() => {
        if (!lessonProgressId) {
            console.error("Error: lessonProgressId not found in navigation state.");
            setError("Could not start activity: Missing progress ID. Please go back to the lesson page.");
            setIsLoading(false);
            return;
        }
        fetchActivityData();
    }, [fetchActivityData, lessonProgressId]);

    // --- MODIFIED Handle Completion ---
    // Now navigates to summary page, passing results and necessary IDs
    // highlight-start
    const handleActivityComplete = (finalScore, finalStatus, highestStreak, timeTaken) => {
        console.log(`Activity ${activityId} ended with status: ${finalStatus}. Score: ${finalScore}. Navigating to summary.`);
        navigate(
            '/student/activity-summary', // New route for the summary page
            {
                state: {
                    // Data for display and potential submission
                    score: finalScore,
                    status: finalStatus, // 'COMPLETED' or 'FAILED'
                    highestStreak: highestStreak,
                    timeTaken: timeTaken,
                    activityType: activityData?.activityType, // Pass activity type if needed
                    // IDs needed for potential submission or restart
                    lessonProgressId: lessonProgressId,
                    activityNodeTypeId: activityData?.activityNodeTypeId || parseInt(activityId), // Use fetched or param ID
                    studentId: authState.user?.identifier,
                    // IDs needed for navigation (Restart/Continue)
                    lessonId: lessonId,
                    activityId: activityId,
                    classroomId: classroomId // Pass classroomId if available and needed for "Continue" button
                }
            }
        );
    };
    // highlight-end

    // --- Render Logic (Pass modified onComplete) ---
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 {/* Loading and Error states remain the same */}
                {isLoading && <CircularProgress sx={{ mt: 4 }} />}
                {error && !isLoading && ( /* ... error Alert ... */
                     <Alert severity="error" sx={{ mt: 4, width: '100%', maxWidth: '600px' }}>
                         {error}
                         <Button onClick={() => navigate(-1)} sx={{ ml: 2, mt: 1 }}>Go Back</Button>
                    </Alert>
                )}

                {/* Render Game Logic - pass the modified onComplete handler */}
                {!isLoading && !error && activityData && lessonProgressId && authState.user?.identifier && (
                    <>
                        <Typography variant="h4" gutterBottom sx={{ my: 2, color: '#451513', textAlign: 'center' }}>
                           Activity Time!
                        </Typography>
                        <ActivityGameLogic
                            key={activityId}
                            questions={activityData.questions || []}
                            activityType={activityData.activityType}
                            // Removed IDs no longer needed as props here
                            onComplete={handleActivityComplete} // Pass the updated handler
                        />
                    </>
                )}
                 {!isLoading && !error && !activityData && ( /* ... no data message ... */
                    <Typography sx={{ mt: 4 }}>No activity data found or loaded.</Typography>
                 )}
            </Box>
        </Box>
    );
};

export default ActivityPage;