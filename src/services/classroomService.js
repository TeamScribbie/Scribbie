// src/services/classroomService.js

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
  // ... (rest of the function remains the same) ...
  const response = await fetch(`${API_BASE_URL}/classrooms/teacher/${teacherId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    console.error('Get Teacher Classrooms API Error:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log("Raw getTeacherClassrooms response:", data);
  return data || [];
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
  // It's good practice to check for classroomName here as well,
  // though the backend @NotBlank will catch it.
  if (!classroomData || !classroomData.classroomName) { // Added a check for classroomData itself
      // Log the problematic classroomData
      console.error("classroomService.js: [ERROR] classroomData or classroomData.classroomName is missing.", classroomData);
      throw new Error('Classroom Name is required.');
  }

  // +++ LOGGING POINT A: What data did this service function receive? +++
  console.log("classroomService.js: [RECEIVED] Data passed to createClassroom:", JSON.stringify(classroomData, null, 2));

  const payloadObject = {
      classroomName: classroomData.classroomName,
      classroomCode: classroomData.classroomCode,
      assignedCourseId: classroomData.assignedCourseId
  };

  // +++ LOGGING POINT B: What object is ACTUALLY being stringified? +++
  console.log("classroomService.js: [STRINGIFYING] Object being sent to backend:", JSON.stringify(payloadObject, null, 2));

  const response = await fetch(`${API_BASE_URL}/classrooms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadObject), // Use the explicitly constructed object
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    console.error('classroomService.js: [API ERROR] Create Classroom API Error:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  console.log("classroomService.js: [API SUCCESS] Create Classroom API Success:", responseData);
  return responseData;
};
/**
 * Fetches the classrooms a specific student is enrolled in or pending for.
 * @param {string} studentId - The ID of the student.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of classroom status objects.
 * @throws {Error} - Throws an error if the fetch fails.
 */
export const getStudentClassrooms = async (studentId, token) => {
  if (!studentId || !token) {
    throw new Error('Student ID and auth token are required.');
  }
  // ... (rest of the function remains the same) ...
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
  return Array.isArray(data) ? data : [];
};

/**
 * Submits a request for a student to join a classroom using its code.
 * @param {string} classroomCode - The code of the classroom to join.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves with the API response (e.g., success message).
 * @throws {Error} - Throws an error if the request fails.
 */
export const joinClassroom = async (classroomCode, token) => {
  if (!classroomCode || !token) {
    throw new Error('Classroom code and auth token are required.');
  }
  // ... (rest of the function remains the same) ...
  const response = await fetch(`${API_BASE_URL}/classrooms/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ classroomCode }),
  });

   if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    console.error('Join Classroom API Error:', errorData);
    throw new Error(errorData.message || `Failed to join classroom. Status: ${response.status}`);
  }
  return await response.json();
};

/**
 * Fetches pending enrollment requests for a specific classroom.
 * @param {number|string} classroomId - The ID of the classroom.
 * @param {string} token - The JWT authentication token (teacher).
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of pending request objects.
 * @throws {Error} - Throws an error if the fetch fails.
 */
export const getPendingRequests = async (classroomId, token) => {
  if (!classroomId || !token) {
    throw new Error('Classroom ID and auth token are required.');
  }
  // ... (rest of the function remains the same) ...
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
    throw new Error(errorData.message || `HTTP error fetching pending requests! Status: ${response.status}`);
  }
  const data = await response.json();
  console.log(`Raw getPendingRequests response (Class ${classroomId}):`, data);
  return Array.isArray(data) ? data : [];
};

/**
 * Updates the enrollment status (Approve/Reject) for a student in a classroom.
 * @param {number|string} classroomId - The ID of the classroom.
 * @param {string} studentId - The ID of the student.
 * @param {'APPROVED' | 'REJECTED'} status - The new status.
 * @param {string} token - The JWT authentication token (teacher).
 * @returns {Promise<object>} - A promise that resolves with the API response (e.g., success message).
 * @throws {Error} - Throws an error if the update fails.
 */

export const updateEnrollmentStatus = async (classroomId, studentId, status, token) => {
  if (!classroomId || !studentId || !status || !token) {
    throw new Error('Classroom ID, Student ID, status, and auth token are required.');
  }
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    throw new Error('Invalid status provided. Must be APPROVED or REJECTED.');
  }

  // Correct endpoint URL
  const endpointUrl = `${API_BASE_URL}/classrooms/${classroomId}/students/${studentId}/status`; //

  const response = await fetch(endpointUrl, {
    method: 'PUT', 
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({ status: status }), //
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
    console.error(`Update Enrollment Status API Error (Class ${classroomId}, Student ${studentId}):`, errorData);
    throw new Error(errorData.message || `Failed to update status. Status: ${response.status}`);
  }
  return await response.json();
};

export const getClassroomDetails = async (classroomId, token) => { // Added export
// highlight-end
  if (!classroomId || !token) {
    throw new Error('Classroom ID and auth token are required to fetch details.');
  }
  console.log(`classroomService: Fetching details for classroomId: ${classroomId}`);

  const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/details`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
    console.error(`Get Classroom Details API Error (Classroom ${classroomId}):`, errorData);
    throw new Error(errorData.message || `Failed to fetch classroom details. Status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`classroomService: Raw getClassroomDetails response (Classroom ${classroomId}):`, data);
  // WARNING check remains as backend needs update
  if (!data.assignedCourseId) {
      console.warn(`classroomService: Response for classroom ${classroomId} details is MISSING 'assignedCourseId'. Lesson fetching will likely fail.`);
  }
  return data;
};