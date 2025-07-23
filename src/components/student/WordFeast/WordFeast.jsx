import React, { useState, useEffect, useRef } from 'react';
import { Stage } from '@pixi/react';
import GameStage from './GameStage';
import WinAnimation from './WinAnimation'; 
import { gameConfig } from './config';

const WordFeast = ({ gameData = [], onGameComplete = () => {} }) => {
    const [gameOver, setGameOver] = useState(false);
    const [isWinning, setIsWinning] = useState(false); 
    const [winData, setWinData] = useState(null); 
    const [key, setKey] = useState(Date.now());
    const [debugMode, setDebugMode] = useState(false);
    const startTimeRef = useRef(null);

    useEffect(() => {
        console.log("WordFeast component received gameData:", gameData);
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
            score: winData?.score+5000 || 0,
            timeTaken: timeTaken,
            highestStreak: 0, // WordFeast does not have a streak mechanic
            accuracy: 100,      // A win implies 100% accuracy
            questionsAttempted: 1,
        });
    }

    const containerStyle = {
        width: '100vw', height: '100vh', display: 'flex',
        justifyContent: 'center', alignItems: 'center', position: 'relative',
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
                    />
                </Stage>
            </div>
            
            {isWinning && winData && (
                <WinAnimation
                    swallowedWords={winData.swallowedWords}
                    onComplete={handleWinAnimationComplete}
                    
                />
            )}


            {gameOver && !isWinning && ( // Ensure win screen doesn't overlap with game over
                <div style={overlayStyle}>
                    <h1 style={{ color: 'white' }}>Game Over</h1>
                    <button onClick={handleRestart} style={{ padding: '10px 20px', fontSize: '20px', cursor: 'pointer', borderRadius: '8px', border: 'none' }}>Restart</button>
                </div>
            )}
        </div>
    );
};

export default WordFeast;