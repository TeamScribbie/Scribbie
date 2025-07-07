import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid } from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BookIcon from '../../assets/book.png';
import mascot from '../../assets/duh.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

// Import sounds
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

const pulseAnimation = (isCorrect) => ({
    animation: `pulse-${isCorrect ? 'correct' : 'incorrect'} 0.7s ease-out`,
    '@keyframes pulse-correct': {
        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
        '70%': { transform: 'scale(1.05)', boxShadow: '0 0 10px 15px rgba(76, 175, 80, 0)' },
        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
    },
    '@keyframes pulse-incorrect': {
        '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.4)' },
        '70%': { transform: 'scale(1.05)', boxShadow: '0 0 10px 15px rgba(211, 47, 47, 0)' },
        '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' }
    }
});

const ReadingGameComponent = ({ 
    activityData,
    onGameComplete,
    activityTitle,
    activityInstructions,
    classroomId,
    lessonDefinitionId 
}) => {
    const [openInstructions, setOpenInstructions] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [highestStreak, setHighestStreak] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const startTimeRef = useRef(Date.now());
    const instructions = activityData?.instructions || activityInstructions || 'No instructions provided.';
    const questions = activityData?.questions || [];

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
    const isHoverSoundPlaying = useRef(false);

    useEffect(() => {
        if (gameOver) return;
        setShowFeedback(false);
        setSelectedChoice(null);
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

    useEffect(() => {
        // Initialize audio settings
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

    const handleAnswer = (choice) => {
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
                    highestStreak: Math.max(highestStreak, currentStreak),
                    timeTaken,
                    accuracy: Math.round((correctAnswers / questionsAttempted) * 100),
                    questionsAttempted
                });
                return;
            }

            setCurrentIndex(prev => prev + 1);
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
    }

    if (gameOver) {
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
                position: 'relative',
                maxWidth: '100%'
            }}
        >
            {/* Back button */}
            <Box sx={{ 
                position: 'absolute', 
                top: {xs: 10, sm:16}, 
                left: {xs:10, sm:16}, 
                zIndex: 10 
            }}>
                {/* <IconButton 
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
                </IconButton> */}
            </Box>            Reading Button - Floating Action Button
            <Box sx={{ 
                position: 'fixed',
                bottom: {xs: 20, sm:30}, 
                right: {xs:20, sm:30},
                zIndex: 1000
            }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenInstructions(true)}
                    onMouseEnter={playHoverSound}
                    sx={{ 
                        bgcolor: '#FFD966',
                        color: '#451513',
                        borderRadius: '50%',
                        width: {xs: '60px', sm: '70px'},
                        height: {xs: '60px', sm: '70px'},
                        minWidth: 'unset',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        '&:hover': {
                            bgcolor: '#FFC107',
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <img 
                        src={BookIcon} 
                        alt="Read" 
                        style={{ 
                            width: '28px', 
                            height: '28px'
                        }} 
                    />
                </Button>
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
            >                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={`life-${i}`} style={{
                            opacity: i < lives ? 1 : 0.3,
                            margin: '0 3px',
                            fontSize: 'clamp(2rem, 7vh, 3rem)',
                            filter: i < lives ? 'none' : 'grayscale(100%)',
                            transition: 'all 0.3s ease',
                            textShadow: i < lives ? '0 0 6px rgba(255,0,0,0.5)' : 'none'
                        }}>❤️</span>
                    ))}
                </Box>

                {/* Score and Streak */}
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
                        maxWidth: '100%',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto'
                    }}
                >
                    {currentQuestion.questionText}
                </Typography>

                <Box sx={{ my: {xs: 1, sm: 1.5, md: 2}, display: 'flex', justifyContent: 'center' }}>
                    <img src={mascot} alt="Scribbie Mascot" style={{ height: 'clamp(130px, 25vh, 200px)', width: 'auto', objectFit: 'contain' }} />
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
                            fontSize: 'clamp(1rem, 3.5vw, 1.6rem)',
                            py: { xs: 1.5, sm: 2 },
                            px: { xs: 2, sm: 3 },
                            textTransform: 'none',
                            fontWeight: 'bold',
                            width: '100%',
                            lineHeight: 1.25,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '16px',
                            border: '3px solid transparent',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                            transition: 'transform 0.15s ease-out, background-color 0.2s, box-shadow 0.2s',
                            textAlign: 'center'
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
                            buttonSx.borderColor = '#e5a900';
                            buttonSx['&:hover'] = { 
                                bgcolor: '#FFC107', 
                                transform: 'translateY(-3px) scale(1.02)', 
                                boxShadow: '0 7px 14px rgba(0,0,0,0.2)' 
                            };
                        }

                        return (
                            <Grid item xs={12} sm={6} key={choice.choiceId}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleAnswer(choice)}
                                    onMouseEnter={playHoverSound}
                                    disabled={showFeedback}
                                    sx={buttonSx}
                                >
                                    {choice.choiceText}
                                </Button>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            <Dialog 
                open={openInstructions} 
                onClose={() => setOpenInstructions(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#FFFBE0',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    color: '#451513', 
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)'
                }}>
                    Reading Instructions
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                        <img src={BookIcon} alt="Book" style={{ width: 120, marginBottom: 16 }} />
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                whiteSpace: 'pre-line',
                                color: '#451513',
                                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                                lineHeight: 1.6,
                                textAlign: 'left'
                            }}
                        >
                            {instructions}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setOpenInstructions(false)} 
                        variant="contained"
                        sx={{
                            bgcolor: '#451513',
                            color: 'white',
                            '&:hover': {
                                bgcolor: '#5d211f'
                            }
                        }} 
                        autoFocus
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

ReadingGameComponent.propTypes = {
    activityData: PropTypes.shape({
        title: PropTypes.string,
        content: PropTypes.string,
        instructions: PropTypes.string,
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
    }).isRequired,
    onGameComplete: PropTypes.func.isRequired,
    activityTitle: PropTypes.string,
    activityInstructions: PropTypes.string,
    classroomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ReadingGameComponent;
