import React, { useMemo } from 'react';
import WordFeast from './WordFeast/WordFeast'; 
import { MEDIA_BASE_URL } from '../../config/apiConfig.js';

const WordFeastGame = ({ questions = [], onGameComplete = () => {} }) => {

    const gameData = useMemo(() => {
        // We assume the WordFeast data is contained in the first question item.
        if (!questions || questions.length === 0) {
            return null;
        }

        const mainQuestion = questions[0];

        // Construct the final gameData object
        const data = {
            question: {
                word: mainQuestion.questionText,
                // Construct the full URL for the audio file
                soundSrc: mainQuestion.questionSoundUrl
                    ? `${MEDIA_BASE_URL}${mainQuestion.questionSoundUrl.replace(/^\/+/, '')}`
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
        console.log("WordFeastGame - Transformed gameData:", data);
        return data;
    }, [questions]);

    // If gameData hasn't been processed yet, we can show a loading or empty state.
    if (!gameData) {
        return <div>Preparing WordFeast...</div>; // Or a proper loading component
    }

    return <WordFeast gameData={gameData} onGameComplete={onGameComplete} />;
};

export default WordFeastGame;