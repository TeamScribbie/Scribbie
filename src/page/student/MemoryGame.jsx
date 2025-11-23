import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography, LinearProgress, Chip, Paper } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import memoryGameBg from '../../assets/memorygame-bg.png';

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
    const [combo, setCombo] = useState(0);
    const [particles, setParticles] = useState([]);
    const [glowCards, setGlowCards] = useState({}); // Track glow effect for cards
    const wordBank = useRef([...gameData]);

    // --- MERGED AUDIO ---
    const backgroundMusic = useMemo(() => new Audio('/sounds/bgmusic.mp3'), []);
    const winSound = useMemo(() => new Audio('/sounds/win.mp3'), []);
    const loseSound = useMemo(() => new Audio('/sounds/win.mp3'), []); // Using win sound as fallback

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
        setCombo(0);
        setParticles([]);
        if (isChallengeMode) {
            setMaxTime(30);
            setTimeLeft(30);
        }
    }, [gameData, isChallengeMode, gameModeFlag]);

    // --- createParticle function (from Challenge) ---
    const createParticle = (x, y) => {
        const id = Date.now() + Math.random();
        setParticles(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 1000);
    };

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

    // --- Main Game Logic (MERGED) ---
    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.src === choiceTwo.src) {
                // Match! - Green glow
                setGlowCards({
                    [choiceOne.id]: 'match',
                    [choiceTwo.id]: 'match'
                });
                
                setMatchedPairs(prev => prev + 1);
                setCombo(prev => prev + 1);

                if (isChallengeMode) {
                    // --- Challenge Mode match logic ---
                    setScore(prev => prev + 100);
                    const newMaxTime = Math.max(maxTime - 1.0, 8);
                    setMaxTime(newMaxTime);
                    setTimeLeft(newMaxTime); 
                }

                // After a short delay, clear glow and mark cards as matched
                setTimeout(() => {
                    setGlowCards({});

                    if (isChallengeMode) {
                        // Mark only this pair as matched; board will be refreshed
                        // later when ALL cards are matched.
                        setCards(prevCards =>
                            prevCards.map(card =>
                                (card.id === choiceOne.id || card.id === choiceTwo.id)
                                    ? { ...card, matched: true }
                                    : card
                            )
                        );
                        resetTurn();
                        createParticle(choiceOne.x, choiceOne.y);
                    } else {
                        // --- Normal Mode match logic ---
                        setCards(prev =>
                            prev.map(card =>
                                card.src === choiceOne.src ? { ...card, matched: true } : card
                            )
                        );
                        resetTurn();
                    }
                }, 800);
            } else {
                // Mismatch! - Red glow (from Challenge)
                setGlowCards({
                    [choiceOne.id]: 'mismatch',
                    [choiceTwo.id]: 'mismatch'
                });
                
                setCombo(0);
                
                setTimeout(() => {
                    setGlowCards({});
                    resetTurn();
                }, 1000);
            }
        }
    }, [choiceOne, choiceTwo, isChallengeMode, maxTime]);

    // --- Challenge Mode: generate a new set only after clearing the current board ---
    useEffect(() => {
        if (!isChallengeMode || cards.length === 0) return;

        const allMatched = cards.every(card => card.matched);
        if (!allMatched) return;

        // Build a fresh challenge board but keep score, time, and matchedPairs
        const uniqueCards = [...new Map(gameData.map(item => [item.src, item])).values()];
        const initialCards = uniqueCards.slice(0, 8);
        const cardSet = [...initialCards, ...initialCards];

        const shuffled = cardSet
            .sort(() => Math.random() - 0.5)
            .map(card => ({
                ...card,
                id: Math.random(),
                matched: false
            }));

        setChoiceOne(null);
        setChoiceTwo(null);
        setCards(shuffled);
        setDisabled(false);
    }, [isChallengeMode, cards, gameData]);

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
             return <img src={card.src} alt={card.word} className="card-image" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />;
        }

        // In Normal mode, use difficulty flag
        switch (gameMode) {
            case 'hard':
                return <div className="card-text">{card.word}</div>;
            case 'medium':
                if (card.displayType === 'image') {
                    return <img src={card.src} alt={card.word} className="card-image" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />;
                } else {
                    return <div className="card-text">{card.word}</div>;
                }
            case 'easy':
            default:
                return <img src={card.src} alt={card.word} className="card-image" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />;
        }
    };

    // --- MERGED JSX (Heavily favors Challenge branch) ---
    return (
        <Box
            className="memory-container"
            sx={{
                minHeight: "100vh",
                backgroundImage: `url(${memoryGameBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                padding: { xs: 2, md: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: 'flex-start',
                gap: 2,
                position: 'relative',
                overflow: 'auto'
            }}
        >
            {/* Floating particles (from Challenge) */}
            {particles.map(p => (
                <div key={p.id} className="particle" style={{ left: p.x, top: p.y }}>⭐</div>
            ))}

            {!gameStarted ? (
                // --- Nickname Screen (from Challenge) ---
                <Paper
                    elevation={12}
                    sx={{
                        p: 6,
                        mt: 10,
                        borderRadius: '30px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        textAlign: 'center',
                        maxWidth: '500px',
                        animation: 'fadeInScale 0.6s ease-out'
                    }}
                >
                    <EmojiEventsIcon sx={{ fontSize: 80, color: '#FDB10D', mb: 2 }} />
                    <Typography variant="h3" mb={3} sx={{ fontWeight: "900", background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Comic Neue, cursive' }}>
                        Memory Challenge
                    </Typography>
                    <input 
                        type="text" 
                        placeholder="Enter your name..." 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (nickname.trim() || isChallengeMode) && setGameStarted(true)}
                        style={{ 
                            padding: "18px 24px", 
                            fontSize: "1.2rem", 
                            borderRadius: "15px", 
                            border: "3px solid #667eea", 
                            marginBottom: "30px", 
                            width: "100%", 
                            textAlign: "center",
                            fontFamily: 'Comic Neue, cursive',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                        }}
                    />
                    <Button 
                        variant="contained" 
                        size="large" 
                        fullWidth
                        disabled={!nickname.trim() && !isChallengeMode} // Allow challenge mode to start without nickname
                        sx={{
                            fontSize: "1.3rem", 
                            padding: "16px", 
                            background: 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)',
                            color: '#451513', 
                            fontWeight: "900",
                            borderRadius: '15px',
                            fontFamily: 'Comic Neue, cursive',
                            boxShadow: '0 8px 20px rgba(253, 177, 13, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 24px rgba(253, 177, 13, 0.5)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => { if (nickname.trim() || isChallengeMode) setGameStarted(true); }}
                    >
                        <FlashOnIcon sx={{ mr: 1 }} /> Start Game
                    </Button>
                </Paper>
            ) : (
                <>
                    {/* Header (from Challenge) */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" maxWidth="1200px" mb={2} px={2}>
                        <Button 
                            variant="contained" 
                            startIcon={<span style={{ fontSize: '1.2rem' }}>⬅</span>}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: "white", 
                                fontWeight: "900", 
                                fontSize: { xs: '0.9rem', md: '1rem' }, 
                                padding: { xs: '10px 20px', md: '12px 28px' }, 
                                borderRadius: "20px",
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                                fontFamily: 'Comic Neue, cursive',
                                textTransform: 'none',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
                                    transform: 'translateY(-3px) scale(1.02)',
                                    boxShadow: '0 10px 28px rgba(102, 126, 234, 0.6)',
                                    border: '2px solid rgba(255, 255, 255, 0.5)',
                                }
                            }}
                            onClick={() => navigate(isChallengeMode ? "/student-challenges" : "/student-homepage")} // Merged exit URL
                        >
                            Exit Game
                        </Button>
                        <Paper 
                            elevation={12}
                            sx={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                padding: { xs: '10px 20px', md: '12px 28px' },
                                borderRadius: '25px',
                                border: '3px solid #FDB10D',
                                boxShadow: '0 6px 20px rgba(253, 177, 13, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 8px 24px rgba(253, 177, 13, 0.5)',
                                }
                            }}
                        >
                            <Box 
                                sx={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}
                            >
                                👤
                            </Box>
                            <Typography variant="h6" sx={{ color: "#451513", fontWeight: 'bold', fontFamily: 'Comic Neue, cursive', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                               {isChallengeMode ? "Challenger" : nickname}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Title (from Challenge) */}
                    <Typography 
                        variant="h3" 
                        sx={{
                            fontWeight: "900",
                            background: 'linear-gradient(135deg, #FFD966 0%, #FDB10D 50%, #f9b121 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            mb: 2,
                            fontFamily: 'Luckiest Guy, cursive',
                            letterSpacing: '2px',
                            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
                        }}
                    >
                        {isChallengeMode ? '⚡ CHALLENGE MODE ⚡' : '✨ MEMORY PUZZLE ✨'}
                    </Typography>

                    {/* Main Game Area - Stats on Side (from Challenge) */}
                    <Box 
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', lg: 'row' },
                            gap: { xs: 2.5, md: 3 },
                            width: '100%',
                            maxWidth: '1400px',
                            alignItems: { xs: 'center', lg: 'flex-start' },
                            justifyContent: 'center',
                            p: { xs: 2, md: 3 },
                            borderRadius: { xs: 3, md: 4 },
                            background: 'rgba(255, 255, 255, 0.18)',
                            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.28)',
                            backdropFilter: 'blur(16px)',
                            border: '2px solid rgba(255, 255, 255, 0.35)'
                        }}
                    >
                        {/* Left Side Stats Cards (from Challenge) */}
                        <Box 
                            sx={{
                                display: { xs: 'flex', lg: 'block' },
                                flexDirection: { xs: 'row', lg: 'column' },
                                gap: 1.5,
                                flexWrap: { xs: 'wrap', lg: 'nowrap' },
                                justifyContent: 'center',
                                alignItems: { xs: 'stretch', lg: 'stretch' },
                                width: { xs: '100%', lg: '210px' },
                                order: { xs: 1, lg: 0 }
                            }}
                        >
                        {/* Score/Matches Card */}
                        <Paper 
                            elevation={12}
                            sx={{
                                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                padding: { xs: '10px 14px', md: '12px 18px' },
                                borderRadius: '16px',
                                minWidth: '120px',
                                textAlign: 'center',
                                flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 140px', lg: '0 0 auto' },
                                border: '3px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.5)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-4px) scale(1.05)',
                                    boxShadow: '0 12px 32px rgba(34, 197, 94, 0.6)',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                    animation: 'shimmer 3s infinite'
                                }
                            }}
                        >
                            <StarIcon sx={{ fontSize: 26, color: '#fff', mb: 0.3, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: '900', fontFamily: 'Comic Neue, cursive', fontSize: { xs: '1.1rem', md: '1.2rem' }, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                {isChallengeMode ? score : `${matchedPairs}/${gameData.length}`}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                {isChallengeMode ? 'Score' : 'Matches'}
                            </Typography>
                        </Paper>

                        {/* Turns Card */}
                        <Paper 
                            elevation={12}
                            sx={{
                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                padding: { xs: '10px 14px', md: '12px 18px' },
                                borderRadius: '16px',
                                minWidth: '120px',
                                textAlign: 'center',
                                flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 140px', lg: '0 0 auto' },
                                border: '3px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.5)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-4px) scale(1.05)',
                                    boxShadow: '0 12px 32px rgba(59, 130, 246, 0.6)',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                    animation: 'shimmer 3s infinite 1s'
                                }
                            }}
                        >
                            <FavoriteIcon sx={{ fontSize: 26, color: '#fff', mb: 0.3, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: '900', fontFamily: 'Comic Neue, cursive', fontSize: { xs: '1.1rem', md: '1.2rem' }, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                {turns}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                Turns
                            </Typography>
                        </Paper>

                        {/* Combo Card */}
                        {combo > 1 && (
                            <Paper 
                                elevation={16}
                                className="combo-badge"
                                sx={{
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                                    padding: { xs: '10px 14px', md: '12px 18px' },
                                    borderRadius: '16px',
                                    minWidth: '120px',
                                    textAlign: 'center',
                                    flex: { xs: '1 1 100%', sm: '1 1 140px', lg: '0 0 auto' },
                                    border: '3px solid rgba(255, 255, 255, 0.7)',
                                    boxShadow: '0 10px 32px rgba(255, 107, 107, 0.6)',
                                    animation: 'comboPulse 0.8s ease-in-out infinite',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                                        animation: 'shimmer 2s infinite'
                                    }
                                }}
                            >
                                <FlashOnIcon sx={{ fontSize: 26, color: '#fff', mb: 0.3, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', animation: 'spin 2s linear infinite' }} />
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: '900', fontFamily: 'Comic Neue, cursive', fontSize: { xs: '1.1rem', md: '1.2rem' }, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                    {combo}x
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    COMBO!
                                </Typography>
                            </Paper>
                        )}
                        </Box>

                        {/* Center Area - Game Cards (from Challenge) */}
                        <Box 
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                width: '100%',
                                minWidth: 0,
                                order: { xs: 2, lg: 1 }
                            }}
                        >
                            {/* Timer Progress Bar (Challenge Mode) */}
                            {isChallengeMode && (
                                <Box sx={{ width: '100%', maxWidth: '600px', mb: 2, px: 2 }}>
                                    <Box display="flex" justifyContent="center" alignItems="center" mb={1.5}>
                                        <Chip 
                                            icon={<TimerIcon sx={{ 
                                                animation: timeLeft <= 10 ? 'pulse 0.5s ease-in-out infinite' : 'none',
                                                color: '#fff !important'
                                            }} />}
                                            label={`${timeLeft}s`}
                                            sx={{
                                                background: timeLeft <= 10 
                                                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' 
                                                    : 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)',
                                                color: '#fff',
                                                fontWeight: '900',
                                                fontSize: '1.2rem',
                                                padding: '24px 16px',
                                                border: '3px solid rgba(255, 255, 255, 0.6)',
                                                boxShadow: timeLeft <= 10 
                                                    ? '0 6px 20px rgba(255, 107, 107, 0.6)'
                                                    : '0 6px 20px rgba(253, 177, 13, 0.5)',
                                                animation: timeLeft <= 10 ? 'pulse 0.5s ease-in-out infinite' : 'none',
                                                fontFamily: 'Comic Neue, cursive',
                                                '& .MuiChip-label': {
                                                    padding: '0 12px',
                                                    fontSize: '1.2rem',
                                                    fontWeight: '900'
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ position: 'relative' }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={(timeLeft / maxTime) * 100} 
                                            sx={{ 
                                                height: '28px', 
                                                borderRadius: '999px',
                                                background: 'linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(30,64,175,0.9) 50%, rgba(15,23,42,0.7) 100%)',
                                                border: '3px solid rgba(255, 255, 255, 0.4)',
                                                boxShadow: '0 10px 26px rgba(15, 23, 42, 0.7)',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px)',
                                                    backgroundSize: '18px 100%',
                                                    opacity: 0.25,
                                                    pointerEvents: 'none',
                                                    zIndex: 0,
                                                },
                                                '& .MuiLinearProgress-bar': { 
                                                    background: timeLeft <= 10 
                                                        ? 'linear-gradient(90deg, #ff6b6b 0%, #ee5a52 45%, #ff9f7d 100%)'
                                                        : 'linear-gradient(90deg, #4ade80 0%, #22c55e 45%, #a7f3d0 100%)',
                                                    borderRadius: '999px',
                                                    boxShadow: timeLeft <= 10
                                                        ? '0 0 24px rgba(248, 113, 113, 0.9)'
                                                        : '0 0 24px rgba(74, 222, 128, 0.9)',
                                                    transition: 'all 0.25s ease',
                                                    backgroundSize: '32px 32px',
                                                    animation: timeLeft <= 10
                                                        ? 'timerStripeFast 0.6s linear infinite'
                                                        : 'timerStripe 1.5s linear infinite',
                                                    zIndex: 1,
                                                } 
                                            }} 
                                        />
                                        <Typography 
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                                fontFamily: 'Comic Neue, cursive',
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            {timeLeft <= 10 ? '⚡ HURRY! ⚡' : 'Time Remaining'}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {gameWon ? (
                                // --- Win Screen (from Challenge) ---
                                <Paper
                                    elevation={20}
                                    sx={{
                                        textAlign: 'center',
                                        p: 6,
                                        mt: 4,
                                        borderRadius: '30px',
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                        maxWidth: '600px',
                                        animation: 'bounceIn 0.8s ease-out'
                                    }}
                                >
                                    <EmojiEventsIcon sx={{ fontSize: 100, color: '#FDB10D', mb: 2, animation: 'spin 2s linear infinite' }} />
                                    <Typography 
                                        variant="h3" 
                                        sx={{
                                            fontWeight: '900',
                                            background: isChallengeMode 
                                                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                                                : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            mb: 3,
                                            fontFamily: 'Luckiest Guy, cursive'
                                        }}
                                    >
                                        {isChallengeMode ? `⌛ TIME'S UP! ⌛` : `🎉 VICTORY! 🎉`}
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: '#451513', mb: 2, fontFamily: 'Comic Neue, cursive' }}>
                                        {!isChallengeMode && `Amazing work, ${nickname}!`}
                                    </Typography>
                                    
                                    {/* Final Stats */}
                                    <Box display="flex" gap={2} justifyContent="center" mb={3} flexWrap="wrap">
                                        <Chip 
                                            icon={<StarIcon sx={{ color: '#451513 !important', fontSize: '1.5rem' }} />}
                                            label={`Score: ${isChallengeMode ? score : matchedPairs * 100 - turns * 10}`}
                                            sx={{
                                                background: 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)',
                                                color: '#451513',
                                                fontWeight: '900',
                                                fontSize: '1.1rem',
                                                padding: '26px 16px',
                                                border: '3px solid rgba(255, 255, 255, 0.5)',
                                                boxShadow: '0 6px 20px rgba(253, 177, 13, 0.4)',
                                                fontFamily: 'Comic Neue, cursive',
                                                '& .MuiChip-label': {
                                                    fontSize: '1.1rem',
                                                    fontWeight: '900'
                                                }
                                            }}
                                        />
                                        <Chip 
                                            icon={<FavoriteIcon sx={{ color: '#fff !important', fontSize: '1.5rem' }} />}
                                            label={`Turns: ${turns}`}
                                            sx={{
                                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                                color: '#fff',
                                                fontWeight: '900',
                                                fontSize: '1.1rem',
                                                padding: '26px 16px',
                                                border: '3px solid rgba(255, 255, 255, 0.5)',
                                                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                                                fontFamily: 'Comic Neue, cursive',
                                                '& .MuiChip-label': {
                                                    fontSize: '1.1rem',
                                                    fontWeight: '900'
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Button 
                                        variant="contained" 
                                        size="large"
                                        fullWidth
                                        onClick={shuffleCards}
                                        startIcon={<span style={{ fontSize: '1.5rem' }}>🔄</span>}
                                        sx={{
                                            fontSize: '1.4rem',
                                            padding: '18px 24px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: '#fff',
                                            fontWeight: '900',
                                            borderRadius: '20px',
                                            fontFamily: 'Comic Neue, cursive',
                                            boxShadow: '0 10px 28px rgba(102, 126, 234, 0.5)',
                                            border: '3px solid rgba(255, 255, 255, 0.3)',
                                            textTransform: 'none',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
                                                transform: 'translateY(-4px) scale(1.02)',
                                                boxShadow: '0 14px 36px rgba(102, 126, 234, 0.6)',
                                                border: '3px solid rgba(255, 255, 255, 0.5)',
                                            }
                                        }}
                                    >
                                        Play Again
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
                                </Paper>
                            ) : (
                                <>
                                    {/* Word Popup (from Challenge) */}
                                    {popupWord && (
                                        <Paper
                                            elevation={12}
                                            className="popup-word-modern"
                                            sx={{
                                                position: 'fixed',
                                                top: '50%',
                                                left: { xs: '50%', md: 'auto' },
                                                right: { xs: 'auto', md: '30px' },
                                                transform: { xs: 'translate(-50%, -50%)', md: 'translateY(-50%)' },
                                                background: 'linear-gradient(135deg, #FFD966 0%, #FDB10D 100%)',
                                                color: '#451513',
                                                fontSize: { xs: '2.3rem', md: '3.5rem' },
                                                fontWeight: '900',
                                                padding: { xs: '18px 24px', md: '28px 42px' },
                                                borderRadius: '25px',
                                                maxWidth: { xs: '90vw', md: 'none' },
                                                textAlign: 'center',
                                                zIndex: 999,
                                                border: '4px solid rgba(255, 255, 255, 0.5)',
                                                boxShadow: '0 12px 40px rgba(253, 177, 13, 0.5)',
                                                fontFamily: 'Luckiest Guy, cursive',
                                                animation: 'popIn 0.4s ease-out'
                                            }}
                                        >
                                            {popupWord}
                                        </Paper>
                                    )}

                                    {/* Card Grid (from Challenge, but using MERGED grid logic) */}
                                    <Box 
                                        className="card-grid-modern" 
                                        sx={{ 
                                            display: "grid", 
                                            // Merged grid logic
                                            gridTemplateColumns: `repeat(${isChallengeMode ? 4 : (totalPairs > 9 ? 4 : (totalPairs > 6 ? 4 : 3))}, 1fr)`,
                                            gap: { xs: 1, sm: 1.5, md: 2 }, 
                                            maxWidth: { xs: "90%", sm: "520px", md: "600px" }, 
                                            margin: "0 auto",
                                            px: { xs: 1, sm: 1.5 }
                                        }}
                                    >
                                        {cards.map((card, index) => {
                                            const isFlipped = card === choiceOne || card === choiceTwo || card.matched;
                                            const glowType = glowCards[card.id];
                                            
                                            return (
                                                <Paper
                                                    key={card.id}
                                                    elevation={isFlipped ? 12 : 6}
                                                    className={`memory-card ${isFlipped ? "flipped" : ""} ${glowType ? `glow-${glowType}` : ""}`}
                                                    onClick={() => { if (!disabled && !isFlipped) handleChoice(card); }}
                                                    sx={{
                                                        width: '100%',
                                                        aspectRatio: '1',
                                                        // Limit card height relative to viewport so the full grid fits on screen
                                                        maxHeight: { xs: '16vh', sm: '14vh', md: '13vh' },

                                                        background: isFlipped 
                                                            ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        borderRadius: { xs: '16px', md: '20px' },
                                                        cursor: disabled || isFlipped ? 'default' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.3s ease',
                                                        border: { xs: '3px solid rgba(255, 255, 255, 0.5)', md: '4px solid rgba(255, 255, 255, 0.5)' },
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        boxShadow: glowType === 'match' 
                                                            ? '0 0 30px 8px rgba(34, 197, 94, 0.8), 0 0 50px 12px rgba(74, 222, 128, 0.6)'
                                                            : glowType === 'mismatch'
                                                            ? '0 0 30px 8px rgba(239, 68, 68, 0.8), 0 0 50px 12px rgba(248, 113, 113, 0.6)'
                                                            : isFlipped ? '0 8px 20px rgba(0, 0, 0, 0.2)' : '0 6px 16px rgba(0, 0, 0, 0.15)',
                                                        '&:hover': !disabled && !isFlipped ? {
                                                            boxShadow: '0 12px 28px rgba(102, 126, 234, 0.5)',
                                                            background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
                                                            transform: 'translateY(-4px) scale(1.03)'
                                                        } : {},
                                                        '&::before': !isFlipped && !glowType ? {
                                                            content: '""',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: '-100%',
                                                            width: '100%',
                                                            height: '100%',
                                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                            animation: 'shimmer 3s infinite'
                                                        } : {}
                                                    }}
                                                >
                                                    {isFlipped ? (
                                                        // Using renderFlippedCardContent (from SkibidiRIzz)
                                                        renderFlippedCardContent(card)
                                                    ) : (
                                                        <Typography sx={{ 
                                                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, 
                                                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                                                            lineHeight: 1
                                                        }}>
                                                            ✨
                                                        </Typography>
                                                    )}
                                                </Paper>
                                            );
                                        })}
                                    </Box>
                                    {/* Mascot (from SkibidiRIzz, now conditional) */}
                                    {!isChallengeMode && <div className="floating-mascot">🌙 You're doing great!</div>}
                                </>
                            )}
                        </Box>
                        {/* End Center Area */}
                    </Box>
                    {/* End Main Game Area */}
                </>
            )}
        </Box>
    );
}