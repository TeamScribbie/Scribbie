// Import API_BASE_URL from your config file
import { API_BASE_URL } from '../config/apiConfig'; // Corrected import

// Function to get the auth token
const getAuthToken = () => {
    // MODIFIED: Check if localStorage is available
    if (typeof localStorage !== 'undefined') {
        // highlight-start
        // Retrieve the token directly from 'authToken' key
        const token = localStorage.getItem('authToken');
        return token;
        // highlight-end
    }
    return null;
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
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return null;
};

/**
 * Fetches the overall course progress for all students in a given classroom.
 */
export const getClassroomCourseProgressOverview = async (classroomId) => {
    try {
        // Use the imported API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/course-progress-overview`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching classroom course progress overview:', error.message);
        throw new Error(error.message || 'Failed to fetch classroom progress overview');
    }
};

/**
 * Fetches the detailed lesson-by-lesson progress for a specific student in a specific course.
 */
export const getStudentDetailedLessonProgress = async (studentId, courseId) => {
    try {
        // Use the imported API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/courses/${courseId}/detailed-lesson-progress`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching student detailed lesson progress:', error.message);
        throw new Error(error.message || 'Failed to fetch student detailed progress');
    }
};