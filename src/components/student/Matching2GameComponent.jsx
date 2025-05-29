// Path: AI Context/Frontend/components/student/Matching2GameComponent.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Grid, Paper, IconButton, CircularProgress, keyframes } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

// Import sounds
import correct1 from '../../assets/sounds/correct1.ogg';
import correct2 from '../../assets/sounds/correct2.ogg';
import correct3 from '../../assets/sounds/correct3.ogg';
import correct4 from '../../assets/sounds/correct4.ogg';
import correct5 from '../../assets/sounds/correct5.ogg';
import correct6 from '../../assets/sounds/correct6.ogg';
import correct7 from '../../assets/sounds/correct7.ogg';
import correct8 from '../../assets/sounds/correct8.ogg';
import correct9 from '../../assets/sounds/correct9.ogg';
import wrongSound from '../../assets/sounds/wrong.ogg';
import winSound from '../../assets/sounds/win.ogg';
import loseSound from '../../assets/sounds/lose.ogg';

// FireAnimation Component
const FireAnimation = ({ streak }) => {
    const canvasRef = useRef(null);
    const appRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        if (streak < 1) return;
        
        // Animation code would go here
        // For now, we'll just use the visual element
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

const pulseGreen = keyframes`
  0% { 
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.8);
    background-color: #4CAF50;
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(76, 175, 80, 0.3);
    background-color: #66BB6A;
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    background-color: #4CAF50;
  }
`;

const pulseRed = keyframes`
  0% { 
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.8);
    background-color: #F44336;
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(244, 67, 54, 0.3);
    background-color: #EF5350;
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
    background-color: #F44336;
  }
`;

const GAME_DURATION_SECONDS = 60;
const QUESTIONS_PER_ROUND = 4; 

// Helper to shuffle an array
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const Matching2GameComponent = ({
    questions: allQuestionsFromProps, // Renamed to avoid confusion
    onGameComplete,
    activityTitle, // For display if needed
    classroomId,
    lessonDefinitionId
}) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Items for display
    const [questionItems, setQuestionItems] = useState([]); // { id, text, isMatched, isSelected }
    const [choiceItems, setChoiceItems] = useState([]);   // { id, text, originalQuestionId, isMatched, isSelected }

    const [selectedQuestion, setSelectedQuestion] = useState(null); // Stores the selected question item object
    const [selectedChoice, setSelectedChoice] = useState(null);     // Stores the selected choice item object
    
    const [showFeedback, setShowFeedback] = useState(false); // To control feedback display and disable clicks
    const [feedbackType, setFeedbackType] = useState(''); // 'correct' or 'incorrect'

    const timerRef = useRef(null);
    const questionPoolRef = useRef([]); // Holds all available questions that haven't been fully matched yet
    const questionsUsedInCurrentSetupRef = useRef(new Set()); // IDs of questions used to form the current display    // Audio Refs
    const correctAudioRefs = useRef({
        1: new Audio(correct1),
        2: new Audio(correct2),
        3: new Audio(correct3),
        4: new Audio(correct4),
        5: new Audio(correct5),
        6: new Audio(correct6),
        7: new Audio(correct7),
        8: new Audio(correct8),
        9: new Audio(correct9),
    });
    const wrongAudioRef = useRef(new Audio(wrongSound));
    const winAudioRef = useRef(new Audio(winSound));
    const loseAudioRef = useRef(new Audio(loseSound));

    const playSound = async (audioRef, pitchMultiplier = 1) => {
        try {
            const audio = audioRef.current;
            audio.currentTime = 0;
            audio.playbackRate = pitchMultiplier;
            await audio.play();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const playCorrectSound = (streak) => {
        const soundIndex = Math.min(streak, 9);
        playSound(correctAudioRefs.current[soundIndex].cloneNode());
    };

    const setupNewRound = useCallback(() => {
        setShowFeedback(false);
        setSelectedQuestion(null);
        setSelectedChoice(null);

        // If pool is empty, try to refill it from all questions (or a subset if already used some)
        if (questionPoolRef.current.length < QUESTIONS_PER_ROUND) {
            // Filter out questions whose all correct choices have been matched (if tracking that level of detail)
            // For simplicity now, we'll just reshuffle if we run low.
            // A more complex logic would track usage of specific question-choice pairs.
             const availableQuestions = allQuestionsFromProps.filter(
                q => !questionsUsedInCurrentSetupRef.current.has(q.questionId) // Avoid immediate reuse if possible
            );
            if (availableQuestions.length < QUESTIONS_PER_ROUND && allQuestionsFromProps.length >= QUESTIONS_PER_ROUND) {
                 // Not enough fresh questions, reset used set and use all for pool
                questionsUsedInCurrentSetupRef.current.clear();
                questionPoolRef.current = shuffleArray([...allQuestionsFromProps]);
            } else if (availableQuestions.length >= QUESTIONS_PER_ROUND) {
                 questionPoolRef.current = shuffleArray(availableQuestions);
            } else if (allQuestionsFromProps.length > 0) { // Not enough for a full new round, use what's left or all
                questionPoolRef.current = shuffleArray([...allQuestionsFromProps]);
                questionsUsedInCurrentSetupRef.current.clear(); // Allow reuse
            } else { // No questions at all
                 setGameOver(true); // No data to play
                 return;
            }
        }
        
        // Take questions for the current round
        const roundQuestionObjects = questionPoolRef.current.slice(0, QUESTIONS_PER_ROUND);
        if (roundQuestionObjects.length === 0) {
            setGameOver(true); // No more questions to display
            return;
        }
        
        roundQuestionObjects.forEach(q => questionsUsedInCurrentSetupRef.current.add(q.questionId));        // Create question items with their paired choices
        const qItems = roundQuestionObjects.map(q => ({
            id: q.questionId,
            text: q.questionText,
            isMatched: false,
            isSelected: false,
            type: 'question'
        }));

        const cItems = roundQuestionObjects.map(q => {
            const choice = q.choices[Math.floor(Math.random() * q.choices.length)];
            return {
                id: choice.choiceId,
                text: choice.choiceText,
                originalQuestionId: q.questionId,
                isMatched: false,
                isSelected: false,
                type: 'choice'
            };
        });

        setQuestionItems(shuffleArray(qItems));
        setChoiceItems(shuffleArray(cItems));

    }, [allQuestionsFromProps]);

    useEffect(() => {
        // Initialize question pool
        if (allQuestionsFromProps && allQuestionsFromProps.length > 0) {
            questionPoolRef.current = shuffleArray([...allQuestionsFromProps]);
            setupNewRound();
        } else if(allQuestionsFromProps) { // If it's an empty array after fetch
            setGameOver(true); // No questions to play with
        }
    }, [allQuestionsFromProps, setupNewRound]);


    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && !gameOver) {
            setGameOver(true);
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, gameOver]);

    useEffect(() => {
        if (gameOver) {
            clearTimeout(timerRef.current);
            // audioGameEnd.current?.play();
            onGameComplete({
                score,
                status: 'COMPLETED', // Assuming game completes, not fails due to lives here
                timeTaken: GAME_DURATION_SECONDS - timeLeft,
                highestStreak: 0, // You can add streak logic if desired
                accuracy: 0,      // Can be calculated based on attempts vs. correct matches
                questionsAttempted: score / 100, // Example: if each match is 100 points
            });
        }
    }, [gameOver, onGameComplete, score, timeLeft]);

    const handleItemClick = (item, columnType) => {
        if (showFeedback || gameOver || item.isMatched || item.isSelected) return;

        if (columnType === 'question') {
            setSelectedQuestion(item);
            setQuestionItems(prev => prev.map(q => q.id === item.id ? { ...q, isSelected: true } : { ...q, isSelected: false } ));
            if (selectedChoice) { // A choice was already selected, now a question is selected
                checkMatch(item, selectedChoice);
            } else {
                // Only a question is selected, keep other column selectable
                 setChoiceItems(prev => prev.map(c => ({...c, isSelected: false})));
            }
        } else if (columnType === 'choice') {
            setSelectedChoice(item);
            setChoiceItems(prev => prev.map(c => c.id === item.id ? { ...c, isSelected: true } : { ...c, isSelected: false } ));
            if (selectedQuestion) { // A question was already selected, now a choice is selected
                checkMatch(selectedQuestion, item);
            } else {
                // Only a choice is selected, keep other column selectable
                setQuestionItems(prev => prev.map(q => ({...q, isSelected: false})));
            }
        }
    };

    const checkMatch = (question, choice) => {
        setShowFeedback(true);
        if (question.id === choice.originalQuestionId) {
            // Correct Match!
            setFeedbackType('correct');
            // audioCorrect.current?.play();
            setScore(prevScore => prevScore + 100);
            setStreak(prevStreak => prevStreak + 1);

            setTimeout(() => {
                setQuestionItems(prev => prev.map(q => q.id === question.id ? { ...q, isMatched: true, isSelected: false } : q));
                setChoiceItems(prev => prev.map(c => c.id === choice.id ? { ...c, isMatched: true, isSelected: false } : c));
                
                setSelectedQuestion(null);
                setSelectedChoice(null);
                setShowFeedback(false);

                // Check if all displayed questions are matched for the current setup
                const allDisplayQuestionsMatched = questionItems.filter(q => !q.isMatched).length === 1 && questionItems.find(q=>q.id === question.id); 
                // The above check means this was the last question to be matched on screen
                
                if (allDisplayQuestionsMatched || choiceItems.filter(c => !c.isMatched && c.originalQuestionId === question.id).length === 0) {
                     const remainingUnmatchedQuestions = questionItems.filter(q => !q.isMatched && q.id !== question.id);
                     const remainingUnmatchedChoices = choiceItems.filter(c => !c.isMatched && c.id !== choice.id);

                     if(remainingUnmatchedQuestions.length === 0 || remainingUnmatchedChoices.length === 0){
                        // audioRoundComplete.current?.play();
                        setTimeout(setupNewRound, 600); // Slightly longer delay for round change
                     } else {
                          // If only one item of the pair got matched but there are other items
                          // This branch might need refinement based on how you want partial matches to behave
                     }
                }

            }, 600); // Delay for feedback
        } else {
            // Incorrect Match
            setFeedbackType('incorrect');
            setStreak(0); // Reset streak on wrong answer
            // audioIncorrect.current?.play();
            setTimeout(() => {
                setSelectedQuestion(null);
                setSelectedChoice(null);
                setQuestionItems(prev => prev.map(q => ({ ...q, isSelected: false })));
                setChoiceItems(prev => prev.map(c => ({ ...c, isSelected: false })));
                setShowFeedback(false);
            }, 800); // Longer delay for incorrect
        }
    };

    const handleExitGame = () => {
        if (window.confirm("Are you sure you want to exit? Your current progress in this activity will not be saved.")) {
            clearTimeout(timerRef.current);
            navigate(classroomId && lessonDefinitionId ? `/student/classroom/${classroomId}/lessons` : '/student-homepage');
        }
    };
    
    const getButtonStyles = (item, type) => {
        let bgColor = '#FFD966'; // Default button color
        let textColor = '#451513';
        let borderColor = '#451513';
        let transform = 'scale(1)';
        let boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

        if (item.isMatched) {
            bgColor = '#B0B0B0'; // Grey out matched items
            textColor = '#757575';
            borderColor = '#9E9E9E';
        } else if (showFeedback && item.isSelected) {
            if (feedbackType === 'correct') {
                bgColor = '#4CAF50'; // Green for correct
                textColor = 'white';
                borderColor = '#388E3C';
            } else if (feedbackType === 'incorrect') {
                bgColor = '#F44336'; // Red for incorrect
                textColor = 'white';
                borderColor = '#D32F2F';
            }
        } else if (item.isSelected) {
            bgColor = '#FFC107'; // Highlight selected
            borderColor = '#FFA000';
            transform = 'scale(1.03)';
            boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }

        return {
            m: 0.5, p: {xs: 1, sm: 1.5}, fontSize: {xs: '0.8rem', sm: '0.9rem'},
            minHeight: {xs: '50px', sm: '60px'}, width: '100%',
            bgcolor: bgColor, color: textColor, border: `2px solid ${borderColor}`,
            '&:hover': {
                bgcolor: item.isMatched ? '#B0B0B0' : (item.isSelected && !showFeedback ? '#FFB300' : '#FFC107'),
                transform: item.isMatched ? 'scale(1)' : 'scale(1.02)',
                boxShadow: item.isMatched ? '0 2px 4px rgba(0,0,0,0.1)' :'0 3px 6px rgba(0,0,0,0.2)',
            },
            transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.2s',
            transform: transform, boxShadow: boxShadow,
            textTransform: 'none', fontWeight: 'medium'
        };
    };

    if ((!allQuestionsFromProps || allQuestionsFromProps.length === 0) && !gameOver) {
        return (
             <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p:2, textAlign: 'center'}}>
                <Typography sx={{color: '#451513', fontSize: '1.2rem', mb:2}}>
                    This matching game is empty! Please ask your teacher to add questions. Each question should have choices to form the matching pairs.
                </Typography>
                <Button variant="outlined" onClick={handleExitGame} sx={{borderColor: '#451513', color: '#451513'}}>
                    Go Back to Lessons
                </Button>
            </Box>
        );
    }
    
    if (questionItems.length === 0 && choiceItems.length === 0 && !gameOver && allQuestionsFromProps && allQuestionsFromProps.length > 0) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                <CircularProgress />
                <Typography sx={{ml: 2}}>Setting up the game...</Typography>
            </Box>
        );
    }    return (
        <Box sx={{ 
            bgcolor: '#fff',
            minHeight: '100vh',
            p: 2
        }}>
            {/* Score Display */}
            <Typography 
                variant="h1" 
                sx={{
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: 2,
                    color: '#333'
                }}
            >
                {score}
            </Typography>

            {/* Header Section with Streak */}
            <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                position: 'relative'
            }}>
                <IconButton 
                    onClick={handleExitGame} 
                    sx={{ 
                        color: '#666',
                        p: 1
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>

                {/* Streak Counter */}
                <Box sx={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 217, 102, 0.2)',
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5
                }}>
                </Box>

                {/* Timer */}
                <Box sx={{ 
                    flexGrow: 1,
                    height: 4,
                    bgcolor: '#f0f0f0',
                    borderRadius: 2,
                    mx: 2,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${(timeLeft / GAME_DURATION_SECONDS) * 100}%`,
                        bgcolor: '#b388ff',
                        transition: 'width 1s linear'
                    }}/>
                </Box>
                <Typography sx={{
                    color: '#b388ff',
                    fontWeight: 500,
                    fontSize: '1rem',
                    minWidth: 52,
                    textAlign: 'right'
                }}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Typography>
            </Box>            {/* Game Title */}
            <Typography variant="h1" sx={{ 
                color: '#333',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 500,
                mb: 4
            }}>
                {activityTitle || 'Match the pairs'}
            </Typography>

            {/* Game Grid */}
            <Box sx={{ 
                mb: 4, 
                px: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '900px',
                mx: 'auto'
            }}>
                {/* Questions Row */}
                <Grid 
                    container 
                    spacing={2} 
                    sx={{ 
                        mb: 3,
                        maxWidth: '100%',
                        justifyContent: 'center'
                    }}
                >
                    {questionItems
                        .filter(item => !item.isMatched)
                        .map((item) => (
                            <Grid item xs={6} sm={3} key={item.id} sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                maxWidth: '150px'
                            }}>
                                <Button
                                    onClick={() => handleItemClick(item, 'question')}
                                    disabled={item.isMatched || 
                                        (selectedQuestion && selectedQuestion.id === item.id) || 
                                        gameOver || 
                                        showFeedback}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        bgcolor: item.isMatched ? '#B0B0B0' : 
                                            (showFeedback && item.isSelected) ? 
                                                (feedbackType === 'correct' ? '#4CAF50' : '#F44336') : 
                                                '#FFD966',
                                        color: (showFeedback && item.isSelected) ? '#fff' : '#451513',
                                        border: 'none',
                                        borderRadius: '12px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        animation: (showFeedback && item.isSelected) ?
                                            (feedbackType === 'correct' ? 
                                                `${pulseGreen} 1s ease-in-out` : 
                                                `${pulseRed} 1s ease-in-out`) :
                                            'none',
                                        boxShadow: item.isMatched ? 'none' : 
                                            (showFeedback && item.isSelected) ?
                                                (feedbackType === 'correct' ? 
                                                    '0 0 15px rgba(76, 175, 80, 0.5)' : 
                                                    '0 0 15px rgba(244, 67, 54, 0.5)') :
                                                '0 4px 8px rgba(0,0,0,0.1)',
                                        p: { xs: 1, sm: 2 },
                                        minHeight: { xs: '80px', sm: '100px' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        transform: item.isSelected ? 
                                            (showFeedback ? 
                                                (feedbackType === 'correct' ? 'scale(1.1)' : 'scale(0.95)') : 
                                                'scale(1.05)') : 
                                            'scale(1)',
                                        '&:hover': {
                                            bgcolor: item.isMatched ? '#B0B0B0' : 
                                                (showFeedback && item.isSelected) ? 
                                                    (feedbackType === 'correct' ? '#66BB6A' : '#EF5350') : 
                                                    '#FFB300',
                                            boxShadow: item.isMatched ? 'none' : 
                                                (showFeedback && item.isSelected) ?
                                                    (feedbackType === 'correct' ? 
                                                        '0 0 20px rgba(76, 175, 80, 0.6)' : 
                                                        '0 0 20px rgba(244, 67, 54, 0.6)') :
                                                '0 8px 16px rgba(0,0,0,0.15)',
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: item.isMatched ? '#f8f8f8' : '#FFD966',
                                            color: item.isMatched ? '#999' : '#451513',
                                            opacity: item.isMatched ? 0.7 : 1
                                        }
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            fontWeight: 500,
                                            lineHeight: 1.2,
                                            wordBreak: 'break-word',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: item.isSelected ? 
                                                (showFeedback ? 
                                                    (feedbackType === 'correct' ? 'scale(1.1)' : 'scale(0.95)') : 
                                                    'scale(1.05)') : 
                                                'scale(1)',
                                            color: (showFeedback && item.isSelected) ? '#fff' : '#451513',
                                            textShadow: (showFeedback && item.isSelected) ?
                                                (feedbackType === 'correct' ? 
                                                    '0 0 10px rgba(255, 255, 255, 0.5)' : 
                                                    '0 0 10px rgba(255, 255, 255, 0.5)') :
                                                'none'
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                </Button>
                            </Grid>
                        ))}
                </Grid>

                {/* Choices Row */}
                <Grid 
                    container 
                    spacing={2} 
                    sx={{ 
                        maxWidth: '100%',
                        justifyContent: 'center'
                    }}
                >
                    {choiceItems
                        .filter(item => !item.isMatched)
                        .map((item) => (
                            <Grid item xs={6} sm={3} key={item.id} sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                maxWidth: '150px'
                            }}>
                                <Button
                                    onClick={() => handleItemClick(item, 'choice')}
                                    disabled={item.isMatched || 
                                        (selectedChoice && selectedChoice.id === item.id) || 
                                        gameOver || 
                                        showFeedback}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        bgcolor: item.isMatched ? '#B0B0B0' : 
                                            (showFeedback && item.isSelected) ? 
                                                (feedbackType === 'correct' ? '#4CAF50' : '#F44336') : 
                                                '#FFD966',
                                        color: (showFeedback && item.isSelected) ? '#fff' : '#451513',
                                        border: 'none',
                                        borderRadius: '12px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        animation: (showFeedback && item.isSelected) ?
                                            (feedbackType === 'correct' ? 
                                                `${pulseGreen} 1s ease-in-out` : 
                                                `${pulseRed} 1s ease-in-out`) :
                                            'none',
                                        boxShadow: item.isMatched ? 'none' : 
                                            (showFeedback && item.isSelected) ?
                                                (feedbackType === 'correct' ? 
                                                    '0 0 15px rgba(76, 175, 80, 0.5)' : 
                                                    '0 0 15px rgba(244, 67, 54, 0.5)') :
                                                '0 4px 8px rgba(0,0,0,0.1)',
                                        p: { xs: 1, sm: 2 },
                                        minHeight: { xs: '80px', sm: '100px' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        transform: item.isSelected ? 
                                            (showFeedback ? 
                                                (feedbackType === 'correct' ? 'scale(1.1)' : 'scale(0.95)') : 
                                                'scale(1.05)') : 
                                            'scale(1)',
                                        '&:hover': {
                                            bgcolor: item.isMatched ? '#B0B0B0' : 
                                                (showFeedback && item.isSelected) ? 
                                                    (feedbackType === 'correct' ? '#66BB6A' : '#EF5350') : 
                                                    '#FFB300',
                                            boxShadow: item.isMatched ? 'none' : 
                                                (showFeedback && item.isSelected) ?
                                                    (feedbackType === 'correct' ? 
                                                        '0 0 20px rgba(76, 175, 80, 0.6)' : 
                                                        '0 0 20px rgba(244, 67, 54, 0.6)') :
                                                '0 8px 16px rgba(0,0,0,0.15)',
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: item.isMatched ? '#f8f8f8' : '#FFD966',
                                            color: item.isMatched ? '#999' : '#451513',
                                            opacity: item.isMatched ? 0.7 : 1
                                        }
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            fontWeight: 500,
                                            lineHeight: 1.2,
                                            wordBreak: 'break-word',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: item.isSelected ? 
                                                (showFeedback ? 
                                                    (feedbackType === 'correct' ? 'scale(1.1)' : 'scale(0.95)') : 
                                                    'scale(1.05)') : 
                                                'scale(1)',
                                            color: (showFeedback && item.isSelected) ? '#fff' : '#451513',
                                            textShadow: (showFeedback && item.isSelected) ?
                                                (feedbackType === 'correct' ? 
                                                    '0 0 10px rgba(255, 255, 255, 0.5)' : 
                                                    '0 0 10px rgba(255, 255, 255, 0.5)') :
                                                'none'
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                </Button>
                            </Grid>
                        ))}
                </Grid>
            </Box>
        </Box>
    );
};

Matching2GameComponent.propTypes = {
    questions: PropTypes.arrayOf(PropTypes.shape({
        questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        questionText: PropTypes.string.isRequired,
        choices: PropTypes.arrayOf(PropTypes.shape({
            choiceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            choiceText: PropTypes.string.isRequired,
            isCorrect: PropTypes.bool // This might not be directly used for matching logic here but good to have
        })).isRequired,
    })).isRequired,
    onGameComplete: PropTypes.func.isRequired,
    activityTitle: PropTypes.string,
    classroomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Matching2GameComponent;