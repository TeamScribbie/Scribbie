import React, { useState, useEffect } from 'react';
import { Container, Sprite, Text } from '@pixi/react';
import { TextStyle, Texture } from 'pixi.js';
import BubbleImg from './game/icons/bubble.png';

const bubbleTexture = Texture.from(BubbleImg);

const SequenceDisplay = ({ swallowedWords, x, y }) => {
    const [visibleWords, setVisibleWords] = useState(swallowedWords.length);
    
    // Animate new words appearing
    useEffect(() => {
        if (swallowedWords.length > visibleWords) {
            // New word added - animate it in
            const timer = setTimeout(() => {
                setVisibleWords(swallowedWords.length);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setVisibleWords(swallowedWords.length);
        }
    }, [swallowedWords.length, visibleWords]);
    
    const textStyle = new TextStyle({
        fill: '#ff0000', // Red text
        fontSize: 36, // Larger text
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: '#ffffff', // White glow
        strokeThickness: 4,
    });

    const wordSpacing = 100; // Space between word bubbles
    const totalWidth = swallowedWords.length * wordSpacing;
    const startX = -totalWidth / 2;

    return (
        <Container x={x} y={y}>
            {swallowedWords.map((wordObj, index) => {
                const isVisible = index < visibleWords;
                
                return (
                    <Container 
                        key={index} 
                        x={startX + index * wordSpacing}
                        y={0}
                        alpha={isVisible ? 1 : 0}
                    >
                        {/* Bubble background - original color */}
                        <Sprite
                            texture={bubbleTexture}
                            anchor={0.5}
                            scale={0.016}
                        />
                        
                        {/* Word text (entire word, not letters) */}
                        <Text
                            text={wordObj.word}
                            anchor={0.5}
                            style={textStyle}
                        />
                    </Container>
                );
            })}
        </Container>
    );
};

export default SequenceDisplay;
