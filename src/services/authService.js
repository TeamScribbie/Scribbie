// src/services/authService.js

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Logs in a student user.
 * @param {string} identifier - The student's ID number.
 * @param {string} password - The student's password.
 * @returns {Promise<object>} - A promise that resolves with the user data from the API.
 * @throws {Error} - Throws an error if the login fails.
 */
export const loginStudent = async (identifier, password) => {
  const response = await fetch(`${API_BASE_URL}/students/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Login API Error Response:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const userData = await response.json();
  return userData;
};

/**
 * Registers a new student user.
 * @param {string} studentId - The desired student ID.
 * @param {string} name - The student's full name.
 * @param {string} password - The student's password.
 * @returns {Promise<object>} - A promise that resolves with the response data from the API.
 * @throws {Error} - Throws an error if the registration fails.
 */
export const registerStudent = async (studentId, name, password) => {
  const response = await fetch(`${API_BASE_URL}/students/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Body matches the RegisterStudentRequest schema
    body: JSON.stringify({ studentId, name, password }),
  });

  if (!response.ok) {
     // Attempt to get more specific error from backend
     const errorData = await response.json().catch(() => ({}));
     console.error('Registration API Error Response:', errorData);
     // Provide a more specific error if available (e.g., ID already exists)
     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // If registration is successful, backend might return the created student or a success message
  const resultData = await response.json();
  return resultData;
};

/**
 * Logs in a teacher user.
 * @param {string} identifier - The teacher's ID number or email.
 * @param {string} password - The teacher's password.
 * @returns {Promise<object>} - A promise that resolves with the user data from the API.
 * @throws {Error} - Throws an error if the login fails.
 */
export const loginTeacher = async (identifier, password) => {
    const response = await fetch(`${API_BASE_URL}/teachers/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Body matches the LoginRequest schema
      body: JSON.stringify({ identifier, password }),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Teacher Login API Error Response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const userData = await response.json();
    return userData;
  };

  /**
 * Registers a new teacher user.
 * @param {object} teacherData - Object containing teacher details.
 * @param {string} teacherData.teacherId
 * @param {string} teacherData.name
 * @param {string} teacherData.email
 * @param {string} teacherData.password
 * @param {string} teacherData.businessCode
 * @returns {Promise<object>} - A promise that resolves with the response data from the API.
 * @throws {Error} - Throws an error if the registration fails.
 */
export const registerTeacher = async (teacherData) => {
    const response = await fetch(`${API_BASE_URL}/teachers/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Body matches the RegisterTeacherRequest schema
      body: JSON.stringify(teacherData), // Send the whole object
    });
  
    if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       console.error('Teacher Registration API Error Response:', errorData);
       throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const resultData = await response.json();
    return resultData;
  };
  


