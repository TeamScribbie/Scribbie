import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import ActivityGameLogic from '../../components/student/ActivityGameLogic';
import { getActivityNodeTypeDetails } from '../../services/activityService'; // Make sure this import is correct
import { CircularProgress, Alert, Typography, Box, Button } from '@mui/material';

const ActivityPage = () => {
    const { lessonId, activityId } = useParams(); // activityId is the activityNodeTypeId
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [activityData, setActivityData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // lessonProgressId is expected to be passed in location.state
    const lessonProgressId = location.state?.lessonProgressId;
    // classroomId might be needed for navigation, passed via location.state
    const classroomId = location.state?.classroomId;

    // --- MODIFIED Data Fetching ---
    const fetchActivityData = useCallback(async () => {
        if (!activityId || !authState.token) {
            setError("Activity ID or authentication token is missing.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null); // Clear previous errors

        try {
            console.log(`Workspaceing activity details for ActivityNodeType ID: ${activityId}`);
            // This is the actual API call
            const data = await getActivityNodeTypeDetails(activityId, authState.token);
            
            console.log("Fetched activity data:", data);

            // Validate if the necessary data structure is present
            // The backend DTO ActivityNodeTypeDetailDto ensures questions is a list (can be empty)
            // and other fields like activityType, instructions should exist.
            if (!data || typeof data.questions === 'undefined' || !data.activityType) {
                console.error("Fetched data is missing expected structure.", data);
                throw new Error("Received invalid data structure from server.");
            }
            
            setActivityData(data); 
        } catch (err) {
            console.error("Failed to fetch activity data:", err);
            // err.message might come from activityService (e.g., "Activity not found")
            // or a generic message if the fetch itself failed.
            setError(err.message || "An error occurred while fetching activity details.");
        } finally {
            setIsLoading(false);
        }
    }, [activityId, authState.token]); // Dependencies for useCallback

    useEffect(() => {
        if (!lessonProgressId) {
            console.error("Error: lessonProgressId not found in navigation state.");
            setError("Could not start activity: Missing progress ID. Please go back to the lesson page and start the lesson again.");
            setIsLoading(false);
            return;
        }
        
        // Only fetch if activityId and token are available
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
        console.log(`Activity ${activityId} ended with status: ${finalStatus}. Score: ${finalScore}. Navigating to summary.`);
        // Ensure activityData is available before trying to access its properties
        const activityNodeTypeActualId = activityData?.activityNodeTypeId || parseInt(activityId);
        const activityTypeActual = activityData?.activityType;

        navigate(
            '/student/activity-summary',
            {
                state: {
                    score: finalScore,
                    status: finalStatus,
                    highestStreak: highestStreak,
                    timeTaken: timeTaken,
                    activityType: activityTypeActual,
                    lessonProgressId: lessonProgressId,
                    activityNodeTypeId: activityNodeTypeActualId,
                    studentId: authState.user?.identifier,
                    lessonId: lessonId, // Original lessonId from params
                    activityId: activityId, // Original activityId from params (used for restart/identification)
                    classroomId: classroomId // Pass classroomId for "Continue Lesson" navigation from summary
                }
            }
        );
    };

    // --- Render Logic ---
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {isLoading && <CircularProgress sx={{ mt: 4 }} />}
                
                {error && !isLoading && (
                     <Alert severity="error" sx={{ mt: 4, width: '100%', maxWidth: '600px', textAlign:'center' }}>
                         <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                            Error Loading Activity
                         </Typography>
                         <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                            {error}
                         </Typography>
                         <Button 
                            onClick={() => navigate(classroomId && lessonId ? `/student/classroom/${classroomId}/lesson/${lessonId}` : -1)} 
                            variant="contained"
                            sx={{ mt: 2 }}
                         >
                            Go Back to Lesson
                         </Button>
                    </Alert>
                )}

                {!isLoading && !error && activityData && lessonProgressId && authState.user?.identifier && (
                    <>
                        <Typography variant="h4" gutterBottom sx={{ my: 2, color: '#451513', textAlign: 'center', fontWeight:'bold' }}>
                           {activityData.instructions || "Activity Time!"} {/* Display fetched instructions or a default */}
                        </Typography>
                        <ActivityGameLogic
                            // Use a key that depends on the actual loaded data to ensure re-initialization if data changes for the same route
                            key={activityData.activityNodeTypeId + '-' + lessonProgressId} 
                            questions={activityData.questions || []}
                            activityType={activityData.activityType}
                            onComplete={handleActivityComplete}
                        />
                    </>
                )}
                
                {/* Message if no data is loaded and not loading, and no error is actively displayed */}
                {!isLoading && !error && !activityData && (
                    <Typography sx={{ mt: 4 }}>No activity data to display. If you just started the lesson, try going back and clicking the activity again.</Typography>
                 )}
            </Box>
        </Box>
    );
};

export default ActivityPage;