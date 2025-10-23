import React from 'react';
import { Container, Sprite, Text } from '@pixi/react';
import { TextStyle, Texture } from 'pixi.js';
import BubbleImg from './game/icons/bubble.png';

const bubbleTexture = Texture.from(BubbleImg);

const BeCarefulMessage = ({ x, y, visible = true }) => {
    const message = "Be careful!";
    const chars = message.split('');
    
    const textStyle = new TextStyle({
        fill: '#ff0000', // Red color
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: '#ffffff', // White glow
        strokeThickness: 4,
    });

    const charSpacing = 40; // Space between each character
    const totalWidth = chars.length * charSpacing;
    const startX = -totalWidth / 2;

    return (
        <Container x={x} y={y} visible={visible}>
            {chars.map((char, index) => (
                <Container 
                    key={index} 
                    x={startX + index * charSpacing}
                    y={0}
                >
                    {/* Bubble background */}
                    <Sprite
                        texture={bubbleTexture}
                        anchor={0.5}
                        scale={0.012}
                    />
                    {/* Character text */}
                    <Text
                        text={char}
                        anchor={0.5}
                        style={textStyle}
                    />
                </Container>
            ))}
        </Container>
    );
};

export default BeCarefulMessage;
