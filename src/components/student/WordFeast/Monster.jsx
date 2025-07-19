import React, { useCallback } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const Monster = ({ position, word, audioUrl, width = 120, height = 160 }) => {
    // Styling for the monster's body - now a rectangle
    const drawMonster = useCallback(g => {
        g.clear();
        g.beginFill(0x660066); // A nice purple color
        // Draw a rectangle. The coordinates are relative to the container's center.
        g.drawRect(-width / 2, -height / 2, width, height); 
        g.endFill();
    }, [width, height]);

    // Styling for the text on the monster
    const textStyle = new TextStyle({
        fill: 'white',
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        stroke: 'black',
        strokeThickness: 5,
    });

    return (
        <Container x={position.x} y={position.y}>
            <Graphics draw={drawMonster} />
            <Text
                text={word}
                anchor={{ x: 0.5, y: 0.5 }} // Center the text
                style={textStyle}
            />
        </Container>
    );
};

export default Monster;