import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams to get lessonId from URL for navigation
import { getActivityNodeDetails } from '../../services/activityService';
import { submitActivityProgress } from '../../services/lessonService'; // Assuming this service function will handle submission
import { AuthContext } from '../../context/AuthContext';
import './ActivityGameLogic.css'; // Optional: Create and import a CSS file for styling

const ActivityGameLogic = ({ activityNodeId, lessonProgressId }) => {
    const navigate = useNavigate();
    const { lessonId } = useParams(); // Get lessonId from the route for navigation back or to summary
    const { user } = useContext(AuthContext);

    const [activityDetails, setActivityDetails] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedChoiceId, setSelectedChoiceId] = useState(null);
    const [answers, setAnswers] = useState([]); // Stores { questionId, selectedChoiceId }
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        if (activityNodeId) {
            setIsLoading(true);
            setStartTime(Date.now()); // Record start time when activity loads
            setAnswers([]); // Reset answers for the new activity node
            setCurrentQuestionIndex(0); // Reset to first question
            setSelectedChoiceId(null); // Reset selected choice
            getActivityNodeDetails(activityNodeId)
                .then(response => {
                    setActivityDetails(response.data);
                    if (response.data && response.data.questions) {
                        // Initialize answers array based on fetched questions
                        setAnswers(response.data.questions.map(q => ({ questionId: q.questionId, selectedChoiceId: null })));
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch activity node details:", err);
                    setError("Failed to load questions. Please ensure you are logged in and try again.");
                    setIsLoading(false);
                });
        }
    }, [activityNodeId]); // Re-fetch if activityNodeId changes

    const handleChoiceSelect = (choiceId) => {
        setSelectedChoiceId(choiceId);
        // Update the answers state for the current question
        if (activityDetails && activityDetails.questions && activityDetails.questions[currentQuestionIndex]) {
            const currentQuestion = activityDetails.questions[currentQuestionIndex];
            const updatedAnswers = [...answers];
            const answerIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion.questionId);
            if (answerIndex !== -1) {
                updatedAnswers[answerIndex].selectedChoiceId = choiceId;
                setAnswers(updatedAnswers);
            } else { // Should not happen if initialized correctly
                updatedAnswers.push({ questionId: currentQuestion.questionId, selectedChoiceId: choiceId });
                setAnswers(updatedAnswers);
            }
        }
    };

    const handleNextQuestion = () => {
        // If it's an instructional question without choices, or if a choice is selected for non-instructional
        const currentQuestion = activityDetails.questions[currentQuestionIndex];
        const canProceed = currentQuestion.instructional || selectedChoiceId !== null;

        if (!canProceed) {
            alert("Please select an answer to proceed.");
            return;
        }

        setSelectedChoiceId(null); // Reset for the next question

        if (currentQuestionIndex < activityDetails.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // All questions answered, proceed to submit
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);

        // Prepare data for submission based on SubmitActivityProgressRequestDto
        // The backend expects 'score'. Frontend cannot reliably calculate score without knowing correct answers from ChoiceDto.
        // For now, we'll send score as 0, assuming backend calculates/validates score.
        // This needs to be addressed if frontend needs to send an accurate score.
        const answeredQuestionsDto = answers
            .filter(a => a.selectedChoiceId !== null) // Only send answers where a choice was made
            .map(a => ({
                questionId: a.questionId,
                selectedChoiceId: a.selectedChoiceId,
            }));

        const progressData = {
            lessonProgressId: lessonProgressId,
            activityNodeTypeId: activityNodeId,
            score: 0, // Placeholder: Backend should ideally calculate this.
            timeTakenSeconds: timeTakenSeconds,
            answeredQuestions: answeredQuestionsDto,
        };

        try {
            // Ensure submitActivityProgress is correctly defined in lessonService.js or activityService.js
            // and that it matches the expected backend DTO.
            // The DTO is SubmitActivityProgressRequestDto.java
            await submitActivityProgress(progressData); // This function needs to exist in your services
            navigate(`/lesson/${lessonId}/activity/${activityNodeId}/summary`, {
                state: {
                    lessonProgressId: lessonProgressId,
                    activityNodeId: activityNodeId,
                    // Potentially pass 'answers' or a result summary if needed by ActivitySummaryPage
                }
            });
        } catch (err) {
            console.error("Failed to submit activity progress:", err);
            setError("Failed to submit progress. Please try again.");
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loading-container"><p>Loading Activity...</p></div>;
    if (error) return <div className="error-container"><p style={{ color: 'red' }}>{error}</p></div>;
    if (!activityDetails || !activityDetails.questions || activityDetails.questions.length === 0) {
        return <div className="container"><p>No questions found for this activity. It might be an instructional segment without direct questions, or the activity is not yet configured.</p></div>;
    }

    const currentQuestion = activityDetails.questions[currentQuestionIndex];
    const isInstructionalWithNoChoices = currentQuestion.instructional && (!currentQuestion.choices || currentQuestion.choices.length === 0);

    return (
        <div className="activity-game-container">
            <h2>{activityDetails.activityType.replace('_', ' ')}</h2>
            {activityDetails.instructions && <p className="activity-instructions">{activityDetails.instructions}</p>}

            <div className="question-area">
                <h3>Question {currentQuestionIndex + 1} of {activityDetails.questions.length}</h3>
                <p className={`question-text ${currentQuestion.instructional ? 'instructional-text' : ''}`}>
                    {currentQuestion.instructional && !currentQuestion.questionText.toLowerCase().startsWith("instruction:") && <strong>Instruction: </strong>}
                    {currentQuestion.questionText}
                </p>
                {currentQuestion.questionImageUrl && (
                    <img src={currentQuestion.questionImageUrl} alt="Question content" className="question-image" />
                )}
                {/* Add audio player if currentQuestion.questionSoundUrl exists */}
            </div>

            {!isInstructionalWithNoChoices && (
                 <div className="choices-area">
                    {currentQuestion.choices.map(choice => (
                        <button
                            key={choice.choiceId}
                            onClick={() => handleChoiceSelect(choice.choiceId)}
                            className={`choice-button ${selectedChoiceId === choice.choiceId ? 'selected' : ''}`}
                        >
                            {choice.choiceText}
                        </button>
                    ))}
                </div>
            )}

            <div className="navigation-area">
                <button 
                    onClick={handleNextQuestion} 
                    disabled={isLoading || (!isInstructionalWithNoChoices && !selectedChoiceId && !currentQuestion.instructional && currentQuestion.choices && currentQuestion.choices.length > 0) }
                >
                    {currentQuestionIndex < activityDetails.questions.length - 1 ? 'Next Question' : 'Finish Activity'}
                </button>
            </div>
        </div>
    );
};

export default ActivityGameLogic;