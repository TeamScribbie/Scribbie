// src/components/student/ActivityGameLogic.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import mascot from '../../assets/duh.png';
import confetti from 'canvas-confetti';
import { Button, Typography, Box, CircularProgress, Alert } from '@mui/material';
// Remove the import for submitActivityProgress and useAuth, as submission happens on summary page
// import { submitActivityProgress } from '../../services/lessonService';
// import { useAuth } from '../../context/AuthContext';

const ActivityGameLogic = ({
    questions,
    activityType,
    // Remove IDs related to submission as props, they'll be passed to summary page
    // lessonProgressId,
    // activityNodeTypeId,
    // studentId,
    onComplete // Callback: now receives onComplete(finalScore, finalStatus)
}) => {
    // --- State ---
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [highestRecordedStreak, setHighestRecordedStreak] = useState(0); // Track max streak
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [activityFinished, setActivityFinished] = useState(false);
    const [startTime, setStartTime] = useState(Date.now()); // Keep start time

    const navigate = useNavigate(); // Keep navigate if needed for other things internally

    // Track highest streak
    useEffect(() => {
        if (streak > highestRecordedStreak) {
            setHighestRecordedStreak(streak);
        }
    }, [streak, highestRecordedStreak]);

    // --- Handle Answer Selection ---
    const handleAnswer = (choice) => {
        if (selectedChoice) return;

        setSelectedChoice(choice.choiceText);
        const correct = choice.isCorrect;
        setIsCorrect(correct);

        let currentStreak = streak;
        if (correct) {
            setScore((prev) => prev + 1000 + (currentStreak * 100));
            currentStreak++;
            setStreak(currentStreak);
        } else {
            setLives((prev) => prev - 1);
            setStreak(0);
            currentStreak = 0;
        }

        // --- Game End Logic ---
        // Check if game should end *after* processing the answer
        const currentLives = correct ? lives : lives - 1;
        const isLastQuestion = currentIndex + 1 >= questions.length;

        if (currentLives <= 0) {
             // Game Over - Call onComplete immediately
             console.log("Game Over triggered");
             const endTime = Date.now();
             const timeTaken = Math.round((endTime - startTime) / 1000);
             // Use highestRecordedStreak
             onComplete(score, 'FAILED', highestRecordedStreak, timeTaken);
             setGameOver(true); // Set state to stop further interaction
        } else if (isLastQuestion) {
             // Last question answered (and lives > 0) - Call onComplete immediately
             console.log("Activity Finished triggered");
             confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
             const endTime = Date.now();
             const timeTaken = Math.round((endTime - startTime) / 1000);
              // Use highestRecordedStreak
             onComplete(score, 'COMPLETED', highestRecordedStreak, timeTaken);
             setActivityFinished(true); // Set state to stop further interaction
        } else {
             // Move to next question after a delay
            setTimeout(() => {
                 setCurrentIndex(currentIndex + 1);
                 setSelectedChoice(null);
                 setIsCorrect(null);
            }, 1200);
        }
    };

    // --- REMOVED Submission Logic and useEffect for submission ---
    // Submission will now happen on the Summary Page

    // --- Render Logic ---

    // Don't render anything further if game has ended (onComplete has been called)
     if (gameOver || activityFinished) {
         // Optionally show a quick "Finished!" message before parent navigates away
         return (
             <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
                 <Typography variant="h5">{gameOver ? "Game Over!" : "Finished!"}</Typography>
                 <CircularProgress sx={{mt: 2}}/>
                 <Typography sx={{mt: 1}}>Loading summary...</Typography>
             </Box>
         );
     }


    // Render Active Game Question
    const currentQuestion = questions?.[currentIndex];
    if (!currentQuestion) {
        if (questions === null || questions === undefined) {
            return <CircularProgress />;
        }
        return <Alert severity="warning">No question data available or index out of bounds.</Alert>;
    }

    // (Keep the rendering code for the active game question - Score, Lives, Question Text, Mascot, Choices Buttons - as it was in the previous version)
    // ... Re-paste the Box container with Top Bar, Question Text, Mascot, Choices Grid here ...
     return (
        // Main Game View
        <Box sx={{ textAlign: 'center', p: [1, 2], width: '100%', maxWidth: '700px', bgcolor: '#FFFBE0', borderRadius: 2, boxShadow: 1 }}>
            {/* Top Bar: Score, Lives, Streak */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1, bgcolor: 'rgba(255, 255, 255, 0.7)', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#451513'}}>Score: {score.toLocaleString()}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {Array.from({ length: lives }).map((_, idx) => (
                        <span key={`life-${idx}`} style={{ color: 'red', fontSize: '1.5rem', textShadow: '1px 1px #888' }}>❤️</span>
                    ))}
                    {Array.from({ length: 3 - lives }).map((_, idx) => (
                         <span key={`lost-${idx}`} style={{ color: '#ccc', fontSize: '1.5rem' }}>♡</span>
                    ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span style={{ fontSize: '1.5rem', color: 'orange' }}>⚡</span>
                    <Typography variant="h6" sx={{ color: '#451513'}}>{streak}x</Typography>
                </Box>
            </Box>

            {/* Question Text */}
            <Typography variant="h5" sx={{ my: [2, 3], fontWeight: 'bold', color: '#451513', minHeight: '3em' }}>
                {currentQuestion.questionText}
            </Typography>

            {/* Optional: Mascot Image */}
            <img src={mascot} alt="Mascot" style={{ height: '100px', marginBottom: '20px' }} />

            {/* Choices Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: ['1fr', '1fr 1fr'], gap: ['10px', '15px'], maxWidth: '600px', margin: '20px auto 0' }}>
                {(currentQuestion.choices || []).map((choice) => {
                    let buttonStyles = {};
                    if (selectedChoice === choice.choiceText) {
                        buttonStyles = isCorrect
                            ? { bgcolor: '#4CAF50', color: 'white', '&:hover': { bgcolor: '#388E3C'} }
                            : { bgcolor: '#F44336', color: 'white', '&:hover': { bgcolor: '#D32F2F'} };
                    } else if (selectedChoice && !choice.isCorrect) {
                         buttonStyles = { opacity: 0.6 };
                    } else if (selectedChoice && choice.isCorrect) {
                         buttonStyles = { bgcolor: '#4CAF50', color: 'white' };
                    }
                    return (
                        <Button
                            key={choice.choiceId}
                            onClick={() => handleAnswer(choice)}
                            disabled={!!selectedChoice}
                            variant="contained"
                            sx={{ /* --- Paste previous button styles here --- */
                                padding: ['12px', '15px'],
                                borderRadius: '10px',
                                border: `2px solid #451513`,
                                bgcolor: '#FFE9A7',
                                color: '#451513',
                                fontSize: ['0.9rem', '1rem'],
                                fontWeight: 'bold',
                                textTransform: 'none',
                                transition: 'background-color 0.3s, opacity 0.3s',
                                '&:hover': {
                                    bgcolor: '#FFD966',
                                    boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
                                },
                                '&:disabled': {
                                    opacity: 1,
                                    color: 'white', // Adjust if needed based on buttonStyles
                                },
                                ...buttonStyles // Apply dynamic styles
                             }}
                        >
                            {choice.choiceText}
                        </Button>
                    );
                 })}
            </Box>
        </Box>
    );
};

// --- Updated PropTypes ---
ActivityGameLogic.propTypes = {
    questions: PropTypes.arrayOf(PropTypes.shape({
        questionId: PropTypes.number.isRequired,
        questionText: PropTypes.string.isRequired,
        choices: PropTypes.arrayOf(PropTypes.shape({
            choiceId: PropTypes.number.isRequired,
            choiceText: PropTypes.string.isRequired,
            isCorrect: PropTypes.bool
        })),
    })),
    activityType: PropTypes.string,
    // Remove IDs from props
    // lessonProgressId: PropTypes.number.isRequired,
    // activityNodeTypeId: PropTypes.number.isRequired,
    // studentId: PropTypes.string.isRequired,
    onComplete: PropTypes.func.isRequired, // Callback: onComplete(finalScore, finalStatus, highestStreak, timeTaken)
};

ActivityGameLogic.defaultProps = {
    questions: [],
    activityType: 'QUIZ_MCQ',
};

export default ActivityGameLogic;