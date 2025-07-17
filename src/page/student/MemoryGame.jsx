import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography } from "@mui/material";
import confetti from 'canvas-confetti';


const backgroundMusic = new Audio("/sounds/bgmusic.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

const winSound = new Audio("/sounds/win.mp3");

export default function MemoryGame({ gameData = [], onGameComplete = () => {} }) {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [popupWord, setPopupWord] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [labelSounds, setLabelSounds] = useState({});
  const totalPairs = gameData.length;

  const navigate = useNavigate();

  useEffect(() => {
    // Generate label sounds from gameData
    const sounds = gameData.reduce((acc, item) => {
      if (item.soundSrc) {
        acc[item.src] = new Audio(item.soundSrc);
      }
      return acc;
    }, {});
    setLabelSounds(sounds);

    // Shuffle cards
    const shuffled = [...gameData, ...gameData]
        .sort(() => Math.random() - 0.5)
        .map((card) => ({ ...card, id: Math.random(), matched: false }));

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffled);
    setTurns(0);
    setGameWon(false);
    setPopupWord(null);
    setMatchedPairs(0);
  }, [gameData]);

  const handleChoice = (card) => {
    if (!disabled) {
      if (labelSounds[card.src]) {
        labelSounds[card.src].play();
      }
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
    } else {
      backgroundMusic.play();
    }
    setMusicPlaying(!musicPlaying);
  };

  const restartGame = () => {
    const shuffled = [...gameData, ...gameData]
        .sort(() => Math.random() - 0.5)
        .map((card) => ({ ...card, id: Math.random(), matched: false }));

    setCards(shuffled);
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(0);
    setGameWon(false);
    setPopupWord(null);
    setMatchedPairs(0);
  };

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
    if (totalPairs > 0 && matchedPairs === totalPairs) {
      setGameWon(true);
      winSound.play();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      const accuracy = turns > 0 ? Math.round((totalPairs / turns) * 100) : 100;
      const result = {
        score: matchedPairs * 100,
        matchedCount: matchedPairs,
        attempts: turns,
        accuracy: accuracy,
        status: 'COMPLETED',
      };
      onGameComplete(result);
    }
  }, [matchedPairs, totalPairs, turns, onGameComplete]);

  useEffect(() => {
    backgroundMusic.play();
    setMusicPlaying(true);

    return () => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    };
  }, []);

  return (
      <Box className="memory-container">
        {/* UI Elements remain the same */}
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
          <Button variant="contained" className="restart-button" onClick={restartGame}>
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
      </Box>
  );
}