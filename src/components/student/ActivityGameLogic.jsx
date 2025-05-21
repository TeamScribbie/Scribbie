// src/components/student/ActivityGameLogic.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import mascot from '../../assets/duh.png';
import confetti from 'canvas-confetti';
import { Button, Typography, Box, CircularProgress, Alert } from '@mui/material';

// Define keyframes for animations (can be moved to a CSS file)
const pulseAnimation = (isCorrect) => ({
    animation: `pulse-${isCorrect ? 'correct' : 'incorrect'} 0.6s ease-in-out`,
    '@keyframes pulse-correct': {
        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
        '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
    },
    '@keyframes pulse-incorrect': {
        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)' },
        '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' },
    }
});


const ActivityGameLogic = ({
    questions,
    activityType,
    onComplete
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [highestRecordedStreak, setHighestRecordedStreak] = useState(0);
    const [selectedChoiceText, setSelectedChoiceText] = useState(null); // Store the text of the selected choice
    const [isChoiceCorrect, setIsChoiceCorrect] = useState(null); // True if correct, false if incorrect, null otherwise
    const [gameOver, setGameOver] = useState(false);
    const [activityFinished, setActivityFinished] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());

    const navigate = useNavigate();

    useEffect(() => {
        if (streak > highestRecordedStreak) {
            setHighestRecordedStreak(streak);
        }
    }, [streak, highestRecordedStreak]);

    const handleAnswer = (choice) => {
        if (selectedChoiceText) return; // Already answered this question

        setSelectedChoiceText(choice.choiceText);
        const correct = choice.isCorrect;
        setIsChoiceCorrect(correct);

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

        const currentLives = correct ? lives : lives - 1;
        const isLastQuestion = currentIndex + 1 >= questions.length;

        if (currentLives <= 0) {
            const endTime = Date.now();
            const timeTaken = Math.round((endTime - startTime) / 1000);
            onComplete(score, 'FAILED', highestRecordedStreak, timeTaken);
            setGameOver(true);
        } else if (isLastQuestion) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            const endTime = Date.now();
            const timeTaken = Math.round((endTime - startTime) / 1000);
            onComplete(score, 'COMPLETED', highestRecordedStreak, timeTaken);
            setActivityFinished(true);
        } else {
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setSelectedChoiceText(null);
                setIsChoiceCorrect(null);
            }, 1200); // Increased delay slightly for animation to play
        }
    };

    if (gameOver || activityFinished) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
                <Typography variant="h5">{gameOver ? "Game Over!" : "Finished!"}</Typography>
                <CircularProgress sx={{ mt: 2 }} />
                <Typography sx={{ mt: 1 }}>Loading summary...</Typography>
            </Box>
        );
    }

    const currentQuestion = questions?.[currentIndex];
    if (!currentQuestion) {
        if (questions === null || questions === undefined) {
            return <CircularProgress />;
        }
        return <Alert severity="warning">No question data available or index out of bounds.</Alert>;
    }

    return (
        <Box sx={{ 
        textAlign: 'center', 
        p: [1, 2], 
        width: '100%', // It will try to take full width of its parent in ActivityPage
        // OPTION 1: Larger fixed max-width
        // maxWidth: '1000px', 
        // OPTION 2: Percentage-based max-width (relative to parent)
        maxWidth: '90%', 
        // OPTION 3: No specific max-width, will be constrained by parent's padding
        // maxWidth: 'none', // Or simply remove the maxWidth property
        bgcolor: '#FFFBE0', 
        borderRadius: 2, 
        boxShadow: 1 
    }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1, bgcolor: 'rgba(255, 255, 255, 0.7)', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#451513' }}>Score: {score.toLocaleString()}</Typography>
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
                    <Typography variant="h6" sx={{ color: '#451513' }}>{streak}x</Typography>
                </Box>
            </Box>

            <Typography variant="h5" sx={{ my: [2, 3], fontWeight: 'bold', color: '#451513', minHeight: '3em' }}>
                {currentQuestion.questionText}
            </Typography>

            <img src={mascot} alt="Mascot" style={{ height: '100px', marginBottom: '20px' }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: ['1fr', '1fr 1fr'], gap: ['10px', '15px'], maxWidth: '600px', margin: '20px auto 0' }}>
                {(currentQuestion.choices || []).map((choice) => {
                    let buttonStyles = {
                        padding: ['12px', '15px'],
                        borderRadius: '10px',
                        border: `2px solid #451513`,
                        bgcolor: '#FFE9A7',
                        color: '#451513',
                        fontSize: ['0.9rem', '1rem'],
                        fontWeight: 'bold',
                        textTransform: 'none',
                        transition: 'background-color 0.3s, opacity 0.3s, transform 0.2s', // Added transform
                        '&:hover': {
                            bgcolor: '#FFD966',
                            boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                            transform: 'scale(1.02)' // Slight hover scale
                        },
                        '&:disabled': {
                            opacity: 1, // Keep full opacity
                            color: 'white', // Text color will be white for feedback
                        },
                    };

                    if (selectedChoiceText === choice.choiceText) {
                        // Apply feedback styles and animation
                        buttonStyles = {
                            ...buttonStyles,
                            ...(isChoiceCorrect ? pulseAnimation(true) : pulseAnimation(false)), // Apply animation
                            bgcolor: isChoiceCorrect ? '#4CAF50' : '#F44336',
                            color: 'white',
                            '&:hover': { // Override hover for selected
                                bgcolor: isChoiceCorrect ? '#388E3C' : '#D32F2F',
                            },
                        };
                    } else if (selectedChoiceText && choice.isCorrect) {
                        // If another choice was selected (incorrectly), highlight the correct one
                        buttonStyles.bgcolor = '#4CAF50'; // Show correct answer
                        buttonStyles.color = 'white';
                        buttonStyles.opacity = 0.8;
                    } else if (selectedChoiceText && !choice.isCorrect){
                        // Fade out other incorrect choices
                        buttonStyles.opacity = 0.6;
                    }

                    return (
                        <Button
                            key={choice.choiceId}
                            onClick={() => handleAnswer(choice)}
                            disabled={!!selectedChoiceText}
                            variant="contained" // Keep variant contained for consistent styling
                            sx={buttonStyles}
                        >
                            {choice.choiceText}
                        </Button>
                    );
                })}
            </Box>
        </Box>
    );
};

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
    onComplete: PropTypes.func.isRequired,
};

ActivityGameLogic.defaultProps = {
    questions: [],
    activityType: 'QUIZ_MCQ',
};

export default ActivityGameLogic;