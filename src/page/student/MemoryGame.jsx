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
  const [nickname, setNickname] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
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
      if (card === choiceOne) return;
      labelSounds[card.src]?.play();
      setPopupWord(card.word);
      setTimeout(() => setPopupWord(null), 10000);
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
    <Box
      className="memory-container"
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(/src/assets/memorygame-bg.png)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        padding: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {!gameStarted ? (
        <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
          <Typography
            variant="h3"
            mb={3}
            style={{ fontWeight: "bold", color: "#3f51b5" }}
          >
            🎮 Enter Your Nickname
          </Typography>

          <input
            type="text"
            placeholder="Enter nickname..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{
              padding: "20px",
              fontSize: "28px",
              borderRadius: "12px",
              border: "2px solid #3f51b5",
              marginBottom: "30px",
              width: "350px",
              textAlign: "center",
            }}
          />

          <Button
            variant="contained"
            size="large"
            style={{
              fontSize: "20px",
              padding: "12px 24px",
              backgroundColor: "#f06292",
              color: "#fff",
              fontWeight: "bold",
            }}
            onClick={() => {
              if (nickname.trim()) setGameStarted(true);
            }}
          >
            🚀 Start Game
          </Button>
        </Box>
      ) : (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            maxWidth="1000px"
            mb={2}
          >
            <Button
              variant="contained"
              style={{
                backgroundColor: "#607d8b",
                color: "white",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/student-challenges")}
            >
              ⬅ EXIT
            </Button>
            <Typography variant="h6">
              👤 Player: <strong>{nickname}</strong>
            </Typography>
          </Box>

          <Typography variant="h2" className="game-title" gutterBottom>
            🌟 Memory Puzzle 🌙
          </Typography>

          <Box display="flex" justifyContent="center" gap={5} mb={5}>
            <Button variant="contained" className="restart-button" onClick={shuffleCards}>
              🔄 Restart
            </Button>
            <Button
              variant="outlined"
              onClick={toggleMusic}
              style={{ backgroundColor: musicPlaying ? "#4caf50" : "#9e9e9e", color: "#fff" }}
            >
              {musicPlaying ? "🔊 Music On" : "🔇 Music Off"}
            </Button>
          </Box>

          {gameWon && (
            <>
              <Typography className="win-message">
                🎉 You matched all cards, {nickname}! 🎉
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

          <Box
            className="card-grid"
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: 2,
              maxWidth: "500px",
              margin: "20px auto",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {cards.map((card) => {
              const isFlipped = card === choiceOne || card === choiceTwo || card.matched;
              return (
                <div
                  key={card.id}
                  className={`card ${isFlipped ? "flipped" : ""}`}
                  onClick={() => {
                    if (!disabled && !isFlipped) handleChoice(card);
                  }}
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
        </>
      )}
    </Box>
  );
}
