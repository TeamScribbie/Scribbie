import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Stage, Graphics, Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js'; // Import PIXI for Texture and Rectangle
import GameStage from './GameStage';
import { gameConfig } from './config';
import background1 from './game/spritesheets/background1.png'; // Import the background image

// MODIFIED Background component to use a specific frame from the spritesheet
const Background = ({ width, height }) => {
    // Create the base texture from the loaded image
    const baseTexture = useMemo(() => PIXI.BaseTexture.from(background1), []);

    // Define the frame for the desired background part (x, y, width, height)
    // You mentioned x,y: 0 and size 800*600
    const backgroundFrame = useMemo(() => new PIXI.Rectangle(0, 0, 800, 600), []);

    // Create a new Texture from the base texture and the defined frame
    const backgroundTextureRegion = useMemo(() => new PIXI.Texture(baseTexture, backgroundFrame), [baseTexture, backgroundFrame]);

    return (
        <Sprite
            texture={backgroundTextureRegion} // Use the texture created from the specific region
            x={0}
            y={0}
            width={width}   // These will stretch the 800x600 region to 1280x720
            height={height} // which may cause slight distortion due to aspect ratio difference.
        />
    );
};

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
                    <Background width={gameConfig.width} height={gameConfig.height} />
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