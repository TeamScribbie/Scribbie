import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography } from "@mui/material";
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";

// The component now only needs `activityDetails`
export default function MemoryGame({ onGameComplete = () => {}, activityDetails = {} }) {

  // LOGIC MOVED FROM FlipMatchingGame.jsx
  // This logic now lives inside MemoryGame and creates the card data it needs.
  const gameData = useMemo(() => {
    if (!activityDetails?.questions) return [];
    return activityDetails.questions.map(q => {
      const choice = q.choices?.[0];
      if (!choice) return null;
      return {
        src: choice.imagePath ? `${MEDIA_BASE_URL}${choice.imagePath.replace(/^\/+/, '')}` : null,
        word: choice.choiceText,
        soundSrc: choice.audioPath ? `${MEDIA_BASE_URL}${choice.audioPath.replace(/^\/+/, '')}` : null,
      };
    }).filter(Boolean);
  }, [activityDetails?.questions]);


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

  // Memoize audio objects
  const backgroundMusic = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/bgmusic.mp3`), []);
  const winSound = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/win.mp3`), []);

  const totalPairs = gameData.length;
  const navigate = useNavigate();
  const gameModeFlag = activityDetails?.flagA;

  const shuffleCards = useCallback(() => {
    const gameMode = (gameModeFlag?.trim().toLowerCase()) || 'easy';

    // The console logs are kept for final verification
    console.log('--- MEMORY GAME DEBUG ---');
    console.log('Received flagA from props:', gameModeFlag);
    console.log('Determined gameMode:', gameMode);

    const sounds = gameData.reduce((acc, item) => {
      if (item.soundSrc) {
        acc[item.src] = new Audio(item.soundSrc);
      }
      return acc;
    }, {});
    setLabelSounds(sounds);

    let cardSet = [];
    if (gameMode === 'medium') {
      const imageCards = gameData.map(item => ({ ...item, displayType: 'image' }));
      const textCards = gameData.map(item => ({ ...item, displayType: 'text' }));
      cardSet = [...imageCards, ...textCards];
    } else {
      cardSet = [...gameData, ...gameData];
    }

    const shuffled = cardSet
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
  }, [gameData, gameModeFlag]);

  // --- The rest of the component logic remains the same ---

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
  }, [shuffleCards]);

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

  useEffect(() => {
    if (gameStarted) {
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.3;
      backgroundMusic.play().catch(e => console.error("Music error:", e));
    }
    return () => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    };
  }, [gameStarted, backgroundMusic]);

  const renderFlippedCardContent = (card) => {
    const gameMode = (gameModeFlag?.trim().toLowerCase()) || 'easy';
    switch (gameMode) {
      case 'hard':
        return <div className="card-text">{card.word}</div>;
      case 'medium':
        if (card.displayType === 'image') {
          return <img src={card.src} alt={card.word} className="card-image" />;
        } else {
          return <div className="card-text">{card.word}</div>;
        }
      case 'easy':
      default:
        return <img src={card.src} alt={card.word} className="card-image" />;
    }
  };

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
              <Typography variant="h3" mb={3} style={{ fontWeight: "bold", color: "#3f51b5" }}>
                🎮 Enter Your Nickname
              </Typography>
              <input type="text" placeholder="Enter nickname..." value={nickname} onChange={(e) => setNickname(e.target.value)}
                     style={{ padding: "20px", fontSize: "28px", borderRadius: "12px", border: "2px solid #3f51b5", marginBottom: "30px", width: "350px", textAlign: "center" }}
              />
              <Button variant="contained" size="large"
                      style={{ fontSize: "20px", padding: "12px 24px", backgroundColor: "#f06292", color: "#fff", fontWeight: "bold" }}
                      onClick={() => { if (nickname.trim()) setGameStarted(true); }}
              >
                🚀 Start Game
              </Button>
            </Box>
        ) : (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" maxWidth="1000px" mb={2}>
                <Button variant="contained"
                        style={{ backgroundColor: "#607d8b", color: "white", fontWeight: "bold", fontSize: "1.1rem", padding: "12px 24px", borderRadius: "8px" }}
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
              </Box>
              {gameWon && (
                  <>
                    <Typography className="win-message">🎉 You matched all cards, {nickname}! 🎉</Typography>
                    <div className="confetti">
                      {Array.from({ length: 30 }).map((_, i) => (
                          <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}>
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
              <Box className="card-grid" sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 2, maxWidth: "500px", margin: "20px auto", justifyContent: "center", alignItems: "center" }}>
                {cards.map((card) => {
                  const isFlipped = card === choiceOne || card === choiceTwo || card.matched;
                  return (
                      <div key={card.id} className={`card ${isFlipped ? "flipped" : ""}`}
                           onClick={() => { if (!disabled && !isFlipped) handleChoice(card); }}
                      >
                        {isFlipped ? ( renderFlippedCardContent(card) ) : ( <div className="card-back">🪐</div> )}
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