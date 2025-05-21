// src/services/courseService.js
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Fetches a list of all available courses for assignment by a teacher/admin.
 * (Existing function - kept for completeness)
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of course objects.
 */
export const getAvailableCoursesForAssignment = async (token) => {
    if (!token) {
        throw new Error('Auth token is required to fetch available courses.');
    }
    console.log("courseService (frontend): Fetching available courses for assignment...");

    const response = await fetch(`${API_BASE_URL}/classrooms/available-courses`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
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

/**
 * Fetches all courses for an Admin/Superadmin view.
 * Assumes backend endpoint GET /api/courses/admin/all or similar.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of course objects.
 */
export const getAllCoursesForAdmin = async (token) => {
    if (!token) throw new Error('Auth token is required.');
    const response = await fetch(`${API_BASE_URL}/courses/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: `HTTP error ${response.status}`}));
        throw new Error(err.message);
    }
    return response.json();
};

/**
 * Creates a new course.
 * Assumes backend endpoint POST /api/courses.
 * @param {object} courseData - Object containing course details (e.g., { title, description }).
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves with the newly created course object.
 */
export const createCourse = async (courseData, token) => {
    if (!token) throw new Error('Auth token is required.');
    const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: `HTTP error ${response.status}`}));
        throw new Error(err.message);
    }
    return response.json();
};


// Placeholder for future functions like updateCourse and deleteCourse
// export const updateCourse = async (courseId, courseData, token) => { ... };
// export const deleteCourse = async (courseId, token) => { ... };

export const deleteCourse = async (courseId, token) => {
    if (!courseId || !token) {
        throw new Error('Course ID and auth token are required for deletion.');
    }
    console.log(`courseService (frontend): Deleting course with ID: ${courseId}`);

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            // No 'Content-Type' needed for a simple DELETE usually, unless backend requires it
        },
    });

    if (!response.ok) {
        // Try to parse error message if backend sends JSON, otherwise use status
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: `HTTP error! Status: ${response.status}` };
        }
        console.error(`Delete Course API Error (ID ${courseId}):`, errorData);
        throw new Error(errorData.message || `Failed to delete course. Status: ${response.status}`);
    }

    if (response.status === 204) {
        return; // Success, no content
    }
    // If backend sends a JSON message like { message: "Course deleted" }
    try {
        return await response.json();
    } catch (e) {
        return; // Success, but no parsable JSON body
    }
};

export const getCourseById = async (courseId, token) => {
    if (!courseId || !token) {
        throw new Error('Course ID and auth token are required.');
    }
    console.log(`courseService (frontend): Fetching course by ID: ${courseId}`);

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get Course By ID API Error (ID ${courseId}):`, errorData);
        throw new Error(errorData.message || `Failed to fetch course details. Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`courseService (frontend): Raw getCourseById response (ID ${courseId}):`, data);
    return data; // Expects CourseDetailDto from backend
};