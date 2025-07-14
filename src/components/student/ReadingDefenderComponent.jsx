import React, { useState, useEffect, useRef } from 'react';
import '../styles/ReadingDefender.css';

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
};

const ReadingDefender = ({ questions = [], onGameComplete, activityTitle, activityInstructions }) => {
    const [gameState, setGameState] = useState('menu');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [wave, setWave] = useState(1);
    const [words, setWords] = useState([]);
    const [target, setTarget] = useState('');
    const [feedback, setFeedback] = useState('');
    const [highestScore, setHighestScore] = useState(0);

    const wordBank = questions.length > 0
        ? questions[0].choices.map(c => c.choiceText)
        : ['Broke', 'Choice', 'Not Displayed'];

    const startTimeRef = useRef(Date.now());
    const animRef = useRef(null);
    const containerRef = useRef(null);
    const waveReadyRef = useRef(true);
    const spawnInProgress = useRef(false);
    const laneOccupancy = useRef({});
    const lanesRef = useRef([]);

    const generateLanes = () => {
        const laneCount = 8;
        const spacing = 120;
        const leftOffset = 80;
        const lanes = Array.from({ length: laneCount }, (_, i) => leftOffset + i * spacing);
        lanesRef.current = lanes;
        lanes.forEach(x => laneOccupancy.current[x] = null);
    };

    const getLane = (wordId) => {
        const available = lanesRef.current.filter(x => !laneOccupancy.current[x]);
        if (available.length === 0) return null;
        const lane = getRandom(available);
        laneOccupancy.current[lane] = wordId;
        return lane;
    };

    const startGame = () => {
        reset();
        setGameState('playing');
    };

    const reset = () => {
        setScore(0);
        setLives(3);
        setWave(1);
        setWords([]);
        waveReadyRef.current = true;
        spawnInProgress.current = false;
        if (animRef.current) cancelAnimationFrame(animRef.current);
        startTimeRef.current = Date.now();
    };

    const spawnWave = (waveNum) => {
        spawnInProgress.current = true;
        generateLanes();

        const targetWord = getRandom(wordBank);
        setTarget(targetWord);

        const totalCount = 20;
        const numTargetWords = getRandom([3, 4, 5]);
        const wordQueue = new Array(totalCount);

        const spacing = Math.floor(totalCount / numTargetWords);
        for (let i = 0; i < numTargetWords; i++) {
            const pos = i * spacing;
            wordQueue[pos] = {
                id: crypto.randomUUID(),
                text: targetWord,
                speed: 1 + waveNum * 0.5,
            };
        }

        for (let i = 0; i < totalCount; i++) {
            if (!wordQueue[i]) {
                const distractor = getRandom(wordBank.filter(w => w !== targetWord));
                wordQueue[i] = {
                    id: crypto.randomUUID(),
                    text: distractor,
                    speed: 1 + waveNum * 0.7,
                };
            }
        }

        for (let i = wordQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordQueue[i], wordQueue[j]] = [wordQueue[j], wordQueue[i]];
        }

        let index = 0;
        const spawnNext = () => {
            if (index >= wordQueue.length) {
                spawnInProgress.current = false;
                return;
            }

            const nextWord = wordQueue[index++];
            const trySpawn = () => {
                const lane = getLane(nextWord.id);
                if (lane !== null) {
                    const y = -100;
                    setWords(prev => [...prev, { ...nextWord, x: lane, y }]);
                    setTimeout(spawnNext, 1200);
                } else {
                    setTimeout(trySpawn, 500);
                }
            };

            trySpawn();
        };

        spawnNext();
    };

    const step = () => {
        const containerHeight = containerRef.current?.getBoundingClientRect().height || 800;

        setWords(prev => {
            const updated = prev
                .map(w => ({ ...w, y: w.y + w.speed }))
                .filter(w => {
                    if (w.y > containerHeight - 100) {
                        if (laneOccupancy.current[w.x] === w.id) {
                            laneOccupancy.current[w.x] = null;
                        }

                        if (w.text === target) {
                            setLives(l => {
                                const newLives = l - 1;
                                if (newLives <= 0) setGameState('gameOver');
                                return newLives;
                            });
                            setFeedback(`😬 Missed the target word "${target}"!`);
                        } else {
                            setScore(s => {
                                const newScore = s + 1;
                                if (newScore > highestScore) setHighestScore(newScore);
                                return newScore;
                            });
                        }

                        return false;
                    }
                    return true;
                });

            if (
                updated.length === 0 &&
                gameState === 'playing' &&
                waveReadyRef.current &&
                !spawnInProgress.current
            ) {
                waveReadyRef.current = false;
                setTimeout(() => {
                    setWave(prev => {
                        const next = prev + 1;
                        spawnWave(next);
                        waveReadyRef.current = true;
                        return next;
                    });
                }, 800);
            }

            return updated;
        });

        animRef.current = requestAnimationFrame(step);
    };

    useEffect(() => {
        if (gameState === 'playing') {
            spawnWave(wave);
            animRef.current = requestAnimationFrame(step);
            return () => cancelAnimationFrame(animRef.current);
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'gameOver') {
            const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
            onGameComplete?.({
                score,
                highestScore,
                status: score >= 10 ? 'COMPLETED' : 'FAILED',
                timeTaken,
                accuracy: 100,
                questionsAttempted: score,
            });
        }
    }, [gameState]);

    const shoot = (w) => {
        setWords(prev => prev.filter(p => p.id !== w.id));
        if (laneOccupancy.current[w.x] === w.id) {
            laneOccupancy.current[w.x] = null;
        }

        if (w.text === target) {
            setScore(s => {
                const newScore = s + 10;
                if (newScore > highestScore) setHighestScore(newScore);
                return newScore;
            });
            setFeedback('🎯 Shot the target word!');
        } else {
            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) setGameState('gameOver');
                return newLives;
            });
            setFeedback('⚠️ That was a distractor.');
        }

        setTimeout(() => setFeedback(''), 1200);
    };

    return (
        <div className="game-screen">
            {activityTitle && <h2>{activityTitle}</h2>}
            {activityInstructions && <p>{activityInstructions}</p>}

            {gameState === 'menu' && <button onClick={startGame}>Start Game</button>}

            {gameState === 'playing' && (
                <div className="game-area fullscreen" ref={containerRef}>
                    <div className="mascot-wrapper">
                        <img src="/mascot.png" className="mascot-img" alt="Mascot" />
                        {feedback && (
                            <div className="mascot-speech">
                                {feedback}
                            </div>
                        )}
                    </div>
                    <div className="bottom-base">TACO TRAY</div>
                        <div className="hud">
                        <span>🌊 Wave: {wave}</span>
                        <span>⭐ Score: {score}</span>
                        <span>❤️ Lives: {'❤️'.repeat(lives)}</span>
                    </div>
                    <div className="taco-clouds-sky">
                        {[...Array(12)].map((_, i) => (
                            <img
                                key={i}
                                src="/taco-cloud.png"
                                alt="Taco Cloud"
                                className={`taco-cloud animated-cloud cloud-${i % 4}`}
                                style={{ left: `${i * 10}%` }}
                            />
                        ))}
                    </div>

                    <div className="target-bubble-container">
                        <p className="target-instruction">Target Word</p>
                        <div
                            className="target-bubble"
                            onClick={() => speak(target)}
                            title="Click to hear the word"
                        >
                            <div className="target-letter">{target}</div>
                        </div>
                    </div>

                    {words.map(w => (
                        <div
                            key={w.id}
                            className="word"
                            style={{ left: `${w.x}px`, top: `${w.y}px` }}
                            onClick={() => shoot(w)}
                        >
                            <span className={`word-label ${w.text === target ? 'correct' : 'wrong'}`}>
                                {w.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {gameState === 'gameOver' && (
                <div className="overlay">
                    <h2>Game Over</h2>
                    <p>Your score: {score}</p>
                    <button onClick={startGame} style={{ marginLeft: '1rem' }}>
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReadingDefender;
