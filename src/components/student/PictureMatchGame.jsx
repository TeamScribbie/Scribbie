import React, { useState } from "react";
import { Box, Button, Typography, Card, CardContent } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const PictureMatchGame = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);

  const navigate = useNavigate();
  const { challengeId } = useParams();
  const current = questions[currentIndex];

  const handleChoice = (value) => {
    setSelected(value);

    const isCorrect = value === current.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setLives((prev) => prev - 1);
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
      } else {
        setShowResult(true);
        const completed = JSON.parse(localStorage.getItem("completedChallenges")) || [];
        const id = parseInt(challengeId);
        if (!completed.includes(id)) {
          localStorage.setItem("completedChallenges", JSON.stringify([...completed, id]));
        }
      }
    }, 1000);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setLives(3);
    setStreak(0);
    setShowResult(false);
  };

  const handleFinish = () => {
    navigate("/student-challenge");
  };

  const renderLives = () => "❤️".repeat(lives) + "🤍".repeat(3 - lives);
  const renderStreak = () => `⚡ ${streak}x`;

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      {!showResult ? (
        <Card sx={{ backgroundColor: "#FFF0F5", borderRadius: "12px", padding: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography fontSize="24px">{renderLives()}</Typography>
              <Typography fontSize="20px" fontWeight="bold" color="#FF8C00">
                {renderStreak()}
              </Typography>
            </Box>

            <Typography variant="h6" color="#451513">
              {`Question ${currentIndex + 1} of ${questions.length}`}
            </Typography>
            <Typography variant="h5" fontWeight="bold" marginBottom={3} marginTop={1}>
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
      ) : (
        <Box mt={4}>
          <Typography
            variant="h4"
            color={score > 0 ? "#388E3C" : "#D32F2F"}
            fontWeight="bold"
          >
            {score > 0 ? "🎉 Well done!" : "😓 Try again!"}
          </Typography>
          <Typography variant="h5" mt={2}>
            You got {score} out of {questions.length} correct!
          </Typography>
          <Typography fontSize="30px" mt={2}>
            {Array(score).fill("⭐").join(" ")}
          </Typography>

          <Button
            onClick={score > 0 ? handleFinish : handleRetry}
            sx={{
              mt: 3,
              backgroundColor: "#451513",
              color: "white",
              padding: "10px 24px",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#5b1a16" },
            }}
          >
            {score > 0 ? "OK" : "Retry"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PictureMatchGame;
