// src/services/classroomService.js

// Reuse the base URL potentially from another config file or define it here
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Fetches the classrooms handled by a specific teacher.
 * @param {string} teacherId - The ID of the teacher.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of classroom objects.
 * @throws {Error} - Throws an error if the fetch fails.
 */
export const getTeacherClassrooms = async (teacherId, token) => {
  if (!teacherId || !token) {
    throw new Error('Teacher ID and auth token are required.');
  }

  const response = await fetch(`${API_BASE_URL}/classrooms/teacher/${teacherId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Standard JWT header
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    console.error('Get Teacher Classrooms API Error:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Assuming the response directly returns the array of classrooms
  // Adjust '.classrooms' if the API wraps the array in an object property
  const data = await response.json();
  // Log the raw response to check its structure
  console.log("Raw getTeacherClassrooms response:", data);
  // If the API returns { "classrooms": [...] }, use `return data.classrooms || [];`
  // If the API returns [...], use `return data || [];`
  // Based on the OpenAPI spec returning 'object', it likely wraps the array.
  // Let's assume it returns an object with a key like 'classrooms' or similar.
  // **ADJUST THIS based on actual API response structure:**
  return data || []; // Safely return data or an empty array
};

/**
 * Creates a new classroom.
 * @param {object} classroomData - Data for the new classroom.
 * @param {string} classroomData.classroomName - The name of the classroom.
 * @param {string} classroomData.classroomCode - The code for the classroom.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves with the newly created classroom object.
 * @throws {Error} - Throws an error if the creation fails.
 */
export const createClassroom = async (classroomData, token) => {
   if (!token) {
    throw new Error('Auth token is required.');
  }
   // Validate required fields based on OpenAPI spec (minLength etc. can be added)
   if (!classroomData.classroomName || !classroomData.classroomCode) {
       throw new Error('Classroom Name and Code are required.');
   }

  const response = await fetch(`${API_BASE_URL}/classrooms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    // Body matches CreateClassroomRequest schema
    body: JSON.stringify({
        classroomName: classroomData.classroomName,
        classroomCode: classroomData.classroomCode,
        // Add teacherId if required by backend implicitly or explicitly
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    console.error('Create Classroom API Error:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json(); // Return the created classroom details
};