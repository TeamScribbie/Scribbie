import React, { useState, useEffect, useRef } from "react"; // Added useRef
import { useNavigate } from "react-router-dom";
import mascot from "../../assets/duh.png"; 
import confetti from "canvas-confetti";

// Assuming GameChallengeLogic receives full question objects including choices
// where each choice is an object like: { choiceId: '...', choiceText: '...', isCorrect: true/false }

const GameChallengeLogic = ({ questions, challengeConfig, onChallengeComplete, onScoreUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localScore, setLocalScore] = useState(0); // Renamed from score to avoid conflict if parent passes score
  const [lives, setLives] = useState(challengeConfig?.initialHealth || 3);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null); // This will store the selected choice *object*
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(challengeConfig?.initialQuestionTimeSeconds || 15); // Default to 15s if no config
  const timerIdRef = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState('IN_PROGRESS'); // 'COMPLETED', 'FAILED'
  
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const startTimeRef = useRef(Date.now());


  const navigate = useNavigate();

  useEffect(() => {
    if (streak > highestStreak) {
      setHighestStreak(streak);
    }
  }, [streak, highestStreak]);

  useEffect(() => {
    if (gameOver) {
        const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
        onChallengeComplete(localScore, highestStreak, totalQuestionsAnswered, challengeStatus, timeTaken);
    }
  }, [gameOver, localScore, highestStreak, totalQuestionsAnswered, challengeStatus, onChallengeComplete]);


  useEffect(() => {
    if (currentIndex < questions.length && !gameOver) {
      setTimeLeft(challengeConfig?.initialQuestionTimeSeconds || 15); // Reset timer for new question
      setIsAnswerSubmitted(false); // Allow new answer
      setSelectedChoice(null); // Clear previous selection

      timerIdRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerIdRef.current);
            handleAnswer(null); // Timer runs out, counts as incorrect/no answer
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerIdRef.current); // Cleanup timer on unmount or question change
  }, [currentIndex, questions.length, gameOver, challengeConfig]);


  const proceedToNextQuestionOrEnd = () => {
    if (lives <= 0) {
      setChallengeStatus('FAILED');
      setGameOver(true);
      return;
    }
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prevIndex => prevIndex + 1);
      // Timer reset and other states are handled in the useEffect for currentIndex
    } else {
      // All questions answered
      setChallengeStatus('COMPLETED');
      setGameOver(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };
  
  const handleAnswer = (choiceObj) => { // choiceObj is the full choice object or null
    if (isAnswerSubmitted) return;

    if (timerIdRef.current) clearInterval(timerIdRef.current);
    setIsAnswerSubmitted(true);
    setSelectedChoice(choiceObj); // Store the selected choice object
    setTotalQuestionsAnswered(prev => prev + 1);

    let currentStreak = streak;

    if (choiceObj && choiceObj.isCorrect) { // Check the isCorrect property of the choice object
        const newScore = localScore + 1000 + (currentStreak * 100); 
        setLocalScore(newScore);
        if(onScoreUpdate) onScoreUpdate(newScore); 

        currentStreak++;
        setStreak(currentStreak);
        setTotalCorrectAnswers(prev => prev + 1);
    } else {
        // Incorrect answer or timer ran out
        setLives(prev => prev - 1);
        setStreak(0); 
        currentStreak = 0; 
        if(onScoreUpdate) onScoreUpdate(localScore);
    }
    
    setTimeout(() => {
        proceedToNextQuestionOrEnd(); 
    }, 1500); 
  };


  if (questions.length === 0) {
    return <Typography sx={{textAlign: 'center', mt: 3}}>No questions loaded for this challenge.</Typography>;
  }

  if (gameOver) {
    // The onChallengeComplete callback will navigate to summary, so this might not be shown for long
    // or could be removed if navigation is immediate.
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h3 style={{ color: "#451513", fontSize: "24px", marginBottom: "10px" }}>
          Challenge Ended!
        </h3>
        <div style={{ fontSize: "60px", fontWeight: "bold", color: "#451513", marginBottom: "10px" }}>
          Score: {localScore.toLocaleString()}
        </div>
        {/* The summary page will handle detailed display and submission */}
      </div>
    );
  }
  
  const currentQuestion = questions[currentIndex];
   if (!currentQuestion || !Array.isArray(currentQuestion.choices)) {
    console.error("Current question or its choices are invalid:", currentQuestion);
    return <Typography color="error">Error: Question data is missing or malformed.</Typography>;
  }


  return (
    <div style={{ textAlign: "center", padding: "20px", backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '700px'}}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{fontSize: "20px", fontWeight: "bold", color: "#451513" }}>Time: {timeLeft}s</div>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>{localScore.toLocaleString()}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {Array.from({ length: lives }, (_, idx) => (
            <span key={idx} style={{ color: "red", fontSize: "20px" }}>❤️</span>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "20px", color: "orange" }}>⚡</span>
            <span style={{ fontWeight: "bold" }}>{streak}x</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <h2 style={{ marginBottom: "10px", fontWeight: "bold", color: "#451513", minHeight: '3em' }}>
        {currentQuestion.questionText}
      </h2>

      {/* Mascot */}
      <img src={mascot} alt="Mascot" style={{ height: "100px", marginBottom: "20px" }} />

      {/* Choices */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", maxWidth: "600px", margin: "0 auto" }}>
        {currentQuestion.choices.map((choice) => ( // choice is now an object
          <button
            key={choice.choiceId || choice.choiceText} // Use choiceId if available, fallback for safety
            onClick={() => handleAnswer(choice)}
            disabled={isAnswerSubmitted} // Disable after an answer is submitted for the current question
            style={{
              padding: "18px",
              borderRadius: "10px",
              border: "2px solid #451513",
              backgroundColor: isAnswerSubmitted && selectedChoice?.choiceId === choice.choiceId // Check if this is the selected choice
                                ? (selectedChoice.isCorrect ? "#38E54D" : "#E63946") // Color based on correctness of selected
                                : (isAnswerSubmitted && choice.isCorrect ? "#A5D6A7" : "#FFE9A7"), // Highlight correct if wrong one was picked
              color: isAnswerSubmitted && (selectedChoice?.choiceId === choice.choiceId || choice.isCorrect) ? "white" : "#451513",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isAnswerSubmitted ? "default" : "pointer",
              transition: "background-color 0.3s, transform 0.2s",
              opacity: isAnswerSubmitted && selectedChoice && selectedChoice.choiceId !== choice.choiceId && !choice.isCorrect ? 0.7 : 1,
            }}
          >
            {choice.choiceText} {/* Render the text of the choice */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameChallengeLogic;