import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';

const Fish = ({ position, size }) => {
    const config = {
        small: { color: 0x33FF33, points: 10, scale: 0.8 },
        medium: { color: 0xFF33FF, points: 25, scale: 1.2 },
        large: { color: 0x3333FF, points: 50, scale: 1.8 },
    };

    const { color, scale } = config[size];

    const draw = useCallback(g => {
        g.clear();
        g.beginFill(color);
        g.drawRect(-15 * scale, -10 * scale, 30 * scale, 20 * scale);
        g.endFill();
    }, [color, scale]);

    return <Graphics draw={draw} x={position.x} y={position.y} />;
};

export default Fish;