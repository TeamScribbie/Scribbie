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
    const [gameSize, setGameSize] = useState({ width: gameConfig.width, height: gameConfig.height });
    const gameContainerRef = useRef(null);

    // Effect for resizing and other logic
    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const ratio = gameConfig.width / gameConfig.height;
            let newWidth = screenWidth;
            let newHeight = newWidth / ratio;

            if (newHeight > screenHeight) {
                newHeight = screenHeight;
                newWidth = newHeight * ratio;
            }
            setGameSize({ width: newWidth, height: newHeight });
        };
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#1a1a1a';
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.style.cssText = '';
        };
    }, []);

    // This effect now listens for the 'd', 'b', and 'g' keys to be held down
    useEffect(() => {
        const keysPressed = new Set();

        const handleKeyDown = (event) => {
            keysPressed.add(event.key.toLowerCase());

            // Check if all three required keys are in the set
            if (keysPressed.has('d') && keysPressed.has('b') && keysPressed.has('g')) {
                // Clear the set to prevent this from firing again until the keys are released and re-pressed
                keysPressed.clear();
                setDebugMode(prevMode => !prevMode);
            }
        };

        const handleKeyUp = (event) => {
            keysPressed.delete(event.key.toLowerCase());
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup: remove the event listeners when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []); // Empty dependency array means this effect runs only once

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

    const gameWrapperStyle = {
        width: gameSize.width,
        height: gameSize.height,
        cursor: 'none'
    };

    const overlayStyle = {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', cursor: 'default', zIndex: 100
    };

    return (
        <div style={containerStyle}>
            <div ref={gameContainerRef} style={gameWrapperStyle}>
                <Stage width={gameSize.width} height={gameSize.height}>
                    <Background width={gameSize.width} height={gameSize.height} color={0x0b1d3a} />
                    <GameStage
                        key={key}
                        width={gameSize.width}
                        height={gameSize.height}
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