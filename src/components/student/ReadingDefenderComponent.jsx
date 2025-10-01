import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MEDIA_BASE_URL } from '../../config/apiConfig.js';
import '../styles/ReadingDefender.css';
import readingDefenderBg from '../../assets/reading-defender.jpg';

function getRandom(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

const ReadingDefender = ({ questions = [], onGameComplete, activityTitle, activityInstructions }) => {
    const [gameState, setGameState] = useState('menu');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [wave, setWave] = useState(1);
    const [words, setWords] = useState([]);
    const [target, setTarget] = useState({ text: '', soundSrc: null });
    const [feedback, setFeedback] = useState('');
    const [highestScore, setHighestScore] = useState(0);
    const [showWaveAnnouncer, setShowWaveAnnouncer] = useState(false);

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
            setGameState('gameOver'); // Win condition met
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

        const spacing = Math.floor(totalCount / numTargetWords);
        for (let i = 0; i < numTargetWords; i++) {
            const pos = i * spacing;
            wordQueue[pos] = {
                id: crypto.randomUUID(),
                text: targetWordObject.text,
                soundSrc: targetWordObject.soundSrc,
                speed: 1 + waveNum * 0.5,
            };
        }

        for (let i = 0; i < totalCount; i++) {
            if (!wordQueue[i]) {
                const distractor = getRandom(wordBank.filter(w => w.text !== targetWordObject.text));
                if (distractor) {
                    wordQueue[i] = {
                        id: crypto.randomUUID(),
                        text: distractor.text,
                        soundSrc: distractor.soundSrc,
                        speed: 1 + waveNum * 0.7,
                    };
                } else {
                    wordQueue[i] = {
                        id: crypto.randomUUID(),
                        text: "Distractor",
                        soundSrc: null,
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
            return () => cancelAnimationFrame(animRef.current);
        }
    }, [gameState, wordBank]);

    // This is the corrected section
    useEffect(() => {
        if (gameState === 'gameOver' && wave >= 6) {
            const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
            onGameComplete?.({
                score,
                highestScore,
                status: 'COMPLETED',
                timeTaken,
                accuracy: 100, // Placeholder
                questionsAttempted: score, // Placeholder
            });
        }
    }, [gameState, score, highestScore, onGameComplete, wave]);

    const shoot = (w) => {
        if (w.soundSrc) {
            const sound = new Audio(w.soundSrc);
            sound.play().catch(e => console.error("Error playing taco sound:", e));
        }

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
        const sound = new Audio(audioUrl);
        sound.play().catch(e => console.error("Error playing target word sound:", e));
    };


    return (
        <div className="game-screen" style={gameState === 'menu' ? {
            backgroundImage: `url(${readingDefenderBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        } : {}}>
            {gameState !== 'menu' && activityTitle && <h2>{activityTitle}</h2>}
            {gameState !== 'menu' && activityInstructions && <p>{activityInstructions}</p>}

            {gameState === 'menu' && (
                <div style={{ position: 'relative' }}>
                    {/* Glow effect behind button */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120%',
                        height: '120%',
                        background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
                        animation: 'pulse 2s ease-in-out infinite',
                        pointerEvents: 'none',
                    }}></div>
                    
                    <button 
                        onClick={startGame}
                        style={{
                            position: 'relative',
                            padding: '25px 70px',
                            fontSize: '2.2rem',
                            fontWeight: 900,
                            color: '#FFF',
                            background: 'linear-gradient(145deg, #ff6b35 0%, #f7931e 50%, #ffb84d 100%)',
                            border: '4px solid #FFD700',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 0 #c45911, 0 15px 30px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                            transition: 'all 0.15s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            fontFamily: 'Arial Black, sans-serif',
                            textShadow: '0 3px 5px rgba(0,0,0,0.5), 0 0 10px rgba(255,215,0,0.5)',
                            transform: 'translateY(0)',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-5px) scale(1.05)';
                            e.target.style.boxShadow = '0 12px 0 #c45911, 0 20px 40px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.4)';
                            e.target.style.background = 'linear-gradient(145deg, #ff7c4d 0%, #ffaa33 50%, #ffc55f 100%)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0) scale(1)';
                            e.target.style.boxShadow = '0 8px 0 #c45911, 0 15px 30px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)';
                            e.target.style.background = 'linear-gradient(145deg, #ff6b35 0%, #f7931e 50%, #ffb84d 100%)';
                        }}
                        onMouseDown={(e) => {
                            e.target.style.transform = 'translateY(4px)';
                            e.target.style.boxShadow = '0 4px 0 #c45911, 0 5px 10px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3)';
                        }}
                        onMouseUp={(e) => {
                            e.target.style.transform = 'translateY(-5px) scale(1.05)';
                            e.target.style.boxShadow = '0 12px 0 #c45911, 0 20px 40px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.4)';
                        }}
                    >
                        <span style={{ 
                            position: 'relative',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '2.5rem' }}>▶</span>
                            START GAME
                        </span>
                    </button>
                    
                    {/* Animated sparkles */}
                    <style>{`
                        @keyframes pulse {
                            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
                            50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
                        }
                    `}</style>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="game-area fullscreen" ref={containerRef}>
                    {showWaveAnnouncer && (
                        <div className="wave-announcer">🌊 Wave {wave}!</div>
                    )}
                    
                    {/* Mascot with Feedback */}
                    <div className="mascot-wrapper">
                        {feedback && (
                            <div className="mascot-speech">
                                {feedback}
                            </div>
                        )}
                        <img
                            src="/mascot.png"
                            alt="Mascot"
                            className="mascot-img"
                        />
                    </div>

                    {/* Taco Clouds */}
                    <div className="taco-clouds-row">
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

                    {/* Target Word Bubble */}
                    <div className="target-bubble-container">
                        <p className="target-instruction">Target Word</p>
                        <div
                            className="target-bubble"
                            onClick={() => speak(target.soundSrc)}
                            title="Click to hear the word"
                        >
                            <div className="target-letter">{"Click Me"}</div>
                        </div>
                    </div>

                    {/* Falling Words */}
                    {words.map(w => (
                        <div
                            key={w.id}
                            className="word"
                            style={{ left: `${w.x}px`, top: `${w.y}px` }}
                            onClick={() => shoot(w)}
                        >
                            <span className={`word-label ${w.text === target.text ? 'correct' : 'wrong'}`}>
                                {w.text}
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