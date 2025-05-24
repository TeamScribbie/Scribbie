// src/components/student/QuizMcqGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Box, Paper, Grid, Chip, IconButton } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';

import mascot from '../../assets/duh.png';
import correctSound1 from '../../assets/sounds/correct1.ogg';
import correctSound2 from '../../assets/sounds/correct2.ogg';
import correctSound3 from '../../assets/sounds/correct3.ogg';
import correctSound4 from '../../assets/sounds/correct4.ogg';
import correctSound5 from '../../assets/sounds/correct5.ogg';
import correctSound6 from '../../assets/sounds/correct6.ogg';
import correctSound7 from '../../assets/sounds/correct7.ogg';
import correctSound8 from '../../assets/sounds/correct8.ogg';
import correctSound9 from '../../assets/sounds/correct9.ogg';
import wrongSound from '../../assets/sounds/wrong.ogg';
import winSound from '../../assets/sounds/win.ogg';
import loseSound from '../../assets/sounds/lose.ogg';
import hoverSound from '../../assets/sounds/hoverQuestion.ogg';

// FireAnimation Component
const FireAnimation = ({ streak }) => {
    const canvasRef = useRef(null);
    const appRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        if (!canvasRef.current || streak < 1) return;

        // Initialize PIXI Application
        if (!appRef.current) {
            appRef.current = new PIXI.Application({
                width: 32,
                height: 32,
                transparent: true,
            });
            canvasRef.current.appendChild(appRef.current.view);
        }

        const app = appRef.current;
        const intensity = Math.min(streak, 7);
        const particleCount = intensity * 5;

        // Clear existing particles
        particlesRef.current.forEach(p => p.destroy());
        particlesRef.current = [];

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const color = streak >= 7 ? 0xff3d00 : 
                         streak >= 5 ? 0xff6d00 : 
                         0xff9d00;
            
            particle.beginFill(color, 0.7);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            
            // Random starting position at the bottom
            particle.x = Math.random() * app.screen.width;
            particle.y = app.screen.height;
            
            // Random velocity
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = -Math.random() * 3 - 1;
            
            app.stage.addChild(particle);
            particlesRef.current.push(particle);
        }

        // Animation loop
        app.ticker.add(() => {
            particlesRef.current.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.alpha -= 0.01;

                if (particle.alpha <= 0) {
                    particle.y = app.screen.height;
                    particle.alpha = 1;
                }
            });
        });

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, [streak]);

    if (streak < 1) return null;

    return (
        <div ref={canvasRef} style={{ 
            position: 'absolute',
            width: '32px',
            height: '32px',
            pointerEvents: 'none',
        }} />
    );
};

// Pulse animation remains the same
const pulseAnimation = (isCorrect) => ({
    animation: `pulse-${isCorrect ? 'correct' : 'incorrect'} 0.7s ease-out`,
    '@keyframes pulse-correct': {
        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
        '70%': { transform: 'scale(1.05)', boxShadow: '0 0 10px 15px rgba(76, 175, 80, 0)' },
        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
    },
    '@keyframes pulse-incorrect': {
        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.4)' },
        '70%': { transform: 'scale(1.05)', boxShadow: '0 0 10px 15px rgba(211, 47, 47, 0)' },
        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' },
    }
});

const QuizMcqGame = ({
    questions,
    onGameComplete,
    activityTitle, // Still passed for potential use (e.g. window title via useEffect in parent)
    activityInstructions, // Same as above
    classroomId,
    lessonDefinitionId
}) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [highestStreak, setHighestStreak] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameOver, setGameOver] = useState(false);    const startTimeRef = useRef(Date.now());
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
    const isHoverSoundPlaying = useRef(false);const playSound = async (audioRef, pitchMultiplier = 1) => {
        try {
            audioRef.current.currentTime = 0;
            audioRef.current.playbackRate = pitchMultiplier;
            await audioRef.current.play();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const playHoverSound = () => {
        if (!isHoverSoundPlaying.current && !showFeedback) {
            isHoverSoundPlaying.current = true;
            hoverAudioRef.current.currentTime = 0;
            hoverAudioRef.current.play()
                .then(() => {
                    // Reset the flag when the sound finishes playing
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

    useEffect(() => {
        if (gameOver) return;
        setShowFeedback(false);
        setSelectedChoice(null);
    }, [currentIndex, gameOver]);

    useEffect(() => {
        if (streak > highestStreak) setHighestStreak(streak);
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
            winAudioRef.current.currentTime = 0;
            loseAudioRef.current.pause();
            loseAudioRef.current.currentTime = 0;
            hoverAudioRef.current.pause();
            hoverAudioRef.current.currentTime = 0;
        };
    }, []);

    const playCorrectSound = (streak) => {
        // Get the appropriate sound based on streak (capped at 9)
        const soundIndex = Math.min(streak, 9);
        const audio = correctAudioRefs.current[soundIndex];
        
        // Stop any currently playing correct sounds
        Object.values(correctAudioRefs.current).forEach(sound => {
          sound.pause();
          sound.currentTime = 0;
        });
        
        // Play the new sound
        audio.currentTime = 0;
        audio.play().catch(error => console.error('Error playing sound:', error));
      };    const handleAnswer = (choice) => {
        if (showFeedback || gameOver) return;

        setSelectedChoice(choice);
        setShowFeedback(true);

        let isCorrect = false;
        let currentScore = score;
        let currentStreak = streak;

        if (choice && choice.isCorrect) {
            isCorrect = true;
            currentScore += 100 + (currentStreak * 10);
            setScore(currentScore);
            currentStreak++;
            setStreak(currentStreak);
            // Play the sound corresponding to the current streak level
            // Stop any currently playing sounds first
            Object.values(correctAudioRefs.current).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
            });
            const audio = correctAudioRefs.current[currentStreak];
            audio.currentTime = 0;
            audio.play();        } else {
            setLives(prevLives => prevLives - 1);
            setStreak(0);
            currentStreak = 0;
            wrongAudioRef.current.currentTime = 0;
            wrongAudioRef.current.play();
        }        setTimeout(async () => {
            const endedDueToLives = lives <= (isCorrect ? 0 : 1);
            const allQuestionsDone = currentIndex + 1 >= questions.length;

            if (allQuestionsDone || endedDueToLives) {
                setGameOver(true);
                const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
                const finalStatus = (allQuestionsDone && (lives > 0 || (isCorrect && lives === 0))) ? 'COMPLETED' : 'FAILED';
                
                // Play appropriate game end sound
                const soundToPlay = finalStatus === 'COMPLETED' ? winAudioRef.current : loseAudioRef.current;
                soundToPlay.currentTime = 0;
                await soundToPlay.play().catch(error => console.error('Error playing sound:', error));
                
                // Calculate accuracy based on correct answers vs total questions attempted
                const questionsAttempted = currentIndex + 1;
                const correctAnswers = Math.floor(currentScore / 100); // Since each correct answer is worth 100 points
                
                onGameComplete({
                    score: currentScore,
                    status: finalStatus,
                    highestStreak,
                    timeTaken,
                    accuracy: Math.round((correctAnswers / questionsAttempted) * 100),
                    questionsAttempted
                });
            } else {
                setCurrentIndex(prevIndex => prevIndex + 1);
            }
        }, 2000);
    };

    const handleExitGame = () => {
        if (window.confirm("Are you sure you want to exit? Your current progress in this activity will not be saved.")) {
            navigate(classroomId && lessonDefinitionId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage');
        }
    };

    if (questions.length === 0 && !gameOver) {
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
    }    if (gameOver) {
        return <Typography variant="h3" sx={{textAlign: 'center', my: 3, color: '#451513', fontWeight:'bold'}}>Saving your progress...</Typography>;
    }

    const currentQuestion = questions[currentIndex];

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
                position: 'relative', // For absolute positioned elements
                maxWidth: '100%' // Ensure paper doesn't overflow
            }}
        >
            {/* Back button */}
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

            {/* Top Stats Section - More Prominent */}
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

                {/* Score and Streak - Right Side */}
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
                            fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem) !important',                            color: streak >= 7 ? '#ff3d00 !important' :
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
                            backgroundColor: 'transparent',                            border: `2px solid ${
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
                    overflowX: 'hidden',
                    boxSizing: 'border-box'
                }}
            >
                <Typography 
                    variant="h2" 
                    component="h1"
                    sx={{
                        mb: {xs:1, sm:1.5},
                        color: '#451513',
                        minHeight: {xs:'2em', sm:'2.5em'},
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: 'clamp(1.6rem, 6vw, 3.2rem)',
                        lineHeight: 1.2,
                        px: {xs: 1, sm: 2},
                        maxWidth: '100%', // Ensure text stays within container
                        wordWrap: 'break-word', // Allow long words to break
                        overflowWrap: 'break-word',
                        hyphens: 'auto'
                    }}
                >
                    {currentQuestion.questionText}
                </Typography>

                {/* Timer Display Removed */}

                <Box sx={{ my: {xs: 1, sm: 1.5, md: 2}, display: 'flex', justifyContent: 'center' }}>
                    <img src={mascot} alt="Scribbie Mascot" style={{ height: 'clamp(130px, 25vh, 200px)', width: 'auto', objectFit: 'contain' }} /> {/* Larger Mascot */}
                </Box>

                {currentQuestion.questionImageUrl && (
                    <Box sx={{ mb: {xs:1, sm:1.5, md: 2}, display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={currentQuestion.questionImageUrl}
                            alt="Question hint"
                            style={{ maxHeight: '25vh', maxWidth: '90%', borderRadius: '12px', border: '2px solid #c9a14a', objectFit: 'contain' }}
                        />
                    </Box>
                )}
            </Box>

            {/* Choices Section */}
            <Box 
                component="footer"
                sx={{ 
                    width: '100%',
                    maxWidth: '100%',
                    pb: {xs:1.5, sm:2}, 
                    px: {xs:1, sm:2},
                    mt: {xs:1, sm: 'auto'},
                    boxSizing: 'border-box'
                }}
            >
                <Grid 
                    container 
                    spacing={{xs:1.5, sm:2}} 
                    justifyContent="center"
                    sx={{ margin: 0, width: '100%' }}
                >
                    {(currentQuestion.choices || []).map((choice) => {
                        const isSelected = selectedChoice && selectedChoice.choiceId === choice.choiceId;
                        let buttonSx = {
                            minHeight: 'clamp(75px, 13vh, 100px)',
                            fontSize: 'clamp(1rem, 3.5vw, 1.6rem)', // Slightly reduced font size
                            py: { xs: 1.5, sm: 2 },
                            px: { xs: 2, sm: 3 }, // Increased horizontal padding
                            textTransform: 'none',
                            fontWeight: 'bold',
                            width: '100%',
                            lineHeight: 1.25,
                            whiteSpace: 'pre-wrap', // Allow text to wrap
                            wordBreak: 'break-word', // Break long words if needed
                            overflowWrap: 'break-word',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '16px',
                            border: '3px solid transparent',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                            transition: 'transform 0.15s ease-out, background-color 0.2s, box-shadow 0.2s',
                            textAlign: 'center' // Center text
                        };

                        if (showFeedback) {
                            if (choice.isCorrect) { 
                                buttonSx.bgcolor = '#4CAF50'; 
                                buttonSx.color = 'white'; 
                                buttonSx['&:hover'] = { bgcolor: '#388E3C' }; 
                                buttonSx.borderColor = '#2e7d32';
                            } else if (isSelected && !choice.isCorrect) { 
                                buttonSx.bgcolor = '#F44336'; 
                                buttonSx.color = 'white'; 
                                buttonSx['&:hover'] = { bgcolor: '#D32F2F' }; 
                                buttonSx.borderColor = '#c62828';
                            } else { 
                                buttonSx.bgcolor = '#FFD966'; 
                                buttonSx.color = '#451513'; 
                                buttonSx.opacity = 0.45; 
                                buttonSx['&:hover'] = { bgcolor: '#FFC107' }; 
                            }
                            if (isSelected) buttonSx = { ...buttonSx, ...pulseAnimation(choice.isCorrect) };
                        } else {
                            buttonSx.bgcolor = '#FFD966'; 
                            buttonSx.color = '#451513';
                            buttonSx.borderColor = '#e5a900'; // Default border
                            buttonSx['&:hover'] = { 
                                bgcolor: '#FFC107', 
                                transform: 'translateY(-3px) scale(1.02)', 
                                boxShadow: '0 7px 14px rgba(0,0,0,0.2)' 
                            };
                        }

                        return (
                            <Grid item xs={12} sm={6} key={choice.choiceId}>                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleAnswer(choice)}
                                    onMouseEnter={playHoverSound}
                                    disabled={showFeedback}
                                    sx={buttonSx}
                                    startIcon={showFeedback && isSelected ?
                                        (choice.isCorrect ? <CheckCircleOutlineIcon sx={{fontSize: '1.8em !important'}}/> : <HighlightOffIcon sx={{fontSize: '1.8em !important'}}/>)
                                        : null
                                    }
                                >
                                    {choice.choiceText}
                                </Button>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Paper>
    );
};

QuizMcqGame.propTypes = {
    questions: PropTypes.arrayOf(PropTypes.shape({
        questionId: PropTypes.any.isRequired,
        questionText: PropTypes.string.isRequired,
        questionImageUrl: PropTypes.string,
        questionSoundUrl: PropTypes.string,
        choices: PropTypes.arrayOf(PropTypes.shape({
            choiceId: PropTypes.any.isRequired,
            choiceText: PropTypes.string.isRequired,
            isCorrect: PropTypes.bool,
        })).isRequired,
    })).isRequired,
    onGameComplete: PropTypes.func.isRequired,
    activityTitle: PropTypes.string,
    activityInstructions: PropTypes.string,
    classroomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default QuizMcqGame;

