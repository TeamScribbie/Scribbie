import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Container, Text, useTick } from '@pixi/react';
import { TextStyle } from 'pixi.js';

import Player from './Player';
import Fish from './Fish';
import FishLogic from './FishLogic';
import DebugDisplay from './DebugDisplay';
import { gameConfig } from './config';
import { canEat, calculateDistance, sizeHierarchy } from './gameUtils';

gameConfig.fishSpawning.targetPopulation = 30;
gameConfig.fishSpawning.respawnCooldown = 20;

const GameStage = ({ onGameOver, isGameOver, isPaused, debugMode, width, height, gameData }) => {
    const [score, setScore] = useState(0);
    const [player, setPlayer] = useState({
        position: { x: width / 2, y: height / 2 },
        velocity: { x: 0, y: 0 },
        size: 'small',
    });
    const [fishLogics, setFishLogics] = useState([]);
    const [messages, setMessages] = useState([]);
    const mousePosition = useRef({ x: width / 2, y: height / 2 });
    const spawnCooldown = useRef(gameConfig.fishSpawning.respawnCooldown);
    const boostInfo = useRef({ isBoosting: false, boostTimer: 0, cooldownTimer: 0 });
    const [playerSpeed, setPlayerSpeed] = useState(0);
    const lastVelocity = useRef({ x: 1, y: 0 });
    const spacebarDown = useRef(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'Space' && !spacebarDown.current && boostInfo.current.cooldownTimer <= 0) {
                event.preventDefault();
                spacebarDown.current = true;
                boostInfo.current.isBoosting = true;
                boostInfo.current.boostTimer = gameConfig.player.boost.duration;
                boostInfo.current.cooldownTimer = gameConfig.player.boost.cooldown;
            }
        };

        const handleKeyUp = (event) => {
            if (event.code === 'Space') {
                spacebarDown.current = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const spawnFish = useCallback(() => {
        const side = Math.floor(Math.random() * 2);
        let position, velocity;
        switch (side) {
            case 0: position = { x: width + 30, y: Math.random() * height }; velocity = { x: -1, y: 0 }; break;
            case 1: position = { x: -30, y: Math.random() * height }; velocity = { x: 1, y: 0 }; break;
        }
        const rand = Math.random();
        const size = rand < 0.6 ? 'small' : rand < 0.9 ? 'medium' : 'large';

        const newFishData = {
            id: Date.now() * Math.random(),
            size,
            points: gameConfig.fishTypes[size].points,
            position,
            velocity,
        };
        setFishLogics(logics => [...logics, new FishLogic(newFishData, width, height)]);
    }, [width, height]);

    useEffect(() => {
        if (isGameOver) return;
        let newSize = 'small';
        if (score >= gameConfig.player.largeScore) newSize = 'large';
        else if (score >= gameConfig.player.mediumScore) newSize = 'medium';

        if (newSize !== player.size) {
            setPlayer(p => ({ ...p, size: newSize }));
            setMessages(m => [...m, { id: Date.now(), text: "Level Up!", position: player.position, life: 60 }]);
        }
    }, [score, player.size, player.position, isGameOver]);

    useTick(delta => {
        if (isGameOver || isPaused) return;

        spawnCooldown.current -= delta;
        if (fishLogics.length < gameConfig.fishSpawning.targetPopulation && spawnCooldown.current <= 0) {
            spawnFish();
            spawnCooldown.current = gameConfig.fishSpawning.respawnCooldown;
        }

        boostInfo.current.cooldownTimer -= delta;
        boostInfo.current.boostTimer -= delta;

        if (boostInfo.current.boostTimer <= 0) {
            boostInfo.current.isBoosting = false;
        }

        let { x: velX, y: velY } = player.velocity;

        if (boostInfo.current.isBoosting) {
            const boostSpeed = gameConfig.player.maxSpeed * gameConfig.player.boost.speedMultiplier;
            const angle = Math.atan2(lastVelocity.current.y, lastVelocity.current.x);
            velX = Math.cos(angle) * boostSpeed;
            velY = Math.sin(angle) * boostSpeed;
        } else {
            const dx = mousePosition.current.x - player.position.x;
            const dy = mousePosition.current.y - player.position.y;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

            if (distanceToMouse > 1) {
                const angle = Math.atan2(dy, dx);
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

            if (speed > 0.1) {
                lastVelocity.current = { x: velX, y: velY };
            }
        }

        const finalSpeed = Math.sqrt(velX * velX + velY * velY);
        if (debugMode) {
            setPlayerSpeed(finalSpeed);
        }

        const nextPlayerPos = {
            x: Math.max(0, Math.min(width, player.position.x + velX * delta)),
            y: Math.max(0, Math.min(height, player.position.y + velY * delta)),
        };

        let scoreToAdd = 0;
        const eatenFishIds = new Set();
        fishLogics.forEach(logic => {
            const fish = logic.state;
            const distance = calculateDistance(nextPlayerPos, fish.position);
            if (distance < (sizeHierarchy[player.size] * 10 + 15)) {
                if (canEat(player.size, fish.size)) {
                    scoreToAdd += fish.points;
                    eatenFishIds.add(fish.id);
                } else if (canEat(fish.size, player.size)) {
                    onGameOver({ score });
                    return;
                }
            }
        });

        if (scoreToAdd > 0) {
            setScore(s => s + scoreToAdd);
        }

        setFishLogics(logics =>
          logics.filter(l => !eatenFishIds.has(l.id)).map(logic => {
            logic.update(delta, player.position);
            return logic;
          })
        );

        setPlayer({ size: player.size, position: nextPlayerPos, velocity: { x: velX, y: velY } });
        setMessages(m => m.map(msg => ({ ...msg, life: msg.life - 1 })).filter(msg => msg.life > 0));
    });

    const handlePointerMove = useCallback(event => {
        mousePosition.current = event.global;
    }, []);

    return (
        <Container eventMode={'static'} pointermove={handlePointerMove}>
            {fishLogics.map(logic => <Fish key={logic.id} {...logic.state} debugMode={debugMode} />)}
            <Player position={player.position} size={player.size} velocity={player.velocity} />
            <Text text={`Score: ${score}`} style={new TextStyle({ fill: 'white', fontSize: 24 })} x={10} y={10} />

            {debugMode && (
                <DebugDisplay
                    playerSpeed={playerSpeed}
                    isBoosting={boostInfo.current.isBoosting}
                    boostCooldown={boostInfo.current.cooldownTimer}
                    width={width}
                />
            )}

            {messages.map(msg => (<Text key={msg.id} text={msg.text} x={msg.position.x} y={msg.position.y - 40} style={new TextStyle({ fill: 'yellow', fontSize: 20, fontWeight: 'bold' })} />))}
        </Container>
    );
};

export default GameStage;