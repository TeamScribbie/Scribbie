import React, { useState } from "react";
import { Box, Button, Typography, Card, CardContent } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const PictureMatchGame = ({ questions, totalChallenges }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);

  const navigate = useNavigate();
  const { challengeId } = useParams();
  const current = questions[currentIndex];

  const handleChoice = (value) => {
    if (selected || gameOver || completed) return;

    setSelected(value);

    const isCorrect = value === current.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setLives(prev => prev - 1);
    }

    setTimeout(() => {
      if (!isCorrect && lives - 1 <= 0) {
        setGameOver(true);
        return;
      }

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
      } else {
        setCompleted(true);
        const completedList = JSON.parse(localStorage.getItem("completedChallenges")) || [];
        const idNum = parseInt(challengeId);
        if (!completedList.includes(idNum)) {
          localStorage.setItem("completedChallenges", JSON.stringify([...completedList, idNum]));
        }
      }
    }, 1000);
  };

  const handleOK = () => navigate("/student-challenge");
  const handleRetry = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setCompleted(false);
  };

  const renderHearts = () => {
    return "❤️".repeat(lives) + "🤍".repeat(3 - lives);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      {!gameOver && !completed && (
        <Card sx={{ backgroundColor: "#FFF0F5", borderRadius: "12px", padding: 3 }}>
          <CardContent>
            <Typography variant="h6" color="#451513">
              {`Question ${currentIndex + 1} of ${questions.length}`}
            </Typography>
            <Typography fontSize="24px" marginTop={1}>
              {renderHearts()}
            </Typography>
            <Typography variant="h5" fontWeight="bold" marginBottom={3} marginTop={2}>
              {current.question}
            </Typography>

            <Box display="flex" justifyContent="center" gap={2}>
              {current.choices.map((choice, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleChoice(choice.value)}
                  sx={{
                    fontSize: "36px",
                    backgroundColor:
                      selected === choice.value
                        ? choice.value === current.correctAnswer
                          ? "#A5D6A7"
                          : "#EF9A9A"
                        : "#FFD966",
                    borderRadius: "50%",
                    minWidth: "80px",
                    height: "80px",
                  }}
                  disabled={!!selected}
                >
                  {choice.label}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {completed && (
        <Box mt={4}>
          <Typography variant="h4" color="#388E3C" fontWeight="bold">
            🎉 You completed the challenge!
          </Typography>
          <Typography variant="h5" mt={2}>
            Score: {score} / {questions.length}
          </Typography>
          <Typography fontSize="30px" mt={2}>
            {Array(score).fill("⭐").join(" ")}
          </Typography>
          <Button
            onClick={handleOK}
            sx={{
              mt: 3,
              backgroundColor: "#451513",
              color: "white",
              padding: "10px 24px",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#5b1a16" },
            }}
          >
            OK
          </Button>
        </Box>
      )}

      {gameOver && (
        <Box mt={4}>
          <Typography variant="h4" color="#D32F2F" fontWeight="bold">
            😢 You ran out of lives!
          </Typography>
          <Typography variant="h6" mt={2}>
            Final Score: {score} / {questions.length}
          </Typography>
          <Button
            onClick={handleRetry}
            sx={{
              mt: 3,
              backgroundColor: "#451513",
              color: "white",
              padding: "10px 24px",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#5b1a16" },
            }}
          >
            Retry
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PictureMatchGame;
