import React, { useEffect, useState } from 'react';
import '../styles/FlipMatchingGame.css';

const FlipMatchingGame = ({
                              questions = [],
                              onGameComplete = () => {},  // receives game result object
                          }) => {
    const [gameCards, setGameCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    // Initialize game
    useEffect(() => {
        const pairs = questions.flatMap((q, idx) => {
            const choice = q.choices?.[0];
            if (!choice) return [];
            const word = choice.choiceText;
            const prompt = q.questionText;
            const imageUrl = choice.imagePath
                ? `http://localhost:8080/${choice.imagePath.replace(/^\/+/, '')}`
                : null;
            const base = { word, prompt, flipped: false, matched: false, imageUrl };
            return [
                { ...base, id: `${idx}-${choice.choiceId}-a` },
                { ...base, id: `${idx}-${choice.choiceId}-b` },
            ];
        });

        const shuffled = pairs.sort(() => Math.random() - 0.5);
        setGameCards(shuffled);
        setFlippedCards([]);
        setMatchedCount(0);
        setAttempts(0);
        setScore(0);
        setIsGameOver(false);
        console.log('🔁 Initialized cards', shuffled);
    }, [questions]);

    // Complete check
    useEffect(() => {
        if (!isGameOver && matchedCount * 2 === gameCards.length && gameCards.length > 0) {
            const multiplier = attempts > 0 ? (matchedCount / attempts) : 1;
            const finalScore = Math.round(matchedCount * 100 * multiplier);
            setScore(finalScore);
            setIsGameOver(true);
            console.log('✅ Game complete, score:', finalScore);

            // Build payload similar to ReadingDefender
            const result = {
                score: finalScore,
                matchedCount,
                attempts,
                timeTaken: null, // flip game doesn't track time
                accuracy: attempts > 0 ? Math.round((matchedCount * 2) / (attempts * 2) * 100) : 0,
                questionsAttempted: matchedCount,
                status: 'COMPLETED',
            };

            onGameComplete(result);
        }
    }, [matchedCount, isGameOver]);

    const handleCardClick = (card) => {
        if (card.flipped || card.matched || flippedCards.length >= 2 || isGameOver) return;

        setGameCards(prev =>
            prev.map(c => c.id === card.id ? { ...c, flipped: true } : c)
        );

        const newFlipped = [...flippedCards, card];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setAttempts(a => a + 1);
            const [first, second] = newFlipped;
            const isMatch = first.id.split('-')[1] === second.id.split('-')[1];

            setTimeout(() => {
                setGameCards(prev =>
                    prev.map(c =>
                        c.id.split('-')[1] === first.id.split('-')[1] && isMatch
                            ? { ...c, matched: true }
                            : (!isMatch && (c.id === first.id || c.id === second.id))
                                ? { ...c, flipped: false }
                                : c
                    )
                );
                if (isMatch) setMatchedCount(m => m + 1);
                setFlippedCards([]);
            }, isMatch ? 600 : 800);
        }
    };

    return (
        <div className="flip-game-container">
            <h2>Memory Game</h2>
            <div className="score-panel">
                Matched: {matchedCount} | Attempts: {attempts} | Score: {score}
            </div>

            {isGameOver && (
                <div className="game-complete-overlay">
                    🎉 Game complete! Final Score: {score}
                </div>
            )}

            <div className="card-grid">
                {gameCards.map(card => (
                    <div
                        key={card.id}
                        className={`card ${card.flipped || card.matched ? 'flipped' : ''}`}
                        onClick={() => handleCardClick(card)}
                    >
                        <div className="card-inner">
                            <div className="card-front">🔒</div>
                            <div className="card-back">
                                {card.imageUrl && (
                                    <img src={card.imageUrl} alt={card.word} className="card-image" />
                                )}
                                <div className="card-text">
                                    <strong>{card.prompt}</strong><br />
                                    {card.word}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlipMatchingGame;
