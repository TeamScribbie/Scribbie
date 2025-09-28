import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Alert, Typography, Box, Button } from '@mui/material';
import { getChallengeQuestions, getChallengeConfigurationForLesson } from '../../services/challengeService';
import challengeBGMusic from '../../assets/sounds/challengeBGMusic.ogg';

// Import all your game components
import ReadingDefenderComponent from '../../components/student/ReadingDefenderComponent';
import ReadingGameComponent from '../../components/student/ReadingGameComponent';
import FlipMatchingGame from '../../components/student/FlipMatchingGame'; // ✨ Import the Memory Game wrapper

const ChallengePage = () => {
    const { lessonDefinitionId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [challengeConfig, setChallengeConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- EFFECT TO FETCH DATA ---
    useEffect(() => {
        const fetchChallengeData = async () => {
            if (!lessonDefinitionId || !authState.token) {
                setError("Lesson ID or authentication token is missing.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Fetch challenge configuration first to know which game to load
                const config = await getChallengeConfigurationForLesson(lessonDefinitionId, authState.token);
                if (!config || !config.challengeType) {
                    throw new Error("This lesson does not have a challenge configured.");
                }
                setChallengeConfig(config);

                // Fetch the aggregated list of questions for the challenge
                const challengeQuestions = await getChallengeQuestions(lessonDefinitionId, authState.token);
                if (!challengeQuestions || challengeQuestions.length === 0) {
                     console.warn("No questions found for this challenge, but rendering game anyway.");
                     setQuestions([]); // Set to empty array if no questions
                } else {
                    setQuestions(challengeQuestions);
                }

            } catch (err) {
                console.error("Error fetching challenge data:", err);
                setError(err.message || "An error occurred while fetching challenge details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallengeData();
    }, [lessonDefinitionId, authState.token]);


    const handleGameComplete = (gameResults) => {
        navigate('/student/challenge-summary', {
            state: {
                ...gameResults,
                lessonDefinitionId: parseInt(lessonDefinitionId),
                 totalScore: gameResults.score, // Pass the score for the summary page
                 highestStreak: gameResults.highestStreak,
                 questionsAnswered: gameResults.questionsAnswered,
            }
        });
    };
    
    const handleBackNavigation = () => {
        navigate('/student-homepage');
    };

    if (isLoading) {
        return (
            <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100vw', height: '100vh', bgcolor: '#FFFBE0' }}>
                <CircularProgress size={50} />
                <Typography sx={{ mt: 2, color: '#451513' }}>Loading Challenge...</Typography>
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
                        Go Back
                    </Button>
                </Alert>
            </Box>
        );
    }

    if (!challengeConfig) {
        return (
             <Box sx={{ display:'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100%', height: '100%', p:2 }}>
               <Alert severity="info" sx={{ width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h6">Challenge Not Available</Typography>
                    <Typography>The challenge data could not be retrieved.</Typography>
                    <Button onClick={handleBackNavigation} variant="outlined" sx={{ mt: 2 }}>Go Back</Button>
               </Alert>
           </Box>
        );
    }

    // --- RENDER THE CORRECT GAME COMPONENT IN CHALLENGE MODE ---
    const gameProps = {
        questions: questions,
        onGameComplete: handleGameComplete,
        isChallengeMode: true, // Crucial prop!
    };

    // Determine which game to render based on the challenge configuration
    switch (challengeConfig.challengeType) {
        case 'BALLOONGAME': return <ReadingDefenderComponent {...gameProps} />;
        case 'READING':     return <ReadingGameComponent {...gameProps} />;
        case 'MEMORYGAME':  return <FlipMatchingGame {...gameProps} />;
        // Add other cases as you adapt more games for challenge mode
        default:
            return (
                <Box sx={{ display:'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Alert severity="warning" sx={{ m: 2 }}>
                        Unsupported challenge type: "{challengeConfig.challengeType}".
                        <Button onClick={handleBackNavigation} variant="outlined" sx={{ mt: 2, ml:1 }}>Go Back</Button>
                    </Alert>
                </Box>
            );
    }
};

export default ChallengePage;