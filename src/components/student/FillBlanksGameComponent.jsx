import React, { useState, useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, TextField, Button, IconButton, Grid, Chip } from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { evaluateAnswer as aiEvaluate } from '../../services/aiService';

import correctSound1 from '../../assets/sounds/correct1.ogg';
import correctSound2 from '../../assets/sounds/correct2.ogg';
import correctSound3 from '../../assets/sounds/correct3.ogg';
import correctSound4 from '../../assets/sounds/correct4.ogg';
import correctSound5 from '../../assets/sounds/correct5.ogg';
import correctSound6 from '../../assets/sounds/correct6.ogg';
import correctSound7 from '../../assets/sounds/correct7.ogg';
import correctSound8 from '../../assets/sounds/correct8.ogg';
import correctSound9 from '../../assets/sounds/correct9.ogg';
import hoverSound from '../../assets/sounds/hoverQuestion.ogg';
import wrongSound from '../../assets/sounds/wrong.ogg';
import winSound from '../../assets/sounds/win.ogg';
import loseSound from '../../assets/sounds/lose.ogg';

const FillBlanksGameComponent = ({ 
    activityData,
    onGameComplete,
    activityTitle,
    activityInstructions,
    classroomId,
    lessonDefinitionId 
}) => {
    const navigate = useNavigate();
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [highestStreak, setHighestStreak] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const startTimeRef = useRef(Date.now());

    const correctAudioRefs = useRef({
        1: new Audio(correctSound1),
        2: new Audio(correctSound2),
        3: new Audio(correctSound3),
        4: new Audio(correctSound4),
        5: new Audio(correctSound5),
        6: new Audio(correctSound6),
        7: new Audio(correctSound7),
        8: new Audio(correctSound8),
        9: new Audio(correctSound9),
    });
    const wrongAudioRef = useRef(new Audio(wrongSound));
    const winAudioRef = useRef(new Audio(winSound));
    const loseAudioRef = useRef(new Audio(loseSound));
    const hoverAudioRef = useRef(new Audio(hoverSound));
    const isHoverSoundPlaying = useRef(false);    useEffect(() => {
        if (gameOver) return;
        setShowFeedback(false);
        setCurrentAnswer('');
    }, [currentIndex, gameOver]);

    useEffect(() => {
        if (streak > highestStreak) {
            setHighestStreak(streak);
        }
    }, [streak, highestStreak]);

    useEffect(() => {
        if (lives <= 0 && !gameOver) {
            setGameOver(true);
            const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
            onGameComplete({ score, status: 'FAILED', highestStreak, timeTaken });
        }
    }, [lives, score, highestStreak, onGameComplete, gameOver]);

    // Initialize audio settings
    useEffect(() => {
        Object.values(correctAudioRefs.current).forEach(audio => {
            audio.volume = 0.5;
        });
        wrongAudioRef.current.volume = 0.5;
        winAudioRef.current.volume = 0.5;
        loseAudioRef.current.volume = 0.5;
        hoverAudioRef.current.volume = 0.3;

        return () => {
            Object.values(correctAudioRefs.current).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            wrongAudioRef.current.pause();
            wrongAudioRef.current.currentTime = 0;
            winAudioRef.current.pause();
            winAudioRef.current.currentTime = 0;
            loseAudioRef.current.pause();
            loseAudioRef.current.currentTime = 0;
            hoverAudioRef.current.pause();
            hoverAudioRef.current.currentTime = 0;
        };
    }, []);

    const playHoverSound = () => {
        if (!isHoverSoundPlaying.current && !showFeedback) {
            isHoverSoundPlaying.current = true;
            hoverAudioRef.current.currentTime = 0;
            hoverAudioRef.current.play()
                .then(() => {
                    hoverAudioRef.current.onended = () => {
                        isHoverSoundPlaying.current = false;
                    };
                })
                .catch(error => {
                    console.error('Error playing hover sound:', error);
                    isHoverSoundPlaying.current = false;
                });
        }
    };

    const handleAnswerChange = (e) => {
        if (showFeedback || isProcessing) return;
        setCurrentAnswer(e.target.value);
    };    const { authState } = useContext(AuthContext);

    const evaluateAnswer = async (userAnswer, question) => {
        try {
            const result = await aiEvaluate(userAnswer, question, authState.token);
            
            // You can use the confidence score to give more nuanced feedback
            const confidenceThreshold = 0.8; // Adjust this threshold as needed
            
            if (result.confidence < confidenceThreshold) {
                // If AI is not very confident, we might want to be more lenient
                return {
                    isCorrect: result.isCorrect,
                    feedback: result.isCorrect 
                        ? "That looks correct, good job!"
                        : "That might not be quite right. " + result.feedback
                };
            }
            
            return {
                isCorrect: result.isCorrect,
                feedback: result.feedback
            };
        } catch (error) {
            console.error('Error evaluating answer:', error);
            throw new Error('Failed to evaluate your answer. Please try again.');
        }
    };

    const handleSubmit = async () => {
        if (showFeedback || isProcessing || !currentAnswer.trim()) return;
        
        setIsProcessing(true);
        const currentQuestion = activityData.questions[currentIndex];
        
        try {
            const { isCorrect, feedback } = await evaluateAnswer(currentAnswer, currentQuestion);
            setShowFeedback(true);
            setFeedbackMessage(feedback);

            let currentStreak = streak;
            if (isCorrect) {
                const currentScore = score + 100 + (currentStreak * 10);
                setScore(currentScore);
                currentStreak++;
                setStreak(currentStreak);
                if (currentStreak > highestStreak) {
                    setHighestStreak(currentStreak);
                }
                // Play streak sound
                const soundIndex = Math.min(currentStreak, 9);
                const audio = correctAudioRefs.current[soundIndex];
                audio.currentTime = 0;
                audio.play().catch(error => console.error('Error playing sound:', error));
            } else {
                setLives(prev => prev - 1);
                setStreak(0);
                currentStreak = 0;
                wrongAudioRef.current.currentTime = 0;
                wrongAudioRef.current.play().catch(error => console.error('Error playing wrong sound:', error));
            }

            setTimeout(async () => {
                const endedDueToLives = lives <= (isCorrect ? 0 : 1);
                const allQuestionsDone = currentIndex + 1 >= activityData.questions.length;

                if (allQuestionsDone || endedDueToLives) {
                    setGameOver(true);
                    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
                    const finalStatus = (allQuestionsDone && (lives > 0 || (isCorrect && lives === 0))) ? 'COMPLETED' : 'FAILED';
                    
                    const soundToPlay = finalStatus === 'COMPLETED' ? winAudioRef.current : loseAudioRef.current;
                    soundToPlay.currentTime = 0;
                    await soundToPlay.play().catch(error => console.error('Error playing sound:', error));
                    
                    const questionsAttempted = currentIndex + 1;
                    const correctAnswers = Math.floor(score / 100);
                    
                    onGameComplete({
                        score: score,
                        status: finalStatus,
                        highestStreak,
                        timeTaken,
                        accuracy: Math.round((correctAnswers / questionsAttempted) * 100),
                        questionsAttempted
                    });
                } else {
                    setTimeout(() => {
                        setCurrentIndex(prev => prev + 1);
                        setShowFeedback(false);
                        setIsProcessing(false);
                    }, 2000);
                }
            }, 2000);
        } catch (error) {
            console.error('Error evaluating answer:', error);
            setFeedbackMessage('There was an error processing your answer. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleExitGame = () => {
        if (window.confirm("Are you sure you want to exit? Your current progress in this activity will not be saved.")) {
            navigate(classroomId && lessonDefinitionId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage');
        }
    };

    if (!activityData?.questions?.length && !gameOver) {
        return (
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p:2}}>
                <Typography sx={{color: '#451513', textAlign: 'center', fontSize: '1.2rem', mb:2}}>
                    No questions available for this activity right now.
                </Typography>
                <Button variant="outlined" onClick={handleExitGame} sx={{borderColor: '#451513', color: '#451513'}}>
                    Go Back to Lessons
                </Button>
            </Box>
        );
    }

    if (gameOver) {
        return <Typography variant="h3" sx={{textAlign: 'center', my: 3, color: '#451513', fontWeight:'bold'}}>Saving your progress...</Typography>;
    }

    const currentQuestion = activityData.questions[currentIndex];

    return (
        <Paper
            elevation={0}
            sx={{
                padding: { xs: '10px 8px', sm: '12px 12px', md: '16px' },
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#FFFBE0',
                borderRadius: 0,
                boxSizing: 'border-box',
                overflowX: 'hidden',
                overflowY: 'auto',
                position: 'relative',
                maxWidth: '100%'
            }}
        >                {/* Back button */}
                <Box sx={{ 
                    position: 'absolute', 
                    top: {xs: 10, sm:16}, 
                    left: {xs:10, sm:16}, 
                    zIndex: 10 
                }}>
                    <IconButton 
                        onClick={handleExitGame} 
                        aria-label="back" 
                        sx={{ 
                            backgroundColor: 'rgba(0,0,0,0.4)', 
                            color: 'white', 
                            '&:hover': { 
                                backgroundColor: 'rgba(0,0,0,0.65)'
                            }, 
                            padding: '8px' 
                        }}
                    >
                        <ArrowBackIcon fontSize="medium" />
                    </IconButton>
                </Box>

                {/* Top Stats Section */}
                <Box 
                    component="header" 
                    sx={{ 
                        mb: {xs:1, sm:1.5, md: 2}, 
                        width: '100%', 
                        pt: {xs:5, sm:3},
                        px: {xs: 2, sm: 3},
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                        maxWidth: '100%'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <span key={`life-${i}`} style={{
                                color: i < lives ? 'red' : '#D0D0D0',
                                margin: '0 3px',
                                fontSize: 'clamp(2rem, 7vh, 3rem)',
                                textShadow: i < lives ? '0 0 6px rgba(0,0,0,0.5)' : 'none'
                            }}>❤️</span>
                        ))}
                    </Box>

                    <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: {xs: 1.5, sm: 2.5}
                    }}>
                        <Typography 
                            key={score} 
                            sx={{
                                color: '#451513', 
                                fontWeight: 'bold', 
                                fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                                animation: showFeedback ? 'pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none',
                                '@keyframes pop-in': {
                                    '0%': { transform: 'scale(1)', opacity: 0.7 },
                                    '50%': { transform: 'scale(1.3)', opacity: 1 },
                                    '80%': { transform: 'scale(0.9)' },
                                    '100%': { transform: 'scale(1)' }
                                }
                            }}
                        >
                            {score.toLocaleString()}
                        </Typography>
                        <Chip
                            icon={<WhatshotIcon sx={{
                                fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem) !important',
                                color: streak >= 7 ? '#ff3d00 !important' :
                                       streak >= 6 ? '#ff4d00 !important' :
                                       streak >= 5 ? '#ff5d00 !important' :
                                       streak >= 4 ? '#ff6d00 !important' :
                                       streak >= 3 ? '#ff7d00 !important' :
                                       streak >= 2 ? '#ff8d00 !important' :
                                       streak >= 1 ? '#ff9d00 !important' :
                                       '#757575 !important',
                                animation: streak >= 3 ? 'flameWave 1s ease-in-out infinite' : 'none',
                                '@keyframes flameWave': {
                                    '0%': { transform: 'scale(1) rotate(0deg)' },
                                    '50%': { transform: 'scale(1.2) rotate(5deg)' },
                                    '100%': { transform: 'scale(1) rotate(0deg)' }
                                }
                            }} />}
                            label={`${streak}x`}
                            sx={{
                                fontWeight: 'bold',
                                fontSize: 'clamp(0.9rem, 3vw, 1.3rem)',
                                padding: 'clamp(12px, 2.5vh, 18px) clamp(10px, 2vw, 14px)',
                                height: 'auto',
                                backgroundColor: 'transparent',
                                border: `2px solid ${
                                    streak >= 7 ? '#ff3d00' :
                                    streak >= 6 ? '#ff4d00' :
                                    streak >= 5 ? '#ff5d00' :
                                    streak >= 4 ? '#ff6d00' :
                                    streak >= 3 ? '#ff7d00' :
                                    streak >= 2 ? '#ff8d00' :
                                    streak >= 1 ? '#ff9d00' :
                                    '#9e9e9e'
                                }`,
                                color: streak >= 1 ? '#ff6d00' : '#757575',
                                boxShadow: streak >= 1 ? `0 0 ${Math.min(streak * 2, 14)}px rgba(255, 109, 0, ${Math.min(streak * 0.1, 0.7)})` : 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 109, 0, 0.1)'
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Main Game Area */}
                <Box 
                    component="main"
                    sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        width: '100%', 
                        maxWidth: '100%',
                        py: {xs:0.5, sm:1},
                        px: {xs:2, sm:3},
                        boxSizing: 'border-box'
                    }}
                >
                    <Typography 
                        variant="h2" 
                        component="h1"
                        sx={{
                            mb: {xs:2, sm:3},
                            color: '#451513',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: 'clamp(1.6rem, 6vw, 3.2rem)',
                            lineHeight: 1.2
                        }}
                    >
                        {currentQuestion.questionText}
                    </Typography>

                    <Box sx={{ width: '100%', maxWidth: '600px', mb: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            placeholder="Type your answer here..."
                            value={currentAnswer}
                            onChange={handleAnswerChange}
                            disabled={showFeedback || isProcessing}
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                }
                            }}
                        />
                    </Box>

                    {showFeedback && (
                        <Typography 
                            sx={{
                                color: feedbackMessage.includes('correct') ? '#4CAF50' : '#F44336',
                                fontWeight: 'bold',
                                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                mb: 2,
                                textAlign: 'center'
                            }}
                        >
                            {feedbackMessage}
                        </Typography>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={showFeedback || isProcessing || !currentAnswer.trim()}
                        sx={{
                            bgcolor: '#FFD966',
                            color: '#451513',
                            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                            fontWeight: 'bold',
                            py: 1.5,
                            px: 4,
                            borderRadius: '12px',
                            '&:hover': {
                                bgcolor: '#FFC107'
                            },
                            '&.Mui-disabled': {
                                bgcolor: '#FFE699',
                                color: '#8B7355'
                            }
                        }}
                    >
                        {isProcessing ? 'Checking...' : 'Submit Answer'}
                    </Button>
                </Box>
            </Paper>
    );
};

FillBlanksGameComponent.propTypes = {
    activityData: PropTypes.shape({
        title: PropTypes.string,
        questions: PropTypes.arrayOf(PropTypes.shape({
            questionId: PropTypes.any.isRequired,
            questionText: PropTypes.string.isRequired,
            questionImageUrl: PropTypes.string,
            questionSoundUrl: PropTypes.string,
        })).isRequired,
    }).isRequired,
    onGameComplete: PropTypes.func.isRequired,
    activityTitle: PropTypes.string,
    activityInstructions: PropTypes.string,
    classroomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default FillBlanksGameComponent;
