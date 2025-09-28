import React, { useMemo } from 'react';
import MemoryGame from '../../page/student/MemoryGame.jsx';
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";

const FlipMatchingGame = ({ questions = [], onGameComplete = () => {}, isChallengeMode = false }) => {

    const gameData = useMemo(() => {
        // In challenge mode, create a full "word bank" from all questions and all their choices.
        if (isChallengeMode) {
            const allChoices = questions.flatMap(q => q.choices || []);
            // Ensure we don't have duplicate images/words in the bank
            const uniqueChoices = [...new Map(allChoices.map(item => [item.choiceText, item])).values()];
            return uniqueChoices.map(choice => ({
                src: choice.imagePath ? `${MEDIA_BASE_URL}${choice.imagePath.replace(/^\/+/, '')}` : null,
                word: choice.choiceText,
                soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null,
            })).filter(c => c.src); // Only include items that have an image
        }

        // In normal activity mode, it expects one choice per question to form a pair.
        return questions.map(q => {
            const choice = q.choices?.[0];
            if (!choice) return null;
            return {
                src: choice.imagePath ? `${MEDIA_BASE_URL}${choice.imagePath.replace(/^\/+/, '')}` : null,
                word: choice.choiceText,
                soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null,
            };
        }).filter(Boolean);
    }, [questions, isChallengeMode]);

    // Render the MemoryGame with the processed data and the challenge mode flag
    return <MemoryGame gameData={gameData} onGameComplete={onGameComplete} isChallengeMode={isChallengeMode} />;
};

export default FlipMatchingGame;