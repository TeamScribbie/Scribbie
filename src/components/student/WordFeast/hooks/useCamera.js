import { useTick } from '@pixi/react';

/**
 * A simple linear interpolation function for smooth movement.
 * @param {number} start The starting value.
 * @param {number} end The target value.
 * @param {number} amount The interpolation amount (between 0 and 1).
 * @returns {number} The interpolated value.
 */
const lerp = (start, end, amount) => (1 - amount) * start + amount * end;

/**
 * A custom hook to manage the game's virtual camera.
 * It follows a target and keeps it within the world boundaries.
 * @param {React.RefObject<PIXI.Container>} worldContainerRef - A ref to the main world container that will be moved.
 * @param {object} target - The object to follow (must have a `position` {x, y} property).
 * @param {{width: number, height: number}} worldSize - The total dimensions of the game world.
 * @param {{width: number, height: number}} viewportSize - The dimensions of the visible screen area.
 */
export const useCamera = (worldContainerRef, target, worldSize, viewportSize) => {
    
    useTick(() => {
        // Ensure the container and target are available
        if (!target || !worldContainerRef.current) {
            return;
        }

        // Calculate the camera's desired top-left position to center the target
        let targetX = -target.position.x + viewportSize.width / 2;
        let targetY = -target.position.y + viewportSize.height / 2;

        // Clamp the camera's position to stay within the world boundaries
        // The camera's top-left (targetX) cannot be more than 0
        // The camera's top-left also cannot be so far that the right edge goes past the world width
        targetX = Math.min(0, Math.max(targetX, -(worldSize.width - viewportSize.width)));
        targetY = Math.min(0, Math.max(targetY, -(worldSize.height - viewportSize.height)));

        // Apply smoothing (lerp) for a fluid camera motion
        // The world moves to the target position, creating the camera effect
        worldContainerRef.current.x = lerp(worldContainerRef.current.x, targetX, 0.1);
        worldContainerRef.current.y = lerp(worldContainerRef.current.y, targetY, 0.1);
    });
};