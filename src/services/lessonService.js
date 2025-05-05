// src/services/lessonService.js

// Assuming API_BASE_URL is defined globally or imported
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Fetches lesson definitions for a given course.
 * @param {number|string} courseId - The ID of the course.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of lesson definition summary objects.
 * @throws {Error} - Throws an error if the fetch fails.
 */
// highlight-start
export const getLessonDefinitions = async (courseId, token) => { // Added export
// highlight-end
  if (!courseId || !token) {
    throw new Error('Course ID and auth token are required to fetch lesson definitions.');
  }
  console.log(`lessonService: Fetching definitions for courseId: ${courseId}`);

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lesson-definitions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
    console.error(`Get Lesson Definitions API Error (Course ${courseId}):`, errorData);
    throw new Error(errorData.message || `Failed to fetch lesson definitions. Status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`lessonService: Raw getLessonDefinitions response (Course ${courseId}):`, data);
  return Array.isArray(data) ? data : [];
};

/**
 * Fetches activity node types for a specific lesson definition.
 * @param {number|string} lessonDefinitionId - The ID of the lesson definition.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of activity node type summary objects.
 * @throws {Error} - Throws an error if the fetch fails.
 */
// highlight-start
export const getActivityNodeTypesForLesson = async (lessonDefinitionId, token) => { // Added export
// highlight-end
  if (!lessonDefinitionId || !token) {
    throw new Error('Lesson Definition ID and auth token are required to fetch activity nodes.');
  }
  console.log(`lessonService: Fetching activity node types for lessonDefinitionId: ${lessonDefinitionId}`);

  const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/activity-node-types`, {
     method: 'GET',
     headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
     },
  });

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
     console.error(`Get Activity Node Types API Error (LessonDef ${lessonDefinitionId}):`, errorData);
     throw new Error(errorData.message || `Failed to fetch activity node types. Status: ${response.status}`);
  }
  const data = await response.json();
   console.log(`lessonService: Raw getActivityNodeTypesForLesson response (LessonDef ${lessonDefinitionId}):`, data);
  return Array.isArray(data) ? data : [];
};


/**
 * Fetches a student's progress for a specific lesson definition.
 * @param {string} studentId - The ID of the student.
 * @param {number|string} lessonDefinitionId - The ID of the lesson definition.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object|null>} - A promise that resolves with the LessonProgress object or null if no progress found (404).
 * @throws {Error} - Throws an error if the fetch fails for reasons other than 404.
 */
// highlight-start
export const getStudentLessonProgress = async (studentId, lessonDefinitionId, token) => { // Added export
// highlight-end
  if (!studentId || !lessonDefinitionId || !token) {
      throw new Error('Student ID, Lesson Definition ID, and auth token are required to fetch progress.');
  }
   console.log(`lessonService: Fetching progress for student ${studentId} on lessonDefinitionId: ${lessonDefinitionId}`);

  const response = await fetch(`${API_BASE_URL}/students/${studentId}/lesson-progress/definition/${lessonDefinitionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
  });

   // Handle 404 (Not Found) as "progress not started" -> return null
   if (response.status === 404) {
       console.log(`lessonService: No existing progress found (404) for student ${studentId} on lesson ${lessonDefinitionId}.`);
       return null;
   }

  // Handle other errors
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
      console.error(`Get Student Lesson Progress API Error (Student ${studentId}, LessonDef ${lessonDefinitionId}):`, errorData);
     throw new Error(errorData.message || `Failed to fetch lesson progress. Status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`lessonService: Raw getStudentLessonProgress response (Student ${studentId}, LessonDef ${lessonDefinitionId}):`, data);
  return data; // Returns LessonProgress DTO/entity object
};


/**
 * Starts lesson progress for a student on a specific lesson definition.
 * Corresponds to POST /api/lesson-progress/start
 * @param {number|string} lessonDefinitionId - The ID of the lesson definition to start.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves with the LessonProgress object (new or existing).
 * @throws {Error} - Throws an error if the request fails.
 */
// highlight-start
export const startLessonProgress = async (lessonDefinitionId, token) => { // Added export
// highlight-end
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required to start progress.');
    }
    console.log(`lessonService: Starting/getting progress for lessonDefinitionId: ${lessonDefinitionId}`);

    const response = await fetch(`${API_BASE_URL}/lesson-progress/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonDefinitionId }), // Matches StartLessonRequestDto
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Start Lesson Progress API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to start lesson progress. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`lessonService: Raw startLessonProgress response (LessonDef ${lessonDefinitionId}):`, data);
    return data; // Returns the LessonProgress DTO/entity
};

export const submitActivityProgress = async (progressData, token) => { // Added export
  // highlight-end
      if (!progressData || !token) {
          throw new Error('Progress data and auth token are required to submit progress.');
      }
      // Basic validation of required fields in progressData
      if (progressData.lessonProgressId == null || progressData.activityNodeTypeId == null || progressData.isFinished == null) {
          throw new Error('Missing required fields in progress data (lessonProgressId, activityNodeTypeId, isFinished).');
      }
      console.log(`lessonService: Submitting activity progress for node type ${progressData.activityNodeTypeId} in lesson progress ${progressData.lessonProgressId}`);
  
      const response = await fetch(`${API_BASE_URL}/activity-node-progress/submit`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(progressData), // Send the whole DTO object
      });
  
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
          console.error(`Submit Activity Progress API Error (Node ${progressData.activityNodeTypeId}):`, errorData);
          throw new Error(errorData.message || `Failed to submit activity progress. Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(`lessonService: Raw submitActivityProgress response (Node ${progressData.activityNodeTypeId}):`, data);
      return data; // Returns the updated ActivityNodeProgress DTO/entity
  };

// --- Placeholder for other functions ---
// submitActivityProgress, etc.

// Make sure getClassroomDetails is also exported if it's in this file
// export const getClassroomDetails = async (...) => { ... }; // Example