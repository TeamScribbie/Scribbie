const API_BASE_URL = 'http://localhost:8080/api'; // Or your actual API base URL

/**
 * Fetches a list of all available courses.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of course objects (e.g., { courseId, title }).
 * @throws {Error} - Throws an error if the fetch fails.
 */
export const getAllCourses = async (token) => {
    if (!token) {
        throw new Error('Auth token is required to fetch courses.');
    }
    console.log("courseService: Fetching all courses...");

    const response = await fetch(`${API_BASE_URL}/courses`, { // Assuming this endpoint will exist
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error('Get All Courses API Error:', errorData);
        throw new Error(errorData.message || `Failed to fetch courses. Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("courseService: Raw getAllCourses response:", data);
    return Array.isArray(data) ? data : []; // Ensure it returns an array
};