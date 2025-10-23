import React, { useState, useEffect } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const MonsterDialogue = ({ text, x, y, visible }) => {
    const [alpha, setAlpha] = useState(0);

    useEffect(() => {
        // Simple fade-in/fade-out animation
        setAlpha(visible ? 1 : 0);
    }, [visible]);

    const containerWidth = 600;
    const containerHeight = 80;
    const topBarHeight = 40;
    const topBarWidth = 180;

    const monsterTextStyle = new TextStyle({
        fill: '#ffffff',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
    });

    const dialogueTextStyle = new TextStyle({
        fill: '#000000',
        fontSize: 28,
        fontFamily: 'Arial',
        fontWeight: 'bold',
    });

    return (
        <Container x={x} y={y} alpha={alpha} visible={visible}>
            {/* Main white bar */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0xffffff);
                    g.lineStyle(6, 0xFF7A7A); // Red border
                    g.drawRoundedRect(
                        -containerWidth / 2,
                        0,
                        containerWidth,
                        containerHeight,
                        40
                    );
                    g.endFill();
                }}
            />

            {/* Red "MONSTER" bar */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0xFF7A7A);
                    g.drawRoundedRect(
                        -topBarWidth / 2,
                        -topBarHeight / 2,
                        topBarWidth,
                        topBarHeight,
                        20
                    );
                    g.endFill();
                }}
            />

            {/* "MONSTER" text */}
            <Text
                text="MONSTER"
                anchor={0.5}
                x={0}
                y={0}
                style={monsterTextStyle}
            />

            {/* Dialogue text */}
            <Text
                text={text}
                anchor={0.5}
                x={0}
                y={containerHeight / 2}
                style={dialogueTextStyle}
            />
        </Container>
    );
};

export default MonsterDialogue;
