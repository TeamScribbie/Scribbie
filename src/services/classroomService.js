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

export const getStudentClassrooms = async (studentId, token) => {
  if (!studentId || !token) {
    throw new Error('Student ID and auth token are required.');
  }

  const response = await fetch(`${API_BASE_URL}/classrooms/student/${studentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    console.error('Get Student Classrooms API Error:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("Raw getStudentClassrooms response:", data);
  // **IMPORTANT**: Adjust based on actual API response structure.
  // The Swagger spec returns 'object'. Assuming it wraps the array, e.g., { "enrollments": [...] } or similar.
  // Or it might return the ClassroomStudent array directly if the spec is loose.
  // Let's assume it returns an array directly for now, adjust if needed.
  return Array.isArray(data) ? data : [];
};


export const joinClassroom = async (classroomCode, token) => {
  if (!classroomCode || !token) {
    throw new Error('Classroom code and auth token are required.');
  }

  const response = await fetch(`${API_BASE_URL}/classrooms/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    // Body matches JoinClassroomRequest schema
    body: JSON.stringify({ classroomCode }),
  });

   if (!response.ok) {
    // Handle specific errors like "already enrolled", "class full", "invalid code" if the backend provides them
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    console.error('Join Classroom API Error:', errorData);
    throw new Error(errorData.message || `Failed to join classroom. Status: ${response.status}`);
  }

  // Return success response (might be empty or contain enrollment details)
  return await response.json();
};

export const getPendingRequests = async (classroomId, token) => {
  if (!classroomId || !token) {
    throw new Error('Classroom ID and auth token are required.');
  }

  const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    console.error(`Get Pending Requests API Error (Class ${classroomId}):`, errorData);
    // Return empty array on error for this specific class to allow others to load? Or throw?
    // Throwing might be better to indicate overall failure.
    throw new Error(errorData.message || `HTTP error fetching pending requests! Status: ${response.status}`);
  }
  const data = await response.json();
  console.log(`Raw getPendingRequests response (Class ${classroomId}):`, data);
  // Assuming backend returns the array directly as per controller mapping
  return Array.isArray(data) ? data : [];
};

export const updateEnrollmentStatus = async (classroomId, studentId, status, token) => {
  if (!classroomId || !studentId || !status || !token) {
   throw new Error('Classroom ID, Student ID, status, and auth token are required.');
 }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
      throw new Error('Invalid status provided. Must be APPROVED or REJECTED.');
  }

 const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/students/${studentId}/status`, {
   method: 'PUT',
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
   },
   // Body matches UpdateEnrollmentStatusRequest schema
   body: JSON.stringify({ status }), // Send { "status": "APPROVED" } or { "status": "REJECTED" }
 });

 if (!response.ok) {
   const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
   console.error(`Update Enrollment Status API Error (Class ${classroomId}, Student ${studentId}):`, errorData);
   throw new Error(errorData.message || `Failed to update status. Status: ${response.status}`);
 }
 return await response.json(); // Return success message response
};