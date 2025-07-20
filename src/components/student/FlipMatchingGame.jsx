import React, { useMemo } from 'react';
import MemoryGame from '../../page/student/MemoryGame.jsx'; // Make sure this path is correct
import {MEDIA_BASE_URL} from "../../config/apiConfig.js";

const FlipMatchingGame = ({ questions = [], onGameComplete = () => {} }) => {
    // Transform the 'questions' prop into the format 'MemoryGame' expects.
    // 'useMemo' prevents this from being recalculated on every render.
    const gameData = useMemo(() => {
        return questions.map(q => {
            const choice = q.choices?.[0];
            if (!choice) return null;
            return {
                src: choice.imagePath ? `${MEDIA_BASE_URL}${choice.imagePath.replace(/^\/+/, '')}` : null,
                word: choice.choiceText,
                // Assuming you have an 'audioPath' in your choice object
                soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null,
            };
        }).filter(Boolean); // Filter out any null entries if a question has no choice
    }, [questions]);

    // Render the MemoryGame with the processed data
    return <MemoryGame gameData={gameData} onGameComplete={onGameComplete} />;
};

export default FlipMatchingGame;