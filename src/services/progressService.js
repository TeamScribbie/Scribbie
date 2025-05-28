// No import for axios needed

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Function to get the auth token
const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user')); // Adjust if your storage key is different
    return user?.token;
};

const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Helper function to handle fetch responses
const handleResponse = async (response) => {
    if (!response.ok) {
        // Try to parse error response from backend if available
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            // If response is not JSON, use the status text
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    // Check if response has content before trying to parse as JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return null; // Or response.text() if you expect text for some non-JSON responses
};

/**
 * Fetches the overall course progress for all students in a given classroom.
 */
export const getClassroomCourseProgressOverview = async (classroomId) => {
    try {
        const response = await fetch(`${API_URL}/classrooms/${classroomId}/course-progress-overview`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching classroom course progress overview:', error.message);
        // Re-throw the error so the component can catch it
        throw new Error(error.message || 'Failed to fetch classroom progress overview');
    }
};

/**
 * Fetches the detailed lesson-by-lesson progress for a specific student in a specific course.
 */
export const getStudentDetailedLessonProgress = async (studentId, courseId) => {
    try {
        const response = await fetch(`${API_URL}/students/${studentId}/courses/${courseId}/detailed-lesson-progress`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching student detailed lesson progress:', error.message);
        throw new Error(error.message || 'Failed to fetch student detailed progress');
    }
};