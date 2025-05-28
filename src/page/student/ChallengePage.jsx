// src/page/student/ChallengePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Container, Paper, CircularProgress, Alert, Button } from '@mui/material';
import Navbar from '../../components/layout/navbar'; // Assuming Navbar is not part of the immersive game screen
import HealthBasedChallenge from '../../components/student/HealthBasedChallenge';
import { useAuth } from '../../context/AuthContext';
import { getChallengeConfigurationForLesson, getChallengeQuestions } from '../../services/challengeService';

const ChallengePage = () => {
    const { lessonDefinitionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { authState } = useAuth();

    const classroomId = location.state?.classroomId;
    const lessonTitleFromState = location.state?.lessonTitle; // Passed from LessonPage

    const [challengeConfig, setChallengeConfig] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchChallengeData = useCallback(async () => {
        if (!lessonDefinitionId || !authState.token) {
            setError("Required information is missing to load the challenge.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log(`ChallengePage: Fetching config for lessonDefId: ${lessonDefinitionId}`);
            const config = await getChallengeConfigurationForLesson(lessonDefinitionId, authState.token);
            if (!config) {
                throw new Error("Challenge not configured for this lesson. Please contact your teacher.");
            }
            setChallengeConfig(config); // This is ChallengeDefinitionResponseDto
            console.log("ChallengePage: Config fetched:", config);

            console.log(`ChallengePage: Fetching questions for lessonDefId: ${lessonDefinitionId}`);
            const fetchedQuestions = await getChallengeQuestions(lessonDefinitionId, authState.token);
             if (!Array.isArray(fetchedQuestions) || fetchedQuestions.length === 0) {
                // Even if config exists, if no questions, it's an issue for gameplay
                throw new Error("No questions available for this challenge. Please contact your teacher.");
            }
            setQuestions(fetchedQuestions);
            console.log("ChallengePage: Questions fetched:", fetchedQuestions.length);

        } catch (err) {
            console.error("ChallengePage: Error fetching challenge data:", err);
            setError(err.message || "Failed to load challenge data.");
        } finally {
            setIsLoading(false);
        }
    }, [lessonDefinitionId, authState.token]);

    useEffect(() => {
        fetchChallengeData();
    }, [fetchChallengeData]);

    const handleChallengeEnd = (results) => {
        console.log("ChallengePage: Challenge ended. Results:", results);
        navigate('/student/challenge-summary', {
            state: {
                ...results, // score, status, highestStreak, questionsAnswered, timeTaken
                lessonDefinitionId: lessonDefinitionId, // Ensure this is passed
                classroomId: classroomId,
                lessonTitle: challengeConfig?.lessonTitle || lessonTitleFromState || "Challenge", // Get lesson title from config if available
            }
        });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                {/* Navbar might be optional here if the game is truly fullscreen */}
                {/* <Navbar />  */}
                <Container component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: '60px' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading Challenge...</Typography>
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                {/* <Navbar /> */}
                <Container component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: '60px' }}>
                    <Alert severity="error" sx={{p:3}}>
                        <Typography variant="h6">Error Loading Challenge</Typography>
                        {error}
                        <Button onClick={() => navigate(classroomId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage')} sx={{mt:2}}>
                            Back to Lessons
                        </Button>
                    </Alert>
                </Container>
            </Box>
        );
    }
    
    if (!challengeConfig || questions.length === 0) {
         return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                <Container component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: '60px' }}>
                    <Alert severity="warning" sx={{p:3}}>
                        <Typography variant="h6">Challenge Not Ready</Typography>
                        <Typography>This challenge is not fully configured or has no questions. Please contact your teacher.</Typography>
                         <Button onClick={() => navigate(classroomId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage')} sx={{mt:2}}>
                            Back to Lessons
                        </Button>
                    </Alert>
                </Container>
            </Box>
        );
    }
    return (
        <> 
            {/* Navbar is intentionally omitted here for a more immersive game experience as requested */}
            {challengeConfig.challengeType === 'HEALTH_BASED' && (
                <HealthBasedChallenge
                    questions={questions}
                    challengeConfig={challengeConfig} // Pass ChallengeDefinitionResponseDto
                    onChallengeEnd={handleChallengeEnd}
                    lessonDefinitionId={lessonDefinitionId} // For leaderboard
                />
            )}
            {challengeConfig.challengeType !== 'HEALTH_BASED' && (
                 <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
                    <Container component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: '60px' }}>
                        <Alert severity="info">
                            Challenge type "{challengeConfig.challengeType}" is not yet implemented.
                             <Button onClick={() => navigate(classroomId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage')} sx={{mt:2}}>
                                Back to Lessons
                            </Button>
                        </Alert>
                    </Container>
                </Box>
            )}
        </>
    );
};

export default ChallengePage;