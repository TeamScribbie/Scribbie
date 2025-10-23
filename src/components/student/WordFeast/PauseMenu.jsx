import React from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const PauseMenu = ({ x, y, onRetry, onExit }) => {
    const menuWidth = 400;
    const menuHeight = 300;
    const buttonWidth = 300;
    const buttonHeight = 60;
    const buttonSpacing = 20;
    
    const titleStyle = new TextStyle({
        fill: '#000000',
        fontSize: 48,
        fontFamily: 'Arial',
        fontWeight: 'bold',
    });
    
    const buttonTextStyle = new TextStyle({
        fill: '#000000',
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
    });
    
    return (
        <Container x={x} y={y}>
            {/* Background overlay */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0x000000, 0.7);
                    g.drawRect(-2000, -2000, 4000, 4000);
                    g.endFill();
                }}
            />
            
            {/* White menu container */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0xffffff);
                    g.drawRoundedRect(
                        -menuWidth / 2,
                        -menuHeight / 2,
                        menuWidth,
                        menuHeight,
                        20
                    );
                    g.endFill();
                }}
            />
            
            {/* Title */}
            <Text
                text="PAUSED"
                anchor={{ x: 0.5, y: 0.5 }}
                x={0}
                y={-80}
                style={titleStyle}
            />
            
            {/* Retry Button */}
            <Container
                eventMode="static"
                cursor="pointer"
                pointerdown={onRetry}
                y={10}
            >
                <Graphics
                    draw={g => {
                        g.clear();
                        g.beginFill(0xdddddd);
                        g.lineStyle(3, 0x000000);
                        g.drawRoundedRect(
                            -buttonWidth / 2,
                            -buttonHeight / 2,
                            buttonWidth,
                            buttonHeight,
                            10
                        );
                        g.endFill();
                    }}
                />
                <Text
                    text="Retry"
                    anchor={{ x: 0.5, y: 0.5 }}
                    x={0}
                    y={0}
                    style={buttonTextStyle}
                />
            </Container>
            
            {/* Exit Button */}
            <Container
                eventMode="static"
                cursor="pointer"
                pointerdown={onExit}
                y={10 + buttonHeight + buttonSpacing}
            >
                <Graphics
                    draw={g => {
                        g.clear();
                        g.beginFill(0xdddddd);
                        g.lineStyle(3, 0x000000);
                        g.drawRoundedRect(
                            -buttonWidth / 2,
                            -buttonHeight / 2,
                            buttonWidth,
                            buttonHeight,
                            10
                        );
                        g.endFill();
                    }}
                />
                <Text
                    text="Exit"
                    anchor={{ x: 0.5, y: 0.5 }}
                    x={0}
                    y={0}
                    style={buttonTextStyle}
                />
            </Container>
        </Container>
    );
};

export default PauseMenu;
