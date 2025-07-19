import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Container, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

import Player from './Player';
import Fish from './Fish';
import DebugDisplay from './DebugDisplay';
import Monster from './Monster';
import CagedWord from './CagedWord';
import { useGameLogic } from './hooks/useGameLogic';
import { usePhysics } from './hooks/usePhysics';
import { gameConfig } from './config';
import { sizeHierarchy } from './gameUtils';

const MONSTER_WIDTH = 120;
const MONSTER_HEIGHT = 160;

const GameStage = ({ onGameOver, isGameOver, isPaused, debugMode, width, height, gameData }) => {
    const {
        isLoading, score, setScore,
        player, setPlayer,
        cagedWords, setCagedWords,
        monster,
        messages, setMessages,
        fishLogics, setFishLogics,
        swallowedWords, setSwallowedWords, 
    } = useGameLogic(gameData, width, height);

    const [eatTrigger, setEatTrigger] = useState(0);
    const [vomitTrigger, setVomitTrigger] = useState(0); 
    const [playerState, setPlayerState] = useState({ name: 'idle', facing: 1 });
    const vomitCooldown = useRef(0);

    const handleVomit = () => {
        if (swallowedWords.length > 0 && vomitCooldown.current <= 0) {
            setVomitTrigger(t => t + 1);
            vomitCooldown.current = 30;
        }
    };

    const { mousePosition, boostInfo } = usePhysics({
        player, setPlayer,
        cagedWords, setCagedWords,
        fishLogics, setFishLogics,
        monster,
        score,
        setScore,
        onGameOver, isGameOver, isPaused,
        width, height,
        onPlayerEat: () => setEatTrigger(t => t + 1),
        swallowedWords, setSwallowedWords,
        onVomit: handleVomit,
        playerState,
        messages, // --- PASS MESSAGES TO PHYSICS ---
        setMessages, // --- PASS SETTER TO PHYSICS ---
    });

    const handleVomitComplete = useCallback(() => {
        if (swallowedWords.length === 0) return;

        const lastWord = swallowedWords[swallowedWords.length - 1];
        const facing = playerState.facing;
        const playerRadius = sizeHierarchy[player.size] * 10;
        const vomitDistance = playerRadius + 60;

        const newVomitedBubble = {
            ...lastWord,
            id: `vomited-${Date.now()}`,
            isBroken: true,
            position: {
                x: player.position.x + (facing * -vomitDistance),
                y: player.position.y,
            },
            velocity: { 
                x: facing * -5,
                y: -1.5,
            }
        };
        
        setCagedWords(current => [...current, newVomitedBubble]);
        setSwallowedWords(current => current.slice(0, -1));

    }, [swallowedWords, playerState, player.position, player.size, setCagedWords, setSwallowedWords]);

    useEffect(() => {
        if (isGameOver || isLoading) return;
        let newSize = 'small';
        if (score >= gameConfig.player.largeScore) newSize = 'large';
        else if (score >= gameConfig.player.mediumScore) newSize = 'medium';

        if (newSize !== player.size) {
            setPlayer(p => ({ ...p, size: newSize }));
            setMessages(m => [...m, { id: Date.now(), text: "Level Up!", position: player.position, life: 60 }]);
        }
    }, [score, player.size, player.position, isLoading, isGameOver, setPlayer, setMessages]);

    useEffect(() => {
        if (vomitCooldown.current > 0) {
            const timer = setInterval(() => {
                vomitCooldown.current -= 1;
            }, 1000 / 60);
            return () => clearInterval(timer);
        }
    }, [vomitTrigger]);
    
    const handlePointerMove = useCallback(event => {
        mousePosition.current = event.global;
    }, [mousePosition]);

    if (isLoading) {
        return <Text text="Loading..." anchor={{ x: 0.5, y: 0.5 }} x={width / 2} y={height / 2} style={new TextStyle({ fill: 'white', fontSize: 48 })} />;
    }

    const swallowedText = swallowedWords.map(w => w.word).join(' + ');

    return (
        <Container eventMode={'static'} pointermove={handlePointerMove}>
            {monster && <Monster {...monster} width={MONSTER_WIDTH} height={MONSTER_HEIGHT} />}
            {cagedWords.map(cw => <CagedWord key={cw.id} {...cw} />)}
            {fishLogics.map(logic => <Fish key={logic.id} {...logic.state} debugMode={debugMode} />)}
            {player && (
                <Player 
                    position={player.position} 
                    size={player.size} 
                    velocity={player.velocity}
                    eatTrigger={eatTrigger}
                    vomitTrigger={vomitTrigger}
                    onStateChange={setPlayerState}
                    onVomitComplete={handleVomitComplete}
                />
            )}
            
            <Text text={`Score: ${score}`} style={new TextStyle({ fill: 'white', fontSize: 24 })} x={10} y={10} />
            <Text text={`Sequence: ${swallowedText}`} style={new TextStyle({ fill: 'yellow', fontSize: 20 })} x={10} y={40} />

            {debugMode && (
                <DebugDisplay
                    playerSpeed={Math.sqrt(player.velocity.x**2 + player.velocity.y**2)}
                    isBoosting={boostInfo.current.isBoosting}
                    boostCooldown={boostInfo.current.cooldownTimer}
                    width={width}
                    playerAnimationName={playerState.name}
                />
            )}
            {messages.map(msg => (<Text key={msg.id} text={msg.text} x={msg.position.x} y={msg.position.y - 40} style={new TextStyle({ fill: 'yellow', fontSize: 20, fontWeight: 'bold' })} />))}
        </Container>
    );
};

export default GameStage;