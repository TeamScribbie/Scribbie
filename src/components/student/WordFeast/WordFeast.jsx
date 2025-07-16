import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Stage, Container, Graphics, Text, useTick } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import Player from './Player';
import Fish from './Fish';

// --- Static Game Data ---
const gameConfig = {
    width: 800,
    height: 600,
    player: {
        initialSize: 'small',
        accel: 0.08,
        maxSpeed: 5,
        friction: 0.96,
        mediumScore: 50,
        largeScore: 150,
    },
    fishSpawning: {
        targetPopulation: 16,
        respawnCooldown: 60,
    },
    fishTypes: {
        small: { points: 10 },
        medium: { points: 25, chaseRadius: 150, chaseSpeed: 1.5 },
        large: { points: 50, chaseRadius: 200, chaseSpeed: 2.5 },
    }
};

const sizeHierarchy = { small: 1, medium: 2, large: 3 };

const canEat = (eaterSize, eatenSize) => sizeHierarchy[eaterSize] >= sizeHierarchy[eatenSize];
const calculateDistance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

const Background = ({ width, height, color }) => (
    <Graphics draw={useCallback(g => { g.clear().beginFill(color).drawRect(0, 0, width, height).endFill(); }, [width, height, color])} />
);

// --- Game Stage Component ---
const GameStage = ({ onGameOver, isGameOver }) => {
    const [score, setScore] = useState(0);
    const [player, setPlayer] = useState({
        position: { x: 400, y: 300 },
        velocity: { x: 0, y: 0 },
        size: 'small',
    });
    const fishesRef = useRef([]);
    const [renderTrigger, setRenderTrigger] = useState(0);
    const [messages, setMessages] = useState([]);
    const mousePosition = useRef({ x: 400, y: 300 });
    const spawnCooldown = useRef(gameConfig.fishSpawning.respawnCooldown);

    const forceRender = () => setRenderTrigger(c => c + 1);

    const spawnFish = () => {
        const side = Math.floor(Math.random() * 2);
        let position, velocity;
        switch (side) {
            case 0: position = { x: gameConfig.width + 30, y: Math.random() * gameConfig.height }; velocity = { x: -1, y: Math.random() * 2 - 1 }; break;
            case 1: position = { x: -30, y: Math.random() * gameConfig.height }; velocity = { x: 1, y: Math.random() * 2 - 1 }; break;
        }
        const rand = Math.random();
        const size = rand < 0.6 ? 'small' : rand < 0.9 ? 'medium' : 'large';
        fishesRef.current.push({ id: Date.now() * Math.random(), size, points: gameConfig.fishTypes[size].points, position, velocity });
    };

    useEffect(() => {
        if (isGameOver) return;
        let newSize = 'small';
        if (score >= gameConfig.player.largeScore) newSize = 'large';
        else if (score >= gameConfig.player.mediumScore) newSize = 'medium';
        if (newSize !== player.size) {
            setPlayer(p => ({ ...p, size: newSize }));
            setMessages(m => [...m, { id: Date.now(), text: "Level Up!", position: player.position, life: 60 }]);
        }
    }, [score, player.size, isGameOver]);

    useTick(delta => {
        if (isGameOver) return;

        spawnCooldown.current -= delta;
        if (fishesRef.current.length < gameConfig.fishSpawning.targetPopulation && spawnCooldown.current <= 0) {
            spawnFish();
            spawnCooldown.current = gameConfig.fishSpawning.respawnCooldown;
            forceRender();
        }

        const dx = mousePosition.current.x - player.position.x;
        const dy = mousePosition.current.y - player.position.y;
        const angle = Math.atan2(dy, dx);
        let velX = player.velocity.x;
        let velY = player.velocity.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            velX += Math.cos(angle) * gameConfig.player.accel * delta;
            velY += Math.sin(angle) * gameConfig.player.accel * delta;
        }
        velX *= gameConfig.player.friction;
        velY *= gameConfig.player.friction;
        const speed = Math.sqrt(velX * velX + velY * velY);
        if (speed > gameConfig.player.maxSpeed) {
            velX = (velX / speed) * gameConfig.player.maxSpeed;
            velY = (velY / speed) * gameConfig.player.maxSpeed;
        }
        const nextPlayerPos = {
            x: Math.max(0, Math.min(gameConfig.width, player.position.x + velX)),
            y: Math.max(0, Math.min(gameConfig.height, player.position.y + velY)),
        };

        let wasChanged = false;
        let scoreToAdd = 0;
        const remainingFish = [];

        for (const fish of fishesRef.current) {
            const distance = calculateDistance(nextPlayerPos, fish.position);
            const isTouching = distance < 40;

            if (isTouching) {
                if (canEat(player.size, fish.size)) {
                    wasChanged = true;
                    scoreToAdd += fish.points;
                    continue; 
                } else if (canEat(fish.size, player.size) && fish.size !== player.size) {
                    onGameOver(); return;
                }
            }

            // --- NEW: Chasing AI Logic ---
            const fishType = gameConfig.fishTypes[fish.size];
            let fishVelX = fish.velocity.x;
            let fishVelY = fish.velocity.y;

            // Check if the fish is bigger and has chasing properties
            if (fishType.chaseRadius && sizeHierarchy[fish.size] > sizeHierarchy[player.size]) {
                if (distance < fishType.chaseRadius) {
                    // Chase the player
                    const chaseAngle = Math.atan2(nextPlayerPos.y - fish.position.y, nextPlayerPos.x - fish.position.x);
                    fishVelX = Math.cos(chaseAngle) * fishType.chaseSpeed;
                    fishVelY = Math.sin(chaseAngle) * fishType.chaseSpeed;
                }
            }

            fish.position.x += fishVelX * delta;
            fish.position.y += fishVelY * delta;
            
            if (fish.position.x > -50 && fish.position.x < gameConfig.width + 50 && fish.position.y > -50 && fish.position.y < gameConfig.height + 50) {
                remainingFish.push({ ...fish, velocity: { x: fishVelX, y: fishVelY } });
            } else {
                wasChanged = true;
            }
        }
        
        setPlayer({ size: player.size, position: nextPlayerPos, velocity: { x: velX, y: velY } });
        if (wasChanged) {
            fishesRef.current = remainingFish;
            if (scoreToAdd > 0) {
                setScore(s => s + scoreToAdd);
            }
            forceRender();
        }
        setMessages(currentMessages => currentMessages.map(msg => ({ ...msg, life: msg.life - 1 })).filter(msg => msg.life > 0));
    });

    const handlePointerMove = useCallback(event => { mousePosition.current = event.global; }, []);

    return (
        <Container width={gameConfig.width} height={gameConfig.height} eventMode={'static'} pointermove={handlePointerMove}>
            {fishesRef.current.map(fish => <Fish key={fish.id} {...fish} />)}
            <Player position={player.position} size={player.size} velocity={player.velocity} />
            <Text text={`Score: ${score}`} style={new TextStyle({ fill: 'white', fontSize: 24 })} x={10} y={10} />
            {messages.map(msg => (<Text key={msg.id} text={msg.text} x={msg.position.x} y={msg.position.y - 40} style={new TextStyle({ fill: 'yellow', fontSize: 20, fontWeight: 'bold' })} />))}
        </Container>
    );
};

// --- Main Export Component ---
const WordFeast = () => {
    const [gameOver, setGameOver] = useState(false);
    const [key, setKey] = useState(Date.now());
    const handleGameOver = () => setGameOver(true);
    const handleRestart = () => { setGameOver(false); setKey(Date.now()); };
    return (
        <div className="word-feast-container">
            <div className="pixi-canvas-container" style={{ position: 'relative', cursor: 'none' }}>
                <Stage width={gameConfig.width} height={gameConfig.height}>
                    <Background width={gameConfig.width} height={gameConfig.height} color={0x1099bb} />
                    <GameStage key={key} onGameOver={handleGameOver} isGameOver={gameOver} />
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