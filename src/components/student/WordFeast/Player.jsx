import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';

const Player = ({ position, size }) => {
    // Determine scale based on size (small, medium, large)
    const scale = {
        small: 1.0,
        medium: 1.5,
        large: 2.0,
    }[size];

    const draw = useCallback(g => {
        g.clear();
        g.beginFill(0x00FF00); // Player's green color
        g.drawRect(-15 * scale, -10 * scale, 30 * scale, 20 * scale);
        g.endFill();
    }, [scale]);

    return (
        <Graphics
            draw={draw}
            x={position.x}
            y={position.y}
        />
    );
};

export default Player;