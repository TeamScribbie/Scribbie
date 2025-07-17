import React, { useMemo } from 'react';
import MemoryGame from '../../page/student/MemoryGame.jsx'; // Ensure this path is correct
import { MEDIA_BASE_URL } from '../../config/apiConfig.js';

const FlipMatchingGame = ({ questions = [], onGameComplete = () => {} }) => {
    // Transform the 'questions' prop into the format 'MemoryGame' expects.
    const gameData = useMemo(() => {
        return questions.map(q => {
            const choice = q.choices?.[0];
            if (!choice) return null;

            return {
                src: choice.imagePath ? `${MEDIA_BASE_URL}${choice.imagePath.replace(/^\/+/, '')}` : null,
                word: choice.choiceText,
                soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null,
            };
        }).filter(Boolean); // Remove any null entries
    }, [questions]);

    return <MemoryGame gameData={gameData} onGameComplete={onGameComplete} />;
};

export default FlipMatchingGame;
