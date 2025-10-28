import React from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';

const GrowthProgressBar = ({ score, x, y }) => {
    // Define growth thresholds (matching config.js)
    const smallToMedium = 200;
    const mediumToLarge = 500;
    
    // Determine current phase
    let phase1Progress = 0; // Phase 1: Small → Medium (first half)
    let phase2Progress = 0; // Phase 2: Medium → Medium+ (second half)
    let phase3Progress = 0; // Phase 3: Medium+ → Large (first half)
    let phase4Progress = 0; // Phase 4: Large → Large+ (second half)
    let currentStage = '';
    
    if (score < smallToMedium / 2) {
        // Phase 1: Small → Medium (first half)
        phase1Progress = score / (smallToMedium / 2);
        currentStage = 'Small';
    } else if (score < smallToMedium) {
        // Phase 2: Medium → Medium+ (second half)
        phase1Progress = 1;
        phase2Progress = (score - smallToMedium / 2) / (smallToMedium / 2);
        currentStage = 'Small+';
    } else if (score < smallToMedium + (mediumToLarge - smallToMedium) / 2) {
        // Phase 3: Medium → Large (first half)
        phase1Progress = 1;
        phase2Progress = 1;
        phase3Progress = (score - smallToMedium) / ((mediumToLarge - smallToMedium) / 2);
        currentStage = 'Medium';
    } else if (score < mediumToLarge) {
        // Phase 4: Large → Large+ (second half)
        phase1Progress = 1;
        phase2Progress = 1;
        phase3Progress = 1;
        phase4Progress = (score - smallToMedium - (mediumToLarge - smallToMedium) / 2) / ((mediumToLarge - smallToMedium) / 2);
        currentStage = 'Medium+';
    } else {
        // Max size reached
        phase1Progress = 1;
        phase2Progress = 1;
        phase3Progress = 1;
        phase4Progress = 1;
        currentStage = 'Large';
    }
    
    const barWidth = 300;
    const barHeight = 30;
    const segmentWidth = barWidth / 4;
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
            
            {/* Phase 1 */}
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
            
            {/* Phase 2 */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0x00dd00);
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
            
            {/* Phase 3 */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0xffaa00);
                    g.drawRoundedRect(
                        segmentWidth * 2 + padding,
                        padding,
                        Math.max(0, (segmentWidth - padding * 2) * phase3Progress),
                        barHeight - padding * 2,
                        3
                    );
                    g.endFill();
                }}
            />
            
            {/* Phase 4 */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0xff8800);
                    g.drawRoundedRect(
                        segmentWidth * 3 + padding,
                        padding,
                        Math.max(0, (segmentWidth - padding * 2) * phase4Progress),
                        barHeight - padding * 2,
                        3
                    );
                    g.endFill();
                }}
            />
            
            {/* Dividers */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.lineStyle(2, 0xffffff, 0.5);
                    for (let i = 1; i < 4; i++) {
                        g.moveTo(segmentWidth * i, 0);
                        g.lineTo(segmentWidth * i, barHeight);
                    }
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
