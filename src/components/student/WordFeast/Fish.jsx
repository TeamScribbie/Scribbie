import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { Container, Graphics, Text, AnimatedSprite } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { gameConfig } from './config';

// --- Import BOTH spritesheets ---
import smallFishSpriteSheet from './game/spritesheets/Small Fish.png';
import mediumFishSpriteSheet from './game/spritesheets/Medium Fish.png';


// --- Small Fish Setup ---
const smallFishLayout = { frames: {}, animations: {}, meta: { image: 'Small Fish.png', format: 'RGBA8888', size: { w: 989, h: 97 }, scale: 1, }, };
const smFrameWidth = 62; const smXGap = 4;
const smSwimHeight = 45; const smSwimCount = 15; const smSwimFrames = [];
for (let i = 0; i < smSwimCount; i++) { const n = `swim_${i}`; const x = 2 + i * (smFrameWidth + smXGap); smallFishLayout.frames[n] = { frame: { x, y: 2, w: smFrameWidth, h: smSwimHeight } }; smSwimFrames.push(n); }
const smTurnHeight = 46; const smTurnCount = 6; const smTurnFrames = [];
for (let i = 0; i < smTurnCount; i++) { const n = `turn_${i}`; const x = 2 + i * (smFrameWidth + smXGap); smallFishLayout.frames[n] = { frame: { x, y: 51, w: smFrameWidth, h: smTurnHeight } }; smTurnFrames.push(n); }
smallFishLayout.animations['swim'] = smSwimFrames;
smallFishLayout.animations['turn'] = smTurnFrames;
const sheetSmall = new PIXI.Spritesheet(PIXI.BaseTexture.from(smallFishSpriteSheet), smallFishLayout);
let fishTexturesSmall = null;
const parsingPromiseSmall = sheetSmall.parse().then(() => { fishTexturesSmall = sheetSmall.animations; return fishTexturesSmall; });


// --- Medium Fish Setup ---
const mediumFishLayout = { frames: {}, animations: {}, meta: { image: 'Medium Fish.png', format: 'RGBA8888', size: { w: 2479, h: 317 }, scale: 1, }, };
const mdFrameWidth = 169; const mdFrameHeight = 104; const mdXGap = 2;
// Swim Frames (14 total)
const mdSwimFrames = [];
for (let i = 0; i < 14; i++) { const n = `swim_${i}`; const x = 87 + i * (mdFrameWidth + mdXGap); mediumFishLayout.frames[n] = { frame: { x, y: 107, w: mdFrameWidth, h: mdFrameHeight } }; mdSwimFrames.push(n); }
// Turn Frames (5 total)
const mdTurnFrames = [];
for (let i = 0; i < 5; i++) { const n = `turn_${i}`; const x = 87 + i * (mdFrameWidth + mdXGap); mediumFishLayout.frames[n] = { frame: { x, y: 213, w: mdFrameWidth, h: mdFrameHeight } }; mdTurnFrames.push(n); }
// Eat Frames (5 total)
const mdEatFrames = [];
for (let i = 0; i < 5; i++) { const n = `eat_${i}`; const x = 87 + i * (mdFrameWidth + mdXGap); mediumFishLayout.frames[n] = { frame: { x, y: 1, w: mdFrameWidth, h: mdFrameHeight } }; mdEatFrames.push(n); }
mediumFishLayout.animations = { 'swim': mdSwimFrames, 'turn': mdTurnFrames, 'eat': mdEatFrames };
const sheetMedium = new PIXI.Spritesheet(PIXI.BaseTexture.from(mediumFishSpriteSheet), mediumFishLayout);
let fishTexturesMedium = null;
const parsingPromiseMedium = sheetMedium.parse().then(() => { fishTexturesMedium = sheetMedium.animations; return fishTexturesMedium; });


// --- THIS IS THE FULL SMALLFISH COMPONENT ---
const SmallFish = ({ position, velocity, status }) => {
    const [textures, setTextures] = useState(null);
    const spriteRef = useRef(null);
    const facingDirection = useRef(1);

    useEffect(() => {
        if (fishTexturesSmall) setTextures(fishTexturesSmall);
        else parsingPromiseSmall.then(setTextures);
    }, []);

    useEffect(() => {
        if (spriteRef.current && textures) {
            spriteRef.current.gotoAndPlay(0);
        }
    }, [status, textures]);

    if (!textures) return null;

    if (velocity.x < -0.1) facingDirection.current = 1;
    else if (velocity.x > 0.1) facingDirection.current = -1;

    const animationName = status === 'turning' ? 'turn' : 'swim';
    const isLooped = animationName === 'swim';

    return (
        <AnimatedSprite
            ref={spriteRef}
            textures={textures[animationName]}
            animationSpeed={0.25}
            isPlaying={true}
            loop={isLooped}
            x={position.x}
            y={position.y}
            scale={{ x: facingDirection.current * 0.8, y: 0.8 }}
            anchor={{ x: 0.5, y: 0.5 }}
        />
    );
};


const MediumFish = ({ position, velocity, status }) => {
    const [textures, setTextures] = useState(null);
    const spriteRef = useRef(null);
    const facingDirection = useRef(1);

    useEffect(() => {
        if (fishTexturesMedium) setTextures(fishTexturesMedium);
        else parsingPromiseMedium.then(setTextures);
    }, []);

    useEffect(() => {
        if (spriteRef.current && textures) {
            spriteRef.current.gotoAndPlay(0);
        }
    }, [status, textures]);

    if (!textures) return null;

    if (velocity.x < -0.1) facingDirection.current = 1;
    else if (velocity.x > 0.1) facingDirection.current = -1;

    let animationName = 'swim';
    if (status === 'turning') animationName = 'turn';
    if (status === 'eating') animationName = 'eat';
    
    const isLooped = animationName === 'swim';

    return (
        <AnimatedSprite
            ref={spriteRef}
            textures={textures[animationName]}
            animationSpeed={0.2}
            isPlaying={true}
            loop={isLooped}
            x={position.x}
            y={position.y}
            scale={{ x: facingDirection.current * 0.7, y: 0.7 }}
            anchor={{ x: 0.5, y: 0.5 }}
        />
    );
};


const Fish = ({ position, size, velocity, status, debugMode }) => {
    if (size === 'small') {
        return <SmallFish position={position} velocity={velocity} status={status} />;
    }
    if (size === 'medium') {
        return <MediumFish position={position} velocity={velocity} status={status} />;
    }

    const config = { large: { color: 0x3333FF, scale: 1.8 } };
    const { color, scale } = config[size] || {};
    const drawFish = useCallback(g => { if(!color) return; g.clear(); g.beginFill(color); g.drawRect(-15 * scale, -10 * scale, 30 * scale, 20 * scale); g.endFill(); }, [color, scale]);
    const debugStyle = new TextStyle({ fill: 'white', fontSize: 12, fontFamily: 'monospace' });
    const speed = velocity ? Math.sqrt(velocity.x ** 2 + velocity.y ** 2) : 0;
    const debugText = `${status}\nSpeed: ${speed.toFixed(2)}`;
    return (<Container x={position.x} y={position.y}><Graphics draw={drawFish} />{debugMode && ( <Text text={debugText} anchor={{ x: 0.5, y: 0 }} y={25 * scale} style={debugStyle} /> )}</Container>);
};

export default Fish;