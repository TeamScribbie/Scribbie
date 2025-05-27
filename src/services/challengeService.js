// AI Context/Frontend/services/challengeService.js

const API_BASE_URL = 'http://152.42.254.129:8080/api'; // Ensure this is defined correctly

/**
 * Fetches the questions for a specific challenge.
 * @param {string|number} lessonDefinitionId - The ID of the lesson definition.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of question objects.
 */
export const getChallengeQuestions = async (lessonDefinitionId, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required.');
    }
    console.log(`challengeService: Fetching questions for lessonDefinitionId: ${lessonDefinitionId}`);
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/challenge/questions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get Challenge Questions API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to fetch challenge questions. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Fetches the current student's challenge progress for a given lesson definition.
 * Assumes a backend endpoint like GET /api/lesson-definitions/{lessonDefinitionId}/challenge/my-progress
 * @param {string|number} lessonDefinitionId - The ID of the lesson definition.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object|null>} - A promise that resolves to the challenge progress object or null if no progress exists.
 */
export const getCurrentChallengeProgressByLessonDef = async (lessonDefinitionId, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required to fetch current challenge progress.');
    }
    console.log(`challengeService: Fetching current challenge progress for lessonDefinitionId: ${lessonDefinitionId}`);
    // This endpoint should be mapped in your ChallengeController to a service method
    // that retrieves the current student's ChallengeProgress for the given lesson's challenge.
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/challenge/my-progress`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 404) {
        console.log(`challengeService: No existing challenge progress found for lessonDefinitionId: ${lessonDefinitionId}`);
        return null; // Explicitly return null for "not found"
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get Current Challenge Progress API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to fetch current challenge progress. Status: ${response.status}`);
    }
    return response.json(); // Expects ChallengeProgressDto or similar
};


/**
 * Starts a new challenge attempt for the student. (COMMENTED OUT AS PER USER REQUEST)
 */
// export const startChallengeAttempt = async (lessonDefinitionId, token) => { ... };

/**
 * Submits the final results of a challenge attempt.
 * The backend will handle creating new progress or updating existing based on student and challenge definition.
 * @param {object} submissionData - The data to submit.
 * @param {string|number} submissionData.lessonDefinitionId - ID of the lesson definition for the challenge.
 * @param {number} submissionData.totalScore
 * @param {number} submissionData.highestStreak
 * @param {number} submissionData.questionsAnswered
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the updated/created challenge progress object.
 */
export const submitChallengeAttempt = async (submissionData, token) => {
    if (!submissionData || submissionData.lessonDefinitionId == null || submissionData.totalScore == null || !token) {
        throw new Error('Submission data (including lessonDefinitionId, totalScore) and auth token are required.');
    }
    // The DTO for this request on the backend (`SubmitChallengeAttemptRequestDto`)
    // should now expect `lessonDefinitionId` (or `challengeDefinitionId`)
    // instead of `challengeProgressId`.
    console.log(`challengeService: Submitting challenge attempt for lessonDefinitionId: ${submissionData.lessonDefinitionId}`);
    const response = await fetch(`${API_BASE_URL}/challenges/submit`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Submit Challenge API Error (LessonDef ${submissionData.lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to submit challenge attempt. Status: ${response.status}`);
    }
    return response.json();
};

// ... (getLeaderboardSnapshot, configureChallengeForLesson, getChallengeConfigurationForLesson, etc., remain the same for now)
// ... (CRUD for custom questions and choices also remain the same for now)

/**
 * Fetches the leaderboard snapshot for a challenge.
 * @param {string|number} lessonDefinitionId - The ID of the lesson definition.
 * @param {number} topN - The number of top entries to fetch.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of leaderboard entry objects.
 */
export const getLeaderboardSnapshot = async (lessonDefinitionId, topN = 5, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required.');
    }
    console.log(`challengeService: Fetching leaderboard snapshot for lessonDefId: ${lessonDefinitionId}, topN: ${topN}`);
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/challenge/leaderboard-snapshot?topN=${topN}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get Leaderboard Snapshot API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to fetch leaderboard snapshot. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Configures (creates or updates) the challenge settings for a lesson definition.
 * @param {string|number} lessonDefinitionId - The ID of the lesson definition.
 * @param {object} challengeData - The challenge configuration data.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the ChallengeDefinitionResponseDto.
 */
export const configureChallengeForLesson = async (lessonDefinitionId, challengeData, token) => {
    if (!lessonDefinitionId || !challengeData || !token) {
        throw new Error('Lesson Definition ID, challenge data, and auth token are required.');
    }
    console.log(`challengeService: Configuring challenge for lessonDefinitionId: ${lessonDefinitionId}`, challengeData);
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/challenge-definition`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(challengeData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Configure Challenge API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to configure challenge. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Gets the challenge configuration for a lesson definition.
 * @param {string|number} lessonDefinitionId - The ID of the lesson definition.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object|null>} - A promise that resolves to the ChallengeDefinitionResponseDto or null if not found.
 */
export const getChallengeConfigurationForLesson = async (lessonDefinitionId, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required.');
    }
    console.log(`challengeService: Getting challenge configuration for lessonDefinitionId: ${lessonDefinitionId}`);
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/challenge-definition`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (response.status === 404) {
        console.log(`challengeService: No challenge configuration found for lessonDefinitionId: ${lessonDefinitionId}`);
        return null;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get Challenge Config API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to get challenge configuration. Status: ${response.status}`);
    }
    return response.json();
};

export const deleteChallengeConfiguration = async (lessonDefinitionId, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required.');
    }
    console.log(`challengeService: Deleting challenge configuration for lessonDefinitionId: ${lessonDefinitionId}`);
    const response = await fetch(`${API_BASE_URL}/lesson-definitions/${lessonDefinitionId}/challenge-definition`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Delete Challenge Config API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to delete challenge configuration. Status: ${response.status}`);
    }
    if (response.status === 204) {
        return { message: "Challenge configuration deleted successfully." };
    }
    return response.json();
};

export const addCustomQuestionToChallenge = async (challengeDefinitionId, questionData, token) => {
    if (!challengeDefinitionId || !questionData || !token) {
        throw new Error('Challenge Definition ID, question data, and auth token are required.');
    }
    console.log(`challengeService: Adding custom question to challengeDefId: ${challengeDefinitionId}`, questionData);
    const response = await fetch(`${API_BASE_URL}/challenge-definitions/${challengeDefinitionId}/questions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Add Custom Question API Error (ChallengeDef ${challengeDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to add custom question. Status: ${response.status}`);
    }
    return response.json();
};

export const getCustomQuestionsForChallengeDefinition = async (challengeDefinitionId, token) => {
    if (!challengeDefinitionId || !token) {
        throw new Error('Challenge Definition ID and auth token are required.');
    }
    console.log(`challengeService: Fetching custom questions for challengeDefId: ${challengeDefinitionId}`);
    const response = await fetch(`${API_BASE_URL}/challenge-definitions/${challengeDefinitionId}/questions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get Custom Questions API Error (ChallengeDef ${challengeDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to fetch custom questions. Status: ${response.status}`);
    }
    return response.json();
};

export const updateCustomChallengeQuestion = async (challengeDefinitionId, challengeQuestionId, questionData, token) => {
    if (!challengeDefinitionId || !challengeQuestionId || !questionData || !token) {
        throw new Error('Challenge Definition ID, Question ID, question data, and auth token are required.');
    }
    console.log(`challengeService: Updating custom questionId ${challengeQuestionId} for challengeDefId ${challengeDefinitionId}`, questionData);
    const response = await fetch(`${API_BASE_URL}/challenge-definitions/${challengeDefinitionId}/questions/${challengeQuestionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Update Custom Question API Error (QID ${challengeQuestionId}):`, errorData);
        throw new Error(errorData.message || `Failed to update custom question. Status: ${response.status}`);
    }
    return response.json();
};

export const deleteCustomChallengeQuestion = async (challengeDefinitionId, challengeQuestionId, token) => {
    if (!challengeDefinitionId || !challengeQuestionId || !token) {
        throw new Error('Challenge Definition ID, Question ID, and auth token are required.');
    }
    console.log(`challengeService: Deleting custom questionId ${challengeQuestionId} from challengeDefId ${challengeDefinitionId}`);
    const response = await fetch(`${API_BASE_URL}/challenge-definitions/${challengeDefinitionId}/questions/${challengeQuestionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Delete Custom Question API Error (QID ${challengeQuestionId}):`, errorData);
        throw new Error(errorData.message || `Failed to delete custom question. Status: ${response.status}`);
    }
    if (response.status === 204) return { message: "Custom question deleted successfully." };
    return response.json();
};

export const addChoiceToChallengeQuestion = async (challengeQuestionId, choiceData, token) => {
    if (!challengeQuestionId || !choiceData || !token) {
        throw new Error('Challenge Question ID, choice data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/challenge-questions/${challengeQuestionId}/choices`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(choiceData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to add choice to challenge question. Status: ${response.status}`);
    }
    return response.json();
};

export const updateChallengeChoice = async (challengeQuestionId, choiceId, choiceData, token) => {
    if (!challengeQuestionId || !choiceId || !choiceData || !token) {
        throw new Error('Challenge Question ID, Choice ID, choice data, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/challenge-questions/${challengeQuestionId}/choices/${choiceId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(choiceData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to update challenge choice. Status: ${response.status}`);
    }
    return response.json();
};

export const deleteChallengeChoice = async (challengeQuestionId, choiceId, token) => {
    if (!challengeQuestionId || !choiceId || !token) {
        throw new Error('Challenge Question ID, Choice ID, and auth token are required.');
    }
    const response = await fetch(`${API_BASE_URL}/challenge-questions/${challengeQuestionId}/choices/${choiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to delete challenge choice. Status: ${response.status}`);
    }
    if (response.status === 204) return { message: "Challenge choice deleted successfully." };
    return response.json();
};