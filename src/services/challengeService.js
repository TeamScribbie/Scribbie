// src/services/challengeService.js

const API_BASE_URL = 'http://localhost:8080/api'; // Ensure this matches your backend URL

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
 * Starts a new challenge attempt for the student.
 * @param {string|number} lessonDefinitionId - The ID of the lesson definition for the challenge.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the challenge progress object (includes config).
 */
export const startChallengeAttempt = async (lessonDefinitionId, token) => {
    if (!lessonDefinitionId || !token) {
        throw new Error('Lesson Definition ID and auth token are required to start a challenge.');
    }
    console.log(`challengeService: Starting challenge for lessonDefinitionId: ${lessonDefinitionId}`);
    const response = await fetch(`${API_BASE_URL}/challenges/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonDefinitionId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Start Challenge API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to start challenge. Status: ${response.status}`);
    }
    return response.json(); // Returns ChallengeProgressDto with config
};

/**
 * Submits the final results of a challenge attempt.
 * @param {object} submissionData - The data to submit.
 * @param {string|number} submissionData.challengeProgressId
 * @param {number} submissionData.totalScore
 * @param {number} submissionData.highestStreak
 * @param {number} submissionData.questionsAnswered
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the updated challenge progress object.
 */
export const submitChallengeAttempt = async (submissionData, token) => {
    if (!submissionData || !submissionData.challengeProgressId || !token) {
        throw new Error('Submission data (including challengeProgressId) and auth token are required.');
    }
    console.log(`challengeService: Submitting challenge attempt for progressId: ${submissionData.challengeProgressId}`);
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
        console.error(`Submit Challenge API Error (ProgressID ${submissionData.challengeProgressId}):`, errorData);
        throw new Error(errorData.message || `Failed to submit challenge attempt. Status: ${response.status}`);
    }
    return response.json();
};

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
        return null; // Or handle as an error if a config is always expected
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Get Challenge Config API Error (LessonDef ${lessonDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to get challenge configuration. Status: ${response.status}`);
    }
    return response.json();
};

/**
 * Deletes the challenge configuration for a lesson definition.
 * @param {string|number} lessonDefinitionId - The ID of the lesson definition.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the success message.
 */
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
    // For DELETE, backend might return 200 with message or 204 No Content.
    if (response.status === 204) {
        return { message: "Challenge configuration deleted successfully." };
    }
    return response.json();
};

/**
 * Adds a custom question to a specific challenge definition.
 * POST /api/challenge-definitions/{challengeDefinitionId}/questions
 * @param {string|number} challengeDefinitionId - The ID of the challenge definition.
 * @param {object} questionData - The question data (matching CreateQuestionRequestDto backend).
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the created ChallengeQuestion object (as QuestionDto).
 */
export const addCustomQuestionToChallenge = async (challengeDefinitionId, questionData, token) => {
    if (!challengeDefinitionId || !questionData || !token) {
        throw new Error('Challenge Definition ID, question data, and auth token are required.');
    }
    console.log(`challengeService: Adding custom question to challengeDefId: ${challengeDefinitionId}`, questionData);
    const response = await fetch(`${API_BASE_URL}/challenge-definitions/${challengeDefinitionId}/questions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData), // questionData should include choices array
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Add Custom Question API Error (ChallengeDef ${challengeDefinitionId}):`, errorData);
        throw new Error(errorData.message || `Failed to add custom question. Status: ${response.status}`);
    }
    return response.json(); // Expected: QuestionDto
};

/**
 * Fetches all custom questions for a specific challenge definition.
 * GET /api/challenge-definitions/{challengeDefinitionId}/questions
 * @param {string|number} challengeDefinitionId - The ID of the challenge definition.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of QuestionDto objects.
 */
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
    return response.json(); // Expected: List<QuestionDto>
};

/**
 * Updates an existing custom question for a challenge.
 * PUT /api/challenge-definitions/{challengeDefinitionId}/questions/{challengeQuestionId}
 * @param {string|number} challengeDefinitionId - The ID of the challenge definition.
 * @param {string|number} challengeQuestionId - The ID of the custom question to update.
 * @param {object} questionData - The updated question data (matching CreateQuestionRequestDto backend, including choices).
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the updated QuestionDto.
 */
export const updateCustomChallengeQuestion = async (challengeDefinitionId, challengeQuestionId, questionData, token) => {
    if (!challengeDefinitionId || !challengeQuestionId || !questionData || !token) {
        throw new Error('Challenge Definition ID, Question ID, question data, and auth token are required.');
    }
    console.log(`challengeService: Updating custom questionId ${challengeQuestionId} for challengeDefId ${challengeDefinitionId}`, questionData);
    const response = await fetch(`${API_BASE_URL}/challenge-definitions/${challengeDefinitionId}/questions/${challengeQuestionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData), // questionData should include choices array with choiceId for existing, and isDeleted flags
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        console.error(`Update Custom Question API Error (QID ${challengeQuestionId}):`, errorData);
        throw new Error(errorData.message || `Failed to update custom question. Status: ${response.status}`);
    }
    return response.json(); // Expected: QuestionDto
};

/**
 * Deletes a custom question from a challenge.
 * DELETE /api/challenge-definitions/{challengeDefinitionId}/questions/{challengeQuestionId}
 * @param {string|number} challengeDefinitionId - The ID of the challenge definition.
 * @param {string|number} challengeQuestionId - The ID of the custom question to delete.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the API response.
 */
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


// Choice management for CUSTOM CHALLENGE QUESTIONS
// These will be called by the adapted AddEditQuestionDialog when saving a custom challenge question

/**
 * Adds a choice to a specific custom challenge question.
 * POST /api/challenge-questions/{challengeQuestionId}/choices
 * @param {string|number} challengeQuestionId - The ID of the custom challenge question.
 * @param {object} choiceData - The choice data (e.g., { choiceText, isCorrect }).
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the created choice object (as ChoiceDto).
 */
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
    return response.json(); // Expected: ChoiceDto
};

/**
 * Updates an existing choice for a custom challenge question.
 * PUT /api/challenge-questions/{challengeQuestionId}/choices/{choiceId}
 * @param {string|number} challengeQuestionId - The ID of the parent custom challenge question.
 * @param {string|number} choiceId - The ID of the choice to update.
 * @param {object} choiceData - The updated choice data (e.g., { choiceText, isCorrect }).
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the updated choice object (as ChoiceDto).
 */
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
    return response.json(); // Expected: ChoiceDto
};

/**
 * Deletes a choice from a custom challenge question.
 * DELETE /api/challenge-questions/{challengeQuestionId}/choices/{choiceId}
 * @param {string|number} challengeQuestionId - The ID of the parent custom challenge question.
 * @param {string|number} choiceId - The ID of the choice to delete.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<object>} - A promise that resolves to the API response.
 */
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