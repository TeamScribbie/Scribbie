import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const FireAnimation = ({ streak, containerRef }) => {
    const pixiContainerRef = useRef(null);
    const appRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        if (!containerRef.current || streak < 1) return;

        const container = containerRef.current;
        const bounds = container.getBoundingClientRect();

        if (!appRef.current) {
            appRef.current = new PIXI.Application({
                width: bounds.width,
                height: bounds.height,
                transparent: true,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            });
            pixiContainerRef.current = document.createElement('div');
            pixiContainerRef.current.style.position = 'absolute';
            pixiContainerRef.current.style.top = '0';
            pixiContainerRef.current.style.left = '0';
            pixiContainerRef.current.style.width = '100%';
            pixiContainerRef.current.style.height = '100%';
            pixiContainerRef.current.style.pointerEvents = 'none';
            pixiContainerRef.current.appendChild(appRef.current.view);
            container.appendChild(pixiContainerRef.current);
        }

        const app = appRef.current;
        const intensity = Math.min(streak, 7);
        const particleCount = intensity * 15;

        // Clear existing particles
        particlesRef.current.forEach(p => p.destroy());
        particlesRef.current = [];

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const color = streak >= 7 ? 0xff3d00 : 
                         streak >= 5 ? 0xff6d00 : 
                         0xff9d00;
            
            particle.beginFill(color, 0.6);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            
            particle.x = bounds.width / 2 + (Math.random() - 0.5) * 20;
            particle.y = bounds.height;
            
            particle.vx = (Math.random() - 0.5) * 2 * intensity;
            particle.vy = -Math.random() * 3 * intensity - 1;
            particle.alpha = 0.8;
            
            app.stage.addChild(particle);
            particlesRef.current.push(particle);
        }

        // Animation loop
        const ticker = app.ticker.add(() => {
            particlesRef.current.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.alpha -= 0.01;

                if (particle.alpha <= 0) {
                    particle.x = bounds.width / 2 + (Math.random() - 0.5) * 20;
                    particle.y = bounds.height;
                    particle.alpha = 0.8;
                }
            });
        });

        return () => {
            ticker.destroy();
            if (pixiContainerRef.current && containerRef.current) {
                containerRef.current.removeChild(pixiContainerRef.current);
            }
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, [streak, containerRef]);

    return null;
};

export default FireAnimation;
