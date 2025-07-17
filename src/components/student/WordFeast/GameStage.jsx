// src/components/student/WordFeast/GameStage.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Container, Text, useTick } from '@pixi/react';
import { TextStyle } from 'pixi.js';

import Player from './Player';
import Fish from './Fish';
import { gameConfig } from './config';
import { canEat, calculateDistance, sizeHierarchy } from './gameUtils';

const GameStage = ({ onGameOver, isGameOver, debugMode }) => {
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
    const dashInfo = useRef({ isDashing: false, dashTimer: 0, cooldownTimer: 0, dashAngle: 0 }); // Added dashAngle

    const forceRender = () => setRenderTrigger(c => c + 1);

    const spawnFish = () => {
        const side = Math.floor(Math.random() * 2);
        let position, velocity;
        switch (side) {
            case 0: position = { x: gameConfig.width + 30, y: Math.random() * gameConfig.height }; velocity = { x: -1, y: 0 }; break;
            case 1: position = { x: -30, y: Math.random() * gameConfig.height }; velocity = { x: 1, y: 0 }; break;
        }
        const rand = Math.random();
        const size = rand < 0.6 ? 'small' : rand < 0.9 ? 'medium' : 'large';
        fishesRef.current.push({ id: Date.now() * Math.random(), size, points: gameConfig.fishTypes[size].points, position, velocity, wanderAngle: Math.random() * 2 * Math.PI });
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
        dashInfo.current.cooldownTimer -= delta;
        dashInfo.current.dashTimer -= delta;
        if (dashInfo.current.dashTimer <= 0) {
            dashInfo.current.isDashing = false;
        }
        let velX = player.velocity.x;
        let velY = player.velocity.y;

        if (dashInfo.current.isDashing) {
            // Dash in the stored direction
            velX = Math.cos(dashInfo.current.dashAngle) * gameConfig.player.dash.speed;
            velY = Math.sin(dashInfo.current.dashAngle) * gameConfig.player.dash.speed;
        } else {
            const dx = mousePosition.current.x - player.position.x;
            const dy = mousePosition.current.y - player.position.y;
            const angle = Math.atan2(dy, dx);
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
            if (distance < 40) {
                if (canEat(player.size, fish.size)) {
                    wasChanged = true; scoreToAdd += fish.points; continue;
                } else if (canEat(fish.size, player.size) && fish.size !== player.size) {
                    onGameOver(); return;
                }
            }
            const fishType = gameConfig.fishTypes[fish.size];
            let fishVelX = fish.velocity.x;
            let fishVelY = fish.velocity.y;
            let status = 'Roaming';
            const isChasing = fishType.chaseRadius && sizeHierarchy[fish.size] > sizeHierarchy[player.size] && distance < fishType.chaseRadius;
            
            if (isChasing) {
                status = 'CHASING';
                const chaseAngle = Math.atan2(nextPlayerPos.y - fish.position.y, nextPlayerPos.x - fish.position.x);
                fishVelX = Math.cos(chaseAngle) * fishType.chaseSpeed;
                fishVelY = Math.sin(chaseAngle) * fishType.chaseSpeed;
            } else {
                fish.wanderAngle += (Math.random() - 0.5) * fishType.wandering.turnStrength;
                
                const targetAngle = Math.atan2(fishVelY, fishVelX);
                const newAngle = targetAngle + (fish.wanderAngle - targetAngle) * 0.1;
                
                fishVelX = Math.cos(newAngle) * fishType.wandering.speed;
                fishVelY = Math.sin(newAngle) * fishType.wandering.speed;
            }
            
            fish.position.x += fishVelX * delta;
            fish.position.y += fishVelY * delta;
            if (fish.position.x > -50 && fish.position.x < gameConfig.width + 50 && fish.position.y > -50 && fish.position.y < gameConfig.height + 50) {
                remainingFish.push({ ...fish, velocity: { x: fishVelX, y: fishVelY }, status });
            } else {
                wasChanged = true;
            }
        }
        setPlayer({ size: player.size, position: nextPlayerPos, velocity: { x: velX, y: velY } });
        if (wasChanged) {
            fishesRef.current = remainingFish;
            if (scoreToAdd > 0) setScore(s => s + scoreToAdd);
            forceRender();
        }
        setMessages(currentMessages => currentMessages.map(msg => ({ ...msg, life: msg.life - 1 })).filter(msg => msg.life > 0));
    });

    const handlePointerMove = useCallback(event => { mousePosition.current = event.global; }, []);

    const handlePointerDown = useCallback((event) => {
        // Dash on left-click
        if (event.data.button === 0 && dashInfo.current.cooldownTimer <= 0) {
            dashInfo.current.isDashing = true;
            dashInfo.current.dashTimer = gameConfig.player.dash.duration;
            dashInfo.current.cooldownTimer = gameConfig.player.dash.cooldown;
            // Store the angle of the current velocity
            dashInfo.current.dashAngle = Math.atan2(player.velocity.y, player.velocity.x);
        }
    }, [player.velocity.x, player.velocity.y]); // Depend on player velocity

    return (
        <Container width={gameConfig.width} height={gameConfig.height} eventMode={'static'} pointermove={handlePointerMove} pointerdown={handlePointerDown}>
            {fishesRef.current.map(fish => <Fish key={fish.id} {...fish} debugMode={debugMode} />)}
            <Player position={player.position} size={player.size} velocity={player.velocity} />
            <Text text={`Score: ${score}`} style={new TextStyle({ fill: 'white', fontSize: 24 })} x={10} y={10} />
            {messages.map(msg => (<Text key={msg.id} text={msg.text} x={msg.position.x} y={msg.position.y - 40} style={new TextStyle({ fill: 'yellow', fontSize: 20, fontWeight: 'bold' })} />))}
        </Container>
    );
};

export default GameStage;