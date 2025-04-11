// src/components/Games/GameComponent.jsx
import React from 'react';
import { useGameLogic } from './GameLogic'; // Hook from the same folder
import './GameComponent.css'; // Import the CSS (renamed and moved)

// GameComponent now receives lessonId as a prop
function GameComponent({ lessonId }) {
    const {
        gameState,
        isLoading,
        error,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        selectedAnswer,
        isCorrect,
        score,
        handleAnswerSelect,
        handleSubmit,
        handleNext,
        restartGame,
    } = useGameLogic(lessonId); // Use the hook with the passed lessonId

    // --- Loading State ---
    if (isLoading) {
        return <div className="game-component-container loading">Loading Lesson...</div>;
    }

    // --- Error State ---
    if (error) {
        return <div className="game-component-container error">Error: {error} <button onClick={restartGame}>Try Again</button></div>;
    }

    // --- Finished State ---
    if (gameState === 'finished') {
        return (
            <div className="game-component-container finished-screen">
                <h2>Lesson Complete!</h2>
                <p className="final-score">Your score: {score} / {totalQuestions}</p>
                <button className="action-button restart-button" onClick={restartGame}>
                    Play Again
                </button>
                {/* You could add a prop function for "onComplete" to navigate away */}
            </div>
        );
    }

    // --- Playing or Feedback State ---
    if (gameState === 'playing' || gameState === 'feedback') {
        const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + (gameState === 'feedback' ? 1 : 0)) / totalQuestions) * 100 : 0;

        return (
            <div className="game-component-container">
                {/* Progress Bar */}
                <div className="progress-bar-container">
                     <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
                </div>

                <div className="question-container">
                    <h2 className="question-prompt">{currentQuestion?.prompt}</h2>

                    {/* Answer Options */}
                    <div className="answer-options">
                        {currentQuestion?.options.map((option) => {
                            let buttonClass = 'answer-button';
                            if (gameState === 'playing') {
                                if (option === selectedAnswer) {
                                    buttonClass += ' selected';
                                }
                            } else if (gameState === 'feedback') {
                                if (option === currentQuestion.correctAnswer) {
                                    buttonClass += ' correct';
                                } else if (option === selectedAnswer) {
                                    buttonClass += ' incorrect';
                                } else {
                                    buttonClass += ' disabled';
                                }
                            }

                            return (
                                <button
                                    key={option}
                                    className={buttonClass}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={gameState === 'feedback'}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Feedback Area */}
                <div className={`feedback-container ${gameState === 'feedback' ? 'visible' : ''}`}>
                    {gameState === 'feedback' && (
                         <div className={`feedback-message ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
                            {isCorrect ? 'Correct!' : `Incorrect! The right answer was: ${currentQuestion.correctAnswer}`}
                         </div>
                    )}

                     {/* Action Button (Check/Continue) */}
                    <button
                        className={`action-button ${gameState === 'playing' ? 'check-button' : 'continue-button'} ${!selectedAnswer && gameState === 'playing' ? 'disabled' : ''}`}
                        onClick={gameState === 'playing' ? handleSubmit : handleNext}
                        disabled={!selectedAnswer && gameState === 'playing'}
                    >
                        {gameState === 'playing' ? 'Check' : 'Continue'}
                    </button>
                </div>
            </div>
        );
    }

    // Fallback
    return <div className="game-component-container">Something went wrong.</div>;
}

export default GameComponent; // Export the component