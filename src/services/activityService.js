// src/services/activityService.js
const API_BASE_URL = 'http://localhost:8080/api'; // Make sure this is correct

/**
 * Fetches detailed data for a specific Activity Node Type.
 * Corresponds to GET /api/activity-node-types/{activityNodeTypeId}
 * @param {number|string} activityNodeTypeId - The ID of the activity node type.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves with the activity node type details (including questions/choices).
 * @throws {Error} - Throws an error if the fetch fails.
 */
export const getActivityNodeTypeDetails = async (activityNodeTypeId, token) => {
    if (!activityNodeTypeId || !token) {
        throw new Error('Activity Node Type ID and auth token are required.');
    }
    console.log(`activityService: Fetching details for ActivityNodeType ID: ${activityNodeTypeId}`);

    const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/activity\-node\-types/</span>{activityNodeTypeId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get Activity Details API Error (ID ${activityNodeTypeId}):`, errorData);
        // Modify error message based on backend response structure if possible
         if (response.status === 404) {
              throw new Error(`Activity not found (ID: ${activityNodeTypeId}).`);
         }
        throw new Error(errorData.message || `Failed to fetch activity details. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`activityService: Raw getActivityNodeTypeDetails response (ID ${activityNodeTypeId}):`, data);

    // --- IMPORTANT: Add Backend Check for isCorrect ---
    // The ActivityGameLogic expects `isCorrect` on choices.
    // Ensure your backend's ChoiceDto includes this, or handle it here.
    // If backend DTO excludes it, you cannot run the game logic correctly.
    // Assuming backend's `QuestionDto` and `ChoiceDto` are structured correctly.
    if (data.questions && data.questions.length > 0 && data.questions[0].choices && data.questions[0].choices[0].isCorrect === undefined) {
         console.warn("Backend ChoiceDto might be missing the 'isCorrect' field needed for gameplay!");
         // You might throw an error here or try to proceed cautiously.
         // throw new Error("Backend response is missing required 'isCorrect' field on choices.");
    }
    // --- End Check ---


    return data; // Returns ActivityNodeTypeDetailDto structure
};

