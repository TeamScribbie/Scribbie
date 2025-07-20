import React, { useState, useEffect, useRef } from 'react';
import { Container, Text, AnimatedSprite } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import * as PIXI from 'pixi.js';

import monsterSpriteSheet from './game/spritesheets/Monster Fish.png';

// --- Spritesheet setup is unchanged, collapsed for brevity ---
const monsterLayout = {
    frames: {
        'idle_0': { frame: { x: 16, y: 3, w: 115, h: 153 } },
        'idle_1': { frame: { x: 177, y: 3, w: 115, h: 152 } },
        'idle_2': { frame: { x: 338, y: 3, w: 116, h: 152 } },
        'idle_3': { frame: { x: 500, y: 3, w: 116, h: 153 } },
        'idle_4': { frame: { x: 662, y: 3, w: 115, h: 152 } },
        'idle_5': { frame: { x: 29, y: 167, w: 115, h: 150 } },
        'idle_6': { frame: { x: 188, y: 167, w: 116, h: 149 } },
        'idle_7': { frame: { x: 347, y: 167, w: 116, h: 149 } },
        'idle_8': { frame: { x: 505, y: 167, w: 116, h: 151 } },
        'idle_9': { frame: { x: 664, y: 167, w: 115, h: 154 } },
    },
    animations: { 'idle': ['idle_0', 'idle_1', 'idle_2', 'idle_3', 'idle_4', 'idle_5', 'idle_6', 'idle_7', 'idle_8', 'idle_9'] },
    meta: { image: 'Monster Fish.png', format: 'RGBA8888', size: { w: 810, h: 1016 }, scale: 1, },
};
const sheet = new PIXI.Spritesheet(PIXI.BaseTexture.from(monsterSpriteSheet), monsterLayout);
let monsterTextures = null;
const parsingPromise = sheet.parse().then(() => { monsterTextures = sheet.animations; return monsterTextures; });


const Monster = ({ position, word, audioUrl }) => {
    const [textures, setTextures] = useState(null);

    useEffect(() => {
        if (monsterTextures) setTextures(monsterTextures);
        else parsingPromise.then(setTextures);
    }, []);

    if (!textures) {
        return null;
    }

    return (
        <Container x={position.x} y={position.y}>
            <AnimatedSprite
                textures={textures['idle']}
                animationSpeed={0.2}
                isPlaying={true}
                loop={true}
                anchor={{ x: 0.5, y: 0.5 }}
                scale={1.5} // MODIFIED: Increased scale for a bigger monster
            />
            {/* REMOVED: The <Text> component that displayed the word is now gone. */}
        </Container>
    );
};

export default Monster;