import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/telling-bg.png";

const storyLines = [
  "Brrrr! It is getting cold.",
  "Bear needs to get ready for winter.",
  "First, he eats a lot.",
  "Next, he finds a den.",
  "Then, he fills the den with leaves, so he will stay warm.",
  "Last, he eats even more!",
  "Is Bear ready for winter?",
  "Yes, he is. Winter is here!",
];

const questions = [
  { question: "What season is coming?", options: ["Summer", "Winter", "Spring"], answer: "Winter" },
  { question: "What does Bear do first?", options: ["Finds a den", "Eats a lot", "Sleeps"], answer: "Eats a lot" },
  { question: "What does Bear put in his den?", options: ["Rocks", "Leaves", "Snow"], answer: "Leaves" },
  { question: "What does Bear do last?", options: ["Sleeps", "Eats more", "Builds a snowman"], answer: "Eats more" },
  { question: "Is Bear ready for winter?", options: ["Yes", "No", "Maybe"], answer: "Yes" },
];

const audioFile = "/sounds/whole_story.mp3";

export default function ColdBearStory() {
  const [activeWord, setActiveWord] = useState({ line: null, word: null });
  const [reading, setReading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(""));
  const [score, setScore] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const WORD_DELAY = 500;
  const highestScore = scoreHistory.length > 0 ? Math.max(...scoreHistory) : null;

  const playWholeStory = () => {
    if (reading) return;

    const audio = new Audio(audioFile);
    audioRef.current = audio;
    setReading(true);

    const totalWords = storyLines.flatMap((line) => line.split(" ")).length;
    const totalTime = totalWords * WORD_DELAY;

    audio.play();

    let wordCount = 0;
    for (let lineIndex = 0; lineIndex < storyLines.length; lineIndex++) {
      const words = storyLines[lineIndex].split(" ");
      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        setTimeout(() => {
          setActiveWord({ line: lineIndex, word: wordIndex });
        }, WORD_DELAY * wordCount);
        wordCount++;
      }
    }

    setTimeout(() => {
      setActiveWord({ line: null, word: null });
      setReading(false);
    }, totalTime);
  };

  const playLine = (lineIndex) => {
    stopAudio();
    const lineAudio = new Audio(`/sounds/lines/bearline${lineIndex}.mp3`);
    audioRef.current = lineAudio;
    setReading(true);
    lineAudio.play();

    const words = storyLines[lineIndex].split(" ");
    words.forEach((_, wordIndex) => {
      setTimeout(() => {
        setActiveWord({ line: lineIndex, word: wordIndex });
      }, WORD_DELAY * wordIndex);
    });

    setTimeout(() => {
      setActiveWord({ line: null, word: null });
      setReading(false);
    }, WORD_DELAY * words.length);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setReading(false);
    setActiveWord({ line: null, word: null });
  };

  const handleAnswer = (value) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[quizStep] = value;
    setUserAnswers(updatedAnswers);
  };

  const nextQuestion = () => {
    if (quizStep < questions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      const newScore = userAnswers.reduce((acc, answer, idx) => acc + (answer === questions[idx].answer ? 1 : 0), 0);
      setScore(newScore);
      setScoreHistory((prev) => [...prev, newScore]);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        px: 2,
        py: 6,
      }}
    >
      {/* Video Modal */}
      <Modal open={showVideo} onClose={() => setShowVideo(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
          }}
        >
          <video controls width="100%">
            <source src="/video/watch-bear.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      </Modal>

      <Box
        sx={{
          width: "100%",
          maxWidth: "900px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "20px",
          p: 4,
          mx: "auto",
          position: "relative",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          },
        }}
      >
        {/* WATCH Button inside content top-right corner */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowVideo(true)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          ▶️ WATCH
        </Button>

        <Typography
          variant="h2"
          fontWeight="bold"
          mb={3}
          color="#6d4c41"
          textAlign="center"
        >
          🐻 A Cold Bear
        </Typography>

        {!showQuiz &&
          storyLines.map((line, lineIndex) => (
            <Box
              key={lineIndex}
              onClick={() => playLine(lineIndex)}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "#fce4ec",
                },
              }}
            >
              <Typography
                variant="h2"
                sx={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2" }}
              >
                {line.split(" ").map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className={
                      activeWord.line === lineIndex && activeWord.word === wordIndex
                        ? "pop-word"
                        : ""
                    }
                    style={{ marginRight: "8px", display: "inline-block" }}
                  >
                    {word}
                  </span>
                ))}
              </Typography>
            </Box>
          ))}

        {!showQuiz && (
          <Box display="flex" gap={2} justifyContent="center">
            <Button onClick={playWholeStory} variant="contained" color="primary">
              🔊 Sound
            </Button>
            <Button onClick={stopAudio} variant="outlined" color="error">
              ⏹ Stop
            </Button>
          </Box>
        )}

        {!showQuiz && (
          <Button
            onClick={() => {
              setShowQuiz(true);
              setScore(null);
              setQuizStep(0);
              setUserAnswers(Array(questions.length).fill(""));
            }}
            variant="contained"
            color="success"
            sx={{ mt: 5, fontSize: "20px", display: "block", mx: "auto" }}
          >
            🎯 Let's try to answer something!
          </Button>
        )}

        {showQuiz && score === null && (
          <Box mt={4}>
            <Typography variant="h4" mb={3} color="#0288d1" textAlign="center">
              {quizStep + 1}. {questions[quizStep].question}
            </Typography>

            <Box display="flex" justifyContent="center" alignItems="center" gap={3}>
              {questions[quizStep].options.map((opt, i) => (
                <Button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  variant={userAnswers[quizStep] === opt ? "contained" : "outlined"}
                  sx={{ fontSize: "20px", minWidth: "200px", borderRadius: "12px" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <Button
                onClick={nextQuestion}
                variant="contained"
                color="success"
                sx={{ mt: 3, fontSize: "18px" }}
              >
                {quizStep < questions.length - 1 ? "Next" : "Submit"}
              </Button>
            </Box>
          </Box>
        )}

        {score !== null && (
          <Box mt={4} display="flex" flexDirection="column" alignItems="center" textAlign="center">
            <Typography variant="h5" color="success.main" mb={2}>
              🎉 You scored {score} out of {questions.length}!
            </Typography>
          </Box>
        )}

        {scoreHistory.length > 0 && (
          <Box mt={4} display="flex" flexDirection="column" alignItems="center" textAlign="center">
            <Typography variant="h6" color="text.primary" gutterBottom>
              📊 Your Score Record
            </Typography>

            {scoreHistory.map((s, i) => (
              <Typography
                key={i}
                sx={{
                  color: s === highestScore ? "green" : "inherit",
                  fontWeight: s === highestScore ? "bold" : "normal",
                }}
              >
                Attempt {i + 1}: {s} / {questions.length}
              </Typography>
            ))}

            <Typography mt={2} variant="subtitle1" color="primary">
              🏆 Highest Score: {highestScore} / {questions.length}
            </Typography>

            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 3 }}
              onClick={() => navigate("/student-challenges")}
            >
              🚪 Exit
            </Button>
          </Box>
        )}
      </Box>

      <style>
        {`
          @keyframes popWord {
            0% { transform: scale(1); }
            50% { transform: scale(1.6); color: #1976d2; }
            100% { transform: scale(1); }
          }
          .pop-word {
            animation: popWord ${WORD_DELAY / 1000}s ease-in-out;
            font-weight: bold;
            color: #1976d2;
          }
        `}
      </style>
    </Box>
  );
}
