import React, { useState, useEffect, useRef } from 'react';
import { Stage } from '@pixi/react';
import GameStage from './GameStage';
import WinAnimation from './WinAnimation';
import LoadingScreen from './LoadingScreen';
import { gameConfig } from './config';
import wordFeastBg from '../../../assets/word-feast.jpg';

const WordFeast = ({ gameData = [], onGameComplete = () => {}, fishLimits = { medium: 8, large: 3 } }) => { // <-- ADDED PROP
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [isWinning, setIsWinning] = useState(false);
    const [winData, setWinData] = useState(null);
    const [key, setKey] = useState(Date.now());
    const [debugMode, setDebugMode] = useState(false);
    const startTimeRef = useRef(null);

    useEffect(() => {
        startTimeRef.current = Date.now();
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#1a1a1a';
        return () => {
            document.body.style.cssText = '';
        };
    }, [gameData]);

    useEffect(() => {
        const keysPressed = new Set();
        const handleKeyDown = (event) => {
            keysPressed.add(event.key.toLowerCase());
            if (keysPressed.has('d') && keysPressed.has('b') && keysPressed.has('g')) {
                keysPressed.clear();
                setDebugMode(prevMode => !prevMode);
            }
        };
        const handleKeyUp = (event) => {
            keysPressed.delete(event.key.toLowerCase());
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleRestart = () => {
        setGameOver(false);
        setIsWinning(false);
        setWinData(null);
        setKey(Date.now());
    };

    const handleGameOver = (results) => {
        setGameOver(true);
    }

    const handleWin = (data) => {
        console.log("handleWin called in WordFeast component!");
        setWinData(data);
        setIsWinning(true);
    }

    const handleWinAnimationComplete = () => {
        const endTime = Date.now();
        const timeTaken = startTimeRef.current ? Math.round((endTime - startTimeRef.current) / 1000) : 0;
        
        onGameComplete({
            status: 'COMPLETED',
            score: winData?.score + 5000 || 0,
            timeTaken: timeTaken,
            highestStreak: 0,
            accuracy: 100,
            questionsAttempted: 1,
        });
    }

    const handleStartGame = () => {
        setGameStarted(true);
    }

    const containerStyle = {
        width: '100vw', height: '100vh', display: 'flex',
        justifyContent: 'center', alignItems: 'center', position: 'relative',
        backgroundImage: `url(${wordFeastBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    const gameWrapperStyle = {
        width: gameConfig.width,
        height: gameConfig.height,
        cursor: 'none',
        transform: `scale(min(calc(100vw / ${gameConfig.width}), calc(100vh / ${gameConfig.height})))`,
    };

    const overlayStyle = {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', cursor: 'default', zIndex: 100
    };

    const buttonStyle = {
        padding: '20px 50px',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#fff',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '2px',
    };

    if (!assetsLoaded) {
        return (
            <div style={containerStyle}>
                <div style={gameWrapperStyle}>
                    <LoadingScreen onAssetsLoaded={() => setAssetsLoaded(true)} />
                </div>
            </div>
        );
    }

    if (!gameStarted) {
        return (
            <div style={containerStyle}>
                <div style={{ position: 'relative' }}>
                    {/* Glow effect behind button - Ocean Blue */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120%',
                        height: '120%',
                        background: 'radial-gradient(circle, rgba(0,191,255,0.4) 0%, transparent 70%)',
                        animation: 'pulse 2s ease-in-out infinite',
                        pointerEvents: 'none',
                    }}></div>
                    
                    <button 
                        onClick={handleStartGame}
                        style={{
                            position: 'relative',
                            padding: '25px 70px',
                            fontSize: '2.2rem',
                            fontWeight: 900,
                            color: '#FFF',
                            background: 'linear-gradient(145deg, #006994 0%, #00a8cc 50%, #4dd0e1 100%)',
                            border: '4px solid #00d4ff',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 0 #004d6d, 0 15px 30px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                            transition: 'all 0.15s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            fontFamily: 'Arial Black, sans-serif',
                            textShadow: '0 3px 5px rgba(0,0,0,0.5), 0 0 10px rgba(0,191,255,0.6)',
                            transform: 'translateY(0)',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-5px) scale(1.05)';
                            e.target.style.boxShadow = '0 12px 0 #004d6d, 0 20px 40px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.4)';
                            e.target.style.background = 'linear-gradient(145deg, #0088b8 0%, #00bfff 50%, #5ddef4 100%)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0) scale(1)';
                            e.target.style.boxShadow = '0 8px 0 #004d6d, 0 15px 30px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)';
                            e.target.style.background = 'linear-gradient(145deg, #006994 0%, #00a8cc 50%, #4dd0e1 100%)';
                        }}
                        onMouseDown={(e) => {
                            e.target.style.transform = 'translateY(4px)';
                            e.target.style.boxShadow = '0 4px 0 #004d6d, 0 5px 10px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3)';
                        }}
                        onMouseUp={(e) => {
                            e.target.style.transform = 'translateY(-5px) scale(1.05)';
                            e.target.style.boxShadow = '0 12px 0 #004d6d, 0 20px 40px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.4)';
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
                    <style>{
                        `@keyframes pulse {
                            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
                            50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
                        }`
                    }</style>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={gameWrapperStyle}>
                <Stage width={gameConfig.width} height={gameConfig.height}>
                    <GameStage
                        key={key}
                        viewportWidth={gameConfig.width}
                        viewportHeight={gameConfig.height}
                        worldWidth={gameConfig.worldWidth}
                        worldHeight={gameConfig.worldHeight}
                        onGameOver={handleGameOver}
                        onWin={handleWin}
                        isGameOver={gameOver || isWinning}
                        debugMode={debugMode}
                        gameData={gameData}
                        fishLimits={fishLimits} // <-- PASS PROP DOWN
                    />
                </Stage>
            </div>

            {isWinning && winData && (
                <WinAnimation
                    swallowedWords={winData.swallowedWords}
                    onComplete={handleWinAnimationComplete}
                />
            )}

            {gameOver && !isWinning && (
                <div style={overlayStyle}>
                    <h1 style={{ color: 'white' }}>Game Over</h1>
                    <button onClick={handleRestart} style={{ ...buttonStyle, marginTop: '20px' }}>
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
};

export default WordFeast;