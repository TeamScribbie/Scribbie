import React from 'react';
import { Container, Sprite, Text } from '@pixi/react';
import { TextStyle, Texture } from 'pixi.js';

import Lvl1CageImg from './game/icons/Lvl1Cage.png';
import Lvl2CageImg from './game/icons/Lvl2Cage.png';
import Lvl3CageImg from './game/icons/Lvl3Cage.png';
import BubbleImg from './game/icons/bubble.png';

const cageTextures = {
    1: Texture.from(Lvl1CageImg),
    2: Texture.from(Lvl2CageImg),
    3: Texture.from(Lvl3CageImg),
};
const bubbleTexture = Texture.from(BubbleImg);

const CagedWord = ({ position, word, strength, isBroken }) => {
    
    const displayTexture = isBroken ? bubbleTexture : cageTextures[strength];

    const textStyle = new TextStyle({
        fill: isBroken ? 'black' : 'white',
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: isBroken ? 'transparent' : 'black',
        strokeThickness: 4,
    });

    return (
        <Container x={position.x} y={position.y}>
            <Sprite
                texture={displayTexture}
                anchor={0.5}
                scale={0.15} // --- FIX: Changed scale to make sprites smaller ---
            />
            <Text
                text={word}
                anchor={0.5}
                style={textStyle}
            />
        </Container>
    );
};

export default CagedWord;