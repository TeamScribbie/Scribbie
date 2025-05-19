import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mascot from "../../assets/duh.png"; 
import confetti from "canvas-confetti";

const GameChallengeLogic = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const navigate = useNavigate();

  const handleAnswer = (choiceObj) => { // choiceObj can be null if timer runs out
        if (isAnswerSubmitted) return;

        if (timerIdRef.current) clearInterval(timerIdRef.current); // Stop the current question's timer
        setIsAnswerSubmitted(true); // Mark that the answer for the current question has been processed
        setSelectedChoice(choiceObj); // Store the selected choice object (or null if timer ran out)
        setTotalQuestionsAnswered(prev => prev + 1);

        let currentStreak = streak;
        // Assuming questions[currentIndex].choices is an array of choice objects,
        // and one of them has an `isCorrect: true` property.
        // const correctAnswerObj = questions[currentIndex].choices.find(c => c.isCorrect); // You'd need this if choiceObj didn't carry its own correctness

        if (choiceObj && choiceObj.isCorrect) {
            // Calculate new score: base score + streak bonus
            const newScore = localScore + 1000 + (currentStreak * 100); // Example scoring logic
            setLocalScore(newScore);
            if(onScoreUpdate) onScoreUpdate(newScore); // Update score for the parent (and LiveLeaderboard)


            currentStreak++;
            setStreak(currentStreak);
            setTotalCorrectAnswers(prev => prev + 1);
        } else {
            // Incorrect answer or timer ran out
            setLives(prev => prev - 1);
            setStreak(0); // Reset streak on incorrect answer
            currentStreak = 0; // Reset for any subsequent calculations if needed in this scope

            // If score needs to be updated for the parent even on incorrect answer (e.g. if it didn't change but parent needs to know)
            if(onScoreUpdate) onScoreUpdate(localScore);
        }

        // Delay before moving to the next question or ending the challenge
        setTimeout(() => {
            proceedToNextQuestionOrEnd(); // This function handles the logic to move to next question or end the game
        }, 1500); // 1.5 seconds delay to show feedback (e.g., correct/incorrect choice color)
    };
  const handleSubmitScore = () => {
    const savedBestScore = parseInt(localStorage.getItem('scribbieScore')) || 0;

    if (score > savedBestScore) {
      localStorage.setItem('scribbieScore', score);
    }

    // Save challenge completion
    const completedChallenges = JSON.parse(localStorage.getItem('completedChallenges')) || [];
    const currentChallengeId = parseInt(window.location.pathname.split("/").pop());

    if (!completedChallenges.includes(currentChallengeId)) {
      completedChallenges.push(currentChallengeId);
    }
    localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));

    setTimeout(() => {
      navigate('/student-homepage'); 
    }, 500);
  };

  useEffect(() => {
    if (gameOver) {
      const savedBestScore = parseInt(localStorage.getItem('scribbieScore')) || 0;
      if (score > savedBestScore) {
        setIsNewHighScore(true);
      }
    }
  }, [gameOver, score]);

  if (gameOver) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h3 style={{ color: "#451513", fontSize: "24px", marginBottom: "10px" }}>
          Score
        </h3>

        <div style={{ fontSize: "60px", fontWeight: "bold", color: "#451513", marginBottom: "10px" }}>
          {score.toLocaleString()}
        </div>

        {isNewHighScore && (
          <div style={{
            marginTop: "10px",
            fontSize: "24px",
            color: "#38E54D",
            animation: "fadeBounce 1s infinite",
            fontWeight: "bold",
          }}>
            🎉 New High Score!
          </div>
        )}

        <p style={{ color: "#451513", fontSize: "18px", marginTop: "30px" }}>
          Beat the highest score: <strong>20,000</strong>
        </p>

        <button
          style={{
            backgroundColor: "#FFD966",
            color: "#451513",
            padding: "12px 30px",
            fontSize: "18px",
            border: "none",
            borderRadius: "999px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "20px",
          }}
          onClick={handleSubmitScore}
        >
          SUBMIT
        </button>
      </div>
    );
  }

  if (showCompletionPopup) {
    return (
      <div style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        animation: "fadeIn 0.5s",
      }}>
        <div style={{
          backgroundColor: "#FFF2D0",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          width: "300px",
          transform: "scale(1)",
          animation: "scaleUp 0.4s ease-in-out",
        }}>
          <h2 style={{ color: "#451513", marginBottom: "20px" }}>
            🎉 Challenge Completed!
          </h2>
          <p style={{ fontWeight: "bold", color: "#542d1d" }}>Great job!</p>
          <button
            style={{
              backgroundColor: "#451513",
              color: "white",
              padding: "10px 20px",
              fontSize: "16px",
              border: "none",
              borderRadius: "999px",
              fontWeight: "bold",
              marginTop: "20px",
              cursor: "pointer",
            }}
            onClick={handleSubmitScore}
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div></div>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>{score.toLocaleString()}</div>

        {/* Lives and Streak */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {Array.from({ length: lives }, (_, idx) => (
            <span key={idx} style={{ color: "red", fontSize: "20px" }}>❤️</span>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "20px", color: "gold" }}>⚡</span>
            <span style={{ fontWeight: "bold" }}>{streak}x</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <h2 style={{ marginBottom: "10px", fontWeight: "bold", color: "#451513" }}>
        {questions[currentIndex].question}
      </h2>

      {/* Mascot */}
      <img src={mascot} alt="Mascot" style={{ height: "120px", marginBottom: "20px" }} />

      {/* Choices */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "500px", margin: "0 auto" }}>
        {questions[currentIndex].choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(choice)}
            disabled={!!selectedChoice}
            style={{
              padding: "20px",
              borderRadius: "10px",
              border: "2px solid #451513",
              backgroundColor:
                selectedChoice === choice
                  ? (choice === questions[currentIndex].correctAnswer ? "#38E54D" : "#E63946")
                  : "#FFE9A7",
              color: "#451513",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameChallengeLogic;
