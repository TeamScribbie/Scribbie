import { useState, useEffect } from 'react';
import { gameConfig } from '../config';

export const useVirtualCamera = (playerPos, debugMode) => {
    const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!playerPos) return;

        // If debug mode is on, camera is fixed at (0,0) (top-left of the map)
        if (debugMode) {
            setCameraPos({ x: 0, y: 0 });
            return;
        }

        const mapWidth = gameConfig.map.width;
        const mapHeight = gameConfig.map.height;
        const cameraViewWidth = gameConfig.cameraViewport.width;
        const cameraViewHeight = gameConfig.cameraViewport.height;

        // Calculate target camera position (where the camera *wants* to be centered on the player)
        // The camera's (x,y) represents its top-left corner in the map coordinates.
        // If player is at (playerX, playerY), camera's top-left should be playerX - (cameraViewWidth / 2)
        let targetCameraX = playerPos.x - cameraViewWidth / 2;
        let targetCameraY = playerPos.y - cameraViewHeight / 2;

        // Clamp camera position to map boundaries
        // Ensure the camera's top-left X is not less than 0
        // Ensure the camera's right edge (cameraX + cameraViewWidth) does not exceed mapWidth
        targetCameraX = Math.max(0, Math.min(mapWidth - cameraViewWidth, targetCameraX));
        targetCameraY = Math.max(0, Math.min(mapHeight - cameraViewHeight, targetCameraY));

        // The camera position (targetCameraX, targetCameraY) is the top-left corner
        // of the *visible area* of the map.
        // To achieve this in PixiJS, we need to move the *entire game world container*
        // by the negative of the camera's position.
        // So, if the camera is at (100, 50), the world container should be at (-100, -50).
        setCameraPos({ x: -targetCameraX, y: -targetCameraY });

    }, [playerPos, debugMode]); // Recalculate when player position or debug mode changes

    return cameraPos;
};
