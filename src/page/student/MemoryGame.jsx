import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography, LinearProgress } from "@mui/material";
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";

// --- MERGED SIGNATURE ---
// Accepts props from FlipMatchingGame (which passes both)
export default function MemoryGame({ 
    gameData = [], 
    onGameComplete = () => {}, 
    activityDetails = {}, 
    isChallengeMode = false 
}) {

    // --- MERGED STATE ---
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
    
    // --- Challenge Mode State (from Challenge) ---
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [maxTime, setMaxTime] = useState(30);
    const wordBank = useRef([...gameData]);

    // --- MERGED AUDIO ---
    const backgroundMusic = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/bgmusic.mp3`), []);
    const winSound = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/win.mp3`), []);
    const loseSound = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/lose.ogg`), []); // Kept from Challenge

    // --- Props and Refs ---
    const navigate = useNavigate();
    const gameModeFlag = activityDetails?.flagA; // From SkibidiRIzz
    const totalPairs = gameData.length; // From SkibidiRIzz

    // --- Challenge Mode Helper (from Challenge) ---
    const getNewCard = useCallback((currentCardSrcs) => {
        const available = wordBank.current.filter(item => !currentCardSrcs.includes(item.src));
        if (available.length === 0) {
            return wordBank.current[Math.floor(Math.random() * wordBank.current.length)];
        }
        return available[Math.floor(Math.random() * available.length)];
    }, []);

    // --- MERGED shuffleCards ---
    const shuffleCards = useCallback(() => {
        const gameMode = (gameModeFlag?.trim().toLowerCase()) || 'easy'; // From SkibidiRIzz

        const sounds = gameData.reduce((acc, item) => {
            if (item.soundSrc) acc[item.src] = new Audio(item.soundSrc);
            return acc;
        }, {});
        setLabelSounds(sounds);

        let cardSet = [];
        
        if (isChallengeMode) {
            // --- Challenge Mode Logic (from Challenge) ---
            const uniqueCards = [...new Map(gameData.map(item => [item.src, item])).values()];
            const initialCards = uniqueCards.slice(0, 8);
            cardSet = [...initialCards, ...initialCards];
        
        } else {
            // --- Normal Mode Logic (from SkibidiRIzz) ---
            if (gameMode === 'medium') {
                const imageCards = gameData.map(item => ({ ...item, displayType: 'image' }));
                const textCards = gameData.map(item => ({ ...item, displayType: 'text' }));
                cardSet = [...imageCards, ...textCards];
            } else { // 'easy' or 'hard'
                cardSet = [...gameData, ...gameData];
            }
        }

        const shuffled = cardSet
            .sort(() => Math.random() - 0.5)
            .map((card) => ({
                ...card,
                id: Math.random(),
                matched: false
            }));

        // --- Reset state (from both) ---
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
        }
    }, [gameData, isChallengeMode, gameModeFlag]);

    // --- handleChoice (from Challenge) ---
    const handleChoice = (card) => {
        if (!disabled) {
            if (card === choiceOne) return;
            labelSounds[card.src]?.play().catch(e => console.error("Sound error:", e));
            setPopupWord(card.word);
            setTimeout(() => setPopupWord(null), 1200);
            choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
        }
    };

    // --- resetTurn (from both) ---
    const resetTurn = () => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setTurns((prev) => prev + 1);
        setDisabled(false);
    };
    
    // --- Initial Shuffle (from both) ---
    useEffect(() => {
        if (gameData.length > 0) {
            shuffleCards();
        }
    }, [gameData, shuffleCards]);

    // --- Timer Logic (from Challenge) ---
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

    // --- Main Game Logic (from Challenge, merged with SkibidiRIzz logic) ---
    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.src === choiceTwo.src) {
                setMatchedPairs(prev => prev + 1);

                if (isChallengeMode) {
                    // --- Challenge Mode match logic ---
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
                    // --- Normal Mode match logic ---
                    setCards((prev) =>
                        prev.map((card) =>
                            card.src === choiceOne.src ? { ...card, matched: true } : card
                        )
                    );
                    resetTurn();
                }
            } else {
                // --- No match ---
                setTimeout(resetTurn, 1000);
            }
        }
    }, [choiceOne, choiceTwo, isChallengeMode, getNewCard, cards, maxTime]);

    // --- Win Condition (Normal Mode) (from Challenge, merged with SkibidiRIzz data) ---
    useEffect(() => {
        if (!isChallengeMode && gameData.length > 0 && cards.length > 0 && !gameWon && cards.every((card) => card.matched)) {
            setGameWon(true);
            winSound.play().catch(e => console.error("Win sound error:", e));
            const accuracy = turns > 0 ? Math.round((matchedPairs / turns) * 100) : 100;
            onGameComplete({
                score: matchedPairs * 100 - (turns * 10),
                matchedCount: matchedPairs,
                attempts: turns,
                accuracy: accuracy,
                status: 'COMPLETED',
            });
        }
    }, [cards, isChallengeMode, gameData.length, gameWon, matchedPairs, turns, onGameComplete, winSound]);
    
    // --- Music (from both) ---
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

    // --- Card Rendering (from SkibidiRIzz) ---
    const renderFlippedCardContent = (card) => {
        const gameMode = (gameModeFlag?.trim().toLowerCase()) || 'easy';

        // In Challenge mode, always show image
        if (isChallengeMode) {
             return <img src={card.src} alt={card.word} className="card-image" />;
        }

        // In Normal mode, use difficulty flag
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

    // --- MERGED JSX ---
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
                // --- Nickname Screen (from both) ---
                <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
                    <Typography variant="h3" mb={3} style={{ fontWeight: "bold", color: "#3f51b5" }}>
                        🎮 Enter Your Nickname
                    </Typography>
                    <input type="text" placeholder="Enter nickname..." value={nickname} onChange={(e) => setNickname(e.target.value)}
                            style={{ padding: "20px", fontSize: "28px", borderRadius: "12px", border: "2px solid #3f51b5", marginBottom: "30px", width: "350px", textAlign: "center" }}
                    />
                    <Button variant="contained" size="large"
                            style={{ fontSize: "20px", padding: "12px 24px", backgroundColor: "#f06292", color: "#fff", fontWeight: "bold" }}
                            onClick={() => { if (nickname.trim() || isChallengeMode) setGameStarted(true); }} // Allow challenge mode to start without nickname
                    >
                        🚀 Start Game
                    </Button>
                </Box>
            ) : (
                <>
                    {/* --- Header (Merged) --- */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" maxWidth="1000px" mb={2}>
                        <Button variant="contained"
                                style={{ backgroundColor: "#607d8b", color: "white", fontWeight: "bold", fontSize: "1.1rem", padding: "12px 24px", borderRadius: "8px" }}
                                onClick={() => navigate(isChallengeMode ? "/student-challenges" : "/student-homepage")} // Merged exit URL
                        >
                            ⬅ EXIT
                        </Button>
                        <Typography variant="h6" style={{ color: "white" }}>
                            👤 Player: <strong>{isChallengeMode ? "Challenger" : nickname}</strong> {/* Merged name logic */}
                        </Typography>
                    </Box>

                    {/* --- Title (Merged) --- */}
                    <Typography variant="h2" className="game-title" gutterBottom>
                        🌟 {isChallengeMode ? 'Challenge Puzzle' : 'Memory Puzzle'} 🌙
                    </Typography>
                    
                    {/* --- Timer Bar (from Challenge) --- */}
                    {isChallengeMode && (
                        <Box sx={{ width: '100%', maxWidth: '500px', my: 2, px: 1 }}>
                                <LinearProgress variant="determinate" value={(timeLeft / maxTime) * 100} sx={{ height: '20px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { backgroundColor: '#f06292' } }} />
                        </Box>
                    )}

                    {/* --- Restart Button (from SkibidiRIzz, now conditional) --- */}
                    {!isChallengeMode && !gameWon && (
                        <Box display="flex" justifyContent="center" gap={5} mb={5}>
                            <Button variant="contained" className="restart-button" onClick={shuffleCards}>
                                🔄 Restart
                            </Button>
                        </Box>
                    )}

                    {/* --- Win/Lose Screen (Merged) --- */}
                    {gameWon ? (
                        <Box textAlign="center" mt={4}>
                            <Typography className="win-message">
                                {isChallengeMode ? `⌛ Time's Up!` : `🎉 You matched all cards, ${nickname}! 🎉`}
                            </Typography>
                            <Typography variant="h5" color="white" mt={2}>
                                {isChallengeMode ? `Final Score: ${score}` : `Total Turns: ${turns}`}
                            </Typography>
                            <Button variant="contained" className="restart-button" onClick={shuffleCards} sx={{mt: 3}}>
                                🔄 Play Again
                            </Button>
                            {/* Confetti (from SkibidiRIzz, now conditional) */}
                            {!isChallengeMode && (
                                <div className="confetti">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}>
                                            {Math.random() > 0.5 ? "🌟" : "✨"}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Box>
                    ) : (
                        // --- Active Game Area (Merged) ---
                        <>
                            {popupWord && <div className="popup-word">{popupWord}</div>}
                            
                            <Typography className="progress-score">
                                {isChallengeMode ? `Score: ${score}` : `Matched Pairs: ${matchedPairs} / ${totalPairs}`}
                            </Typography>

                            <Box className="card-grid" sx={{ 
                                display: "grid", 
                                // Merged grid logic
                                gridTemplateColumns: `repeat(${isChallengeMode ? 4 : (totalPairs > 6 ? 4 : 3)}, 1fr)`, 
                                gap: 2, 
                                maxWidth: "500px", 
                                margin: "20px auto" 
                            }}>
                                {cards.map((card) => {
                                    const isFlipped = card === choiceOne || card === choiceTwo || card.matched;
                                    return (
                                        <div key={card.id} className={`card ${isFlipped ? "flipped" : ""}`}
                                            onClick={() => { if (!disabled && !isFlipped) handleChoice(card); }} // Using handleChoice
                                        >
                                            {/* Using renderFlippedCardContent */}
                                            {isFlipped ? ( renderFlippedCardContent(card) ) : ( <div className="card-back">🪐</div> )}
                                        </div>
                                    );
                                })}
                            </Box>
                            <Typography className="turn-counter">Turns: {turns}</Typography>
                            {/* Mascot (from SkibidiRIzz, now conditional) */}
                            {!isChallengeMode && <div className="floating-mascot">🌙 You're doing great!</div>}
                        </>
                    )}
                </>
            )}
        </Box>
    );
}import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography, LinearProgress } from "@mui/material";
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";

// --- MERGED SIGNATURE ---
// Accepts props from FlipMatchingGame (which passes both)
export default function MemoryGame({ 
    gameData = [], 
    onGameComplete = () => {}, 
    activityDetails = {}, 
    isChallengeMode = false 
}) {

    // --- MERGED STATE ---
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
    
    // --- Challenge Mode State (from Challenge) ---
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [maxTime, setMaxTime] = useState(30);
    const wordBank = useRef([...gameData]);

    // --- MERGED AUDIO ---
    const backgroundMusic = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/bgmusic.mp3`), []);
    const winSound = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/win.mp3`), []);
    const loseSound = useMemo(() => new Audio(`${MEDIA_BASE_URL}sounds/lose.ogg`), []); // Kept from Challenge

    // --- Props and Refs ---
    const navigate = useNavigate();
    const gameModeFlag = activityDetails?.flagA; // From SkibidiRIzz
    const totalPairs = gameData.length; // From SkibidiRIzz

    // --- Challenge Mode Helper (from Challenge) ---
    const getNewCard = useCallback((currentCardSrcs) => {
        const available = wordBank.current.filter(item => !currentCardSrcs.includes(item.src));
        if (available.length === 0) {
            return wordBank.current[Math.floor(Math.random() * wordBank.current.length)];
        }
        return available[Math.floor(Math.random() * available.length)];
    }, []);

    // --- MERGED shuffleCards ---
    const shuffleCards = useCallback(() => {
        const gameMode = (gameModeFlag?.trim().toLowerCase()) || 'easy'; // From SkibidiRIzz

        const sounds = gameData.reduce((acc, item) => {
            if (item.soundSrc) acc[item.src] = new Audio(item.soundSrc);
            return acc;
        }, {});
        setLabelSounds(sounds);

        let cardSet = [];
        
        if (isChallengeMode) {
            // --- Challenge Mode Logic (from Challenge) ---
            const uniqueCards = [...new Map(gameData.map(item => [item.src, item])).values()];
            const initialCards = uniqueCards.slice(0, 8);
            cardSet = [...initialCards, ...initialCards];
        
        } else {
            // --- Normal Mode Logic (from SkibidiRIzz) ---
            if (gameMode === 'medium') {
                const imageCards = gameData.map(item => ({ ...item, displayType: 'image' }));
                const textCards = gameData.map(item => ({ ...item, displayType: 'text' }));
                cardSet = [...imageCards, ...textCards];
            } else { // 'easy' or 'hard'
                cardSet = [...gameData, ...gameData];
            }
        }

        const shuffled = cardSet
            .sort(() => Math.random() - 0.5)
            .map((card) => ({
                ...card,
                id: Math.random(),
                matched: false
            }));

        // --- Reset state (from both) ---
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
        }
    }, [gameData, isChallengeMode, gameModeFlag]);

    // --- handleChoice (from Challenge) ---
    const handleChoice = (card) => {
        if (!disabled) {
            if (card === choiceOne) return;
            labelSounds[card.src]?.play().catch(e => console.error("Sound error:", e));
            setPopupWord(card.word);
            setTimeout(() => setPopupWord(null), 1200);
            choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
        }
    };

    // --- resetTurn (from both) ---
    const resetTurn = () => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setTurns((prev) => prev + 1);
        setDisabled(false);
    };
    
    // --- Initial Shuffle (from both) ---
    useEffect(() => {
        if (gameData.length > 0) {
            shuffleCards();
        }
    }, [gameData, shuffleCards]);

    // --- Timer Logic (from Challenge) ---
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

    // --- Main Game Logic (from Challenge, merged with SkibidiRIzz logic) ---
    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.src === choiceTwo.src) {
                setMatchedPairs(prev => prev + 1);

                if (isChallengeMode) {
                    // --- Challenge Mode match logic ---
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
                    // --- Normal Mode match logic ---
                    setCards((prev) =>
                        prev.map((card) =>
                            card.src === choiceOne.src ? { ...card, matched: true } : card
                        )
                    );
                    resetTurn();
                }
            } else {
                // --- No match ---
                setTimeout(resetTurn, 1000);
            }
        }
    }, [choiceOne, choiceTwo, isChallengeMode, getNewCard, cards, maxTime]);

    // --- Win Condition (Normal Mode) (from Challenge, merged with SkibidiRIzz data) ---
    useEffect(() => {
        if (!isChallengeMode && gameData.length > 0 && cards.length > 0 && !gameWon && cards.every((card) => card.matched)) {
            setGameWon(true);
            winSound.play().catch(e => console.error("Win sound error:", e));
            const accuracy = turns > 0 ? Math.round((matchedPairs / turns) * 100) : 100;
            onGameComplete({
                score: matchedPairs * 100 - (turns * 10),
                matchedCount: matchedPairs,
                attempts: turns,
                accuracy: accuracy,
                status: 'COMPLETED',
            });
        }
    }, [cards, isChallengeMode, gameData.length, gameWon, matchedPairs, turns, onGameComplete, winSound]);
    
    // --- Music (from both) ---
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

    // --- Card Rendering (from SkibidiRIzz) ---
    const renderFlippedCardContent = (card) => {
        const gameMode = (gameModeFlag?.trim().toLowerCase()) || 'easy';

        // In Challenge mode, always show image
        if (isChallengeMode) {
             return <img src={card.src} alt={card.word} className="card-image" />;
        }

        // In Normal mode, use difficulty flag
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

    // --- MERGED JSX ---
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
                // --- Nickname Screen (from both) ---
                <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
                    <Typography variant="h3" mb={3} style={{ fontWeight: "bold", color: "#3f51b5" }}>
                        🎮 Enter Your Nickname
                    </Typography>
                    <input type="text" placeholder="Enter nickname..." value={nickname} onChange={(e) => setNickname(e.target.value)}
                            style={{ padding: "20px", fontSize: "28px", borderRadius: "12px", border: "2px solid #3f51b5", marginBottom: "30px", width: "350px", textAlign: "center" }}
                    />
                    <Button variant="contained" size="large"
                            style={{ fontSize: "20px", padding: "12px 24px", backgroundColor: "#f06292", color: "#fff", fontWeight: "bold" }}
                            onClick={() => { if (nickname.trim() || isChallengeMode) setGameStarted(true); }} // Allow challenge mode to start without nickname
                    >
                        🚀 Start Game
                    </Button>
                </Box>
            ) : (
                <>
                    {/* --- Header (Merged) --- */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" maxWidth="1000px" mb={2}>
                        <Button variant="contained"
                                style={{ backgroundColor: "#607d8b", color: "white", fontWeight: "bold", fontSize: "1.1rem", padding: "12px 24px", borderRadius: "8px" }}
                                onClick={() => navigate(isChallengeMode ? "/student-challenges" : "/student-homepage")} // Merged exit URL
                        >
                            ⬅ EXIT
                        </Button>
                        <Typography variant="h6" style={{ color: "white" }}>
                            👤 Player: <strong>{isChallengeMode ? "Challenger" : nickname}</strong> {/* Merged name logic */}
                        </Typography>
                    </Box>

                    {/* --- Title (Merged) --- */}
                    <Typography variant="h2" className="game-title" gutterBottom>
                        🌟 {isChallengeMode ? 'Challenge Puzzle' : 'Memory Puzzle'} 🌙
                    </Typography>
                    
                    {/* --- Timer Bar (from Challenge) --- */}
                    {isChallengeMode && (
                        <Box sx={{ width: '100%', maxWidth: '500px', my: 2, px: 1 }}>
                                <LinearProgress variant="determinate" value={(timeLeft / maxTime) * 100} sx={{ height: '20px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { backgroundColor: '#f06292' } }} />
                        </Box>
                    )}

                    {/* --- Restart Button (from SkibidiRIzz, now conditional) --- */}
                    {!isChallengeMode && !gameWon && (
                        <Box display="flex" justifyContent="center" gap={5} mb={5}>
                            <Button variant="contained" className="restart-button" onClick={shuffleCards}>
                                🔄 Restart
                            </Button>
                        </Box>
                    )}

                    {/* --- Win/Lose Screen (Merged) --- */}
                    {gameWon ? (
                        <Box textAlign="center" mt={4}>
                            <Typography className="win-message">
                                {isChallengeMode ? `⌛ Time's Up!` : `🎉 You matched all cards, ${nickname}! 🎉`}
                            </Typography>
                            <Typography variant="h5" color="white" mt={2}>
                                {isChallengeMode ? `Final Score: ${score}` : `Total Turns: ${turns}`}
                            </Typography>
                            <Button variant="contained" className="restart-button" onClick={shuffleCards} sx={{mt: 3}}>
                                🔄 Play Again
                            </Button>
                            {/* Confetti (from SkibidiRIzz, now conditional) */}
                            {!isChallengeMode && (
                                <div className="confetti">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}>
                                            {Math.random() > 0.5 ? "🌟" : "✨"}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Box>
                    ) : (
                        // --- Active Game Area (Merged) ---
                        <>
                            {popupWord && <div className="popup-word">{popupWord}</div>}
                            
                            <Typography className="progress-score">
                                {isChallengeMode ? `Score: ${score}` : `Matched Pairs: ${matchedPairs} / ${totalPairs}`}
                            </Typography>

                            <Box className="card-grid" sx={{ 
                                display: "grid", 
                                // Merged grid logic
                                gridTemplateColumns: `repeat(${isChallengeMode ? 4 : (totalPairs > 6 ? 4 : 3)}, 1fr)`, 
                                gap: 2, 
                                maxWidth: "500px", 
                                margin: "20px auto" 
                            }}>
                                {cards.map((card) => {
                                    const isFlipped = card === choiceOne || card === choiceTwo || card.matched;
                                    return (
                                        <div key={card.id} className={`card ${isFlipped ? "flipped" : ""}`}
                                            onClick={() => { if (!disabled && !isFlipped) handleChoice(card); }} // Using handleChoice
                                        >
                                            {/* Using renderFlippedCardContent */}
                                            {isFlipped ? ( renderFlippedCardContent(card) ) : ( <div className="card-back">🪐</div> )}
                                        </div>
                                    );
                                })}
                            </Box>
                            <Typography className="turn-counter">Turns: {turns}</Typography>
                            {/* Mascot (from SkibidiRIzz, now conditional) */}
                            {!isChallengeMode && <div className="floating-mascot">🌙 You're doing great!</div>}
                        </>
                    )}
                </>
            )}
        </Box>
    );
}