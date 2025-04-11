// src/components/Games/GameLogic.jsx
import { useState, useEffect, useCallback } from 'react';

// --- Placeholder Data ---
// Replace this with actual data structure once backend is ready
const placeholderQuestions = [
    {
        id: 1,
        type: 'multiple-choice', // Example type
        prompt: 'Which of these means "hello"?',
        options: ['Goodbye', 'Hello', 'Thank you', 'Apple'],
        correctAnswer: 'Hello',
    },
    {
        id: 2,
        type: 'multiple-choice',
        prompt: 'Translate "apple" to Spanish.',
        options: ['Manzana', 'Naranja', 'Plátano', 'Uva'],
        correctAnswer: 'Manzana',
    },
    {
        id: 3,
        type: 'multiple-choice',
        prompt: 'What is "thank you" in French?',
        options: ['Bonjour', 'Au revoir', 'Merci', 'Oui'],
        correctAnswer: 'Merci',
    },
    // Add more questions as needed
];
// --- End Placeholder Data ---

export function useGameLogic(lessonId) { // Pass lessonId if needed for API
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null); // null, true, or false
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('loading'); // loading, playing, feedback, finished
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch questions - replace with API call
    const fetchQuestions = useCallback(async () => {
        console.log('Fetching questions for lesson:', lessonId); // Log lessonId if used
        setIsLoading(true);
        setError(null);
        setGameState('loading');
        try {
            // --- TODO: Replace with your API call ---
            // Example: const response = await fetch(`/api/lessons/${lessonId}/questions`);
            // if (!response.ok) throw new Error('Failed to fetch questions');
            // const data = await response.json();
            // setQuestions(data);

            // Using placeholder data for now:
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            setQuestions(placeholderQuestions);
            // --- End API call replacement ---

            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setScore(0);
            setGameState('playing');
        } catch (err) {
            console.error("Error fetching questions:", err);
            setError(err.message || 'Could not load questions.');
            setGameState('error');
        } finally {
            setIsLoading(false);
        }
    }, [lessonId]); // Dependency array includes lessonId

    // Fetch questions on initial load or when lessonId changes
    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]); // Use the memoized fetchQuestions

    // Handle selecting an answer
    const handleAnswerSelect = (answer) => {
        if (gameState === 'playing') {
            setSelectedAnswer(answer);
            setIsCorrect(null); // Reset correctness state until check
        }
    };

    // Handle submitting the selected answer
    const handleSubmit = () => {
        if (!selectedAnswer || gameState !== 'playing') return;

        const currentQuestion = questions[currentQuestionIndex];
        const correct = selectedAnswer === currentQuestion.correctAnswer;

        setIsCorrect(correct);
        if (correct) {
            setScore(prevScore => prevScore + 1); // Increment score
        }
        setGameState('feedback');

        // --- TODO: Optionally send answer result to backend ---
        // Example: await fetch(`/api/progress`, { method: 'POST', body: JSON.stringify({ questionId: currentQuestion.id, isCorrect: correct }) });
        // --- End optional API call ---
    };

    // Handle moving to the next question or finishing
    const handleNext = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setGameState('playing');
        } else {
            setGameState('finished');
            // --- TODO: Optionally send final score/completion to backend ---
             // Example: await fetch(`/api/lessons/${lessonId}/complete`, { method: 'POST', body: JSON.stringify({ score: score }) });
            // --- End optional API call ---
        }
    };

    // Function to restart the game
    const restartGame = () => {
        // Option 1: Re-fetch questions
         fetchQuestions();
        // Option 2: Just reset state if questions don't change
        // setCurrentQuestionIndex(0);
        // setSelectedAnswer(null);
        // setIsCorrect(null);
        // setScore(0);
        // setGameState('playing');
    }

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    return {
        gameState,
        isLoading,
        error,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        selectedAnswer,
        isCorrect,
        score,
        handleAnswerSelect,
        handleSubmit,
        handleNext,
        restartGame,
    };
}