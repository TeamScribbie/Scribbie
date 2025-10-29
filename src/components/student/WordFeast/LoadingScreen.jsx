// WORDD/Working/WordFeast/LoadingScreen.jsx

import React, { useEffect, useState } from 'react';
import { Assets } from 'pixi.js';
import { sound } from '@pixi/sound';

const LoadingScreen = ({ onAssetsLoaded }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const loadAssets = async () => {
            const assetManifest = {
                bundles: [{
                    name: 'game-assets',
                    assets: [
                        { name: 'background', src: './game/spritesheets/background1.png' },
                        { name: 'player', src: './game/spritesheets/Player.png' },
                        { name: 'small-fish', src: './game/spritesheets/Small Fish.png' },
                        { name: 'medium-fish', src: './game/spritesheets/Medium Fish.png' },
                        { name: 'big-fish', src: './game/spritesheets/Big Fish.png' },
                        { name: 'monster-fish', src: './game/spritesheets/Monster Fish.png' },
                        { name: 'bubble', src: './game/icons/bubble.png' },
                        { name: 'lvl1-cage', src: './game/icons/Lvl1Cage.png' },
                        { name: 'lvl2-cage', src: './game/icons/Lvl2Cage.png' },
                        { name: 'lvl3-cage', src: './game/icons/Lvl3Cage.png' },
                        { name: 'monster-intro', src: './game/audio/monster/Intro.ogg' },
                        { name: 'monster-warn1', src: './game/audio/monster/Warn1.ogg' },
                        { name: 'monster-warn2', src: './game/audio/monster/Warn2.ogg' },
                        { name: 'monster-warn3', src: './game/audio/monster/Warn3.ogg' },
                        // Replace with your actual audio file paths
                        { name: 'background-music', src: './game/audio/your-background-music.mp3' },
                        { name: 'ambient-sound', src: './game/audio/your-ambient-sound.mp3' },
                    ],
                }],
            };

            // This will only be called once
            if (!Assets.loader) {
                await Assets.init({ manifest: assetManifest });
                Assets.addBundle('game-assets', assetManifest.bundles[0].assets);
            }
            
            const bundle = await Assets.loadBundle('game-assets', (p) => setProgress(p));

            onAssetsLoaded();
        };

        loadAssets();
    }, [onAssetsLoaded]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            color: 'white',
            fontSize: '24px'
        }}>
            Loading... {Math.round(progress * 100)}%
        </div>
    );
};

export default LoadingScreen;