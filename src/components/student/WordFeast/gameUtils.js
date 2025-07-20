export const sizeHierarchy = { small: 1, medium: 2, large: 3 };

/**
 * Determines if the eater can eat the eaten based on their sizes.
 * A fish can eat another fish of its same size or smaller.
 * @param {string} eaterSize - The size of the eater ('small', 'medium', 'large').
 * @param {string} eatenSize - The size of the one being eaten.
 * @returns {boolean}
 */
export const canEat = (eaterSize, eatenSize) => {
    return sizeHierarchy[eaterSize] >= sizeHierarchy[eatenSize];
};

/**
 * Calculates the distance between two points.
 * @param {{x: number, y: number}} p1 - The first point.
 * @param {{x: number, y: number}} p2 - The second point.
 * @returns {number}
 */
export const calculateDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

/**
 * --- NEW: Determines if the player can break a cage. ---
 * @param {string} playerSize - The size of the player ('small', 'medium', 'large').
 * @param {number} cageStrength - The level of the cage (1, 2, or 3).
 * @returns {boolean}
 */
export const canBreakCage = (playerSize, cageStrength) => {
    const playerStrength = sizeHierarchy[playerSize] || 0;
    return playerStrength >= cageStrength;
};