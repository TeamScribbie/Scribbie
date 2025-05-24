// AI Context/Frontend/services/lessonService.js

const API_BASE_URL = 'http://localhost:8080/api';

// ... (getLessonDefinitions, getActivityNodeTypesForLesson, createLessonDefinition, createActivityNodeTypeForLesson remain THE SAME)
// ... (getStudentLessonProgress, startLessonProgress, submitActivityProgress remain THE SAME)

// --- Question Management (Now interacts with ActivityController's nested paths) ---

/**
 * Creates a new question for a specific Activity Node Type.
 * POST /api/activity-node-types/{activityNodeTypeId}/questions
 */
export const createQuestionForActivityNode = async (activityNodeTypeId, questionData, token) => {
    if (!activityNodeTypeId || !questionData || !token) {
        throw new Error('ActivityNodeType ID, question data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to create question. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Fetches all questions for a specific Activity Node Type.
 * GET /api/activity-node-types/{activityNodeTypeId}/questions
 */
export const getQuestionsForActivityNode = async (activityNodeTypeId, token) => {
    if (!activityNodeTypeId || !token) {
        throw new Error('ActivityNodeType ID and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch questions. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Updates an existing question.
 * PUT /api/activity-node-types/{activityNodeTypeId}/questions/{questionId}
 * Note: activityNodeTypeId in the path is for context/consistency, actual update targets questionId.
 */
export const updateQuestion = async (activityNodeTypeId, questionId, questionData, token) => {
    if (!activityNodeTypeId || !questionId || !questionData || !token) {
        throw new Error('ActivityNodeType ID, Question ID, question data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to update question. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Deletes a question.
 * DELETE /api/activity-node-types/{activityNodeTypeId}/questions/{questionId}
 */
export const deleteQuestion = async (activityNodeTypeId, questionId, token) => {
    if (!activityNodeTypeId || !questionId || !token) {
        throw new Error('ActivityNodeType ID, Question ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete question. Status: ${response.status}`);
    }
    if (response.status === 204) return { message: "Question deleted successfully" };
    return response.json();
};

// --- Choice Management (Now interacts with ActivityController's nested paths) ---

/**
 * Fetches choices for a specific question.
 * GET /api/activity-node-types/{activityNodeTypeId}/questions/{questionId}/choices
 */
export const getChoicesForQuestion = async (activityNodeTypeId, questionId, token) => {
    if (!activityNodeTypeId || !questionId || !token) {
        throw new Error('ActivityNodeType ID, Question ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}/choices`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch choices. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Creates a choice for a specific question.
 * POST /api/activity-node-types/{activityNodeTypeId}/questions/{questionId}/choices
 */
export const createChoiceForQuestion = async (activityNodeTypeId, questionId, choiceData, token) => {
    if (!activityNodeTypeId || !questionId || !choiceData || !token) {
        throw new Error('ActivityNodeType ID, Question ID, choice data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}/choices`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(choiceData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to create choice. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Updates an existing choice.
 * PUT /api/activity-node-types/{activityNodeTypeId}/questions/{questionId}/choices/{choiceId}
 */
export const updateChoice = async (activityNodeTypeId, questionId, choiceId, choiceData, token) => {
    if (!activityNodeTypeId || !questionId || !choiceId || !choiceData || !token) {
        throw new Error('ActivityNodeType ID, Question ID, Choice ID, choice data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}/choices/${choiceId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(choiceData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to update choice. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Deletes a choice.
 * DELETE /api/activity-node-types/{activityNodeTypeId}/questions/{questionId}/choices/{choiceId}
 */
export const deleteChoice = async (activityNodeTypeId, questionId, choiceId, token) => {
    if (!activityNodeTypeId || !questionId || !choiceId || !token) {
        throw new Error('ActivityNodeType ID, Question ID, Choice ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${questionId}/choices/${choiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete choice. Status: ${response.status}`);
    }
    if (response.status === 204) return { message: "Choice deleted successfully" };
    return response.json();
};

// ... (other lesson service functions like those related to student progress can remain)
export const getLessonDefinitions = async (courseId, token) => {
  if (!courseId || !token) {
    throw new Error('Course ID and auth token are required to fetch lesson definitions.');
  }
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lesson-definitions`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
    throw new Error(errorData.message || `Failed to fetch lesson definitions. Status: ${response.status}`);
  }
  return response.json();
};

export const getActivityNodeTypesForLesson = async (lessonDefinitionId, token) => {
  if (!lessonDefinitionId || !token) {
    throw new Error('Lesson Definition ID and auth token are required.');
  }
  const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/activity-node-types`, {
     method: 'GET',
     headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
     throw new Error(errorData.message || `Failed to fetch activity node types. Status: ${response.status}`);
  }
  return response.json();
};

export const createLessonDefinition = async (courseId, lessonData, token) => {
    if (!courseId || !lessonData || !token) {
        throw new Error('Course ID, lesson data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to create lesson. Status: ${response.status}`);
    }
    return response.json();
};

export const createActivityNodeTypeForLesson = async (lessonDefinitionId, activityNodeData, token) => {
    if (!lessonDefinitionId || !activityNodeData || !token) {
        throw new Error('Lesson Definition ID, activity node data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/activity-node-types`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(activityNodeData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to create activity node type. Status: ${response.status}`);
    }
    return response.json();
};

export const getStudentLessonProgress = async (studentId, lessonDefinitionId, token) => {
  if (!studentId || !lessonDefinitionId || !token) {
      throw new Error('Student ID, Lesson Definition ID, and auth token are required.');
  }
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/lesson-progress/definition/${lessonDefinitionId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
   if (response.status === 404) return null;
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
     throw new Error(errorData.message || `Failed to fetch lesson progress. Status: ${response.status}`);
  }
  return response.json();
};

export const startLessonProgress = async (lessonDefinitionId, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/lesson-progress/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonDefinitionId }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to start lesson progress. Status: ${response.status}`);
    }
    return response.json();
};

export const submitActivityProgress = async (progressData, token) => {
      if (!progressData || !token) {
          throw new Error('Progress data and auth token are required.');
      }
      const response = await fetch(`${API_BASE_URL}/activity-node-progress/submit`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData),
      });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
          throw new Error(errorData.message || `Failed to submit activity progress. Status: ${response.status}`);
      }
      return response.json();
  };

/**
 * ✨ ADD THIS FUNCTION TO UPDATE A LESSON ✨
 * Updates an existing lesson definition.
 * @param {string|number} courseId - The ID of the course the lesson belongs to.
 * @param {string|number} lessonId - The ID of the lesson to update.
 * @param {object} lessonData - The data to update (e.g., { lessonTitle, lessonDescription }).
 * @param {string} token - The JWT auth token.
 * @returns {Promise<object>} - The updated lesson object.
 */
export const updateLessonDefinition = async (courseId, lessonId, lessonData, token) => {
    if (!courseId || !lessonId || !token) {
        throw new Error('Course ID, Lesson ID, and auth token are required.');
    }

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Update Lesson API Error (ID ${lessonId}):`, errorData);
        throw new Error(errorData.message || 'Failed to update lesson.');
    }

    return response.json();
};

/**
 * ✨ ADD THIS FUNCTION TO DELETE A LESSON ✨
 * Deletes a lesson definition.
 * @param {string|number} courseId - The ID of the course.
 * @param {string|number} lessonId - The ID of the lesson to delete.
 * @param {string} token - The JWT auth token.
 * @returns {Promise<object>} - A promise that resolves with the success message.
 */
export const deleteLessonDefinition = async (courseId, lessonId, token) => {
    if (!courseId || !lessonId || !token) {
        throw new Error('Course ID, Lesson ID, and auth token are required for deletion.');
    }

    const response = await fetch(`http://localhost:8080/api/courses/${courseId}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || 'Failed to delete lesson.');
    }

    return response.json();
};

/**
 * ✨ ADD THIS FUNCTION TO DELETE AN ACTIVITY NODE ✨
 * Deletes an activity node type.
 * @param {string|number} activityNodeTypeId - The ID of the activity node to delete.
 * @param {string} token - The JWT auth token.
 * @returns {Promise<object>} - A promise that resolves with the success message.
 */
export const deleteActivityNode = async (activityNodeTypeId, token) => {
    if (!activityNodeTypeId || !token) {
        throw new Error('Activity Node ID and auth token are required for deletion.');
    }

    const response = await fetch(`http://localhost:8080/api/activity-node-types/${activityNodeTypeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || 'Failed to delete activity node.');
    }

    return response.json();
};


