import React, { useState, useEffect } from 'react';
import { Container, Sprite, Text } from '@pixi/react';
import { TextStyle, Texture } from 'pixi.js';
import BubbleImg from './game/icons/bubble.png';

const bubbleTexture = Texture.from(BubbleImg);

const BeCarefulMessage = ({ x, y, visible = true }) => {
    const message = "Be careful!";
    const chars = message.split('');
    const [visibleChars, setVisibleChars] = useState(0);
    
    // Snappy letter-by-letter animation (50ms per letter)
    useEffect(() => {
        if (!visible) {
            setVisibleChars(0);
            return;
        }
        
        setVisibleChars(0);
        const interval = setInterval(() => {
            setVisibleChars(prev => {
                if (prev >= chars.length) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 50); // Snappy - 50ms per letter
        
        return () => clearInterval(interval);
    }, [visible, chars.length]);
    
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
            {chars.map((char, index) => {
                const isSpace = char === ' ';
                const isVisible = index < visibleChars;
                
                return (
                    <Container 
                        key={index} 
                        x={startX + index * charSpacing}
                        y={0}
                        alpha={isVisible ? 1 : 0}
                    >
                        {/* Bubble background - skip for spaces */}
                        {!isSpace && (
                            <Sprite
                                texture={bubbleTexture}
                                anchor={0.5}
                                scale={0.012}
                            />
                        )}
                        {/* Character text */}
                        <Text
                            text={char}
                            anchor={0.5}
                            style={textStyle}
                        />
                    </Container>
                );
            })}
        </Container>
    );
};

export default BeCarefulMessage;
