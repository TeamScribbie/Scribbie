import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stage, Graphics } from '@pixi/react';
import GameStage from './GameStage';
import { gameConfig } from './config';

const Background = ({ width, height, color }) => (
    <Graphics
        draw={useCallback(g => {
            g.clear().beginFill(color).drawRect(0, 0, width, height).endFill();
        }, [width, height, color])}
    />
);

const WordFeast = ({ gameData = [], onGameComplete = () => {} }) => {
    const [gameOver, setGameOver] = useState(false);
    const [key, setKey] = useState(Date.now());
    const [debugMode, setDebugMode] = useState(false);

    // --- REMOVED: Resizing logic is no longer needed ---

    useEffect(() => {
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#1a1a1a';
        return () => {
            document.body.style.cssText = '';
        };
    }, []);

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

    const containerStyle = {
        width: '100vw', height: '100vh', display: 'flex',
        justifyContent: 'center', alignItems: 'center', position: 'relative',
    };

    // --- MODIFIED: Wrapper now uses fixed size from config ---
    const gameWrapperStyle = {
        width: gameConfig.width,
        height: gameConfig.height,
        cursor: 'none',
        // This will scale the game to fit the screen, centered via flexbox
        transform: `scale(min(calc(100vw / ${gameConfig.width}), calc(100vh / ${gameConfig.height})))`,
    };

    const overlayStyle = {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', cursor: 'default', zIndex: 100
    };

    return (
        <div style={containerStyle}>
            {/* --- MODIFIED: The wrapper div handles the scaling --- */}
            <div style={gameWrapperStyle}>
                {/* --- MODIFIED: Stage now has a fixed size --- */}
                <Stage width={gameConfig.width} height={gameConfig.height}>
                    <Background width={gameConfig.width} height={gameConfig.height} color={0x0b1d3a} />
                    <GameStage
                        key={key}
                        width={gameConfig.width}
                        height={gameConfig.height}
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