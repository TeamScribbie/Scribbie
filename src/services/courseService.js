// src/services/courseService.js
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Fetches a list of all available courses for assignment.
 * Calls the new endpoint in ClassroomController.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of course objects (e.g., { courseId, title, description }).
 * @throws {Error} - Throws an error if the fetch fails.
 */
export const getAvailableCoursesForAssignment = async (token) => {
    if (!token) {
        throw new Error('Auth token is required to fetch available courses.');
    }
    console.log("courseService (frontend): Fetching available courses for assignment...");

    // Make sure this endpoint matches what you defined in ClassroomController.java
    const response = await fetch(`${API_BASE_URL}/classrooms/available-courses`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        // Handle cases where response might not be JSON (e.g. network error)
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: `HTTP error! Status: ${response.status}. Response not JSON.` };
        }
        console.error('Get Available Courses API Error:', errorData);
        throw new Error(errorData.message || `Failed to fetch available courses. Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("courseService (frontend): Raw getAvailableCoursesForAssignment response:", data);
    return Array.isArray(data) ? data : [];
};
