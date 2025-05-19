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