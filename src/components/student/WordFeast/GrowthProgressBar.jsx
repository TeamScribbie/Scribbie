import React from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const GrowthProgressBar = ({ score, x, y }) => {
    // Define growth thresholds (matching config.js)
    const smallToMedium = 200;
    const mediumToLarge = 500;
    
    // Determine current phase - only 2 segments for 3 sizes
    let phase1Progress = 0; // Small → Medium
    let phase2Progress = 0; // Medium → Large
    let currentStage = '';
    
    if (score < smallToMedium) {
        // Phase 1: Small → Medium
        phase1Progress = score / smallToMedium;
        currentStage = 'Small';
    } else if (score < mediumToLarge) {
        // Phase 2: Medium → Large
        phase1Progress = 1;
        phase2Progress = (score - smallToMedium) / (mediumToLarge - smallToMedium);
        currentStage = 'Medium';
    } else {
        // Max size reached
        phase1Progress = 1;
        phase2Progress = 1;
        currentStage = 'Large';
    }
    
    const barWidth = 300;
    const barHeight = 30;
    const segmentWidth = barWidth / 2; // Changed from 4 to 2 segments
    const padding = 2;
    
    const textStyle = new TextStyle({
        fill: '#ffffff',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold',
    });
    
    return (
        <Container x={x} y={y}>
            {/* Background */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0x000000, 0.5);
                    g.drawRoundedRect(0, 0, barWidth, barHeight, 5);
                    g.endFill();
                }}
            />
            
            {/* Phase 1: Small → Medium (Green) */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0x00ff00);
                    g.drawRoundedRect(
                        padding,
                        padding,
                        Math.max(0, (segmentWidth - padding * 2) * phase1Progress),
                        barHeight - padding * 2,
                        3
                    );
                    g.endFill();
                }}
            />
            
            {/* Phase 2: Medium → Large (Orange) */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0xffaa00);
                    g.drawRoundedRect(
                        segmentWidth + padding,
                        padding,
                        Math.max(0, (segmentWidth - padding * 2) * phase2Progress),
                        barHeight - padding * 2,
                        3
                    );
                    g.endFill();
                }}
            />
            
            {/* Center Divider */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.lineStyle(2, 0xffffff, 0.5);
                    g.moveTo(segmentWidth, 0);
                    g.lineTo(segmentWidth, barHeight);
                }}
            />
            
            {/* Stage label - above the bar */}
            <Text
                text={currentStage}
                anchor={{ x: 0.5, y: 1 }}
                x={barWidth / 2}
                y={-8}
                style={textStyle}
            />
        </Container>
    );
};

export default GrowthProgressBar;
