// src/page/student/ActivityPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Navbar import is removed
import QuizMcqGame from '../../components/student/QuizMcqGame';
import { getActivityNodeTypeDetails } from '../../services/activityService';
import { CircularProgress, Alert, Typography, Box, Button } from '@mui/material';

const ActivityPage = () => {
    const { lessonDefinitionId, activityNodeTypeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [activityDetails, setActivityDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const lessonProgressId = location.state?.lessonProgressId;
    const classroomId = location.state?.classroomId;
    const activityTitleFromState = location.state?.activityTitle;
    const activityInstructionsFromState = location.state?.activityInstructions;

    const fetchActivityDetailsCallback = useCallback(async () => {
        if (!activityNodeTypeId || !authState.token) {
            setError("Activity Node ID or authentication token is missing.");
            setIsLoading(false); return;
        }
        if (!lessonProgressId) {
             setError("Lesson progress information is missing. Please ensure the lesson was started correctly.");
             setIsLoading(false); return;
        }
        setIsLoading(true); setError(null);
        try {
            const data = await getActivityNodeTypeDetails(activityNodeTypeId, authState.token);
            if (!data || !data.activityType || typeof data.questions === 'undefined') {
                throw new Error("Invalid activity data structure received from server.");
            }
            setActivityDetails(data);
        } catch (err) {
            setError(err.message || "An error occurred while fetching activity details.");
        } finally {
            setIsLoading(false);
        }
    }, [activityNodeTypeId, authState.token, lessonProgressId]);

    useEffect(() => {
        fetchActivityDetailsCallback();
    }, [fetchActivityDetailsCallback]);

    const handleGameComplete = (gameResults) => {
        navigate('/student/activity-summary', {
            state: {
                ...gameResults,
                lessonProgressId,
                activityNodeTypeId: parseInt(activityNodeTypeId),
                studentId: authState.user?.identifier,
                lessonDefinitionId: parseInt(lessonDefinitionId),
                classroomId,
                activityTitle: activityDetails?.activityTitle || activityTitleFromState || "Activity",
            }
        });
    };
    
    const handleBackNavigation = () => {
        // This function is now primarily for error states or if QuizMcqGame needs an exit prop
        navigate(classroomId && lessonDefinitionId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage');
    };

    const renderGameArea = () => {
        if (isLoading) {
            return (
                <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100%', height: '100%' }}>
                    <CircularProgress size={50} />
                    <Typography sx={{ mt: 2, color: '#451513' }}>Loading Activity...</Typography>
                </Box>
            );
        }

        if (error) {
            return (
                 <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100%', height: '100%', p:2 }}>
                    <Alert severity="error" sx={{ width: '100%', maxWidth: '600px' }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>Oops!</Typography>
                        <Typography variant="body2" component="div" sx={{ mt: 1 }}>{error}</Typography>
                        <Button onClick={handleBackNavigation} variant="contained" sx={{ mt: 2, bgcolor: '#451513', '&:hover': {bgcolor: '#5d211f'} }}>
                            Go Back to Lessons
                        </Button>
                    </Alert>
                </Box>
            );
        }

        if (activityDetails) {
            const gameTitle = activityDetails.activityTitle || activityTitleFromState || 'Activity Game';
            const gameInstructions = activityDetails.instructions || activityInstructionsFromState;

            switch (activityDetails.activityType) {
                case 'MATCHING': // Your MCQ game
                    return (
                        <QuizMcqGame
                            questions={activityDetails.questions || []}
                            onGameComplete={handleGameComplete}
                            activityTitle={gameTitle}
                            activityInstructions={gameInstructions}
                            // Pass classroomId and lessonDefinitionId for the game's internal back button
                            classroomId={classroomId}
                            lessonDefinitionId={lessonDefinitionId}
                        />
                    );
                default:
                    return (
                        <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100%', height: '100%', p:2 }}>
                            <Alert severity="warning" sx={{m: 2, width: '100%', maxWidth: '600px'}}>
                                Unsupported activity type: "{activityDetails.activityType}".
                                <Button onClick={handleBackNavigation} variant="outlined" sx={{ mt: 2, ml:1 }}>Go Back</Button>
                            </Alert>
                        </Box>
                    );
            }
        }

        return ( 
             <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100%', height: '100%', p:2 }}>
                <Alert severity="info" sx={{ width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h6">Activity Not Loaded</Typography>
                    <Typography>The activity data could not be retrieved.</Typography>
                    <Button onClick={handleBackNavigation} variant="outlined" sx={{ mt: 2 }}>Go Back to Lessons</Button>
                </Alert>
            </Box>
         );
    };

    return (
        // This Box now takes the full viewport height and width, and hides overflow.
        <Box 
            sx={{ 
                width: '100vw', 
                height: '100vh', 
                bgcolor: '#FFFBE0', // Background for the whole page
                display: 'flex',      // Use flex to make its child (the game area) fill it
                flexDirection: 'column',
                overflow: 'hidden',   // Prevent scrollbars on the page itself
            }}
        >
            {/* Navbar is removed */}
            {/* The game area will stretch to fill this Box */}
            {renderGameArea()} 
        </Box>
    );
};

export default ActivityPage;