import { useRef, useCallback, useEffect } from 'react';
import { useTick } from '@pixi/react';
import { gameConfig } from '../config';
import { canEat, calculateDistance, sizeHierarchy, canBreakCage } from '../gameUtils';
import FishLogic from '../FishLogic';

const MONSTER_WIDTH = 120;
const MONSTER_HEIGHT = 160;
const CAGE_WIDTH = 80;
const CAGE_HEIGHT = 50;
const turningFriction = 0.92;

function isColliding(circle, radius, rect) {
    if (!circle || !rect) return false;
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    return (distanceX * distanceX + distanceY * distanceY) < (radius * radius);
}

function isRectColliding(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

export const usePhysics = ({
    player, setPlayer,
    cagedWords, setCagedWords,
    fishLogics, setFishLogics,
    monster,
    score,
    setScore,
    onGameOver,
    isGameOver,
    isPaused,
    width,
    height,
    onPlayerEat,
    swallowedWords, setSwallowedWords, onVomit,
    playerState,
    messages,
    setMessages,
    onMonsterDash, // <-- Accept the handler for monster dash interaction
}) => {
    const mousePosition = useRef({ x: width / 2, y: height / 2 });
    const boostInfo = useRef({ isBoosting: false, boostTimer: 0, cooldownTimer: 0 });
    const lastVelocity = useRef({ x: 1, y: 0 });
    const spacebarDown = useRef(false);
    const spawnCooldown = useRef(gameConfig.fishSpawning.respawnCooldown);

    const spawnFish = useCallback(() => {
        let position;
        let velocity;
        const monsterBounds = monster ? {
            x: monster.position.x - MONSTER_WIDTH / 2,
            y: monster.position.y - MONSTER_HEIGHT / 2,
            width: MONSTER_WIDTH,
            height: MONSTER_HEIGHT
        } : null;

        do {
            const side = Math.floor(Math.random() * 2);
            switch (side) {
                case 0: position = { x: width + 30, y: Math.random() * height }; velocity = { x: -1, y: 0 }; break;
                case 1: position = { x: -30, y: Math.random() * height }; velocity = { x: 1, y: 0 }; break;
            }
        } while (monsterBounds && (position.x > monsterBounds.x && position.x < monsterBounds.x + monsterBounds.width && position.y > monsterBounds.y && position.y < monsterBounds.y + monsterBounds.height));

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
    }, [width, height, setFishLogics, monster]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'KeyQ') {
                event.preventDefault();
                onVomit();
            }
            if (event.code === 'Space' && !spacebarDown.current && boostInfo.current.cooldownTimer <= 0) {
                event.preventDefault();
                spacebarDown.current = true;
                boostInfo.current.isBoosting = true;
                boostInfo.current.boostTimer = gameConfig.player.boost.duration;
                boostInfo.current.cooldownTimer = gameConfig.player.boost.cooldown;
            }
        };
        const handleKeyUp = (event) => { if (event.code === 'Space') spacebarDown.current = false; };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [onVomit]);

    useTick(delta => {
        if (isGameOver || isPaused || !player) return;

        if (messages && messages.length > 0) {
            setMessages(currentMessages =>
                currentMessages
                    .map(msg => ({ ...msg, life: msg.life - delta }))
                    .filter(msg => msg.life > 0)
            );
        }

        spawnCooldown.current -= delta;

        if (fishLogics && fishLogics.length < gameConfig.fishSpawning.targetPopulation && spawnCooldown.current <= 0) {
            spawnFish();
            spawnCooldown.current = gameConfig.fishSpawning.respawnCooldown;
        }

        if (fishLogics) {
            setFishLogics(logics => logics.map(l => {
                l.update(delta, player.position, logics); 
                return l;
            }));
        }

        boostInfo.current.cooldownTimer -= delta;
        boostInfo.current.boostTimer -= delta;
        if (boostInfo.current.boostTimer <= 0) boostInfo.current.isBoosting = false;

        let { x: velX, y: velY } = player.velocity;

        if (boostInfo.current.isBoosting) {
            const boostSpeed = gameConfig.player.maxSpeed * gameConfig.player.boost.speedMultiplier;
            const angle = Math.atan2(lastVelocity.current.y, lastVelocity.current.x);
            velX = Math.cos(angle) * boostSpeed;
            velY = Math.sin(angle) * boostSpeed;
        } else {
            const dx = mousePosition.current.x - player.position.x;
            const dy = mousePosition.current.y - player.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) {
                const angle = Math.atan2(dy, dx);
                velX += Math.cos(angle) * gameConfig.player.accel * delta;
                velY += Math.sin(angle) * gameConfig.player.accel * delta;
            }

            const friction = playerState.name === 'turn' ? turningFriction : gameConfig.player.friction;
            velX *= friction;
            velY *= friction;

            const speed = Math.sqrt(velX * velX + velY * velY);
            if (speed > gameConfig.player.maxSpeed) {
                velX = (velX / speed) * gameConfig.player.maxSpeed;
                velY = (velY / speed) * gameConfig.player.maxSpeed;
            }
            if (speed > 0.1) lastVelocity.current = { x: velX, y: velY };
        }

        let nextPlayerPos = {
            x: Math.max(0, Math.min(width, player.position.x + velX * delta)),
            y: Math.max(0, Math.min(height, player.position.y + velY * delta)),
        };
        const playerRadius = sizeHierarchy[player.size] * 10;
        let playerBlocked = false;

        let newCages = cagedWords.map(c => ({ ...c, velocity: { ...c.velocity } }));
        const monsterBounds = monster ? { x: monster.position.x - MONSTER_WIDTH / 2, y: monster.position.y - MONSTER_HEIGHT / 2, width: MONSTER_WIDTH, height: MONSTER_HEIGHT } : null;

        if (monster) {
            if (isColliding(nextPlayerPos, playerRadius, monsterBounds)) {
                // --- MODIFIED: Monster Interaction Logic ---
                if (boostInfo.current.isBoosting) {
                    if (onMonsterDash) {
                        onMonsterDash(); // Call the central handler in GameStage
                    }
                    // Apply recoil
                    velX *= -1.5;
                    velY *= -1.5;
                    boostInfo.current.isBoosting = false;
                }
                playerBlocked = true;
            }
        }

        const swallowedCageIds = new Set();

        newCages.forEach(cage => {
            const cageBounds = { x: cage.position.x - CAGE_WIDTH / 2, y: cage.position.y - CAGE_HEIGHT / 2, width: CAGE_WIDTH, height: CAGE_HEIGHT };

            if (isColliding(nextPlayerPos, playerRadius, cageBounds)) {
                if (cage.isBroken) {
                    swallowedCageIds.add(cage.id);
                    setSwallowedWords(s => [...s, { word: cage.word, isCorrect: cage.isCorrect, id: cage.id, audioUrl: cage.audioUrl }]);
                    if (cage.audioUrl) {
                        const sound = new Audio(cage.audioUrl);
                        sound.play().catch(e => console.error("Error playing sound:", e));
                    }
                } else if (boostInfo.current.isBoosting) {
                    if (canBreakCage(player.size, cage.strength)) {
                        cage.isBroken = true;
                        velX *= -0.8;
                    } else {
                        velX *= -1.8;
                    }
                    boostInfo.current.isBoosting = false;
                    playerBlocked = true;
                } else {
                    playerBlocked = true;
                }
            }

            if (monsterBounds && isRectColliding(cageBounds, monsterBounds)) {
                const dx = cage.position.x - monster.position.x;
                const dy = cage.position.y - monster.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                const pushX = dx / distance;
                const pushY = dy / distance;

                const pushStrength = 2;
                const recoilDampening = -0.8;

                cage.velocity.x = (cage.velocity.x * recoilDampening) + (pushX * pushStrength);
                cage.velocity.y = (cage.velocity.y * recoilDampening) + (pushY * pushStrength);

                const minOverlap = 1.0;
                cage.position.x += pushX * minOverlap;
                cage.position.y += pushY * minOverlap;
            }
        });

        newCages.forEach(cage => {
            cage.position.x += cage.velocity.x * delta;
            cage.position.y += cage.velocity.y * delta;

            const friction = cage.isBroken ? 0.90 : 0.95;
            cage.velocity.x *= friction;
            cage.velocity.y *= friction;

            const halfCageW = CAGE_WIDTH / 2;
            const halfCageH = CAGE_HEIGHT / 2;
            if (cage.position.x < halfCageW) { cage.position.x = halfCageW; cage.velocity.x *= -0.7; }
            else if (cage.position.x > width - halfCageW) { cage.position.x = width - halfCageW; cage.velocity.x *= -0.7; }
            if (cage.position.y < halfCageH) { cage.position.y = halfCageH; cage.velocity.y *= -0.7; }
            else if (cage.y > height - halfCageH) { cage.position.y = height - halfCageH; cage.velocity.y *= -0.7; }
        });

        if (playerBlocked) {
            nextPlayerPos = { ...player.position };
        }

        const eatenFishIds = new Set();
        if (fishLogics) {
            fishLogics.forEach(logic => {
                const distance = calculateDistance(nextPlayerPos, logic.state.position);
                if (distance < (playerRadius + 15)) {
                    if (canEat(player.size, logic.state.size)) {
                        setScore(s => s + logic.state.points);
                        eatenFishIds.add(logic.id);
                        if (onPlayerEat) onPlayerEat();
                    } else if (canEat(logic.state.size, player.size)) {
                        onGameOver({ score: score, status: 'FAILED' });
                    }
                }
            });
        }

        const fishEatenByOtherFish = new Set();
        if (fishLogics) {
            fishLogics.forEach(logic => {
                // Check the state of each fish
                if (logic.state.fishToEatId) {
                    // If a fish has targeted another to eat, add it to the set
                    fishEatenByOtherFish.add(logic.state.fishToEatId);
                }
            });
        }

        const allEatenFishIds = new Set([...eatenFishIds, ...fishEatenByOtherFish]);

        if (eatenFishIds.size > 0) {
            setFishLogics(logics => logics.filter(l => !eatenFishIds.has(l.id)));
        }

        if (allEatenFishIds.size > 0) {
            setFishLogics(logics => logics.filter(l => !allEatenFishIds.has(l.id)));
        }

        if (swallowedCageIds.size > 0) {
            setCagedWords(currentCages => currentCages.filter(c => !swallowedCageIds.has(c.id)));
        } else {
            setCagedWords(newCages);
        }

        setPlayer(p => ({ ...p, position: nextPlayerPos, velocity: { x: velX, y: velY } }));
    });

    return { mousePosition, boostInfo };
};