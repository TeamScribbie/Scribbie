import React from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const LifeBar = ({ lives, maxLives = 3, x = 10, y = 70 }) => {
    const heartSize = 25;
    const heartSpacing = 5;

    const drawHeart = (g, filled) => {
        g.clear();
        
        if (filled) {
            g.beginFill(0xff0000); // Red color for filled hearts
        } else {
            g.lineStyle(2, 0x666666); // Gray outline for empty hearts
        }
        
        // Draw heart shape
        const size = heartSize;
        g.moveTo(0, size * 0.3);
        g.bezierCurveTo(-size * 0.5, -size * 0.3, -size * 0.5, size * 0.3, 0, size * 0.7);
        g.bezierCurveTo(size * 0.5, size * 0.3, size * 0.5, -size * 0.3, 0, size * 0.3);
        
        if (filled) {
            g.endFill();
        }
    };

    return (
        <Container x={x} y={y}>
            <Text 
                text="Lives:" 
                style={new TextStyle({ 
                    fill: 'white', 
                    fontSize: 20,
                    fontWeight: 'bold',
                    stroke: '#000000',
                    strokeThickness: 3
                })} 
                x={0} 
                y={0} 
            />
            {Array.from({ length: maxLives }).map((_, index) => (
                <Graphics
                    key={index}
                    draw={(g) => drawHeart(g, index < lives)}
                    x={60 + index * (heartSize + heartSpacing)}
                    y={12}
                />
            ))}
        </Container>
    );
};

export default LifeBar;
