import React, { useMemo } from 'react';
import MemoryGame from '../../page/student/MemoryGame.jsx';
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";

// FIX 1: Add `activityDetails` to the list of props this component accepts.
const FlipMatchingGame = ({ questions = [], onGameComplete = () => {}, activityDetails = {} }) => {

    // DEBUG: Let's log the details as they arrive in this component.
    console.log("FlipMatchingGame received these activityDetails:", activityDetails);

    const gameData = useMemo(() => {
        return questions.map(q => {
            const choice = q.choices?.[0];
            if (!choice) return null;
            return {
                src: choice.imagePath ? `${MEDIA_BASE_URL}${choice.imagePath.replace(/^\/+/, '')}` : null,
                word: choice.choiceText,
                soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null,
            };
        }).filter(Boolean);
    }, [questions]);

    // FIX 2: Pass the `activityDetails` prop down to the MemoryGame component.
    return <MemoryGame
        gameData={gameData}
        onGameComplete={onGameComplete}
        activityDetails={activityDetails}
    />;
};

export default FlipMatchingGame;