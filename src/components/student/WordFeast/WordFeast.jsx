import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Graphics } from '@pixi/react';

import GameStage from './GameStage';
import { gameConfig } from './config';

const Background = ({ width, height, color }) => (
    <Graphics draw={useCallback(g => { g.clear().beginFill(color).drawRect(0, 0, width, height).endFill(); }, [width, height, color])} />
);

const WordFeast = () => {
    const [gameOver, setGameOver] = useState(false);
    const [key, setKey] = useState(Date.now());
    // NEW: State to control debug visibility
    const [debugMode, setDebugMode] = useState(false);
    
    const handleGameOver = () => setGameOver(true);
    const handleRestart = () => {
        setGameOver(false);
        setKey(Date.now()); 
    };

    // NEW: useEffect to handle the keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check for Ctrl + P
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault(); // Prevent the browser's print dialog
                setDebugMode(prevMode => !prevMode); // Toggle debug mode
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // Empty dependency array means this effect runs only once

    return (
        <div className="word-feast-container">
            <div className="pixi-canvas-container" style={{ position: 'relative', cursor: 'none' }}>
                <Stage width={gameConfig.width} height={gameConfig.height}>
                    <Background width={gameConfig.width} height={gameConfig.height} color={0x1099bb} />
                    {/* Pass debugMode as a prop to GameStage */}
                    <GameStage key={key} onGameOver={handleGameOver} isGameOver={gameOver} debugMode={debugMode} />
                </Stage>
                {gameOver && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', cursor: 'default',
                    }}>
                        <h1 style={{ color: 'white', fontSize: '48px' }}>Game Over</h1>
                        <button onClick={handleRestart} style={{ padding: '10px 20px', fontSize: '20px', cursor: 'pointer' }}>
                            Restart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WordFeast;