import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography } from "@mui/material";


const cardImages = [
  { src: "/icons/apple.png", word: "Apple", matched: false },
  { src: "/icons/banana.png", word: "Banana", matched: false },
  { src: "/icons/cat.png", word: "Cat", matched: false },
  { src: "/icons/dog.png", word: "Dog", matched: false },
  { src: "/icons/strawberry.png", word: "Strawberry", matched: false },
  { src: "/icons/rabbit.png", word: "Rabbit", matched: false },
];

const labelSounds = {
  "/icons/apple.png": new Audio("/sounds/labels/apple.mp3"),
  "/icons/banana.png": new Audio("/sounds/labels/banana.mp3"),
  "/icons/cat.png": new Audio("/sounds/labels/cat.mp3"),
  "/icons/dog.png": new Audio("/sounds/labels/dog.mp3"),
  "/icons/strawberry.png": new Audio("/sounds/labels/strawberry.mp3"),
  "/icons/rabbit.png": new Audio("/sounds/labels/rabbit.mp3"),
};

const backgroundMusic = new Audio("/sounds/bgmusic.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

const winSound = new Audio("/sounds/win.mp3");

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [popupWord, setPopupWord] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const totalPairs = cardImages.length;

  const navigate = useNavigate();

  const shuffleCards = () => {
    const shuffled = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }));
    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffled);
    setTurns(0);
    setGameWon(false);
    setPopupWord(null);
    setMatchedPairs(0);
  };

  const handleChoice = (card) => {
    if (!disabled) {
      labelSounds[card.src]?.play();
      setPopupWord(card.word);
      setTimeout(() => setPopupWord(null), 1200);
      choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
    }
  };

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prev) => prev + 1);
    setDisabled(false);
  };

  const toggleMusic = () => {
    if (musicPlaying) {
      backgroundMusic.pause();
      setMusicPlaying(false);
    } else {
      backgroundMusic.play();
      setMusicPlaying(true);
    }
  };

  useEffect(() => {
    shuffleCards();
  }, []);

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.src === choiceTwo.src) {
        setCards((prev) =>
          prev.map((card) =>
            card.src === choiceOne.src ? { ...card, matched: true } : card
          )
        );
        setMatchedPairs((prev) => prev + 1);
        resetTurn();
      } else {
        setTimeout(resetTurn, 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  useEffect(() => {
    if (cards.length && cards.every((card) => card.matched)) {
      setGameWon(true);
      winSound.play();
    }
  }, [cards]);

  useEffect(() => {
    backgroundMusic.play();
    setMusicPlaying(true);

    return () => {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        setMusicPlaying(false);
    };
  }, []);

  return (
    <Box className="memory-container">
      {/* ✅ Back Button at top-left */}
      <Box display="flex" justifyContent="flex-start" width="100%" mb={1}>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#607d8b",
            color: "white",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/student-challenges")}
        >
          ⬅ Back to Challenge
        </Button>
      </Box>

      <Typography variant="h3" className="game-title">
        🌟 Memory Puzzle 🌙
      </Typography>

      <Box display="flex" justifyContent="center" gap={2} mb={2}>
        <Button variant="contained" className="restart-button" onClick={shuffleCards}>
          🔄 Restart Game
        </Button>
        <Button
          variant="outlined"
          className="restart-button"
          onClick={toggleMusic}
          style={{ backgroundColor: musicPlaying ? "#4caf50" : "#9e9e9e" }}
        >
          {musicPlaying ? "🔊 Music On" : "🔇 Music Off"}
        </Button>
      </Box>

      {gameWon && (
        <>
          <Typography className="win-message">
            🎉 You matched all cards! 🎉
          </Typography>
          <div className="confetti">
            {Array.from({ length: 30 }).map((_, i) => (
              <span
                key={i}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              >
                {Math.random() > 0.5 ? "🌟" : "✨"}
              </span>
            ))}
          </div>
        </>
      )}

      {popupWord && <div className="popup-word">{popupWord}</div>}

      <Typography className="progress-score">
        Matched Pairs: {matchedPairs} / {totalPairs}
      </Typography>

      <Box className="card-grid">
        {cards.map((card) => {
          const isFlipped = card === choiceOne || card === choiceTwo || card.matched;
          return (
            <div
              key={card.id}
              className={`card ${isFlipped ? "flipped" : ""}`}
              onClick={() => !isFlipped && handleChoice(card)}
            >
              {isFlipped ? (
                <img src={card.src} alt={card.word} className="card-image" />
              ) : (
                <div className="card-back">🪐</div>
              )}
            </div>
          );
        })}
      </Box>

      <Typography className="turn-counter">Turns: {turns}</Typography>

      <div className="floating-mascot">🌙 You're doing great!</div>
    </Box>
  );
}
