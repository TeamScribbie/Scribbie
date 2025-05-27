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
import correctSound from '../../assets/sounds/correct.ogg';
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
    const correctSoundRef = useRef(null);
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
            if (!correctSoundRef.current) correctSoundRef.current = new Audio(correctSound);
            correctSoundRef.current.currentTime = 0;
            correctSoundRef.current.play().catch(() => {});
        } else {
            if (!wrongSoundRef.current) wrongSoundRef.current = new Audio(wrongSound);
            wrongSoundRef.current.currentTime = 0;
            wrongSoundRef.current.play().catch(() => {});
        }
    }, [isAnswerSubmitted, selectedChoiceId, displayedChoices]);

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
            width: '100vw', height: '100vh', backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            p: 2, overflow: 'hidden', position: 'relative'
        }}>
            {comboMessage && (
                <Typography sx={{
                    position: 'absolute', top: '30%', left: '50%',
                    transform: 'translate(-50%, -50%)', fontSize: 'clamp(2rem, 10vw, 5rem)',
                    fontWeight: 'bold', color: streak > 0 ? '#FFD700' : '#FF6B6B',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)', zIndex: 100,
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

            <Grid container spacing={2} sx={{ height: '100%', maxHeight: '900px', maxWidth: '1600px' }} alignItems="center">
                
                {/* Left Timer Bar and Anubis */}
                <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Box sx={{
                        width: '30px', height: '70%', 
                        maxHeight: '500px',
                        backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '10px',
                        position: 'relative',
                        border: '2px solid #004d00',
                        mb: 2
                    }}>
                        <LinearProgress
                            variant="determinate" value={timerProgress}
                            sx={{
                                width: '100%', height: '100%',
                                position: 'absolute', bottom: 0,
                                transform: 'rotate(180deg)',
                                transformOrigin: 'center',
                                '& .MuiLinearProgress-bar': { backgroundColor: '#38E54D', transition: 'transform .2s linear !important' },
                                backgroundColor: 'transparent',
                            }}
                            orientation="vertical"
                        />
                    </Box>
                    <Box sx={{ width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={anubisImage} alt="Anubis" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} />
                    </Box>
                </Grid>

                {/* Center Content */}
                <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                    <Paper elevation={3} sx={{
                        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
                        p: {xs: 0.5, sm:1}, borderRadius: '15px', backgroundColor: 'rgba(255, 224, 130, 0.8)',
                        width: '100%', maxWidth: '700px', mb: {xs:1, sm:1.5}
                    }}>
                         <Box sx={{ display: 'flex', alignItems: 'center', p: {xs:0.5, sm:1}, borderRadius: 1, backgroundColor: 'rgba(229, 57, 53, 0.7)'}}>
                            {Array.from({ length: challengeConfig?.initialHealth || 3 }).map((_, i) => (
                                i < health ? <FavoriteIcon key={i} sx={{ color: 'white', fontSize: {xs: '1.2rem', sm: '1.5rem'} }} /> : <FavoriteBorderIcon key={i} sx={{ color: 'rgba(255,255,255,0.5)', fontSize: {xs: '1.2rem', sm: '1.5rem'} }} />
                            ))}
                        </Box>
                        <Box sx={{ p: {xs:0.5, sm:1}, borderRadius: 1, backgroundColor: 'rgba(123, 31, 162, 0.7)'}}>
                            <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: {xs: '0.9rem', sm: '1.2rem'} }}>
                                <ScoreboardIcon sx={{verticalAlign: 'bottom', mr: 0.5, fontSize: 'inherit'}}/> {score}
                            </Typography>
                        </Box>
                        <Box sx={{ p: {xs:0.5, sm:1}, borderRadius: 1, backgroundColor: 'rgba(25, 118, 210, 0.7)'}}>
                            <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: {xs: '0.9rem', sm: '1.2rem'} }}>
                                <WhatshotIcon sx={{verticalAlign: 'bottom', mr: 0.5, fontSize: 'inherit'}}/> {streak}x
                            </Typography>
                        </Box>
                    </Paper>

                    <Paper elevation={3} sx={{ p: {xs:1, sm:2}, my: {xs:1, sm:1.5}, backgroundColor: 'rgba(30,30,30,0.85)', color: 'white', width: '100%', maxWidth: '700px', textAlign: 'center', borderRadius: '10px', minHeight: '80px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Typography variant="h5" sx={{ fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', fontWeight: 'bold' }}>
                            {currentQuestionData?.questionText}
                        </Typography>
                    </Paper>
                    
                    <Box sx={{ my: {xs:1, sm:1.5}, display: 'flex', justifyContent: 'center' }}>
                        <img src={mascotImage} alt="Mascot" style={{ height: 'clamp(80px, 15vh, 120px)', objectFit: 'contain' }} />
                    </Box>
                    
                    {currentQuestionData?.questionImageUrl && (
                         <Box sx={{ display: 'flex', justifyContent: 'center', mb: {xs:1, sm:1.5}, width: '100%', maxHeight: '100px' }}>
                            <img
                                src={currentQuestionData.questionImageUrl.startsWith('http') ? currentQuestionData.questionImageUrl : `/api/media/download/${currentQuestionData.questionImageUrl}`}
                                alt="Question visual hint"
                                style={{ maxWidth: '80%', maxHeight: '100px', borderRadius: '8px', objectFit: 'contain' }}
                            />
                        </Box>
                    )}

                    <Box sx={{
                        width: '100%', maxWidth: '700px', p: {xs:0.5, sm:1}, backgroundColor: 'rgba(121, 85, 72, 0.75)',
                        borderRadius: '10px', overflowY: 'auto',
                        maxHeight: {xs: '200px', sm: '250px', md: '300px'}, flexGrow: 1, mb: 1
                    }}>
                        <Grid container spacing={{xs:0.5, sm:1}} justifyContent="center">
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
                </Grid>

                {/* Right Leaderboard */}
                <Grid item xs={2} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {lessonDefinitionId && (
                        <LiveLeaderboard
                            lessonDefinitionId={lessonDefinitionId}
                            currentPlayerLocalScore={score}
                        />
                    )}
                </Grid>
            </Grid>
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
            isCorrect: PropTypes.bool.isRequired,
        })).isRequired,
    })).isRequired,
    challengeConfig: PropTypes.shape({
        initialHealth: PropTypes.number,
        initialQuestionTimeSeconds: PropTypes.number,
        challengeType: PropTypes.string,
    }).isRequired,
    onChallengeEnd: PropTypes.func.isRequired,
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default HealthBasedChallenge;