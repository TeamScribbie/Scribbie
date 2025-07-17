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