import React, { useMemo } from 'react';
import WordFeast from './WordFeast/WordFeast'; // Import the main game component
import { MEDIA_BASE_URL } from '../../config/apiConfig.js';

// This is the wrapper/renderer component
const WordFeastGame = ({ questions = [], onGameComplete = () => {} }) => {

    // useMemo will transform the 'questions' prop into the format 'WordFeast' expects.
    // This logic runs only when the 'questions' prop changes.
    const gameData = useMemo(() => {
        // We assume the WordFeast data is contained in the first question item.
        if (!questions || questions.length === 0) {
            return null;
        }

        const mainQuestion = questions[0];

        // Construct the final gameData object
        return {
            question: {
                word: mainQuestion.questionText,
                // Construct the full URL for the audio file
                soundSrc: mainQuestion.audioPath 
                    ? `${MEDIA_BASE_URL}${mainQuestion.audioPath.replace(/^\/+/, '')}` 
                    : null,
            },
            choices: mainQuestion.choices.map(choice => ({
                id: choice.choiceId,
                word: choice.choiceText,
                isCorrect: choice.isCorrect,
                strength: choice.strength || 1, // Default strength to 1 if not provided
                // Construct the full URL for the audio file
                soundSrc: choice.audioPath 
                    ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` 
                    : null,
            })),
        };
    }, [questions]);

    // If gameData hasn't been processed yet, we can show a loading or empty state.
    if (!gameData) {
        return <div>Preparing WordFeast...</div>; // Or a proper loading component
    }

    return <WordFeast gameData={gameData} onGameComplete={onGameComplete} />;
};

export default WordFeastGame;