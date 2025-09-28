import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MEDIA_BASE_URL } from '../../config/apiConfig.js';
import '../styles/ReadingDefender.css';

function getRandom(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

const ReadingDefender = ({ questions = [], onGameComplete, activityTitle, activityInstructions, difficulty = 'easy' }) => {
    const [gameState, setGameState] = useState('menu');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [wave, setWave] = useState(1);
    const [words, setWords] = useState([]);
    const [target, setTarget] = useState({ text: '', soundSrc: null });
    const [feedback, setFeedback] = useState('');
    const [highestScore, setHighestScore] = useState(0);
    const [showWaveAnnouncer, setShowWaveAnnouncer] = useState(false);
    const [hoveredWord, setHoveredWord] = useState(null);

    const wordBank = useMemo(() => {
        if (!questions || questions.length === 0 || !questions[0].choices) {
            return [{ text: 'No Words', soundSrc: null }];
        }
        return questions[0].choices.map(choice => ({
            text: choice.choiceText,
            soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null
        }));
    }, [questions]);


    const startTimeRef = useRef(Date.now());
    const animRef = useRef(null);
    const containerRef = useRef(null);
    const waveReadyRef = useRef(true);
    const spawnInProgress = useRef(false);
    const laneOccupancy = useRef({});
    const lanesRef = useRef([]);
    const audioRef = useRef(null);

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
        if (waveNum >= 6) {
            setGameState('gameOver');
            return;
        }
        spawnInProgress.current = true;
        generateLanes();

        const targetWordObject = getRandom(wordBank);
        if (!targetWordObject) {
            console.error("Could not get a target word from the word bank.");
            spawnInProgress.current = false;
            return;
        }
        setTarget(targetWordObject);

        const totalCount = 20;
        const numTargetWords = getRandom([3, 4, 5]);
        const wordQueue = new Array(totalCount);
        const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7'];

        const createWordObject = (word) => ({
            id: crypto.randomUUID(),
            text: word.text,
            soundSrc: word.soundSrc,
            speed: .09 + waveNum * (word.text === targetWordObject.text ? 0.1 : 0.3),
            colorClass: getRandom(colors),
        });

        const spacing = Math.floor(totalCount / numTargetWords);
        for (let i = 0; i < numTargetWords; i++) {
            const pos = i * spacing;
            wordQueue[pos] = createWordObject(targetWordObject);
        }

        for (let i = 0; i < totalCount; i++) {
            if (!wordQueue[i]) {
                const distractor = getRandom(wordBank.filter(w => w.text !== targetWordObject.text)) || { text: "Distractor", soundSrc: null };
                wordQueue[i] = createWordObject(distractor);
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
                    setTimeout(spawnNext, 3500);
                } else {
                    setTimeout(trySpawn, 5000);
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

                        if (w.text === target.text) {
                            setLives(l => {
                                const newLives = l - 1;
                                if (newLives <= 0) setGameState('gameOver');
                                return newLives;
                            });
                            setFeedback(`😬 Missed the target word "${target.text}"!`);
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
                    setShowWaveAnnouncer(true);
                    setTimeout(() => setShowWaveAnnouncer(false), 1500);

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
            return () => {
                cancelAnimationFrame(animRef.current);
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            };
        }
    }, [gameState, wordBank]);

    useEffect(() => {
        if (gameState === 'gameOver' && wave >= 6) {
            const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
            onGameComplete?.({
                score,
                highestScore,
                status: 'COMPLETED',
                timeTaken,
                accuracy: 100,
                questionsAttempted: score,
            });
        }
    }, [gameState, score, highestScore, onGameComplete, wave]);

    const shoot = (w) => {
        speak(w.soundSrc);

        setWords(prev => prev.filter(p => p.id !== w.id));
        if (laneOccupancy.current[w.x] === w.id) {
            laneOccupancy.current[w.x] = null;
        }

        if (w.text === target.text) {
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

    const speak = (audioUrl) => {
        if (!audioUrl) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const sound = new Audio(audioUrl);
        audioRef.current = sound;
        sound.play().catch(e => console.error("Error playing sound:", e));
    };


    return (
        <div className="game-screen">
            {activityTitle && <h2>{activityTitle}</h2>}
            {activityInstructions && <p>{activityInstructions}</p>}

            {gameState === 'menu' && <button onClick={startGame}>Start Game</button>}

            {gameState === 'playing' && (
                <div className="game-area fullscreen" ref={containerRef}>
                    {showWaveAnnouncer && (
                        <div className="wave-announcer">🌊 Wave {wave}!</div>
                    )}
                    <div className="mascot-wrapper">
                        <img src="/mascot.png" className="mascot-img" alt="Mascot" />
                        {feedback && (
                            <div className="mascot-speech">
                                {feedback}
                            </div>
                        )}
                    </div>
                    <div className="bottom-base">TACO TRAY</div>
                    <div className="wave-hud">🌊 Wave: {wave} </div>
                    <div className="left-hud">❤️ Lives: {[...Array(lives)].map((_, i) => (
                        <img key={i} src="/heart.png" alt="life" className="life-icon" />
                    ))}</div>
                    <div className="right-hud">⭐ Score: {score}</div>
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
                        <p className="target-instruction">Target Word: <span className="target-word-display">{difficulty !== 'easy' && target.text}</span></p>
                        <div
                            className="target-bubble"
                            onClick={() => speak(target.soundSrc)}
                            title="Click to hear the word"
                        >
                            <div className="target-letter">{"Click Me"}</div>
                        </div>
                    </div>

                    {words.map(w => (
                        <div
                            key={w.id}
                            className="word"
                            style={{ left: `${w.x}px`, top: `${w.y}px` }}
                            onClick={() => shoot(w)}
                            onMouseEnter={() => {
                                if (difficulty === 'medium' || difficulty === 'hard') {
                                    speak(w.soundSrc);
                                }
                                if (difficulty === 'hard') {
                                    setHoveredWord(w.id);
                                }
                            }}
                            onMouseLeave={() => {
                                if (difficulty === 'hard') {
                                    setHoveredWord(null);
                                }
                            }}
                        >
                            <span className={`word-label ${w.colorClass} ${difficulty === 'easy' ? (w.text === target.text ? 'correct' : 'wrong') : ''}`}>
                                {difficulty === 'hard' && hoveredWord !== w.id ? '' : w.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {gameState === 'gameOver' && wave < 6 && (
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