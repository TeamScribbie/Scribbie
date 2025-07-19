import React, { useState, useCallback, useEffect } from 'react';
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

const MONSTER_WIDTH = 120;
const MONSTER_HEIGHT = 160;

const GameStage = ({ onGameOver, isGameOver, isPaused, debugMode, width, height, gameData }) => {
    // --- All state is managed here first ---
    const {
        isLoading, score, setScore,
        player, setPlayer,
        cagedWords, setCagedWords,
        monster,
        messages, setMessages,
        fishLogics, setFishLogics,
    } = useGameLogic(gameData, width, height);

    const [eatTrigger, setEatTrigger] = useState(0);
    const [playerAnimationName, setPlayerAnimationName] = useState('idle');

    // --- The physics hook is now called with the fully initialized state ---
    const { mousePosition, boostInfo } = usePhysics({
        player, setPlayer,
        cagedWords, setCagedWords,
        fishLogics, setFishLogics,
        monster,
        score, // <-- FIX: Pass the current score to the physics hook
        setScore,
        onGameOver, isGameOver, isPaused,
        width, height,
        onPlayerEat: () => setEatTrigger(t => t + 1),
    });

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
    
    const handlePointerMove = useCallback(event => {
        mousePosition.current = event.global;
    }, [mousePosition]);

    if (isLoading) {
        return <Text text="Loading..." anchor={{ x: 0.5, y: 0.5 }} x={width / 2} y={height / 2} style={new TextStyle({ fill: 'white', fontSize: 48 })} />;
    }

    return (
        <Container eventMode={'static'} pointermove={handlePointerMove}>
            {monster && <Monster {...monster} width={MONSTER_WIDTH} height={MONSTER_HEIGHT} />}
            {cagedWords.map(cw => <CagedWord key={cw.id} {...cw} />)}
            {/* --- THIS IS THE FIX: We are now mapping over the fishLogics array from our state, which is guaranteed to be up-to-date --- */}
            {fishLogics.map(logic => <Fish key={logic.id} {...logic.state} debugMode={debugMode} />)}
            {player && (
                <Player 
                    position={player.position} 
                    size={player.size} 
                    velocity={player.velocity}
                    eatTrigger={eatTrigger}
                    onStateChange={setPlayerAnimationName}
                />
            )}
            
            <Text text={`Score: ${score}`} style={new TextStyle({ fill: 'white', fontSize: 24 })} x={10} y={10} />

            {debugMode && (
                <DebugDisplay
                    playerSpeed={Math.sqrt(player.velocity.x**2 + player.velocity.y**2)}
                    isBoosting={boostInfo.current.isBoosting}
                    boostCooldown={boostInfo.current.cooldownTimer}
                    width={width}
                    playerAnimationName={playerAnimationName}
                />
            )}
            {messages.map(msg => (<Text key={msg.id} text={msg.text} x={msg.position.x} y={msg.position.y - 40} style={new TextStyle({ fill: 'yellow', fontSize: 20, fontWeight: 'bold' })} />))}
        </Container>
    );
};

export default GameStage;