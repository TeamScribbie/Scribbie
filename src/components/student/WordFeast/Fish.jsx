import React, { useCallback } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { gameConfig } from './config';

const Fish = ({ position, size, velocity, status, debugMode }) => {
    // Configuration for placeholder rectangle sizes and colors
    const config = {
        small: { color: 0x33FF33, scale: 0.8 },
        medium: { color: 0xFF33FF, scale: 1.2 },
        large: { color: 0x3333FF, scale: 1.8 },
    };

    const { color, scale } = config[size];

    const drawFish = useCallback(g => {
        g.clear();
        g.beginFill(color);
        g.drawRect(-15 * scale, -10 * scale, 30 * scale, 20 * scale);
        g.endFill();
    }, [color, scale]);

    const drawDebug = useCallback((g) => {
        g.clear();
        if (!debugMode) return;

        const fishType = gameConfig.fishTypes[size];
        if (fishType.chaseRadius) {
            g.lineStyle(2, 0xFF0000, 0.6); // Red line, 2px thick, 60% opacity
            g.drawCircle(0, 0, fishType.chaseRadius);
        }
    }, [debugMode, size]);

    const debugStyle = new TextStyle({
        fill: 'white',
        fontSize: 12,
        fontFamily: 'monospace',
        stroke: 'black',
        strokeThickness: 2,
    });
    
    // Calculate speed if velocity is available
    const speed = velocity ? Math.sqrt(velocity.x ** 2 + velocity.y ** 2) : 0;
    const debugText = `${status}\nSpeed: ${speed.toFixed(2)}`;

    return (
        <Container x={position.x} y={position.y}>
            <Graphics draw={drawFish} />

            {debugMode && (
                <>
                    <Graphics draw={drawDebug} />
                    <Text
                        text={debugText}
                        anchor={{ x: 0.5, y: 0 }}
                        y={25 * scale}
                        style={debugStyle}
                    />
                </>
            )}
        </Container>
    );
};

export default Fish;