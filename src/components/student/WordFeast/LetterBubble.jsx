import React, { useCallback, useState } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const LetterBubble = ({ id, text, position, weight, onDragStart, onDragMove, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handlePointerDown = (event) => {
        setIsDragging(true);
        onDragStart(event, id);
    };

    const handlePointerMove = (event) => {
        if (isDragging) {
            onDragMove(event, id);
        }
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        onDragEnd(id);
    };

    const drawBubble = useCallback((g) => {
        g.clear();
        g.beginFill(isDragging ? 0xCCCCCC : 0xfeca57, 1); // Change color when dragging
        g.drawCircle(0, 0, 35);
        g.endFill();
    }, [isDragging]);

    const textStyle = new TextStyle({
        align: 'center',
        fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
    });

    return (
        <Container
            x={position.x}
            y={position.y}
            eventMode={'static'}
            pointerdown={handlePointerDown}
            pointermove={handlePointerMove}
            pointerup={handlePointerUp}
            pointerupoutside={handlePointerUp}
        >
            <Graphics draw={drawBubble} />
            <Text text={`${text}\nLvl: ${weight}`} anchor={0.5} style={textStyle} />
        </Container>
    );
};

export default LetterBubble;