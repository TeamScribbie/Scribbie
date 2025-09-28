import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography, LinearProgress } from "@mui/material";
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";

export default function MemoryGame({ gameData = [], onGameComplete = () => {}, isChallengeMode = false }) {
    // --- Existing State ---
    const [cards, setCards] = useState([]);
    const [turns, setTurns] = useState(0);
    const [choiceOne, setChoiceOne] = useState(null);
    const [choiceTwo, setChoiceTwo] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [popupWord, setPopupWord] = useState(null);
    const [nickname, setNickname] = useState("");
    const [gameStarted, setGameStarted] = useState(false);
    const [labelSounds, setLabelSounds] = useState({});

    // --- Challenge Mode State ---
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [maxTime, setMaxTime] = useState(30);
    const wordBank = useRef([...gameData]);

    // --- Audio Memos ---
    const backgroundMusic = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/bgmusic.mp3`), []);
    const winSound = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/win.mp3`), []);
    const loseSound = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/lose.ogg`), []);

    const navigate = useNavigate();

    const getNewCard = useCallback((currentCardSrcs) => {
        const available = wordBank.current.filter(item => !currentCardSrcs.includes(item.src));
        if (available.length === 0) {
            return wordBank.current[Math.floor(Math.random() * wordBank.current.length)];
        }
        return available[Math.floor(Math.random() * available.length)];
    }, []);

    const shuffleCards = useCallback(() => {
        const sounds = gameData.reduce((acc, item) => {
            if (item.soundSrc) acc[item.src] = new Audio(item.soundSrc);
            return acc;
        }, {});
        setLabelSounds(sounds);

        let initialCards;
        if (isChallengeMode) {
            const uniqueCards = [...new Map(gameData.map(item => [item.src, item])).values()];
            initialCards = uniqueCards.slice(0, 8);
        } else {
            initialCards = gameData;
        }

        const shuffled = [...initialCards, ...initialCards]
            .sort(() => Math.random() - 0.5)
            .map((card) => ({ ...card, id: Math.random(), matched: false }));

        setChoiceOne(null);
        setChoiceTwo(null);
        setCards(shuffled);
        setTurns(0);
        setGameWon(false);
        setPopupWord(null);
        setMatchedPairs(0);
        setScore(0);
        
        if (isChallengeMode) {
            setMaxTime(30);
            setTimeLeft(30);
            setGameStarted(true);
        } else {
            setGameStarted(false);
        }
    }, [gameData, isChallengeMode]);

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
    }, [gameData, shuffleCards]);

    useEffect(() => {
        if (!isChallengeMode || !gameStarted || gameWon) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setGameWon(true);
                    loseSound.play().catch(e => console.error("Sound error:", e));
                    onGameComplete({
                        score: score,
                        status: 'COMPLETED',
                        questionsAnswered: matchedPairs
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isChallengeMode, gameStarted, gameWon, score, matchedPairs, onGameComplete, loseSound]);

    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.src === choiceTwo.src) {
                setMatchedPairs(prev => prev + 1);

                if (isChallengeMode) {
                    setScore(prev => prev + 100);
                    const newMaxTime = Math.max(maxTime - 1.0, 8);
                    setMaxTime(newMaxTime);
                    setTimeLeft(newMaxTime); 

                    setTimeout(() => {
                        const currentCardSrcs = cards.map(c => c.src);
                        const newCard = getNewCard(currentCardSrcs);
                        
                        setCards(prevCards => prevCards.map(card => {
                            if (card.id === choiceOne.id || card.id === choiceTwo.id) {
                                return { ...newCard, id: card.id, matched: false };
                            }
                            return card;
                        }));
                        resetTurn();
                    }, 800);

                } else {
                    setCards((prev) =>
                        prev.map((card) =>
                            card.src === choiceOne.src ? { ...card, matched: true } : card
                        )
                    );
                    resetTurn();
                }
            } else {
                setTimeout(resetTurn, 1000);
            }
        }
    }, [choiceOne, choiceTwo, isChallengeMode, getNewCard, cards, maxTime]);

    // --- Win Condition (Normal Mode) ---
    useEffect(() => {
        // ✨ FIXED: Added 'cards.length > 0' to prevent the bug
        if (!isChallengeMode && gameData.length > 0 && cards.length > 0 && cards.every((card) => card.matched)) {
            setGameWon(true);
            winSound.play().catch(e => console.error("Win sound error:", e));
            const accuracy = turns > 0 ? Math.round((matchedPairs / turns) * 100) : 100;
            onGameComplete({
                score: matchedPairs * 100 - (turns * 10),
                status: 'COMPLETED',
            });
        }
    }, [cards, isChallengeMode, gameData.length, gameWon, matchedPairs, turns, onGameComplete, winSound]);
    
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
                    <Button variant="contained" size="large" style={{ fontSize: "20px", padding: "12px 24px", backgroundColor: "#f06292", color: "#fff", fontWeight: "bold" }}
                        onClick={() => { if (nickname.trim()) setGameStarted(true); }}
                    >
                        🚀 Start Game
                    </Button>
                </Box>
            ) : (
                <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" maxWidth="1000px" mb={2}>
                        <Button variant="contained" style={{ backgroundColor: "#607d8b", color: "white", fontWeight: "bold", fontSize: "1.1rem", padding: "12px 24px", borderRadius: "8px" }}
                            onClick={() => navigate("/student-homepage")}
                        >
                            ⬅ EXIT
                        </Button>
                        <Typography variant="h6" style={{ color: "white" }}>
                           👤 Player: <strong>{isChallengeMode ? "Challenger" : nickname}</strong>
                        </Typography>
                    </Box>

                    <Typography variant="h2" className="game-title" gutterBottom>
                        🌟 {isChallengeMode ? 'Challenge Puzzle' : 'Memory Puzzle'} 🌙
                    </Typography>
                    
                    {isChallengeMode && (
                        <Box sx={{ width: '100%', maxWidth: '500px', my: 2, px: 1 }}>
                             <LinearProgress variant="determinate" value={(timeLeft / maxTime) * 100} sx={{ height: '20px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { backgroundColor: '#f06292' } }} />
                        </Box>
                    )}

                    {gameWon ? (
                        <Box textAlign="center" mt={4}>
                            <Typography className="win-message">
                                {isChallengeMode ? `⌛ Time's Up! ⌛` : `🎉 You matched all cards, ${nickname}! 🎉`}
                            </Typography>
                            <Typography variant="h5" color="white" mt={2}>Final Score: {score}</Typography>
                            <Button variant="contained" className="restart-button" onClick={shuffleCards} sx={{mt: 3}}>
                                🔄 Play Again
                            </Button>
                        </Box>
                    ) : (
                         <>
                            {popupWord && <div className="popup-word">{popupWord}</div>}
                            
                            <Typography className="progress-score">
                                {isChallengeMode ? `Score: ${score}` : `Matched Pairs: ${matchedPairs} / ${gameData.length}`}
                            </Typography>

                            <Box className="card-grid" sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, maxWidth: "500px", margin: "20px auto" }}>
                                {cards.map((card) => {
                                    const isFlipped = card === choiceOne || card === choiceTwo || card.matched;
                                    return (
                                        <div key={card.id} className={`card ${isFlipped ? "flipped" : ""}`} onClick={() => { if (!disabled && !isFlipped) handleChoice(card); }}>
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
                        </>
                    )}
                </>
            )}
        </Box>
    );
}