// src/page/student/ActivityPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar'; // Assuming Navbar is appropriately styled
import ActivityGameLogic from '../../components/student/ActivityGameLogic';
import { getActivityNodeTypeDetails } from '../../services/activityService';
import { CircularProgress, Alert, Typography, Box, Button } from '@mui/material';

const ActivityPage = () => {
    const { lessonId, activityId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [activityData, setActivityData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const lessonProgressId = location.state?.lessonProgressId;
    const classroomId = location.state?.classroomId;
    const activityInstructions = location.state?.activityInstructions;


    const fetchActivityData = useCallback(async () => {
        if (!activityId || !authState.token) {
            setError("Activity ID or authentication token is missing.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await getActivityNodeTypeDetails(activityId, authState.token);
            if (!data || typeof data.questions === 'undefined' || !data.activityType) {
                throw new Error("Received invalid data structure from server.");
            }
            setActivityData(data);
        } catch (err) {
            setError(err.message || "An error occurred while fetching activity details.");
        } finally {
            setIsLoading(false);
        }
    }, [activityId, authState.token]);

    useEffect(() => {
        if (!lessonProgressId) {
            setError("Could not start activity: Missing progress ID. Please go back and start the lesson again.");
            setIsLoading(false);
            return;
        }
        if (activityId && authState.token) {
            fetchActivityData();
        } else if (!authState.token) {
            setError("Authentication token not available. Please log in.");
            setIsLoading(false);
        } else if (!activityId) {
            setError("Activity ID not available. Cannot fetch details.");
            setIsLoading(false);
        }
    }, [activityId, authState.token, lessonProgressId, fetchActivityData]);

    const handleActivityComplete = (finalScore, finalStatus, highestStreak, timeTaken) => {
        const activityNodeTypeActualId = activityData?.activityNodeTypeId || parseInt(activityId);
        const activityTypeActual = activityData?.activityType;
        navigate('/student/activity-summary', {
            state: {
                score: finalScore,
                status: finalStatus,
                highestStreak: highestStreak,
                timeTaken: timeTaken,
                activityType: activityTypeActual,
                lessonProgressId: lessonProgressId,
                activityNodeTypeId: activityNodeTypeActualId,
                studentId: authState.user?.identifier,
                lessonId: lessonId,
                activityId: activityId,
                classroomId: classroomId
            }
        });
    };
    
    const handleBackNavigation = () => {
        navigate(classroomId && lessonId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage');
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100vw',
            height: '100vh',
            bgcolor: '#FFFBE0',
            overflow: 'hidden' // Page itself should not scroll
        }}>
            <Navbar /> {/* Assuming Navbar has a fixed height (e.g., 60px) */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: { xs: 1, sm: 2, md: 3 },
                    marginTop: '60px', // Account for fixed Navbar height
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center', // Center game content vertically
                    overflow: 'auto', // Allows internal scrolling for game content if it's too tall
                    width: '100%' // Main content area takes full width from parent
                }}
            >
                {isLoading && (
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 1 }}>Loading Activity...</Typography>
                    </Box>
                )}
                
                {error && !isLoading && (
                     <Alert severity="error" sx={{ m: 2, width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                         <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>Error Loading Activity</Typography>
                         <Typography variant="body2" component="div" sx={{ mt: 1 }}>{error}</Typography>
                         <Button onClick={handleBackNavigation} variant="contained" sx={{ mt: 2 }}>Go Back</Button>
                    </Alert>
                )}

                {!isLoading && !error && activityData && lessonProgressId && authState.user?.identifier && (
                    // This Box wraps the game title and the game logic component.
                    // It's centered by its parent.
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h4" gutterBottom sx={{
                            my: {xs: 1, sm: 2}, p:1, borderRadius:1, bgcolor: 'rgba(255,232,163,0.7)',
                            color: '#451513', textAlign: 'center', fontWeight: 'bold',
                            fontSize: {xs: '1.2rem', md: '1.5rem'},
                            width: '100%', maxWidth: '700px' // Title can also have a max-width
                        }}>
                           {activityInstructions || activityData.instructions || "Activity Time!"}
                        </Typography>
                        {/* ActivityGameLogic is rendered here. Its own internal styling will determine its width. */}
                        <ActivityGameLogic
                            key={activityData.activityNodeTypeId + '-' + lessonProgressId}
                            questions={activityData.questions || []}
                            activityType={activityData.activityType}
                            onComplete={handleActivityComplete}
                        />
                    </Box>
                )}
                
                {!isLoading && !error && !activityData && (
                    <Typography sx={{ mt: 4 }}>No activity data to display.</Typography>
                 )}
            </Box>
        </Box>
    );
};

export default ActivityPage;