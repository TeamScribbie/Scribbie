import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatedSprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import playerSpriteImage from './game/spritesheets/Player.png';

// Custom hook for reliable intervals in React
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

// --- THIS IS THE FIX: Adjusted x, y, width, and height for all frames ---
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

const Player = ({ position, size, velocity, eatTrigger, onStateChange }) => {
    const [textures, setTextures] = useState(null);
    const [animationName, setAnimationName] = useState('idle');
    const spriteRef = useRef(null);
    const facingDirection = useRef(1); // 1 for left, -1 for right

    const sheet = useMemo(() => {
        const baseTexture = PIXI.BaseTexture.from(playerSpriteImage);
        return new PIXI.Spritesheet(baseTexture, spritesheetLayout);
    }, []);

    useEffect(() => {
        sheet.parse().then(() => {
            setTextures(sheet.animations);
        });
    }, [sheet]);

    // This is our reliable state machine logic
    useEffect(() => {
        onStateChange(animationName); // Report current animation state
        const isBusy = animationName === 'turn' || animationName === 'eat';
        if (isBusy) return;

        if (!velocity) return;

        // Determine intended direction
        let intendedDirection = facingDirection.current;
        if (velocity.x < -0.2) intendedDirection = 1; // Left
        else if (velocity.x > 0.2) intendedDirection = -1; // Right

        // If intent and facing direction don't match, start a turn.
        if (intendedDirection !== facingDirection.current) {
            setAnimationName('turn');
        } else {
            // Otherwise, set swim or idle based on speed.
            const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
            setAnimationName(speed > 0.5 ? 'swim' : 'idle');
        }
    }, [velocity, animationName, onStateChange]);

    // Effect for the eat trigger, which has top priority
    useEffect(() => {
        if (eatTrigger > 0) {
            setAnimationName('eat');
        }
    }, [eatTrigger]);
    
    // This effect ensures that the animation restarts whenever the animationName changes.
    useEffect(() => {
        if (spriteRef.current) {
            spriteRef.current.gotoAndPlay(0);
        }
    }, [animationName]);

    // Our reliable animation completion checker
    useInterval(() => {
        const sprite = spriteRef.current;
        if (!sprite || sprite.loop) return;

        if (sprite.currentFrame === sprite.totalFrames - 1) {
            if (animationName === 'turn') {
                if (velocity.x < -0.2) facingDirection.current = 1;
                else if (velocity.x > 0.2) facingDirection.current = -1;
            }
            setAnimationName('idle');
        }
    }, 50);

    if (!textures) {
        return null;
    }

    const scale = { small: 0.6, medium: 0.9, large: 1.2 }[size];
    const isLooped = animationName === 'idle' || animationName === 'swim';

    return (
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
    );
};

export default Player;