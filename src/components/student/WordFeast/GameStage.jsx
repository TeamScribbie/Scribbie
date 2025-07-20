import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Container, Text, useTick, Sprite } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import * as PIXI from 'pixi.js';

import Player from './Player';
import Fish from './Fish';
import DebugDisplay from './DebugDisplay';
import Monster from './Monster';
import CagedWord from './CagedWord';
import { useGameLogic } from './hooks/useGameLogic';
import { usePhysics } from './hooks/usePhysics';
import { gameConfig } from './config';
import background1 from './game/spritesheets/background1.png';
import IntroAudio from './game/audio/monster/Intro.ogg';

// --- CORRECTED: Import actual audio files ---
import Warn1Ogg from './game/audio/monster/Warn1.ogg';
import Warn2Ogg from './game/audio/monster/Warn2.ogg';
import Warn3Ogg from './game/audio/monster/Warn3.ogg';


const Background = ({ width, height }) => {
    const baseTexture = useMemo(() => PIXI.BaseTexture.from(background1), []);
    const backgroundFrame = useMemo(() => new PIXI.Rectangle(0, 0, 800, 600), []);
    const backgroundTextureRegion = useMemo(() => new PIXI.Texture(baseTexture, backgroundFrame), [baseTexture, backgroundFrame]);
    return (<Sprite texture={backgroundTextureRegion} x={0} y={0} width={width} height={height} />);
};

const MONSTER_WIDTH = 172;
const MONSTER_HEIGHT = 228;

const GameStage = ({ onGameOver, onWin, isGameOver, isPaused, debugMode, viewportWidth, viewportHeight, worldWidth, worldHeight, gameData }) => {
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

    const handleMonsterInteraction = useCallback(() => {
        const playerSequence = swallowedWords.map(w => w.word).join('');
        
        // Check for the win condition first
        if (monster && playerSequence.trim().toLowerCase() === monster.word.trim().toLowerCase()) {
            console.log("✅ WIN CONDITION MET!");
            if(onWin) onWin(); 
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

    const { mousePosition, boostInfo } = usePhysics({
        gameState, setGameState, player, setPlayer, cagedWords, setCagedWords, fishLogics, setFishLogics, monster,
        score, setScore, onGameOver, isGameOver, isPaused, width: worldWidth, height: worldHeight,
        onPlayerEat: () => setEatTrigger(t => t + 1),
        swallowedWords, setSwallowedWords, onVomit: handleVomit, playerState,
        messages, setMessages, onMonsterDash: handleMonsterInteraction,
    });
    
    useEffect(() => {
        if (!isLoading && monster) {
            const timer = setTimeout(() => {
                const introSound = new Audio(IntroAudio);
                introSound.play().catch(e => console.error("Error playing intro sound:", e));
                introSound.onended = () => { if (monster.audioUrl) { const monsterSound = new Audio(monster.audioUrl); monsterSound.play().catch(e => console.error("Error playing monster sound:", e)); } };
                setMessages(currentMessages => [...currentMessages, { id: `monster-dialogue-${Date.now()}`, text: "I'm hungry. I need the word: !#%@ . ", position: { x: monster.position.x, y: monster.position.y - MONSTER_HEIGHT / 2 - 60 }, life: 360 }]);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, monster, setMessages]);

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
                    />
                )}
                {messages.map(msg => (<Text key={msg.id} text={msg.text} x={msg.position.x} y={msg.position.y - 40} style={new TextStyle({ fill: 'yellow', fontSize: 20, fontWeight: 'bold' })} />))}
            </Container>
            <Container>
                <Text text={`Score: ${score}`} style={new TextStyle({ fill: 'white', fontSize: 24 })} x={10} y={10} />
                <Text text={`Sequence: ${swallowedText}`} style={new TextStyle({ fill: 'yellow', fontSize: 20 })} x={10} y={40} />
                {debugMode && player && (
                    <DebugDisplay
                        playerSpeed={Math.sqrt(player.velocity.x**2 + player.velocity.y**2)}
                        isBoosting={boostInfo.current.isBoosting}
                        boostCooldown={boostInfo.current.cooldownTimer}
                        width={viewportWidth}
                        playerAnimationName={playerState.name}
                    />
                )}
            </Container>
        </>
    );
};

export default GameStage;