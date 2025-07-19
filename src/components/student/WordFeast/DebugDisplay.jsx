import React from 'react';
import { Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

// --- ADDED: playerAnimationName prop ---
const DebugDisplay = ({ playerSpeed, isBoosting, boostCooldown, width, playerAnimationName }) => {
    const debugStyle = new TextStyle({
        fill: 'white',
        fontSize: 16,
        fontFamily: 'monospace',
        align: 'right',
        stroke: 'black',
        strokeThickness: 2,
    });

    const boostStatus = isBoosting
        ? "ACTIVE"
        : (boostCooldown > 0 ? `COOLDOWN (${Math.ceil(boostCooldown / 60)}s)` : "Ready");

    const debugText = [
        `Player Speed: ${playerSpeed.toFixed(2)}`,
        `Boost Status: ${boostStatus}`,
        `Animation State: ${playerAnimationName.toUpperCase()}`, // <-- Display the animation state
    ].join('\n');

    return (
        <Text
            text={debugText}
            style={debugStyle}
            x={width - 10}
            y={10}
            anchor={{ x: 1, y: 0 }}
        />
    );
};

export default DebugDisplay;