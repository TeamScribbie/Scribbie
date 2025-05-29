import React, { useState, useEffect, useRef } from "react"; // Added useRef
import { useNavigate } from "react-router-dom";
import mascot from "../../assets/duh.png"; 
import confetti from "canvas-confetti";

// Import sound files
import correctSound1 from "../../assets/sounds/correct1.ogg";
import correctSound2 from "../../assets/sounds/correct2.ogg";
import correctSound3 from "../../assets/sounds/correct3.ogg";
import correctSound4 from "../../assets/sounds/correct4.ogg";
import correctSound5 from "../../assets/sounds/correct5.ogg";
import correctSound6 from "../../assets/sounds/correct6.ogg";
import correctSound7 from "../../assets/sounds/correct7.ogg";
import correctSound8 from "../../assets/sounds/correct8.ogg";
import correctSound9 from "../../assets/sounds/correct9.ogg";
import wrongSound from "../../assets/sounds/wrong.ogg";
import winSound from "../../assets/sounds/win.ogg";
import loseSound from "../../assets/sounds/lose.ogg";

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
        
        // Play the appropriate sound
        const soundToPlay = challengeStatus === 'COMPLETED' ? winAudioRef.current : loseAudioRef.current;
        soundToPlay.currentTime = 0;
        soundToPlay.play().catch(error => console.error('Error playing game end sound:', error));
        
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
  
  const handleAnswer = (choiceObj) => {
    if (isAnswerSubmitted) return;

    if (timerIdRef.current) clearInterval(timerIdRef.current);
    setIsAnswerSubmitted(true);
    setSelectedChoice(choiceObj);
    setTotalQuestionsAnswered(prev => prev + 1);

    let currentStreak = streak;

    if (choiceObj && choiceObj.isCorrect) {
        const newScore = localScore + 1000 + (currentStreak * 100); 
        setLocalScore(newScore);
        if(onScoreUpdate) onScoreUpdate(newScore); 

        // Increment streak before playing sound
        currentStreak++;
        setStreak(currentStreak);
        setTotalCorrectAnswers(prev => prev + 1);
        
        // Play the streak-specific sound with the new streak value
        playCorrectSound(currentStreak);
    } else {
        // Incorrect answer or timer ran out
        setLives(prev => prev - 1);
        setStreak(0); 
        currentStreak = 0;
        if(onScoreUpdate) onScoreUpdate(localScore);
        
        // Play wrong sound
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play().catch(error => console.error('Error playing wrong sound:', error));
    }
    
    setTimeout(() => {
        proceedToNextQuestionOrEnd(); 
    }, 1500); 
  };

  // Add audio refs
  const correctAudioRefs = useRef({
    1: new Audio(correctSound1),
    2: new Audio(correctSound2),
    3: new Audio(correctSound3),
    4: new Audio(correctSound4),
    5: new Audio(correctSound5),
    6: new Audio(correctSound6),
    7: new Audio(correctSound7),
    8: new Audio(correctSound8),
    9: new Audio(correctSound9),
  });
  const wrongAudioRef = useRef(new Audio(wrongSound));
  const winAudioRef = useRef(new Audio(winSound));
  const loseAudioRef = useRef(new Audio(loseSound));

  // Initialize audio settings
  useEffect(() => {
    Object.values(correctAudioRefs.current).forEach(audio => {
      audio.volume = 0.5;
    });
    wrongAudioRef.current.volume = 0.5;
    winAudioRef.current.volume = 0.5;
    loseAudioRef.current.volume = 0.5;

    return () => {
      Object.values(correctAudioRefs.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      wrongAudioRef.current.pause();
      wrongAudioRef.current.currentTime = 0;
      winAudioRef.current.pause();
      winAudioRef.current.currentTime = 0;
      loseAudioRef.current.pause();
      loseAudioRef.current.currentTime = 0;
    };
  }, []);

  // Add playCorrectSound function
  const playCorrectSound = async (currentStreak) => {
    // Use exactly the streak number to get the corresponding sound (capped at 9)
    const soundIndex = Math.min(currentStreak, 9);
    const audio = correctAudioRefs.current[soundIndex];
    
    if (!audio) {
      console.error(`No audio found for streak ${currentStreak}`);
      return;
    }

    // Stop any currently playing correct sounds
    Object.values(correctAudioRefs.current).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
    
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error('Error playing streak sound:', error);
    }
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