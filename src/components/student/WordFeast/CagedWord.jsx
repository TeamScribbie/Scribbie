import React, { useCallback } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const CagedWord = ({ position, word, strength, audioUrl }) => {
    // Cage colors based on strength
    const cageColors = {
        1: 0xcd7f32, // Bronze for 'small'
        2: 0xc0c0c0, // Silver for 'medium'
        3: 0xffd700, // Gold for 'large'
    };

    const drawCage = useCallback(g => {
        const cageColor = cageColors[strength] || cageColors[1];
        g.clear();
        g.lineStyle(6, cageColor, 1);
        g.drawRect(-40, -25, 80, 50); // Outer box
        g.moveTo(-20, -25).lineTo(-20, 25); // Vertical bar
        g.moveTo(20, -25).lineTo(20, 25);  // Vertical bar
    }, [strength]);

    const textStyle = new TextStyle({
        fill: 'white',
        fontSize: 24,
        fontFamily: 'Arial',
        stroke: 'black',
        strokeThickness: 4,
    });

    return (
        <Container x={position.x} y={position.y}>
            <Graphics draw={drawCage} />
            <Text
                text={word}
                anchor={{ x: 0.5, y: 0.5 }}
                style={textStyle}
            />
        </Container>
    );
};

export default CagedWord;