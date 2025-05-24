import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Alert, Typography, Grid, Button } from '@mui/material'; // Added Button
import { useAuth } from '../../context/AuthContext';
import { 
    getChallengeQuestions, 
    // startChallengeAttempt, 
    getChallengeConfigurationForLesson // Assuming you might need this separately
} from '../../services/challengeService'; 
import GameChallengeLogic from './GameChallengeLogic'; 
import LiveLeaderboard from './LiveLeaderboard'; 

const GameChallengeComponent = ({ lessonDefinitionId, onChallengeEnd }) => {
    const { authState } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [challengeConfig, setChallengeConfig] = useState(null);
    // const [challengeProgressId, setChallengeProgressId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPlayersLiveScore, setCurrentPlayersLiveScore] = useState(0);

    const initializeChallengeData = useCallback(async () => {
        if (!lessonDefinitionId || !authState.token || !authState.user?.identifier) {
            setError("Missing necessary information to start the challenge. Please ensure you are logged in and the lesson is correctly identified.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Step 1: Fetch Challenge Configuration (if not part of questions endpoint response)
            // If your getChallengeQuestions endpoint already returns the config, you might not need a separate call.
            // For now, assuming we might need it or it's good to have explicitly.
            console.log("GameChallengeComponent: Fetching challenge configuration for lessonDefinitionId:", lessonDefinitionId);
            const configData = await getChallengeConfigurationForLesson(lessonDefinitionId, authState.token);
            if (!configData) { // configData could be null if no challenge is set up
                throw new Error("Challenge not configured for this lesson. Please ask your teacher to set it up.");
            }
            setChallengeConfig(configData); // configData is ChallengeDefinitionResponseDto
            console.log("GameChallengeComponent: Configuration fetched:", configData);

            // Step 2: Fetch Questions
            console.log("GameChallengeComponent: Fetching challenge questions for lessonDefinitionId:", lessonDefinitionId);
            const fetchedQuestions = await getChallengeQuestions(lessonDefinitionId, authState.token);
            if (!Array.isArray(fetchedQuestions)) {
                console.warn("Challenge questions data is not an array or is missing.", fetchedQuestions);
                setQuestions([]);
            } else {
                setQuestions(fetchedQuestions);
            }
            console.log("GameChallengeComponent: Questions fetched.");

            // Step 3: NOW Start/Get Challenge Attempt to get a progress ID
            // This is called after successfully loading config and questions.
            console.log("GameChallengeComponent: Starting/getting challenge attempt for lessonDefinitionId:", lessonDefinitionId);
            // const progressData = await startChallengeAttempt(lessonDefinitionId, authState.token);
            // if (!progressData || !progressData.challengeProgressId) { // Also check if config is part of progressData if needed
            //     throw new Error("Failed to initialize challenge progress: Invalid data received.");
            // }
            // setChallengeProgressId(progressData.challengeProgressId);
            // // If startChallengeAttempt returns the config, you can update it here too
            // // setChallengeConfig(progressData.challengeConfig || configData); 
            // console.log("GameChallengeComponent: Challenge attempt active. Progress ID:", progressData.challengeProgressId);

        } catch (err) {
            console.error("Failed to initialize challenge data:", err);
            setError(err.message || "An unexpected error occurred while preparing the challenge.");
            // If config fetch failed, challengeConfig might be null, GameChallengeLogic should handle this
            if (err.message.includes("Challenge not configured")) { // More specific error handling
                 setQuestions([]); // Ensure questions are empty if config fails
            }
        } finally {
            setIsLoading(false);
        }
    }, [lessonDefinitionId, authState.token, authState.user?.identifier]);

    useEffect(() => {
        initializeChallengeData();
    }, [initializeChallengeData]);

    const handleChallengeComplete = (finalScore, finalHighestStreak, finalQuestionsAnswered, finalStatus, timeTaken) => {
        console.log("GameChallengeComponent: Challenge ended in Logic.", { finalScore, finalHighestStreak, finalQuestionsAnswered, finalStatus, timeTaken });
        onChallengeEnd({
            // challengeProgressId, 
            score: finalScore,
            highestStreak: finalHighestStreak,
            questionsAnswered: finalQuestionsAnswered,
            status: finalStatus, 
            lessonDefinitionId, 
            timeTaken,
        });
    };
    
    const handleScoreUpdateFromLogic = (newScore) => {
        setCurrentPlayersLiveScore(newScore);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', p: 2 }}>
                <CircularProgress />
                <Typography sx={{mt: 2, color: '#451513'}}>Loading Challenge...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{m: 2, p: 2}}>
                <Typography fontWeight="bold">Error Preparing Challenge</Typography>
                <Typography>{error}</Typography>
                <Button onClick={() => navigate(-1)} sx={{mt:1}}>Go Back</Button>
            </Alert>
        );
    }

    // If challengeConfig is missing after load attempt (e.g. 404 on getChallengeConfigurationForLesson)
    if (!challengeConfig && !isLoading) {
        return (
            <Alert severity="warning" sx={{m: 2, p: 2}}>
                 <Typography fontWeight="bold">Challenge Not Available</Typography>
                 <Typography>This lesson does not have a challenge configured, or it could not be loaded. Please contact your teacher.</Typography>
                 <Button onClick={() => navigate(-1)} sx={{mt:1}}>Go Back</Button>
            </Alert>
        );
    }
    
    // // If questions are empty but config loaded (and progress ID obtained)
    // if (questions.length === 0 && challengeConfig && challengeProgressId && !isLoading) { 
    //     return (
    //         <Box sx={{ textAlign: 'center', mt: 4, p: 2 }}>
    //             <Typography variant="h6" color="text.secondary">
    //                 No questions are available for this challenge at the moment, but the challenge is set up.
    //             </Typography>
    //              <Typography variant="body2" color="text.secondary" sx={{mb:2}}>
    //                 Please ask your teacher to add questions to this challenge.
    //             </Typography>
    //             <Button 
    //                 onClick={() => navigate(-1)}
    //                 sx={{mt: 2, bgcolor: '#451513', color: 'white', '&:hover': {bgcolor: '#5d211f'}}}
    //                 variant="contained"
    //             >
    //                 Back to Lessons
    //             </Button>
    //         </Box>
    //     );
    // }
    // If questions are empty but config loaded (and progress ID obtained)
    if (questions.length === 0 && challengeConfig && !isLoading) { 
        return (
            <Box sx={{ textAlign: 'center', mt: 4, p: 2 }}>
                <Typography variant="h6" color="text.secondary">
                    No questions are available for this challenge at the moment, but the challenge is set up.
                </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{mb:2}}>
                    Please ask your teacher to add questions to this challenge.
                </Typography>
                <Button 
                    onClick={() => navigate(-1)}
                    sx={{mt: 2, bgcolor: '#451513', color: 'white', '&:hover': {bgcolor: '#5d211f'}}}
                    variant="contained"
                >
                    Back to Lessons
                </Button>
            </Box>
        );
    }
    
    // Ensure all necessary data is present before rendering GameChallengeLogic
    // if (!challengeConfig || !challengeProgressId || questions.length === 0) {
    //      // This case should ideally be caught by earlier checks, but as a fallback:
    //     return (
    //         <Alert severity="info" sx={{m: 2, p: 2}}>
    //              <Typography fontWeight="bold">Preparing Challenge</Typography>
    //              <Typography>Still gathering all required data for the challenge. If this persists, please try again.</Typography>
    //              <Button onClick={() => initializeChallengeData()} sx={{mt:1}}>Retry Load</Button>
    //         </Alert>
    //     );
    // }
    if (!challengeConfig || questions.length === 0) {
         // This case should ideally be caught by earlier checks, but as a fallback:
        return (
            <Alert severity="info" sx={{m: 2, p: 2}}>
                 <Typography fontWeight="bold">Preparing Challenge</Typography>
                 <Typography>Still gathering all required data for the challenge. If this persists, please try again.</Typography>
                 <Button onClick={() => initializeChallengeData()} sx={{mt:1}}>Retry Load</Button>
            </Alert>
        );
    }


    return (
        <Grid container spacing={2} sx={{ p: { xs: 1, sm: 2}, alignItems: 'flex-start', justifyContent:'center', width: '100%' }}>
            <Grid item xs={12} md={8} sx={{display: 'flex', justifyContent:'center', order: {xs: 2, md: 1} }}>
                <GameChallengeLogic
                    // key={challengeProgressId} 
                    questions={questions}
                    challengeConfig={challengeConfig} // Pass the fetched config
                    // challengeProgressId={challengeProgressId} // Pass the progress ID
                    onChallengeComplete={handleChallengeComplete}
                    onScoreUpdate={handleScoreUpdateFromLogic} 
                />
            </Grid>
            <Grid item xs={12} md={4} sx={{display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mt: {xs: 2, md: 0}, order: {xs: 1, md: 2} }}>
                {lessonDefinitionId && ( 
                    <LiveLeaderboard
                        lessonDefinitionId={lessonDefinitionId}
                        currentPlayerLocalScore={currentPlayersLiveScore} 
                        onInitialLoadError={(leaderboardError) => { 
                            console.warn("Leaderboard initial load error:", leaderboardError);
                        }}
                    />
                )}
            </Grid>
        </Grid>
    );
};

GameChallengeComponent.propTypes = {
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChallengeEnd: PropTypes.func.isRequired, 
};

export default GameChallengeComponent;