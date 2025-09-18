import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// Import bite sounds
import Bite1Mp3 from './game/audio/player/bite1.mp3';
import Bite2Mp3 from './game/audio/player/bite2.mp3';
import Bite3Mp3 from './game/audio/player/bite3.mp3';
import Bite4Mp3 from './game/audio/player/bite4.mp3';
import { AnimatedSprite, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import playerSpriteImage from './game/spritesheets/Player.png';

// --- Spritesheet setup is now done ONCE outside the component ---

const spritesheetLayout = {
    frames: {
        'eat_0': { frame: { x: 113, y: 3, w: 274, h: 142 } },
        'eat_1': { frame: { x: 390, y: 3, w: 274, h: 142 } },
        'eat_2': { frame: { x: 667, y: 3, w: 274, h: 142 } },
        'eat_3': { frame: { x: 944, y: 3, w: 274, h: 142 } },
        'eat_4': { frame: { x: 1221, y: 3, w: 274, h: 142 } },
        'eat_5': { frame: { x: 1498, y: 3, w: 274, h: 142 } },
        'eat_6': { frame: { x: 1775, y: 3, w: 274, h: 142 } },
        'eat_7': { frame: { x: 2052, y: 3, w: 274, h: 142 } },
        'idle_0': { frame: { x: 113, y: 149, w: 274, h: 142 } },
        'idle_1': { frame: { x: 390, y: 149, w: 274, h: 142 } },
        'idle_2': { frame: { x: 667, y: 149, w: 274, h: 142 } },
        'idle_3': { frame: { x: 944, y: 149, w: 274, h: 142 } },
        'idle_4': { frame: { x: 1221, y: 149, w: 274, h: 142 } },
        'idle_5': { frame: { x: 1498, y: 149, w: 274, h: 142 } },
        'idle_6': { frame: { x: 1775, y: 149, w: 274, h: 142 } },
        'idle_7': { frame: { x: 2052, y: 149, w: 274, h: 142 } },
        'idle_8': { frame: { x: 2329, y: 149, w: 274, h: 142 } },
        'idle_9': { frame: { x: 2606, y: 149, w: 274, h: 142 } },
        'idle_10': { frame: { x: 2883, y: 149, w: 274, h: 142 } },
        'idle_11': { frame: { x: 3160, y: 149, w: 274, h: 142 } },
        'swim_0': { frame: { x: 113, y: 295, w: 274, h: 142 } },
        'swim_1': { frame: { x: 390, y: 295, w: 274, h: 142 } },
        'swim_2': { frame: { x: 667, y: 295, w: 274, h: 142 } },
        'swim_3': { frame: { x: 944, y: 295, w: 274, h: 142 } },
        'swim_4': { frame: { x: 1221, y: 295, w: 274, h: 142 } },
        'swim_5': { frame: { x: 1498, y: 295, w: 274, h: 142 } },
        'swim_6': { frame: { x: 1775, y: 295, w: 274, h: 142 } },
        'swim_7': { frame: { x: 2052, y: 295, w: 274, h: 142 } },
        'swim_8': { frame: { x: 2329, y: 295, w: 274, h: 142 } },
        'swim_9': { frame: { x: 2606, y: 295, w: 274, h: 142 } },
        'swim_10': { frame: { x: 2883, y: 295, w: 274, h: 142 } },
        'swim_11': { frame: { x: 3160, y: 295, w: 274, h: 142 } },
        'swim_12': { frame: { x: 3437, y: 295, w: 274, h: 142 } },
        'swim_13': { frame: { x: 3714, y: 295, w: 274, h: 142 } },
        'turn_0': { frame: { x: 113, y: 441, w: 274, h: 142 } },
        'turn_1': { frame: { x: 390, y: 441, w: 274, h: 142 } },
        'turn_2': { frame: { x: 667, y: 441, w: 274, h: 142 } },
        'turn_3': { frame: { x: 944, y: 441, w: 274, h: 142 } },
        'turn_4': { frame: { x: 1221, y: 441, w: 274, h: 142 } },
        'turn_5': { frame: { x: 1498, y: 441, w: 274, h: 142 } },
    },
    animations: {
        'eat': ['eat_0', 'eat_1', 'eat_2', 'eat_3', 'eat_4', 'eat_5', 'eat_6', 'eat_7'],
        'idle': ['idle_0', 'idle_1', 'idle_2', 'idle_3', 'idle_4', 'idle_5', 'idle_6', 'idle_7', 'idle_8', 'idle_9', 'idle_10', 'idle_11'],
        'swim': ['swim_0', 'swim_1', 'swim_2', 'swim_3', 'swim_4', 'swim_5', 'swim_6', 'swim_7', 'swim_8', 'swim_9', 'swim_10', 'swim_11', 'swim_12', 'swim_13'],
        'turn': ['turn_0', 'turn_1', 'turn_2', 'turn_3', 'turn_4', 'turn_5'],
    },
    meta: {
        image: 'Player.png',
        format: 'RGBA8888',
        size: { w: 3988, h: 583 },
        scale: 1,
    },
};

spritesheetLayout.animations.vomit = [...spritesheetLayout.animations.eat].reverse();

const sheet = new PIXI.Spritesheet(PIXI.BaseTexture.from(playerSpriteImage), spritesheetLayout);
let playerTextures = null;
const parsingPromise = sheet.parse().then(() => {
    playerTextures = sheet.animations;
    return playerTextures;
});

// --- ADDED: Consistent dimensions from usePhysics ---
const playerSpriteDimensions = {
    width: 274,
    height: 142,
    scaleMultiplier: 1.5,
};

function useInterval(callback, delay) {
    const savedCallback = useRef();
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

const biteSounds = [Bite1Mp3, Bite2Mp3, Bite3Mp3, Bite4Mp3];

const Player = ({ position, size, velocity, eatTrigger, vomitTrigger, onStateChange, onVomitComplete, debugMode }) => {
    const [textures, setTextures] = useState(null);
    const [animationName, setAnimationName] = useState('idle');
    const [isEating, setIsEating] = useState(false);
    const spriteRef = useRef(null);
    const facingDirection = useRef(1);

    useEffect(() => {
        if (playerTextures) {
            setTextures(playerTextures);
        } else {
            parsingPromise.then(setTextures);
        }
    }, []);

    useEffect(() => {
        if (!textures) return;
        onStateChange({ name: animationName, facing: facingDirection.current });
        if (animationName === 'eat' || animationName === 'vomit') return;
        if (!velocity) return;
        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
        let intendedDirection = facingDirection.current;
        if (velocity.x < -0.4) intendedDirection = 1;
        else if (velocity.x > 0.4) intendedDirection = -1;
        if (intendedDirection !== facingDirection.current && speed > 0.5) {
            setAnimationName('turn');
        } else {
            setAnimationName(speed > 0.5 ? 'swim' : 'idle');
        }
    }, [velocity, animationName, onStateChange, textures]);

    const biteSoundIndexRef = useRef(0);
    useEffect(() => {
        if (eatTrigger > 0) {
            setAnimationName('eat');
            setIsEating(true);
            const idx = biteSoundIndexRef.current;
            const sound = new Audio(biteSounds[idx]);
            sound.play().catch(e => console.error('Error playing bite sound:', e));
            biteSoundIndexRef.current = (idx + 1) % biteSounds.length;
        }
    }, [eatTrigger]);

    useEffect(() => {
        if (vomitTrigger > 0) setAnimationName('vomit');
    }, [vomitTrigger]);
    
    useEffect(() => {
        if (spriteRef.current) {
            spriteRef.current.gotoAndPlay(0);
        }
    }, [animationName]);

    useInterval(() => {
        const sprite = spriteRef.current;
        if (!sprite || sprite.loop) return;
        if (sprite.currentFrame === sprite.totalFrames - 1) {
            if (animationName === 'turn') {
                if (velocity.x < -0.2) facingDirection.current = 1;
                else if (velocity.x > 0.2) facingDirection.current = -1;
            }
            if (animationName === 'vomit' && onVomitComplete) {
                onVomitComplete();
            }
            if (animationName === 'eat') {
                setIsEating(false);
            }
            setAnimationName('idle');
        }
    }, 50);

    const draw = useCallback((g) => {
        g.clear();
        if (debugMode) {
            const playerScale = { small: 0.4, medium: 0.6, large: 0.8 }[size];
            // --- MODIFIED LINES ---
            // Use the exact same calculation as usePhysics.js
            const width = playerSpriteDimensions.width * playerScale * playerSpriteDimensions.scaleMultiplier;
            const height = playerSpriteDimensions.height * playerScale * playerSpriteDimensions.scaleMultiplier;
            g.lineStyle(2, 0x00ff00, 1); // Green color for visibility
            g.drawRect(-width / 2, -height / 2, width, height);
        }
    }, [debugMode, size]);

    if (!textures) {
        return null;
    }
    
    const scale = { small: 0.4, medium: 0.6, large: 0.8 }[size];
    const isLooped = animationName === 'idle' || animationName === 'swim';

    return (
        <>
            <AnimatedSprite
                ref={spriteRef}
                textures={textures[animationName]}
                animationSpeed={0.3}
                isPlaying={true}
                loop={isLooped}
                x={position.x}
                y={position.y}
                scale={{ x: facingDirection.current * scale, y: scale }}
                anchor={{ x: 0.5, y: 0.5 }}
            />
            <Graphics draw={draw} x={position.x} y={position.y} />
        </>
    );
};

export default Player;