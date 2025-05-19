import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Container, Paper } from '@mui/material';
import Navbar from '../../components/layout/navbar';
import GameChallengeComponent from '../../components/student/GameChallengeComponent'; // Corrected path

const ChallengePage = () => {
    const { lessonDefinitionId } = useParams(); // Get lessonDefinitionId from URL
    const navigate = useNavigate();
    const location = useLocation(); // To get classroomId if passed for back navigation

    const classroomId = location.state?.classroomId; // Retrieve if passed

    const handleChallengeEnd = (results) => {
        // Results contain { challengeProgressId, score, highestStreak, questionsAnswered, status, lessonDefinitionId, timeTaken }
        console.log("ChallengePage: Challenge ended. Results:", results);
        // Navigate to a summary page, passing all necessary results
        navigate('/student/challenge-summary', {
            state: {
                ...results,
                classroomId: classroomId, // Pass classroomId along for back navigation from summary
            }
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
            <Navbar />
            <Container component="main" sx={{ flexGrow: 1, py: 3, mt: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={2} sx={{p: {xs: 1, sm: 2}, mb: 3, bgcolor: '#FFD966', width: '100%', maxWidth: 'md'}}>
                    <Typography variant="h4" component="h1" sx={{ textAlign: 'center', color: '#451513', fontWeight: 'bold' }}>
                        Lesson Challenge!
                    </Typography>
                    {/* Optionally display lesson title here if fetched */}
                </Paper>

                {lessonDefinitionId ? (
                    <GameChallengeComponent
                        lessonDefinitionId={lessonDefinitionId}
                        onChallengeEnd={handleChallengeEnd}
                    />
                ) : (
                    <Typography color="error">Lesson Definition ID is missing.</Typography>
                )}
            </Container>
        </Box>
    );
};

export default ChallengePage;