import { API_BASE_URL } from '../config/apiConfig';

export const evaluateAnswer = async (userAnswer, question, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userAnswer,
                question: question.questionText,
                expectedAnswer: question.correctAnswer,
                context: question.context || '', // Additional context if needed
                criteria: question.criteria || [], // Specific evaluation criteria if needed
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to evaluate answer');
        }

        const result = await response.json();
        return {
            isCorrect: result.isCorrect,
            feedback: result.feedback,
            confidence: result.confidence, // AI's confidence in its evaluation
            details: result.details // Additional evaluation details if needed
        };
    } catch (error) {
        console.error('Error in AI evaluation:', error);
        throw error;
    }
};
