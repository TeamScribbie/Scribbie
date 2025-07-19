// Path: AI Context/Frontend/page/student/ActivityPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import QuizMcqGame from '../../components/student/QuizMcqGame'

// GAMEMODESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
import ReadingGameComponent from '../../components/student/ReadingGameComponent';
import FillBlanksGameComponent from '../../components/student/FillBlanksGameComponent';
import Matching2GameComponent from '../../components/student/Matching2GameComponent';
import ReadingDefenderComponent from '../../components/student/ReadingDefenderComponent';
import WordFeastGame from '../../components/student/WordFeast/WordFeast';
// GAMEMODESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS

import FlipMatchingGame from '../../components/student/FlipMatchingGame';
import { getActivityNodeTypeDetails } from '../../services/activityService';
import { CircularProgress, Alert, Typography, Box, Button } from '@mui/material';

// Import the background music
import challengeBGMusic from '../../assets/sounds/activitybgmusic.ogg';

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

    // --- Music control effect ---
    useEffect(() => {
        const audio = new Audio(challengeBGMusic);
        audio.loop = true; // Loop the music
        audio.volume = 0.5; // Adjust volume as needed (0.0 to 1.0)

        // Play the music when the component mounts
        audio.play().catch(e => console.error("Error playing background music:", e));

        // Pause and clean up the audio when the component unmounts
        return () => {
            audio.pause();
            audio.currentTime = 0; // Reset time for next play
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount
    // --- End music control effect ---

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
            if (!data || !data.activityType) {
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
                case 'MATCHING':
                    return (
                        <QuizMcqGame
                            questions={activityDetails.questions || []}
                            onGameComplete={handleGameComplete}
                            activityTitle={gameTitle}
                            activityInstructions={gameInstructions}
                            classroomId={classroomId}
                            lessonDefinitionId={lessonDefinitionId}
                        />
                    );
                case 'READING':
                    return (
                        <ReadingGameComponent
                            activityData={activityDetails}
                            onGameComplete={handleGameComplete}
                            activityTitle={gameTitle}
                            activityInstructions={gameInstructions}
                            classroomId={classroomId}
                            lessonDefinitionId={lessonDefinitionId}
                        />
                    );
                case 'FILL_BLANKS':
                    return (
                        <FillBlanksGameComponent 
                            activityData={activityDetails}
                            onGameComplete={handleGameComplete}
                            activityTitle={gameTitle}
                            activityInstructions={gameInstructions}
                            classroomId={classroomId}
                            lessonDefinitionId={lessonDefinitionId}
                        />
                    );
                case 'MATCHING2':
                    return (
                        <Matching2GameComponent
                            questions={activityDetails.questions || []} // Or specific data structure for MATCHING2
                            onGameComplete={handleGameComplete}
                            activityTitle={gameTitle}
                            activityInstructions={gameInstructions}
                            classroomId={classroomId}
                            lessonDefinitionId={lessonDefinitionId}
                        />
                    );
                case 'BALLOONGAME':
                    console.log("🔍 Activity Details:", activityDetails);
                    console.log("📦 Questions:", activityDetails?.questions);
                    return (
                        <ReadingDefenderComponent
                            questions={activityDetails.questions || []}
                            onGameComplete={handleGameComplete}
                            activityTitle={gameTitle}
                            activityInstructions={gameInstructions}
                            classroomId={classroomId}
                            lessonDefinitionId={lessonDefinitionId}
                        />
                    );
                case 'MEMORYGAME':
                    return (
                        <FlipMatchingGame
                            questions={activityDetails.questions}
                            onGameComplete={handleGameComplete}
                            activityTitle={gameTitle}
                            activityInstructions={gameInstructions}
                            classroomId={classroomId}
                            lessonDefinitionId={lessonDefinitionId}
                        />
                    );
                case 'WORDFEAST':
                    return (
                        <WordFeastGame
                            questions={activityDetails.questions || []}
                            onGameComplete={handleGameComplete}
                            activityTitle={gameTitle}
                            activityInstructions={gameInstructions}
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
        <Box 
            sx={{ 
                width: '100vw', 
                height: '100vh', 
                bgcolor: '#FFFBE0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* The renderGameArea handles displaying the actual game or loading/error states. */}
            {renderGameArea()} 
        </Box>
    );
};

export default ActivityPage;