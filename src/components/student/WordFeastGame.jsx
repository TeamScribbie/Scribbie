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
        // === AUDIO DEBUG LOGGING ===
        console.log(" === WORDFEAST AUDIO DEBUG ===");
        console.log(" RAW Question Data:", {
            questionText: mainQuestion.questionText,
            questionSoundUrl: mainQuestion.questionSoundUrl,
            hasQuestionSound: !!mainQuestion.questionSoundUrl
        });
        console.log(" RAW Choices Data:", mainQuestion.choices.map(c => ({
            word: c.choiceText,
            audioPath: c.audioPath,
            hasAudio: !!c.audioPath
        })));

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
        
        console.log(" CONSTRUCTED URLs:");
        console.log("  Question Audio:", data.question.soundSrc || " NO AUDIO");
        console.log("  Choice Audios:", data.choices.map(c => `${c.word}: ${c.soundSrc || " NO AUDIO"}`));
        console.log("  MEDIA_BASE_URL:", MEDIA_BASE_URL);
        console.log(" === END AUDIO DEBUG ===");
        console.log("WordFeastGame - Transformed gameData:", data);
        
        // Test audio URL accessibility
        if (data.question.soundSrc) {
            fetch(data.question.soundSrc, { method: 'HEAD' })
                .then(r => console.log(` Question audio HTTP ${r.status}:`, data.question.soundSrc))
                .catch(e => console.error(` Question audio FAILED:`, data.question.soundSrc, e.message));
        }
        data.choices.forEach((choice, idx) => {
            if (choice.soundSrc) {
                fetch(choice.soundSrc, { method: 'HEAD' })
                    .then(r => console.log(` Choice ${idx} (${choice.word}) audio HTTP ${r.status}:`, choice.soundSrc))
                    .catch(e => console.error(` Choice ${idx} (${choice.word}) audio FAILED:`, choice.soundSrc, e.message));
            }
        });
        
        return data;
    }, [questions]);

    // If gameData hasn't been processed yet, we can show a loading or empty state.
    if (!gameData) {
        return <div>Preparing WordFeast...</div>; // Or a proper loading component
    }

    return <WordFeast gameData={gameData} onGameComplete={onGameComplete} />;
};

export default WordFeastGame;