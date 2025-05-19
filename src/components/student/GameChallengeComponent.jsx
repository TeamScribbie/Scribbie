import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Alert, Typography, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getChallengeQuestions, startChallengeAttempt } from '../../services/challengeService'; // Assuming path is correct
import GameChallengeLogic from './GameChallengeLogic'; // Assuming path is correct
import LiveLeaderboard from './LiveLeaderboard'; // Assuming path is correct

const GameChallengeComponent = ({ lessonDefinitionId, onChallengeEnd }) => {
    const { authState } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [challengeConfig, setChallengeConfig] = useState(null);
    const [challengeProgressId, setChallengeProgressId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State to hold the current player's live score, updated by GameChallengeLogic
    const [currentPlayersLiveScore, setCurrentPlayersLiveScore] = useState(0);

    const initializeChallenge = useCallback(async () => {
        if (!lessonDefinitionId || !authState.token || !authState.user?.identifier) {
            setError("Missing necessary information to start the challenge. Please ensure you are logged in and the lesson is correctly identified.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Step 1: Start/Get Challenge Attempt (also gets config)
            console.log("GameChallengeComponent: Starting challenge attempt for lessonDefinitionId:", lessonDefinitionId);
            const progressData = await startChallengeAttempt(lessonDefinitionId, authState.token);
            if (!progressData || !progressData.challengeProgressId || !progressData.challengeConfig) {
                throw new Error("Failed to initialize challenge: Invalid data received from server when starting attempt.");
            }
            setChallengeProgressId(progressData.challengeProgressId);
            setChallengeConfig(progressData.challengeConfig);
            console.log("GameChallengeComponent: Challenge attempt started/retrieved. Progress ID:", progressData.challengeProgressId, "Config:", progressData.challengeConfig);

            // Step 2: Fetch Questions
            console.log("GameChallengeComponent: Fetching challenge questions for lessonDefinitionId:", lessonDefinitionId);
            const fetchedQuestions = await getChallengeQuestions(lessonDefinitionId, authState.token);
             if (!Array.isArray(fetchedQuestions)) { // Check if it's an array even if empty
                console.warn("Challenge questions data is not an array or is missing. Challenge might start with no questions.", fetchedQuestions);
                setQuestions([]); // Set to empty array to prevent errors in GameChallengeLogic
            } else if (fetchedQuestions.length === 0) {
                console.warn("No questions found for this challenge. The challenge will start with an empty set.");
                setQuestions([]);
            }
             else {
                setQuestions(fetchedQuestions);
            }
            console.log("GameChallengeComponent: Questions fetched/processed.");

        } catch (err) {
            console.error("Failed to initialize challenge or fetch questions:", err);
            setError(err.message || "An unexpected error occurred while starting the challenge.");
        } finally {
            setIsLoading(false);
        }
    }, [lessonDefinitionId, authState.token, authState.user?.identifier]);

    useEffect(() => {
        initializeChallenge();
    }, [initializeChallenge]);

    const handleChallengeComplete = (finalScore, finalHighestStreak, finalQuestionsAnswered, finalStatus, timeTaken) => {
        console.log("GameChallengeComponent: Challenge ended in Logic.", { finalScore, finalHighestStreak, finalQuestionsAnswered, finalStatus, timeTaken });
        // Call the onChallengeEnd prop passed by ChallengePage to navigate to summary
        onChallengeEnd({
            challengeProgressId, // The ID of the current attempt
            score: finalScore,
            highestStreak: finalHighestStreak,
            questionsAnswered: finalQuestionsAnswered,
            status: finalStatus, // 'COMPLETED' or 'FAILED'
            lessonDefinitionId, // For retrying or context
            timeTaken,
        });
    };
    
    // Callback for GameChallengeLogic to update the live score for the leaderboard
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
                <Typography fontWeight="bold">Error Loading Challenge</Typography>
                <Typography>{error}</Typography>
                {/* Optional: Add a button to retry or go back */}
            </Alert>
        );
    }

    if (!challengeConfig || !challengeProgressId) {
        return (
            <Alert severity="warning" sx={{m: 2, p: 2}}>
                 <Typography fontWeight="bold">Challenge Not Ready</Typography>
                 <Typography>Challenge configuration could not be loaded. Please try refreshing or going back to the lesson page.</Typography>
            </Alert>
        );
    }
    
    // Handle case where questions array might be empty after attempting to load
    if (questions.length === 0 && !isLoading) { // Ensure not still loading
        return (
            <Box sx={{ textAlign: 'center', mt: 4, p: 2 }}>
                <Typography variant="h6" color="text.secondary">
                    No questions are available for this challenge at the moment.
                </Typography>
                {/* Provide a way for the user to navigate away if the challenge can't be played */}
                <Button 
                    onClick={() => onChallengeEnd({ // Trigger onChallengeEnd with minimal data or a specific status
                        challengeProgressId: null, // Or the current ID if it exists
                        score: 0,
                        highestStreak: 0,
                        questionsAnswered: 0,
                        status: 'NO_QUESTIONS', // Custom status
                        lessonDefinitionId,
                        timeTaken: 0,
                    })} 
                    sx={{mt: 2, bgcolor: '#451513', color: 'white', '&:hover': {bgcolor: '#5d211f'}}}
                    variant="contained"
                >
                    Back to Lessons
                </Button>
            </Box>
        );
    }

    return (
        <Grid container spacing={2} sx={{ p: { xs: 1, sm: 2}, alignItems: 'flex-start', justifyContent:'center', width: '100%' }}>
            {/* Main Game Logic Area */}
            <Grid item xs={12} md={8} sx={{display: 'flex', justifyContent:'center', order: {xs: 2, md: 1} /* Game below leaderboard on small screens */ }}>
                {questions.length > 0 && challengeConfig && ( // Ensure questions are loaded
                    <GameChallengeLogic
                        key={challengeProgressId} // Ensures re-mount if challenge attempt changes
                        questions={questions}
                        challengeConfig={challengeConfig}
                        onChallengeComplete={handleChallengeComplete}
                        onScoreUpdate={handleScoreUpdateFromLogic} // Pass the callback here
                    />
                )}
            </Grid>
            {/* Leaderboard Area */}
            <Grid item xs={12} md={4} sx={{display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mt: {xs: 2, md: 0}, order: {xs: 1, md: 2} /* Leaderboard above game on small screens */}}>
                {lessonDefinitionId && ( // Ensure lessonDefinitionId is present before rendering leaderboard
                    <LiveLeaderboard
                        lessonDefinitionId={lessonDefinitionId}
                        currentPlayerLocalScore={currentPlayersLiveScore} // Use the state updated by GameChallengeLogic
                        onInitialLoadError={(leaderboardError) => { 
                            // Optional: Handle leaderboard-specific load errors differently if needed
                            console.warn("Leaderboard initial load error:", leaderboardError);
                            // Could set a specific state for leaderboard error to show a message like "Leaderboard unavailable"
                        }}
                    />
                )}
            </Grid>
        </Grid>
    );
};

GameChallengeComponent.propTypes = {
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChallengeEnd: PropTypes.func.isRequired, // Callback when challenge finishes (completed, failed, or error)
};

export default GameChallengeComponent;