import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { Container, Graphics, Text, AnimatedSprite } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { gameConfig } from './config';

import smallFishSpriteSheet from './game/spritesheets/Small Fish.png';
import mediumFishSpriteSheet from './game/spritesheets/Medium Fish.png';
import largeFishSpriteSheet from './game/spritesheets/Big Fish.png';


// --- Small Fish Setup (Unchanged) ---
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


// --- Medium Fish Setup (Unchanged) ---
const mediumFishLayout = { frames: {}, animations: {}, meta: { image: 'Medium Fish.png', format: 'RGBA8888', size: { w: 2479, h: 317 }, scale: 1, }, };
const mdFrameWidth = 167; const mdFrameHeight = 102; const mdXGap = 4;
const mdSwimFrames = [];
for (let i = 0; i < 14; i++) { const n = `swim_${i}`; const x = 88 + i * (mdFrameWidth + mdXGap); mediumFishLayout.frames[n] = { frame: { x, y: 108, w: mdFrameWidth, h: mdFrameHeight } }; mdSwimFrames.push(n); }
const mdTurnFrames = [];
for (let i = 0; i < 5; i++) { const n = `turn_${i}`; const x = 88 + i * (mdFrameWidth + mdXGap); mediumFishLayout.frames[n] = { frame: { x, y: 214, w: mdFrameWidth, h: mdFrameHeight } }; mdTurnFrames.push(n); }
const mdEatFrames = [];
for (let i = 0; i < 5; i++) { const n = `eat_${i}`; const x = 88 + i * (mdFrameWidth + mdXGap); mediumFishLayout.frames[n] = { frame: { x, y: 2, w: mdFrameWidth, h: mdFrameHeight } }; mdEatFrames.push(n); }
mediumFishLayout.animations = { 'swim': mdSwimFrames, 'turn': mdTurnFrames, 'eat': mdEatFrames };
const sheetMedium = new PIXI.Spritesheet(PIXI.BaseTexture.from(mediumFishSpriteSheet), mediumFishLayout);
let fishTexturesMedium = null;
const parsingPromiseMedium = sheetMedium.parse().then(() => { fishTexturesMedium = sheetMedium.animations; return fishTexturesMedium; });


// --- Large Fish Setup (MODIFIED) ---
const largeFishLayout = { frames: {}, animations: {}, meta: { image: 'Big Fish.png', format: 'RGBA8888', size: { w: 2633, h: 643 }, scale: 1, }, };
const lgFrameWidth = 177; // Reduced from 179
const lgFrameHeight = 157; // Reduced from 159
const lgXGap = 4; // Increased from 2
// Swim Frames (14 total)
const lgSwimFrames = [];
for (let i = 0; i < 14; i++) { const n = `swim_${i}`; const x = 102 + i * (lgFrameWidth + lgXGap); largeFishLayout.frames[n] = { frame: { x, y: 324, w: lgFrameWidth, h: lgFrameHeight } }; lgSwimFrames.push(n); }
// Turn Frames (4 total)
const lgTurnFrames = [];
for (let i = 0; i < 4; i++) { const n = `turn_${i}`; const x = 102 + i * (lgFrameWidth + lgXGap); largeFishLayout.frames[n] = { frame: { x, y: 485, w: lgFrameWidth, h: lgFrameHeight } }; lgTurnFrames.push(n); }
// Eat Frames (5 total)
const lgEatFrames = [];
for (let i = 0; i < 5; i++) { const n = `eat_${i}`; const x = 102 + i * (lgFrameWidth + lgXGap); largeFishLayout.frames[n] = { frame: { x, y: 2, w: lgFrameWidth, h: lgFrameHeight } }; lgEatFrames.push(n); }
largeFishLayout.animations = { 'swim': lgSwimFrames, 'turn': lgTurnFrames, 'eat': lgEatFrames };
const sheetLarge = new PIXI.Spritesheet(PIXI.BaseTexture.from(largeFishSpriteSheet), largeFishLayout);
let fishTexturesLarge = null;
const parsingPromiseLarge = sheetLarge.parse().then(() => { fishTexturesLarge = sheetLarge.animations; return fishTexturesLarge; });


// --- SmallFish Component (Unchanged) ---
const SmallFish = ({ position, velocity, status }) => {
    const [textures, setTextures] = useState(null);
    const spriteRef = useRef(null);
    const facingDirection = useRef(1);
    useEffect(() => { if (fishTexturesSmall) setTextures(fishTexturesSmall); else parsingPromiseSmall.then(setTextures); }, []);
    useEffect(() => { if (spriteRef.current && textures) { spriteRef.current.gotoAndPlay(0); } }, [status, textures]);
    if (!textures) return null;
    if (velocity.x < -0.1) facingDirection.current = 1; else if (velocity.x > 0.1) facingDirection.current = -1;
    const animationName = status === 'turning' ? 'turn' : 'swim';
    const isLooped = animationName === 'swim';
    return (<AnimatedSprite ref={spriteRef} textures={textures[animationName]} animationSpeed={0.25} isPlaying={true} loop={isLooped} x={position.x} y={position.y} scale={{ x: facingDirection.current * 0.8, y: 0.8 }} anchor={{ x: 0.5, y: 0.5 }} />);
};


// --- MediumFish Component (Unchanged) ---
const MediumFish = ({ position, velocity, status }) => {
    const [textures, setTextures] = useState(null);
    const spriteRef = useRef(null);
    const facingDirection = useRef(1);
    useEffect(() => { if (fishTexturesMedium) setTextures(fishTexturesMedium); else parsingPromiseMedium.then(setTextures); }, []);
    useEffect(() => { if (spriteRef.current && textures) { spriteRef.current.gotoAndPlay(0); } }, [status, textures]);
    if (!textures) return null;
    if (velocity.x < -0.1) facingDirection.current = 1; else if (velocity.x > 0.1) facingDirection.current = -1;
    let animationName = 'swim';
    if (status === 'turning') animationName = 'turn';
    if (status === 'eating') animationName = 'eat';
    const isLooped = animationName === 'swim';
    return (<AnimatedSprite ref={spriteRef} textures={textures[animationName]} animationSpeed={0.2} isPlaying={true} loop={isLooped} x={position.x} y={position.y} scale={{ x: facingDirection.current * 0.9, y: 0.9 }} anchor={{ x: 0.5, y: 0.5 }} />);
};


// --- LargeFish Component (Unchanged) ---
const LargeFish = ({ position, velocity, status }) => {
    const [textures, setTextures] = useState(null);
    const spriteRef = useRef(null);
    const facingDirection = useRef(1);
    useEffect(() => { if (fishTexturesLarge) setTextures(fishTexturesLarge); else parsingPromiseLarge.then(setTextures); }, []);
    useEffect(() => { if (spriteRef.current && textures) spriteRef.current.gotoAndPlay(0); }, [status, textures]);
    if (!textures) return null;
    if (velocity.x < -0.1) facingDirection.current = 1; else if (velocity.x > 0.1) facingDirection.current = -1;
    let animationName = 'swim';
    if (status === 'turning') animationName = 'turn';
    if (status === 'eating') animationName = 'eat';
    const isLooped = animationName === 'swim';

    return (<AnimatedSprite ref={spriteRef} textures={textures[animationName]} animationSpeed={0.15} isPlaying={true} loop={isLooped} x={position.x} y={position.y} scale={{ x: facingDirection.current * 1.1, y: 1.1 }}  anchor={{ x: 0.5, y: 0.5 }} />);
};


// --- Main Fish Component (Unchanged) ---
const Fish = ({ position, size, velocity, status, debugMode }) => {
    if (size === 'small') {
        return <SmallFish position={position} velocity={velocity} status={status} />;
    }
    if (size === 'medium') {
        return <MediumFish position={position} velocity={velocity} status={status} />;
    }
    if (size === 'large') {
        return <LargeFish position={position} velocity={velocity} status={status} />;
    }
    return null;
};

export default Fish;