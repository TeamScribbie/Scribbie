import React, { useState, useEffect, useRef } from 'react';
import '../styles/ReadingDefender.css';
import { Howl } from 'howler';
import { API_BASE_URL, MEDIA_BASE_URL } from '../../config/apiConfig';

let currentPlayingSound = null;

const playWordSound = (soundUrl) => {
    if (soundUrl) {
        if (currentPlayingSound) {
            currentPlayingSound.stop();
        }

        console.log('Attempting to play sound from URL:', soundUrl);
        const sound = new Howl({
            src: [soundUrl],
            html5: true,
            onloaderror: (id, err) => {
                console.error(`Howler.js: Error loading sound ${soundUrl}:`, err);
                currentPlayingSound = null;
            },
            onplayerror: (id, err) => {
                console.error(`Howler.js: Error playing sound ${soundUrl}:`, err);
                currentPlayingSound = null;
            },
            onend: () => {
                currentPlayingSound = null;
            }
        });
        sound.play();
        currentPlayingSound = sound;
    } else {
        console.warn('No sound URL provided for playback.');
        if (currentPlayingSound) {
            currentPlayingSound.stop();
            currentPlayingSound = null;
        }
    }
};

const ReadingDefender = ({ questions = [], onGameComplete, activityTitle, activityInstructions }) => {
    const getRandom = (arr) => {
        if (!arr || arr.length === 0) {
            console.warn("getRandom called with empty or null array, returning null.");
            return null; // Return null if array is empty
        }
        return arr[Math.floor(Math.random() * arr.length)];
    };

    const [gameState, setGameState] = useState('menu');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [wave, setWave] = useState(1);
    const [words, setWords] = useState([]);
    const [target, setTarget] = useState(null); // Initial state is null
    const [feedback, setFeedback] = useState('');
    const [highestScore, setHighestScore] = useState(0);

    const wordBank = [];
    if (questions.length > 0) {
        questions.forEach(q => {
            if (q.choices && Array.isArray(q.choices)) {
                q.choices.forEach(choice => {
                    wordBank.push({
                        text: choice.choiceText,
                        soundUrl: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath}` : null
                    });
                });
            }
        });
    }

    if (wordBank.length === 0) {
        wordBank.push(
            { text: 'Broke', soundUrl: null },
            { text: 'Choice', soundUrl: null },
            { text: 'Not Displayed', soundUrl: null }
        );
    }


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
        setTarget(null); // Ensure target is reset to null
        waveReadyRef.current = true;
        spawnInProgress.current = false;
        if (animRef.current) cancelAnimationFrame(animRef.current);
        startTimeRef.current = Date.now();
        if (currentPlayingSound) {
            currentPlayingSound.stop();
            currentPlayingSound = null;
        }
    };

    const spawnWave = (waveNum) => {
        spawnInProgress.current = true;
        generateLanes();

        const targetWordObject = getRandom(wordBank);
        // Ensure targetWordObject is not null before setting state and playing sound
        if (targetWordObject) {
            setTarget(targetWordObject);
            playWordSound(targetWordObject.soundUrl);
        } else {
            console.error("Failed to get a target word from wordBank. Check wordBank content.");
            setGameState('gameOver'); // Or handle this error gracefully
            return; // Exit if no target word
        }


        const totalCount = 20;
        const numTargetWords = getRandom([3, 4, 5]);
        const wordQueue = new Array(totalCount);

        const spacing = Math.floor(totalCount / numTargetWords);
        for (let i = 0; i < numTargetWords; i++) {
            const pos = i * spacing;
            wordQueue[pos] = {
                id: crypto.randomUUID(),
                text: targetWordObject.text,
                soundUrl: targetWordObject.soundUrl,
                speed: 1 + waveNum * 0.5,
            };
        }

        for (let i = 0; i < totalCount; i++) {
            if (!wordQueue[i]) {
                const filteredDistractors = wordBank.filter(w => w.text !== targetWordObject.text);
                let distractorObject;

                if (filteredDistractors.length > 0) {
                    distractorObject = getRandom(filteredDistractors);
                } else {
                    console.warn("No unique distractors available. Reusing words or using placeholder.");
                    distractorObject = getRandom(wordBank);
                }

                // Ensure distractorObject is not null before using its properties
                if (distractorObject) {
                    wordQueue[i] = {
                        id: crypto.randomUUID(),
                        text: distractorObject.text,
                        soundUrl: distractorObject.soundUrl,
                        speed: 1 + waveNum * 0.7,
                    };
                } else {
                    // Fallback for distractor if getRandom returns null even from main wordBank
                    wordQueue[i] = {
                        id: crypto.randomUUID(),
                        text: 'ERROR_WORD',
                        soundUrl: null,
                        speed: 1 + waveNum * 0.7,
                    };
                }
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

                        // Use optional chaining for target.text to prevent error
                        if (target?.text && w.text === target.text) {
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
            // Only call spawnWave if target is null (first time entering playing state)
            // or if a new wave needs to be spawned explicitly by the game loop.
            // This prevents re-spawning a wave on every render if target changes.
            if (!target) {
                spawnWave(wave);
            }
            animRef.current = requestAnimationFrame(step);
            return () => cancelAnimationFrame(animRef.current);
        }
        // Cleanup when component unmounts or gameState changes from 'playing'
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [gameState, wave]); // Depend on gameState and wave

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
            if (currentPlayingSound) {
                currentPlayingSound.stop();
                currentPlayingSound = null;
            }
        }
    }, [gameState, score, highestScore, onGameComplete]); // Added dependencies for useEffect

    const shoot = (w) => {
        setWords(prev => prev.filter(p => p.id !== w.id));
        if (laneOccupancy.current[w.x] === w.id) {
            laneOccupancy.current[w.x] = null;
        }

        // Use optional chaining for target.text to prevent error
        if (target?.text && w.text === target.text) {
            playWordSound(w.soundUrl);
            setScore(s => {
                const newScore = s + 10;
                if (newScore > highestScore) setHighestScore(newScore);
                return newScore;
            });
            setFeedback('🎯 Shot the target word!');
        } else {
            playWordSound(w.soundUrl);
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

            {gameState === 'menu' && (
                <div className="game-area fullscreen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
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
                    <h1 style={{ color: 'white', fontSize: '3em', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', zIndex: 1 }}>Taco Game</h1>
                    <button
                        onClick={startGame}
                        style={{
                            padding: '20px 40px',
                            fontSize: '2em',
                            cursor: 'pointer',
                            backgroundColor: '#FFD700',
                            color: '#8B4513',
                            border: '3px solid #8B4513',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            boxShadow: '4px 4px 8px rgba(0,0,0,0.3)',
                            zIndex: 1,
                            marginTop: '20px'
                        }}
                    >
                        Start Game
                    </button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="game-area fullscreen" ref={containerRef}>
                    <div className="bottom-base">TACO TRAY</div>
                    <div className="hud">Wave: {wave} | Score: {score} | Lives: {lives}</div>
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

                    {/* Use optional chaining for target?.text */}
                    {target && (
                        <div
                            className="target"
                            onClick={() => playWordSound(target.soundUrl)}
                            style={{ cursor: 'pointer' }}
                            title="Click to hear"
                        >
                            <strong>{target.text}</strong>
                            <div className="target-instructions">
                                Only shoot this word before it reaches your base!
                            </div>
                        </div>
                    )}


                    {words.map(w => (
                        <div
                            key={w.id}
                            className="word"
                            style={{ left: `${w.x}px`, top: `${w.y}px` }}
                            onClick={() => shoot(w)}
                        >
                            {/* Use optional chaining for target?.text */}
                            <span className={`word-label ${target?.text && w.text === target.text ? 'correct' : 'wrong'}`}>
                                {w.text}
                            </span>
                        </div>
                    ))}

                    {feedback && <div className="feedback">{feedback}</div>}
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