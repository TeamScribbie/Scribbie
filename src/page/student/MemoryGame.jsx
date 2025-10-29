import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/memory.css";
import { Box, Button, Typography, LinearProgress, Chip, Paper } from "@mui/material";
import { MEDIA_BASE_URL } from "../../config/apiConfig.js";
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import FlashOnIcon from '@mui/icons-material/FlashOn';

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
    const [combo, setCombo] = useState(0);
    const [particles, setParticles] = useState([]);
    const [glowCards, setGlowCards] = useState({}); // Track glow effect for cards
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
        setCombo(0);
        setParticles([]);
        if (isChallengeMode) {
            setMaxTime(30);
            setTimeLeft(30);
            setGameStarted(true);
        } else {
            setGameStarted(false);
        }
    }, [gameData, isChallengeMode]);

    const createParticle = (x, y) => {
        const id = Date.now() + Math.random();
        setParticles(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 1000);
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
                // Match! - Green glow
                setGlowCards({
                    [choiceOne.id]: 'match',
                    [choiceTwo.id]: 'match'
                });
                
                setMatchedPairs(prev => prev + 1);
                setCombo(prev => prev + 1);

                setTimeout(() => {
                    setGlowCards({});
                }, 800);

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
                        createParticle(choiceOne.x, choiceOne.y);
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
                // Mismatch! - Red glow
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
                backgroundImage: 'url(/src/assets/memorygame-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                padding: { xs: 1, md: 2 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: 'relative',
                overflow: 'auto'
            }}
        >
            {/* Floating particles */}
            {particles.map(p => (
                <div key={p.id} className="particle" style={{ left: p.x, top: p.y }}>⭐</div>
            ))}

            {!gameStarted ? (
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
                        onKeyPress={(e) => e.key === 'Enter' && nickname.trim() && setGameStarted(true)}
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
                        disabled={!nickname.trim()}
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
                        onClick={() => { if (nickname.trim()) setGameStarted(true); }}
                    >
                        <FlashOnIcon sx={{ mr: 1 }} /> Start Game
                    </Button>
                </Paper>
            ) : (
                <>
                    {/* Header */}
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
                            onClick={() => navigate("/student-homepage")}
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

                    {/* Title */}
                    <Typography 
                        variant="h3" 
                        sx={{
                            fontWeight: "900",
                            background: 'linear-gradient(135deg, #FFD966 0%, #FDB10D 50%, #f9b121 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 4px 20px rgba(253, 177, 13, 0.3)',
                            mb: 2,
                            fontFamily: 'Luckiest Guy, cursive',
                            letterSpacing: '2px',
                            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
                        }}
                    >
                        {isChallengeMode ? '⚡ CHALLENGE MODE ⚡' : '✨ MEMORY PUZZLE ✨'}
                    </Typography>

                    {/* Main Game Area - Stats on Side */}
                    <Box 
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', lg: 'row' },
                            gap: 3,
                            width: '100%',
                            maxWidth: '1400px',
                            alignItems: { xs: 'center', lg: 'flex-start' },
                            justifyContent: 'center'
                        }}
                    >
                        {/* Left Side Stats Cards */}
                        <Box 
                            sx={{
                                display: { xs: 'flex', lg: 'block' },
                                flexDirection: { xs: 'row', lg: 'column' },
                                gap: 2,
                                flexWrap: { xs: 'wrap', lg: 'nowrap' },
                                justifyContent: 'center',
                                order: { xs: 1, lg: 0 }
                            }}
                        >
                        {/* Score/Matches Card */}
                        <Paper 
                            elevation={12}
                            sx={{
                                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                padding: '14px 24px',
                                borderRadius: '20px',
                                minWidth: '140px',
                                textAlign: 'center',
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
                            <StarIcon sx={{ fontSize: 32, color: '#fff', mb: 0.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: '900', fontFamily: 'Comic Neue, cursive', fontSize: '1.6rem', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
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
                                padding: '14px 24px',
                                borderRadius: '20px',
                                minWidth: '140px',
                                textAlign: 'center',
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
                            <FavoriteIcon sx={{ fontSize: 32, color: '#fff', mb: 0.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: '900', fontFamily: 'Comic Neue, cursive', fontSize: '1.6rem', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
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
                                    padding: '14px 24px',
                                    borderRadius: '20px',
                                    minWidth: '140px',
                                    textAlign: 'center',
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
                                <FlashOnIcon sx={{ fontSize: 32, color: '#fff', mb: 0.5, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', animation: 'spin 2s linear infinite' }} />
                                <Typography variant="h5" sx={{ color: '#fff', fontWeight: '900', fontFamily: 'Comic Neue, cursive', fontSize: '1.6rem', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                    {combo}x
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    COMBO!
                                </Typography>
                            </Paper>
                        )}
                        </Box>

                        {/* Center Area - Game Cards */}
                        <Box 
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
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
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
                                                borderRadius: '14px', 
                                                backgroundColor: 'rgba(255,255,255,0.25)',
                                                border: '3px solid rgba(255, 255, 255, 0.6)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                overflow: 'visible',
                                                '& .MuiLinearProgress-bar': { 
                                                    background: timeLeft <= 10 
                                                        ? 'linear-gradient(90deg, #ff6b6b 0%, #ee5a52 50%, #ff6b6b 100%)'
                                                        : 'linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #4ade80 100%)',
                                                    borderRadius: '14px',
                                                    boxShadow: timeLeft <= 10
                                                        ? '0 0 20px rgba(255, 107, 107, 0.6)'
                                                        : '0 0 20px rgba(34, 197, 94, 0.5)',
                                                    transition: 'all 0.3s ease'
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
                                </Paper>
                            ) : (
                                <>
                                    {/* Word Popup */}
                                    {popupWord && (
                                <Paper
                                    elevation={12}
                                    className="popup-word-modern"
                                    sx={{
                                        position: 'fixed',
                                        top: '50%',
                                        right: '30px',
                                        transform: 'translateY(-50%)',
                                        background: 'linear-gradient(135deg, #FFD966 0%, #FDB10D 100%)',
                                        color: '#451513',
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        fontWeight: '900',
                                        padding: { xs: '20px 30px', md: '28px 42px' },
                                        borderRadius: '25px',
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

                            {/* Card Grid */}
                            <Box 
                                className="card-grid-modern" 
                                sx={{ 
                                    display: "grid", 
                                    gridTemplateColumns: "repeat(4, 1fr)", 
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
                                                aspectRatio: '0.75',
                                                maxHeight: { xs: '95px', sm: '110px', md: '125px' },
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
                                                animation: `cardDrop 0.5s ease-out ${index * 0.05}s backwards`,
                                                boxShadow: glowType === 'match' 
                                                    ? '0 0 30px 8px rgba(34, 197, 94, 0.8), 0 0 50px 12px rgba(74, 222, 128, 0.6)'
                                                    : glowType === 'mismatch'
                                                    ? '0 0 30px 8px rgba(239, 68, 68, 0.8), 0 0 50px 12px rgba(248, 113, 113, 0.6)'
                                                    : isFlipped ? '0 8px 20px rgba(0, 0, 0, 0.2)' : '0 6px 16px rgba(0, 0, 0, 0.15)',
                                                '&:hover': !disabled && !isFlipped ? {
                                                    transform: 'translateY(-8px) scale(1.05)',
                                                    boxShadow: '0 12px 28px rgba(102, 126, 234, 0.5)',
                                                    background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)'
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
                                                <img 
                                                    src={card.src} 
                                                    alt={card.word} 
                                                    style={{
                                                        width: '90%',
                                                        height: '90%',
                                                        objectFit: 'contain',
                                                        borderRadius: '15px',
                                                        animation: 'flipIn 0.4s ease-out'
                                                    }}
                                                />
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