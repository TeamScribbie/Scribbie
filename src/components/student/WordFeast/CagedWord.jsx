import React from 'react';
import { Container, Sprite, Text } from '@pixi/react';
import { TextStyle, Texture } from 'pixi.js';

import Lvl1CageImg from './game/icons/Lvl1Cage.png';
import Lvl2CageImg from './game/icons/Lvl2Cage.png';
import Lvl3CageImg from './game/icons/Lvl3Cage.png';
import BubbleImg from './game/icons/bubble.png';

// --- FIX: Create textures once, outside the component, to prevent cache warnings ---
const cageTextures = {
    1: Texture.from(Lvl1CageImg),
    2: Texture.from(Lvl2CageImg),
    3: Texture.from(Lvl3CageImg),
};
const bubbleTexture = Texture.from(BubbleImg);

const CagedWord = ({ position, word, strength, isBroken }) => {
    
    const textStyle = new TextStyle({
        fill: 'black',
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold',
    });

    return (
        <Container x={position.x} y={position.y}>
            {/* The Bubble and Word are now always rendered if the entity is broken */}
            <Sprite
                texture={bubbleTexture}
                anchor={0.5}
                scale={0.015} 
                visible={isBroken} 
            />
            <Text
                text={word}
                anchor={0.5}
                style={textStyle}
                visible={isBroken}
            />

            {/* --- FIX: The Cage is now only rendered if it is NOT broken --- */}
            {/* This prevents the crash when trying to render a vomited bubble that has no strength */}
            {!isBroken && (
                <Sprite
                    texture={cageTextures[strength]}
                    anchor={0.5}
                    scale={0.2}
                />
            )}
        </Container>
    );
};

export default CagedWord;