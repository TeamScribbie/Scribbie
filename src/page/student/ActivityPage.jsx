import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Alert, Typography, Box, Button } from '@mui/material';
import { getActivityNodeTypeDetails } from '../../services/activityService';
import MemoryGame from '../../page/student/MemoryGame';
import challengeBGMusic from '../../assets/sounds/activitybgmusic.ogg';

// Import all your game components
import ReadingGameComponent from '../../components/student/ReadingGameComponent';
import FillBlanksGameComponent from '../../components/student/FillBlanksGameComponent';
import Matching2GameComponent from '../../components/student/Matching2GameComponent';
import ReadingDefenderComponent from '../../components/student/ReadingDefenderComponent';
import WordFeastGame from '../../components/student/WordFeastGame';
import FlipMatchingGame from '../../components/student/FlipMatchingGame';
import QuizMcqGame from '../../components/student/QuizMcqGame'; // This import was added during the merge resolution

const ActivityPage = () => {
    const { lessonDefinitionId, activityNodeTypeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [activityDetails, setActivityDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { lessonProgressId, classroomId, activityTitle, activityInstructions } = location.state || {};

    // --- EFFECT TO FETCH DATA ---
    useEffect(() => {
        const fetchActivityDetails = async () => {
            if (!activityNodeTypeId || !authState.token) {
                setError("Activity Node ID or authentication token is missing.");
                setIsLoading(false);
                return;
            }
            if (!lessonProgressId) {
                setError("Lesson progress information is missing. Please ensure the lesson was started correctly.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const data = await getActivityNodeTypeDetails(activityNodeTypeId, authState.token);
                if (!data || !data.activityType) {
                    throw new Error("Invalid activity data received from the server.");
                }
                setActivityDetails(data);
            } catch (err) {
                console.error("Error fetching activity details:", err);
                setError(err.message || "An error occurred while fetching activity details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivityDetails();
    }, [activityNodeTypeId, authState.token, lessonProgressId]); // Dependencies are now stable primitive values


    const handleGameComplete = (gameResults) => {
        navigate('/student/activity-summary', {
            state: {
                ...gameResults,
                lessonProgressId,
                activityNodeTypeId: parseInt(activityNodeTypeId),
                studentId: authState.user?.identifier,
                lessonDefinitionId: parseInt(lessonDefinitionId),
                classroomId,
                activityTitle: activityDetails?.activityTitle || activityTitle || "Activity",
            }
        });
    };
    
    const handleBackNavigation = () => {
        navigate(classroomId && lessonDefinitionId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage');
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100vw', height: '100vh', p:2, bgcolor: '#FFFBE0' }}>
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

    if (!activityDetails) {
        return (
            <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100%', height: '100%', p:2 }}>
               <Alert severity="info" sx={{ width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h6">Activity Not Loaded</Typography>
                    <Typography>The activity data could not be retrieved.</Typography>
                    <Button onClick={handleBackNavigation} variant="outlined" sx={{ mt: 2 }}>Go Back to Lessons</Button>
               </Alert>
           </Box>
        );
    }

    // --- RENDER THE CORRECT GAME COMPONENT ---
    const gameProps = {
        questions: activityDetails.questions || [],
        onGameComplete: handleGameComplete,
        activityTitle: activityDetails.activityTitle || activityTitle,
        activityInstructions: activityDetails.instructions || activityInstructions,
        classroomId,
        lessonDefinitionId,
difficulty: activityDetails.flagA || 'easy',
        isChallengeMode: false, // Explicitly false for normal activities
    };

    const renderActivity = () => {
        switch (activityDetails.activityType) {
            case 'MATCHING':    return <QuizMcqGame {...gameProps} />;
            case 'READING':     return <ReadingGameComponent activityData={activityDetails} {...gameProps} />;
            case 'FILL_BLANKS': return <FillBlanksGameComponent activityData={activityDetails} {...gameProps} />;
            case 'MATCHING2':   return <Matching2GameComponent {...gameProps} />;
            case 'BALLOONGAME': return <ReadingDefenderComponent {...gameProps} />;
            case 'MEMORYGAME':  return <FlipMatchingGame {...gameProps} />; // Kept from Challenge branch
            case 'WORDFEAST':   return <WordFeastGame {...gameProps} />;
            default:
                return (
                    <Box sx={{ display:'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                        <Alert severity="warning" sx={{ m: 2 }}>
                            Unsupported activity type: "{activityDetails.activityType}".
                            <Button onClick={handleBackNavigation} variant="outlined" sx={{ mt: 2, ml:1 }}>Go Back</Button>
                        </Alert>
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ 
            width: '100vw', 
            height: '100vh', 
            overflow: 'hidden',
            margin: 0,
            padding: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }}>
            {renderActivity()}
        </Box>
    );

};

export default ActivityPage;