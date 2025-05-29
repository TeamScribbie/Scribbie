import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, LinearProgress, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import LiveLeaderboard from './LiveLeaderboard';

import anubisImage from '../../assets/anubis.png';
import mascotImage from '../../assets/duh.png';
import backgroundImage from '../../assets/background.png';
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
import challengeBGMusic from '../../assets/sounds/challengeBGMusic.ogg';

const COMBO_MESSAGES = {
    3: "GREAT!", 5: "AWESOME!", 7: "SUPER!", 10: "EXCELLENT!", 15: "UNSTOPPABLE!",
};

const StyledButton = styled(Button)(({ theme, selected, correct, submitted }) => ({
    padding: theme.spacing(1.5, 2), fontSize: '1rem', fontWeight: 'bold', color: '#fff',
    border: '2px solid transparent',
    transition: 'transform 0.2s ease-out, background-color 0.3s, box-shadow 0.3s',
    minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', lineHeight: 1.3,
    backgroundColor: submitted ? (correct ? theme.palette.success.main : (selected ? theme.palette.error.main : theme.palette.grey[700])) : '#6A4C93',
    borderColor: submitted ? (correct ? theme.palette.success.dark : (selected ? theme.palette.error.dark : theme.palette.grey[800])) : '#4A00E0',
    '&:hover': {
        backgroundColor: submitted ? (correct ? theme.palette.success.dark : (selected ? theme.palette.error.dark : theme.palette.grey[800])) : '#8E2DE2',
        transform: submitted ? 'none' : 'scale(1.03)',
        boxShadow: submitted ? 'none' : `0px 4px 15px rgba(0,0,0,0.2)`,
    },
    opacity: submitted && !selected && !correct ? 0.6 : 1,
}));

const HealthBasedChallenge = ({ questions, challengeConfig, onChallengeEnd, lessonDefinitionId }) => {
    const [currentQuestionData, setCurrentQuestionData] = useState(null);
    const [displayedChoices, setDisplayedChoices] = useState([]);
    const [health, setHealth] = useState(challengeConfig?.initialHealth || 3);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [highestStreak, setHighestStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(challengeConfig?.initialQuestionTimeSeconds || 15);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [selectedChoiceId, setSelectedChoiceId] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [comboMessage, setComboMessage] = useState('');
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    
    const [questionPool, setQuestionPool] = useState([]);
    const [currentQuestionIndexInPool, setCurrentQuestionIndexInPool] = useState(0);

    const timerIntervalRef = useRef(null);
    const feedbackTimeoutRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const bgMusicRef = useRef(null);
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
    const wrongSoundRef = useRef(null);
    const winSoundRef = useRef(null);
    const loseSoundRef = useRef(null);

    const MAX_ADDITIONAL_CHOICES = 7;
    const ALL_POSSIBLE_INCORRECT_DISTRACTORS = [
        "Always", "Never", "Sometimes", "Often", "Rarely", "Perhaps", "Maybe", "Certainly",
        "Possibly", "Indeed", "Truly", "Not at all", "Very much", "A little", "A lot",
        "Too much", "Too little", "Just right", "Almost", "Completely", "Partially",
        "Slightly", "Significantly", "Moderately"
    ];
    
    const advanceToNextQuestionRef = useRef();
    const handleAnswerCbRef = useRef();
    const gameOverRef = useRef(gameOver);

    useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

    const internalAdvanceToNextQuestion = useCallback(() => {
        if (gameOver || questionPool.length === 0) {
            return;
        }
        let pool = questionPool;
        let nextIdx = currentQuestionIndexInPool;

        if (nextIdx >= pool.length) {
            const newShuffledPool = [...questions].sort(() => 0.5 - Math.random());
            setQuestionPool(newShuffledPool);
            pool = newShuffledPool;
            nextIdx = 0;
            setCurrentQuestionIndexInPool(0);
        }
        
        const question = pool[nextIdx];
        setCurrentQuestionData(question);
        setCurrentQuestionIndexInPool(nextIdx + 1);

        if (question && Array.isArray(question.choices)) {
            const baseChoices = question.choices.map(c => ({...c, isDistractor: false}));
            let numAdditionalChoices = Math.min(Math.floor(correctAnswersCount / 10), MAX_ADDITIONAL_CHOICES);
            const finalChoices = [...baseChoices];
            const correctChoice = baseChoices.find(c => c.isCorrect);

            if (numAdditionalChoices > 0 && correctChoice) {
                const availableDistractors = ALL_POSSIBLE_INCORRECT_DISTRACTORS.filter(
                    d => !baseChoices.some(bc => bc.choiceText.toLowerCase() === d.toLowerCase())
                );
                for (let i = 0; i < numAdditionalChoices && availableDistractors.length > 0; i++) {
                    const distractorIndex = Math.floor(Math.random() * availableDistractors.length);
                    const distractorText = availableDistractors.splice(distractorIndex, 1)[0];
                    finalChoices.push({
                        choiceId: `distractor-${Date.now()}-${i}`, choiceText: distractorText,
                        isCorrect: false, isDistractor: true,
                    });
                }
            }
            setDisplayedChoices([...finalChoices].sort(() => 0.5 - Math.random()));
        } else {
            setDisplayedChoices([]);
        }
        setTimeLeft(challengeConfig?.initialQuestionTimeSeconds || 15);
        setIsAnswerSubmitted(false);
        setSelectedChoiceId(null);
        setComboMessage('');
    }, [gameOver, questionPool, currentQuestionIndexInPool, questions, challengeConfig, correctAnswersCount, MAX_ADDITIONAL_CHOICES, ALL_POSSIBLE_INCORRECT_DISTRACTORS]);

    const internalHandleAnswer = useCallback((choice) => {
        if (isAnswerSubmitted || gameOverRef.current) return;

        setIsAnswerSubmitted(true);
        setSelectedChoiceId(choice ? choice.choiceId : null);
        clearInterval(timerIntervalRef.current);

        if (choice && choice.isCorrect) {
            setScore(prev => prev + 100 + (streak * 10));
            setStreak(prev => {
                const newStreak = prev + 1;
                if (newStreak > highestStreak) setHighestStreak(newStreak);
                const combo = COMBO_MESSAGES[newStreak];
                if (combo) setComboMessage(combo);
                return newStreak;
            });
            setCorrectAnswersCount(prev => prev + 1);
        } else {
            setHealth(prev => prev - 1);
            setStreak(0);
            setComboMessage(choice ? 'OUCH!' : "TIME'S UP!");
        }
        
        if (health > 1 || (choice && choice.isCorrect)) { // Will only proceed if health > 0 after this check
            clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = setTimeout(() => {
                if (!gameOverRef.current) {
                    advanceToNextQuestionRef.current();
                }
            }, 1500);
        }
    }, [isAnswerSubmitted, health, streak, highestStreak, correctAnswersCount]);

    useEffect(() => {
        advanceToNextQuestionRef.current = internalAdvanceToNextQuestion;
    }, [internalAdvanceToNextQuestion]);

    useEffect(() => {
        handleAnswerCbRef.current = internalHandleAnswer;
    }, [internalHandleAnswer]);
    
    useEffect(() => {
        if (questions && questions.length > 0) {
            const shuffled = [...questions].sort(() => 0.5 - Math.random());
            setQuestionPool(shuffled);
            setCurrentQuestionIndexInPool(0);
            setCurrentQuestionData(null);
            setIsAnswerSubmitted(false);
            setSelectedChoiceId(null);
        } else {
            setQuestionPool([]);
            setCurrentQuestionData(null);
        }
    }, [questions]);

    useEffect(() => {
        if (questionPool.length > 0 && !currentQuestionData && !gameOverRef.current && currentQuestionIndexInPool === 0) {
            if(advanceToNextQuestionRef.current) {
                advanceToNextQuestionRef.current();
            }
        }
    }, [questionPool, currentQuestionData, currentQuestionIndexInPool]);

    useEffect(() => {
        if (isAnswerSubmitted || gameOverRef.current || !currentQuestionData) {
            clearInterval(timerIntervalRef.current);
            return;
        }
        timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerIntervalRef.current);
                    if (handleAnswerCbRef.current) handleAnswerCbRef.current(null);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(timerIntervalRef.current);
    }, [isAnswerSubmitted, currentQuestionData, challengeConfig?.initialQuestionTimeSeconds]);

    useEffect(() => {
        if (health <= 0 && !gameOverRef.current) {
            gameOverRef.current = true;
            setGameOver(true);
            const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
            onChallengeEnd({
                score, status: 'FAILED', highestStreak,
                questionsAnswered: correctAnswersCount, timeTaken,
            });
        }
    }, [health, onChallengeEnd, score, highestStreak, correctAnswersCount]);

    useEffect(() => {
        return () => clearTimeout(feedbackTimeoutRef.current);
    }, []);

    // Play background music on mount, stop on unmount or game over
    useEffect(() => {
        if (!bgMusicRef.current) {
            bgMusicRef.current = new Audio(challengeBGMusic);
            bgMusicRef.current.loop = true;
            bgMusicRef.current.volume = 0.25;
        }
        bgMusicRef.current.play().catch(() => {});
        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current.currentTime = 0;
            }
        };
    }, []);

    // Stop music on game over
    useEffect(() => {
        if (gameOver && bgMusicRef.current) {
            bgMusicRef.current.pause();
            bgMusicRef.current.currentTime = 0;
        }
    }, [gameOver]);

    // Play correct/wrong sound on answer
    useEffect(() => {
        if (!isAnswerSubmitted || !selectedChoiceId) return;
        const selected = displayedChoices.find(c => c.choiceId === selectedChoiceId);
        if (selected && selected.isCorrect) {
            playCorrectSound(streak);
        } else {
            if (!wrongSoundRef.current) wrongSoundRef.current = new Audio(wrongSound);
            wrongSoundRef.current.currentTime = 0;
            wrongSoundRef.current.play().catch(() => {});
        }
    }, [isAnswerSubmitted, selectedChoiceId, displayedChoices, streak]);

    // Play wrong sound if time runs out (no choice selected)
    useEffect(() => {
        if (isAnswerSubmitted && selectedChoiceId === null) {
            if (!wrongSoundRef.current) wrongSoundRef.current = new Audio(wrongSound);
            wrongSoundRef.current.currentTime = 0;
            wrongSoundRef.current.play().catch(() => {});
        }
    }, [isAnswerSubmitted, selectedChoiceId]);

    // Play win/lose sound on challenge end
    useEffect(() => {
        if (!gameOver) return;
        if (health > 0) {
            if (!winSoundRef.current) winSoundRef.current = new Audio(winSound);
            winSoundRef.current.currentTime = 0;
            winSoundRef.current.play().catch(() => {});
        } else {
            if (!loseSoundRef.current) loseSoundRef.current = new Audio(loseSound);
            loseSoundRef.current.currentTime = 0;
            loseSoundRef.current.play().catch(() => {});
        }
    }, [gameOver, health]);

    // Initialize audio settings
    useEffect(() => {
        Object.values(correctAudioRefs.current).forEach(audio => {
            audio.volume = 0.5;
        });
        return () => {
            Object.values(correctAudioRefs.current).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }, []);

    const playCorrectSound = async (currentStreak) => {
        // Use the next streak number since we're playing after incrementing
        const nextStreak = currentStreak + 1;
        const soundIndex = Math.min(nextStreak, 9);
        const audio = correctAudioRefs.current[soundIndex];
        
        if (!audio) {
            console.error(`No audio found for streak ${nextStreak}`);
            return;
        }

        // Stop any currently playing correct sounds
        Object.values(correctAudioRefs.current).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        
        try {
            audio.currentTime = 0;
            await audio.play();
        } catch (error) {
            console.error('Error playing streak sound:', error);
        }
    };

    if (questions.length === 0 && !gameOver) {
        return <Typography sx={{textAlign: 'center', color: 'white', p:3, fontSize: '1.5rem'}}>Loading questions, please wait...</Typography>;
    }
    if (gameOver) {
        return <Typography variant="h4" sx={{ textAlign: 'center', color: 'white', p:3 }}>Saving results...</Typography>;
    }
    if (!currentQuestionData) {
        return <Typography sx={{ textAlign: 'center', color: 'white', p:3, fontSize: '1.5rem' }}>Preparing challenge...</Typography>;
    }
    
    const timerProgress = (timeLeft / (challengeConfig?.initialQuestionTimeSeconds || 15)) * 100;

    return (
        <Box sx={{
            width: '100vw',
            height: '100vh',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            py: 2
        }}>
            {comboMessage && (
                <Typography sx={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 'clamp(2rem, 10vw, 5rem)',
                    fontWeight: 'bold',
                    color: streak > 0 ? '#FFD700' : '#FF6B6B',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    zIndex: 100,
                    animation: 'comboAnim 1s ease-out forwards',
                    '@keyframes comboAnim': {
                        '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
                        '50%': { opacity: 1, transform: 'translate(-50%, -70%) scale(1.2)' },
                        '100%': { opacity: 0, transform: 'translate(-50%, -100%) scale(1)' },
                    },
                }}>
                    {comboMessage}
                </Typography>
            )}

            {/* Main Content */}
            <Box sx={{
                maxWidth: '1200px',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Timer Bar */}
                <Box sx={{ 
                    width: '600px',
                    mt: 2,
                    mb: 3,
                    position: 'relative',
                }}>
                    <Box sx={{
                        height: 20,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 10,
                        backdropFilter: 'blur(8px)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: `${timerProgress}%`,
                            background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
                            transition: 'width 1s linear',
                            boxShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
                        }}/>
                    </Box>
                </Box>

                {/* Game Stats Container */}
                <Paper elevation={3} sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    p: {xs: 1, sm: 1.5},
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    width: '100%',
                    maxWidth: '800px',
                    mb: {xs: 2, sm: 3},
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: {xs: 1, sm: 2},
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #FF5252 0%, #FF1744 100%)',
                        boxShadow: '0 4px 15px rgba(255, 23, 68, 0.3)'
                    }}>
                        {Array.from({ length: challengeConfig?.initialHealth || 3 }).map((_, i) => (
                            i < health 
                                ? <FavoriteIcon key={i} sx={{ 
                                    color: 'white',
                                    fontSize: {xs: '1.5rem', sm: '2rem'},
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                    mx: 0.5,
                                    animation: 'pulse 1.5s infinite'
                                }} />
                                : <FavoriteBorderIcon key={i} sx={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: {xs: '1.5rem', sm: '2rem'},
                                    mx: 0.5
                                }} />
                        ))}
                    </Box>
                    <Box sx={{
                        p: {xs: 1, sm: 2},
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                        boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)'
                    }}>
                        <Typography sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: {xs: '1.2rem', sm: '1.5rem'},
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <ScoreboardIcon sx={{mr: 1, fontSize: 'inherit'}}/> {score}
                        </Typography>
                    </Box>
                    <Box sx={{
                        p: {xs: 1, sm: 2},
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                        boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
                    }}>
                        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: {xs: '0.9rem', sm: '1.2rem'} }}>
                            <WhatshotIcon sx={{verticalAlign: 'bottom', mr: 0.5, fontSize: 'inherit'}}/> {streak}x
                        </Typography>
                    </Box>
                </Paper>

                {/* Question Container */}
                <Paper elevation={3} sx={{
                    p: {xs: 2, sm: 3},
                    my: {xs: 2, sm: 3},
                    background: 'linear-gradient(135deg, rgba(66, 66, 66, 0.95) 0%, rgba(33, 33, 33, 0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    width: '100%',
                    maxWidth: '800px',
                    textAlign: 'center',
                    borderRadius: '20px',
                    minHeight: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Typography variant="h5" sx={{
                        fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        lineHeight: 1.4
                    }}>
                        {currentQuestionData?.questionText}
                    </Typography>
                </Paper>

                {/* Mascot Image */}
                <Box sx={{ my: {xs:1, sm:1.5}, display: 'flex', justifyContent: 'center' }}>
                    <img src={mascotImage} alt="Mascot" style={{ height: 'clamp(80px, 15vh, 120px)', objectFit: 'contain' }} />
                </Box>

                {/* Question Image */}
                {currentQuestionData?.questionImageUrl && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: {xs:1, sm:1.5}, width: '100%', maxHeight: '100px' }}>
                        <img
                            src={currentQuestionData.questionImageUrl.startsWith('http') ? currentQuestionData.questionImageUrl : `/api/media/download/${currentQuestionData.questionImageUrl}`}
                            alt="Question visual hint"
                            style={{ maxWidth: '80%', maxHeight: '100px', borderRadius: '8px', objectFit: 'contain' }}
                        />
                    </Box>
                )}

                {/* Choices Container */}
                <Box sx={{
                    width: '100%',
                    maxWidth: '800px',
                    p: {xs: 1.5, sm: 2},
                    background: 'linear-gradient(135deg, rgba(121, 85, 72, 0.9) 0%, rgba(93, 64, 55, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    overflowY: 'auto',
                    maxHeight: '45vh',
                    flexGrow: 0,
                    mb: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Grid container spacing={1} justifyContent="center">
                        {displayedChoices.map((choice) => (
                            <Grid item xs={12} sm={displayedChoices.length > 4 ? 6 : (12 / Math.max(1, displayedChoices.length))} key={choice.choiceId}>
                                <StyledButton
                                    fullWidth
                                    onClick={() => handleAnswerCbRef.current(choice)}
                                    disabled={isAnswerSubmitted}
                                    selected={selectedChoiceId === choice.choiceId}
                                    correct={choice.isCorrect}
                                    submitted={isAnswerSubmitted}
                                >
                                    {choice.choiceText}
                                </StyledButton>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>            {/* Floating Leaderboard */}
            <Box sx={{
                position: 'fixed',
                right: { xs: 16, sm: 32, md: 48 },  // Increased margin from the right edge
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10
            }}>
                {lessonDefinitionId && (
                    <LiveLeaderboard
                        lessonDefinitionId={lessonDefinitionId}
                        currentPlayerLocalScore={score}
                    />
                )}
            </Box>
        </Box>
    );
};

HealthBasedChallenge.propTypes = {
    questions: PropTypes.arrayOf(PropTypes.shape({
        questionId: PropTypes.any.isRequired,
        questionText: PropTypes.string.isRequired,
        questionImageUrl: PropTypes.string,
        choices: PropTypes.arrayOf(PropTypes.shape({
            choiceId: PropTypes.any.isRequired,
            choiceText: PropTypes.string.isRequired,
            isCorrect: PropTypes.bool.isRequired
        })).isRequired
    })).isRequired,
    challengeConfig: PropTypes.shape({
        initialHealth: PropTypes.number,
        initialQuestionTimeSeconds: PropTypes.number,
        challengeType: PropTypes.string
    }).isRequired,
    onChallengeEnd: PropTypes.func.isRequired,
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default HealthBasedChallenge;