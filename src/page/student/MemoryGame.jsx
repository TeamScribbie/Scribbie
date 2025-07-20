import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography } from "@mui/material";
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";

export default function MemoryGame({ gameData = [], onGameComplete = () => {} }) {
  // State for the game logic
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);

  // State for the UI
  const [popupWord, setPopupWord] = useState(null);
  const [nickname, setNickname] = useState("");
  const [gameStarted, setGameStarted] = useState(false);

  // State for card-specific sounds
  const [labelSounds, setLabelSounds] = useState({});

  // Memoize audio objects to prevent re-creation
  const backgroundMusic = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/bgmusic.mp3`), []);
  const winSound = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/win.mp3`), []);

  const totalPairs = gameData.length;
  const navigate = useNavigate();

  const shuffleCards = () => {
    const sounds = gameData.reduce((acc, item) => {
      if (item.soundSrc) {
        acc[item.src] = new Audio(item.soundSrc);
      }
      return acc;
    }, {});
    setLabelSounds(sounds);

    const shuffled = [...gameData, ...gameData]
        .sort(() => Math.random() - 0.5)
        .map((card) => ({
          ...card,
          id: Math.random(),
          matched: false
        }));

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
      labelSounds[card.src]?.play().catch(e => console.error("Sound error:", e));
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

  useEffect(() => {
    if (gameData.length > 0) {
      shuffleCards();
    }
  }, [gameData]);

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
    if (!gameWon && cards.length > 0 && cards.every((card) => card.matched)) {
      setGameWon(true);
      winSound.play().catch(e => console.error("Win sound error:", e));

      const accuracy = turns > 0 ? Math.round((matchedPairs / turns) * 100) : 100;
      const result = {
        score: matchedPairs * 100 - (turns * 10),
        matchedCount: matchedPairs,
        attempts: turns,
        accuracy: accuracy,
        status: 'COMPLETED',
      };
      onGameComplete(result);
    }
  }, [cards, gameWon, matchedPairs, turns, onGameComplete, winSound]);

  // This effect now handles the background music automatically
  useEffect(() => {
    if (gameStarted) {
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.3;
      backgroundMusic.play().catch(e => console.error("Music error:", e));
    }
    // Cleanup function: this will pause the music when the component is unmounted (e.g., user navigates away)
    return () => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    };
  }, [gameStarted, backgroundMusic]);

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
                      fontSize: "1.1rem",
                      padding: "12px 24px",
                      borderRadius: "8px",
                    }}
                    onClick={() => navigate("/student-challenges")}
                >
                  ⬅ EXIT
                </Button>
                <Typography variant="h6" style={{ color: "white" }}>
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
                {/* Mute button has been removed from here */}
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