import React from 'react';
import { Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const DebugDisplay = ({ playerSpeed, isBoosting, boostCooldown, width }) => {
    // Style for the debug text
    const debugStyle = new TextStyle({
        fill: 'white',
        fontSize: 16,
        fontFamily: 'monospace',
        align: 'right',
        stroke: 'black',
        strokeThickness: 2,
    });

    // Determine the boost status text
    const boostStatus = isBoosting
        ? "ACTIVE"
        : (boostCooldown > 0 ? `COOLDOWN (${Math.ceil(boostCooldown / 60)}s)` : "Ready");

    // Combine all debug info into one string
    const debugText = [
        `Player Speed: ${playerSpeed.toFixed(2)}`,
        `Boost Status: ${boostStatus}`
    ].join('\n');

    return (
        <Text
            text={debugText}
            style={debugStyle}
            x={width - 10} // Position on the right edge
            y={10}
            anchor={{ x: 1, y: 0 }} // Anchor to the top-right corner
        />
    );
};

export default DebugDisplay;