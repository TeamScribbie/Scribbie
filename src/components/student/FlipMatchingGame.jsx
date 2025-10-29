import React, { useMemo } from 'react';
import MemoryGame from '../../page/student/MemoryGame.jsx';
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";

// FIX 1: Add `activityDetails` to the list of props this component accepts.
const FlipMatchingGame = ({ questions = [], onGameComplete = () => {}, activityDetails = {}, isChallengeMode = false }) => {

    // DEBUG: Let's log the details as they arrive in this component.
    console.log("FlipMatchingGame received these activityDetails:", activityDetails);

    const gameData = useMemo(() => {
        console.log(" === MEMORY GAME AUDIO DEBUG ===");
        console.log(" Challenge Mode:", isChallengeMode);
        console.log(" Total Questions:", questions.length);
        
        // In challenge mode, create a full "word bank" from all questions and all their choices.
        if (isChallengeMode) {
            const allChoices = questions.flatMap(q => q.choices || []);
            console.log(" All Choices Count:", allChoices.length);
            console.log(" Sample Raw Choice:", allChoices[0]);
            
            // Ensure we don't have duplicate images/words in the bank
            const uniqueChoices = [...new Map(allChoices.map(item => [item.choiceText, item])).values()];
            const result = uniqueChoices.map(choice => ({
                src: choice.imagePath ? `${MEDIA_BASE_URL}${choice.imagePath.replace(/^\/+/, '')}` : null,
                word: choice.choiceText,
                soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null,
            })).filter(c => c.src); // Only include items that have an image
            
            console.log(" Audios with paths:", result.filter(r => r.soundSrc).length);
            console.log(" Audios WITHOUT paths:", result.filter(r => !r.soundSrc).length);
            console.log(" Sample Constructed:", result[0]);
            console.log(" === END AUDIO DEBUG ===");
            return result;
        }

        // In normal activity mode, it expects one choice per question to form a pair.
        const result = questions.map(q => {
            const choice = q.choices?.[0];
            if (!choice) {
                console.log(" WARNING: Question without choices:", q);
                return null;
            }
            return {
                src: choice.imagePath ? `${MEDIA_BASE_URL}${choice.imagePath.replace(/^\/+/, '')}` : null,
                word: choice.choiceText,
                soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null,
            };
        }).filter(Boolean);
console.log(" Normal Mode Results:", result.length);
        console.log(" With Audio:", result.filter(r => r.soundSrc).length);
        console.log(" WITHOUT Audio:", result.filter(r => !r.soundSrc).length);
        console.log(" Sample:", result[0]);
        console.log(" === END AUDIO DEBUG ===");
        return result;
    }, [questions, isChallengeMode]);

    // Combined props from both branches
    return <MemoryGame
        gameData={gameData}
        onGameComplete={onGameComplete}
        activityDetails={activityDetails}
        isChallengeMode={isChallengeMode}
    />;
};

export default FlipMatchingGame;