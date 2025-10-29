import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MEDIA_BASE_URL } from '../../config/apiConfig.js';
import '../styles/ReadingDefender.css';
import readingDefenderBg from '../../assets/reading-defender.jpg';
import mascotImg from '../../assets/mascot.png';
import tacoCloudImg from '../../assets/taco-cloud.png';
import tacoImg from '../../assets/taco.png';
import cartoonBg from '../../assets/cartoon-bg.jpg';

// HUD icons from public folder
const heartIcon = '/heart.png';
const waveIcon = '/wave.png';

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
    const [feedbackType, setFeedbackType] = useState(''); // 'success', 'error', 'miss'
    const [combo, setCombo] = useState(0);
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
        setCombo(0);
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
                            // Target word missed - lose a life
                            setLives(l => {
                                const newLives = l - 1;
                                if (newLives <= 0) setGameState('gameOver');
                                return newLives;
                            });
                            setCombo(0);
                            const missMessages = [
                                '😬 Oh no! You missed it!',
                                '💔 The target slipped away!',
                                '😰 Quick! Shoot the next one!',
                                '⚡ Don\'t let them pass!'
                            ];
                            setFeedback(missMessages[Math.floor(Math.random() * missMessages.length)]);
                            setFeedbackType('miss');
                            setTimeout(() => {
                                setFeedback('');
                                setFeedbackType('');
                            }, 1500);
                        }
                        // Distractor reached bottom - no penalty, just remove it

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
            setCombo(c => c + 1);
            const newCombo = combo + 1;
            const points = 10 + (newCombo > 1 ? (newCombo - 1) * 5 : 0);
            
            setScore(s => {
                const newScore = s + points;
                if (newScore > highestScore) setHighestScore(newScore);
                return newScore;
            });
            
            let message = '';
            if (newCombo >= 5) {
                message = `🔥 AMAZING! ${newCombo}x COMBO! +${points} pts!`;
            } else if (newCombo >= 3) {
                message = `⚡ ${newCombo}x COMBO! +${points} points!`;
            } else if (newCombo === 2) {
                message = `✨ 2x COMBO! +${points} points!`;
            } else {
                const successMessages = [
                    `🎯 Perfect shot! +${points} points!`,
                    `💫 Excellent! +${points} points!`,
                    `🌟 Nice hit! +${points} points!`,
                    `👏 You got it! +${points} points!`
                ];
                message = successMessages[Math.floor(Math.random() * successMessages.length)];
            }
            
            setFeedback(message);
            setFeedbackType('success');
        } else {
            setCombo(0);
            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) setGameState('gameOver');
                return newLives;
            });
            const errorMessages = [
                '⚠️ Wrong target! -1 life',
                '❌ That\'s not it! -1 life',
                '🚫 Focus on the target! -1 life',
                '💥 Oops! Wrong one! -1 life'
            ];
            setFeedback(errorMessages[Math.floor(Math.random() * errorMessages.length)]);
            setFeedbackType('error');
        }

        setTimeout(() => {
            setFeedback('');
            setFeedbackType('');
        }, 1500);
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
                <div 
                    className="game-area fullscreen" 
                    ref={containerRef}
                    style={{ backgroundImage: `url(${cartoonBg})` }}
                >
                    {/* Wave HUD - Top Right */}
                    <div className="wave-hud">
                        <img src={waveIcon} alt="Wave" className="wave-icon" />
                        Wave {wave}
                    </div>

                    {/* Combo Counter - Below Wave */}
                    {combo > 1 && (
                        <div className="combo-counter">
                            {combo}x COMBO! 🔥
                        </div>
                    )}

                    {/* Bottom Tray for Catching Tacos */}
                    <div className="bottom-tray">
                        <div className="left-hud">
                            <span className="lives-label">Lives:</span>
                            {Array(lives).fill(null).map((_, i) => (
                                <img key={i} src={heartIcon} alt="Heart" className="heart-icon" />
                            ))}
                        </div>
                        <div className="right-hud">
                            Score: {score}
                        </div>
                    </div>

                    {showWaveAnnouncer && (
                        <div className="wave-announcer">
                            <img src={waveIcon} alt="Wave" className="wave-announcer-icon" />
                            Wave {wave}!
                        </div>
                    )}
                    
                    {/* Taco Clouds */}
                    <div className="taco-clouds-row">
                        {[...Array(12)].map((_, i) => (
                            <img
                                key={i}
                                src={tacoCloudImg}
                                alt="Taco Cloud"
                                className={`taco-cloud animated-cloud cloud-${i % 4}`}
                                style={{ left: `${i * 10}%` }}
                            />
                        ))}
                    </div>

                    {/* Mascot with Feedback */}
                    <div className="mascot-wrapper">
                        {feedback && (
                            <div className={`mascot-speech ${feedbackType}`}>
                                {feedback}
                            </div>
                        )}
                        <img
                            src={mascotImg}
                            alt="Mascot"
                            className="mascot-img"
                        />
                    </div>

                    {/* Target Word Bubble */}
                    <div className="target-bubble-container">
                        <p className="target-instruction">Target Word: <span className="target-word-display">{difficulty !== 'easy' && target.text}</span></p>
                        <div
                            className="target-bubble"
                            onClick={() => speak(target.soundSrc)}
                            title="Click to hear the word"
                        >
                            <div className="target-letter">{target.text || "Loading..."}</div>
                        </div>
                    </div>

                    {/* Falling Words */}
                    {words.map(w => (
                        <div
                            key={w.id}
                            className="word"
                            style={{ 
                                left: `${w.x}px`, 
                                top: `${w.y}px`,
                                backgroundImage: `url(${tacoImg})`
                            }}
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
                <div className="overlay" style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                    <h2 style={{ 
                        fontSize: '3rem', 
                        color: '#451513',
                        marginBottom: '20px',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}>💔 Game Over</h2>
                    <p style={{ 
                        fontSize: '1.8rem', 
                        color: '#666',
                        marginBottom: '10px'
                    }}>Your Score: <strong style={{ color: '#FDB10D' }}>{score}</strong></p>
                    <p style={{ 
                        fontSize: '1.5rem', 
                        color: '#666',
                        marginBottom: '30px'
                    }}>Highest Score: <strong style={{ color: '#36B8E4' }}>{highestScore}</strong></p>
                    <button 
                        onClick={startGame} 
                        style={{ 
                            padding: '15px 40px',
                            fontSize: '1.5rem',
                            background: 'linear-gradient(145deg, #FDB10D 0%, #f9b121 100%)',
                            border: '3px solid #f9b121',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 0 #c45911, 0 8px 20px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-3px)';
                            e.target.style.boxShadow = '0 6px 0 #c45911, 0 12px 24px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 0 #c45911, 0 8px 20px rgba(0,0,0,0.2)';
                        }}
                    >
                        🔄 Play Again
                    </button>
                </div>
            )}

            {gameState === 'gameOver' && wave >= 6 && (
                <div className="overlay" style={{
                    background: 'linear-gradient(135deg, #FDB10D 0%, #FFD966 100%)',
                    borderRadius: '24px',
                    padding: '50px',
                    boxShadow: '0 12px 48px rgba(253, 177, 13, 0.4)',
                    border: '4px solid #f9b121'
                }}>
                    <h2 style={{ 
                        fontSize: '4rem', 
                        color: 'white',
                        marginBottom: '20px',
                        textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                        animation: 'bounceIn 0.8s ease-out'
                    }}>🎉 YOU WIN! 🎉</h2>
                    <p style={{ 
                        fontSize: '2rem', 
                        color: 'white',
                        marginBottom: '15px',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}>🏆 All Waves Completed!</p>
                    <p style={{ 
                        fontSize: '1.8rem', 
                        color: 'white',
                        marginBottom: '10px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
                    }}>Final Score: <strong>{score}</strong></p>
                    <p style={{ 
                        fontSize: '1.6rem', 
                        color: 'white',
                        marginBottom: '10px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
                    }}>Highest Score: <strong>{highestScore}</strong></p>
                    <p style={{ 
                        fontSize: '1.4rem', 
                        color: 'white',
                        marginBottom: '30px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
                    }}>Time: <strong>{Math.round((Date.now() - startTimeRef.current) / 1000)}s</strong></p>
                    <button 
                        onClick={startGame} 
                        style={{ 
                            padding: '18px 50px',
                            fontSize: '1.6rem',
                            background: 'white',
                            border: '4px solid #f9b121',
                            borderRadius: '16px',
                            color: '#FDB10D',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 6px 0 #f9b121, 0 10px 30px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-4px)';
                            e.target.style.boxShadow = '0 8px 0 #f9b121, 0 14px 36px rgba(0,0,0,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 6px 0 #f9b121, 0 10px 30px rgba(0,0,0,0.3)';
                        }}
                    >
                        ⭐ Play Again ⭐
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReadingDefender;