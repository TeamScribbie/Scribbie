import React, { useState, useEffect } from 'react';
import { Stage } from '@pixi/react';
import GameStage from './GameStage';
import { gameConfig } from './config';

const WordFeast = ({ gameData = [], onGameComplete = () => {} }) => {
    const [gameOver, setGameOver] = useState(false);
    const [key, setKey] = useState(Date.now());
    const [debugMode, setDebugMode] = useState(false);

    useEffect(() => {
        console.log("WordFeast component received gameData:", gameData);
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
        setKey(Date.now());
    };

    const handleGameOver = (results) => {
        setGameOver(true);
        onGameComplete(results);
    }

    const handleWin = () => {
        console.log("handleWin called in WordFeast component!");
        setGameOver(true); 
        onGameComplete({ status: 'COMPLETED' });
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
                        isGameOver={gameOver}
                        debugMode={debugMode}
                        gameData={gameData}
                    />
                </Stage>
            </div>

            {gameOver && (
                <div style={overlayStyle}>
                    <h1 style={{ color: 'white' }}>Game Over</h1>
                    <button onClick={handleRestart} style={{ padding: '10px 20px', fontSize: '20px', cursor: 'pointer', borderRadius: '8px', border: 'none' }}>Restart</button>
                </div>
            )}
        </div>
    );
};

export default WordFeast;