import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Container, Text, useTick, Sprite } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import * as PIXI from 'pixi.js';

import Player from './Player';
import Fish from './Fish';
import DebugDisplay from './DebugDisplay';
import Monster from './Monster';
import CagedWord from './CagedWord';
import LifeBar from './LifeBar';
import BeCarefulMessage from './BeCarefulMessage';
import GrowthProgressBar from './GrowthProgressBar';
import SequenceDisplay from './SequenceDisplay';
import PauseMenu from './PauseMenu';
import { useGameLogic } from './hooks/useGameLogic';
import { usePhysics } from './hooks/usePhysics';
import { gameConfig } from './config';
import background1 from './game/spritesheets/background1.png';
import IntroAudio from './game/audio/monster/Intro.ogg';

// --- CORRECTED: Import actual audio files ---

import Warn1Ogg from './game/audio/monster/Warn1.ogg';
import Warn2Ogg from './game/audio/monster/Warn2.ogg';
import Warn3Ogg from './game/audio/monster/Warn3.ogg';

// Import background music and ambient sound
import Track1Wav from './game/audio/music/track1.wav';
import WaterAmb1mp3 from './game/audio/music/WaterAmb1.mp3';


const Background = ({ width, height }) => {
    const baseTexture = useMemo(() => PIXI.BaseTexture.from(background1), []);
    const backgroundFrame = useMemo(() => new PIXI.Rectangle(0, 0, 800, 600), []);
    const backgroundTextureRegion = useMemo(() => new PIXI.Texture(baseTexture, backgroundFrame), [baseTexture, backgroundFrame]);
    return (<Sprite texture={backgroundTextureRegion} x={0} y={0} width={width} height={height} />);
};

const MONSTER_WIDTH = 172;
const MONSTER_HEIGHT = 228;

const GameStage = ({ onGameOver, onWin, isGameOver, isPaused, debugMode, viewportWidth, viewportHeight, worldWidth, worldHeight, gameData, fishLimits }) => { // <-- ADDED PROP
    const {
        isLoading, gameState, setGameState, score, setScore,
        player, setPlayer, cagedWords, setCagedWords, monster,
        messages, setMessages, fishLogics, setFishLogics, swallowedWords, setSwallowedWords,
        monsterDashCollisions, setMonsterDashCollisions,
    } = useGameLogic(gameData, worldWidth, worldHeight);

    const [eatTrigger, setEatTrigger] = useState(0);
    const [vomitTrigger, setVomitTrigger] = useState(0);
    const [playerState, setPlayerState] = useState({ name: 'idle', facing: 1 });
    const vomitCooldown = useRef(0);
    const worldContainer = useRef(null);
    
    // Health system states
    const [lives, setLives] = useState(3);
    const [isInvulnerable, setIsInvulnerable] = useState(false);
    const [showWarningMessage, setShowWarningMessage] = useState(false);
    const [isDying, setIsDying] = useState(false); // Disable movement during death
    const invulnerabilityTimerRef = useRef(null);
    const respawnTimerRef = useRef(null);
    
    // Pause system
    const [isGamePaused, setIsGamePaused] = useState(false);
    const bgMusicRef = useRef(null);
    const ambientRef = useRef(null);

    const handleMonsterInteraction = useCallback(() => {
        const playerSequence = swallowedWords.map(w => w.word).join('');
        
        // Check for the win condition first
        if (monster && playerSequence.trim().toLowerCase() === monster.word.trim().toLowerCase()) {
            console.log(" WIN CONDITION MET!");
            if(onWin) onWin({ swallowedWords, score }); // Pass the swallowedWords and score
            return;
        }

        const newCollisionCount = monsterDashCollisions + 1;
        setMonsterDashCollisions(newCollisionCount);

        let dialogue = "";
        let audioSrc = null;

        switch (newCollisionCount) {
            case 1:
                dialogue = "I'm Hungry for the Word: @#%1?";
                audioSrc = Warn1Ogg;
                break;
            case 2:
                dialogue = "I said I'm hungry for the word: **@#?";
                audioSrc = Warn2Ogg;
                break;
            case 3:
                dialogue = "For the last time, I'm hungry for the word: #!@$";
                audioSrc = Warn3Ogg;
                break;
            case 4:
                onGameOver({ score, status: 'FAILED_BY_MONSTER' });
                return;
            default:
                return;
        }

        if (dialogue && audioSrc) {
            const warningSound = new Audio(audioSrc);
            warningSound.play().catch(e => console.error("Error playing warning sound:", e));
            
            warningSound.onended = () => {
                if (monster.audioUrl) {
                    const questionSound = new Audio(monster.audioUrl);
                    questionSound.play().catch(e => console.error("Error playing question sound:", e));
                }
            };

            setMessages(currentMessages => [
                ...currentMessages,
                {
                    id: `monster-warning-${Date.now()}`,
                    text: dialogue,
                    position: {
                        x: monster.position.x,
                        y: monster.position.y - MONSTER_HEIGHT / 2 - 20
                    },
                    life: 180
                }
            ]);
        }
    }, [monster, swallowedWords, monsterDashCollisions, score, onWin, onGameOver, setMessages, setMonsterDashCollisions]);

    const handleVomit = () => {
        if (swallowedWords.length > 0 && vomitCooldown.current <= 0) {
            setVomitTrigger(t => t + 1);
            vomitCooldown.current = 30;
        }
    };

    const handlePlayerDeath = useCallback(() => {
        // Disable player movement
        setIsDying(true);
        
        // Check lives and deduct
        setLives(prevLives => {
            const newLives = prevLives - 1;
            
            // If no lives left, trigger game over
            if (newLives <= 0) {
                setTimeout(() => {
                    onGameOver({ score, status: 'FAILED' });
                }, 100);
                return 0;
            }
            
            return newLives;
        });
        
        // Show warning message
        setShowWarningMessage(true);
        
        // Hide warning message and respawn after 300ms (snappy!)
        respawnTimerRef.current = setTimeout(() => {
            setShowWarningMessage(false);
            setIsDying(false); // Re-enable movement
            
            // Respawn player in the middle of the map
            setPlayer(p => ({
                ...p,
                position: { x: worldWidth / 2, y: worldHeight / 2 },
                velocity: { x: 0, y: 0 }
            }));
            
            // Make player invulnerable
            setIsInvulnerable(true);
            
            // Remove invulnerability after 1.5 seconds
            invulnerabilityTimerRef.current = setTimeout(() => {
                setIsInvulnerable(false);
            }, 1500);
        }, 300);
    }, [setPlayer, worldWidth, worldHeight, onGameOver, score]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (invulnerabilityTimerRef.current) {
                clearTimeout(invulnerabilityTimerRef.current);
            }
            if (respawnTimerRef.current) {
                clearTimeout(respawnTimerRef.current);
            }
        };
    }, []);

    const { mousePosition, boostInfo } = usePhysics({
        gameState, setGameState, player, setPlayer, cagedWords, setCagedWords, fishLogics, setFishLogics, monster,
        score, setScore, onGameOver, isGameOver, isPaused: isPaused || isGamePaused, width: worldWidth, height: worldHeight,
        onPlayerEat: () => setEatTrigger(t => t + 1),
        swallowedWords, setSwallowedWords, onVomit: handleVomit, playerState,
        messages, setMessages, onMonsterDash: handleMonsterInteraction,
        mediumFishLimit: fishLimits.medium, // <-- PASS PROP
        largeFishLimit: fishLimits.large,   // <-- PASS PROP
        lives, onPlayerDeath: handlePlayerDeath, isInvulnerable, isDying, // <-- HEALTH SYSTEM PROPS
    });
    

    // Play background music and ambient sound
    useEffect(() => {
        if (!isLoading && monster) {
            // Start background music
            const bgMusic = new Audio(Track1Wav);
            bgMusic.loop = true;
            bgMusic.volume = 1.0;
            bgMusic.play().catch(e => console.error("Error playing background music:", e));
            bgMusicRef.current = bgMusic;

            // Start ambient sound
            const ambient = new Audio(WaterAmb1mp3);
            ambient.loop = true;
            ambient.volume = 0.2;
            ambient.play().catch(e => console.error("Error playing ambient sound:", e));
            ambientRef.current = ambient;

            // Monster intro sound logic
            const timer = setTimeout(() => {
                const introSound = new Audio(IntroAudio);
                introSound.play().catch(e => console.error("Error playing intro sound:", e));
                introSound.onended = () => { if (monster.audioUrl) { const monsterSound = new Audio(monster.audioUrl); monsterSound.play().catch(e => console.error("Error playing monster sound:", e)); } };
                setMessages(currentMessages => [...currentMessages, { id: `monster-dialogue-${Date.now()}`, text: "I'm hungry. I need the word: !#%@ . ", position: { x: monster.position.x, y: monster.position.y - MONSTER_HEIGHT / 2 - 60 }, life: 360 }]);
            }, 2000);
            return () => {
                clearTimeout(timer);
                if (bgMusicRef.current) { bgMusicRef.current.pause(); bgMusicRef.current.currentTime = 0; }
                if (ambientRef.current) { ambientRef.current.pause(); ambientRef.current.currentTime = 0; }
            };
        }
    }, [isLoading, monster, setMessages]);
    
    // Pause/Resume music when game is paused
    useEffect(() => {
        if (isGamePaused) {
            if (bgMusicRef.current) bgMusicRef.current.pause();
            if (ambientRef.current) ambientRef.current.pause();
        } else {
            if (bgMusicRef.current) bgMusicRef.current.play().catch(e => console.error("Error resuming music:", e));
            if (ambientRef.current) ambientRef.current.play().catch(e => console.error("Error resuming ambient:", e));
        }
    }, [isGamePaused]);
    
    // ESC key listener for pause
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !isGameOver) {
                setIsGamePaused(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGameOver]);
    
    const handleRetry = useCallback(() => {
        window.location.reload(); // Simple retry - reload the page
    }, []);
    
    const handleExit = useCallback(() => {
        // Go back to previous page or home
        window.history.back();
    }, []);

    useTick(() => {
        if (!player || !worldContainer.current) return;
        let targetX = -player.position.x + viewportWidth / 2;
        let targetY = -player.position.y + viewportHeight / 2;
        targetX = Math.min(0, Math.max(targetX, -(worldWidth - viewportWidth)));
        targetY = Math.min(0, Math.max(targetY, -(worldHeight - viewportHeight)));
        worldContainer.current.x += (targetX - worldContainer.current.x) * 0.1;
        worldContainer.current.y += (targetY - worldContainer.current.y) * 0.1;
    });
    
    const handlePointerMove = useCallback(event => {
        if (worldContainer.current) {
            const stagePosition = event.global;
            mousePosition.current = worldContainer.current.toLocal(stagePosition);
        }
    }, [mousePosition]);

    const handleVomitComplete = useCallback(() => {
        if (swallowedWords.length === 0) return;
        const lastWord = swallowedWords[swallowedWords.length - 1];
        const facing = playerState.facing;
        const playerRadius = {small: 10, medium: 20, large: 30}[player.size] || 10;
        const vomitDistance = playerRadius + 60;
        const newVomitedBubble = {
            ...lastWord,
            id: `vomited-${Date.now()}`,
            isBroken: true,
            position: { x: player.position.x + (facing * -vomitDistance), y: player.position.y, },
            velocity: { x: facing * -5, y: -1.5, }
        };
        setCagedWords(current => [...current, newVomitedBubble]);
        setSwallowedWords(current => current.slice(0, -1));
    }, [swallowedWords, playerState, player.position, player.size, setCagedWords, setSwallowedWords]);

    useEffect(() => {
        if (isGameOver || isLoading || !player) return;
        let newSize = 'small';
        if (score >= gameConfig.player.largeScore) {
            newSize = 'large';
        } else if (score >= gameConfig.player.mediumScore) {
            newSize = 'medium';
        }
        if (newSize !== player.size) {
            setPlayer(p => ({ ...p, size: newSize }));
            setMessages(m => [...m, { id: Date.now(), text: "Level Up!", position: player.position, life: 60 }]);
        }
    }, [score, player?.size, player?.position, isLoading, isGameOver, setPlayer, setMessages]);

    useEffect(() => {
        if (vomitCooldown.current > 0) {
            const timer = setInterval(() => {
                vomitCooldown.current -= 1;
            }, 1000 / 60);
            return () => clearInterval(timer);
        }
    }, [vomitTrigger]);
    
    if (isLoading) {
        return <Text text="Loading..." anchor={{ x: 0.5, y: 0.5 }} x={viewportWidth / 2} y={viewportHeight / 2} style={new TextStyle({ fill: 'white', fontSize: 48 })} />;
    }

    const swallowedText = swallowedWords.map(w => w.word).join(' + ');

    return (
        <>
            <Container ref={worldContainer} eventMode={'static'} pointermove={handlePointerMove}>
                <Background width={worldWidth} height={worldHeight} />
                {monster && <Monster {...monster} />}
                {cagedWords.map(cw => <CagedWord key={cw.id} {...cw} />)}
                {fishLogics.map(logic => <Fish key={logic.id} {...logic.state} debugMode={debugMode} />)}
                {player && (
                    <Player
                        position={player.position} size={player.size} velocity={player.velocity}
                        eatTrigger={eatTrigger} vomitTrigger={vomitTrigger}
                        onStateChange={setPlayerState} onVomitComplete={handleVomitComplete}
                        debugMode={debugMode}
                        isInvulnerable={isInvulnerable}
                    />
                )}
                {messages.map(msg => (<Text key={msg.id} text={msg.text} x={msg.position.x} y={msg.position.y - 40} style={new TextStyle({ fill: 'yellow', fontSize: 20, fontWeight: 'bold' })} />))}
            </Container>
            <Container>
                {/* Top-left: Lives */}
                <LifeBar lives={lives} maxLives={3} x={10} y={10} />
                
                {/* Top-right: Score */}
                <Text text={`Score: ${score}`} style={new TextStyle({ fill: 'white', fontSize: 24, fontWeight: 'bold' })} x={viewportWidth - 150} y={10} />
                
                {/* Top-center: Sequence with red glowing bubbles */}
                {swallowedWords.length > 0 && (
                    <SequenceDisplay 
                        swallowedWords={swallowedWords}
                        x={viewportWidth / 2}
                        y={50}
                    />
                )}
                
                {/* Bottom-center: Growth progress bar */}
                <GrowthProgressBar 
                    score={score}
                    x={(viewportWidth - 300) / 2}
                    y={viewportHeight - 50}
                />
                {showWarningMessage && (
                    <BeCarefulMessage 
                        x={viewportWidth / 2} 
                        y={viewportHeight / 2} 
                        visible={true} 
                    />
                )}
                {debugMode && player && (
                    <DebugDisplay
                        playerSpeed={Math.sqrt(player.velocity.x**2 + player.velocity.y**2)}
                        isBoosting={boostInfo.current.isBoosting}
                        boostCooldown={boostInfo.current.cooldownTimer}
                        width={viewportWidth}
                        playerAnimationName={playerState.name}
                    />
                )}
                
                {/* Pause Menu */}
                {isGamePaused && (
                    <PauseMenu
                        x={viewportWidth / 2}
                        y={viewportHeight / 2}
                        onRetry={handleRetry}
                        onExit={handleExit}
                    />
                )}
            </Container>
        </>
    );
};

export default GameStage;