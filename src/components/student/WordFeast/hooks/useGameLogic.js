// src/components/student/WordFeast/hooks/useGameLogic.js
import { useState, useEffect } from 'react';

const SAVE_GAME_KEY = 'wordfeast-save-data';

export const useGameLogic = (gameData, width, height) => {
    const [isLoading, setIsLoading] = useState(true);

    const loadInitialState = () => {
        try {
            const savedState = localStorage.getItem(SAVE_GAME_KEY);
            if (!savedState) return null;
            const parsed = JSON.parse(savedState);
            
            if (parsed.cagedWords) {
                parsed.cagedWords = parsed.cagedWords.map(cage => ({
                    ...cage,
                    velocity: cage.velocity || { x: 0, y: 0 }
                }));
            }
            if(parsed.player?.position) {
                 parsed.player.position = {
                    x: Math.min(width, Math.max(0, parsed.player.position.x)),
                    y: Math.min(height, Math.max(0, parsed.player.position.y))
                };
            }
            return parsed;
        } catch (error) {
            console.error("Failed to load saved game state:", error);
            localStorage.removeItem(SAVE_GAME_KEY);
            return null;
        }
    };

    const initialState = loadInitialState();
    
    const [score, setScore] = useState(initialState?.score ?? 0);
    const [player, setPlayer] = useState(initialState?.player ?? {
        position: { x: width / 2, y: height / 2 },
        velocity: { x: 0, y: 0 },
        size: 'small',
    });
    const [cagedWords, setCagedWords] = useState(initialState?.cagedWords ?? []);
    const [monster, setMonster] = useState(initialState?.monster ?? null);
    const [messages, setMessages] = useState([]);
    // --- THIS IS THE FIX: Ensure fishLogics is part of the state managed by this hook ---
    const [fishLogics, setFishLogics] = useState([]); 

    // Effect to set up the level from gameData
    useEffect(() => {
        const setupAndPreload = async () => {
            if (!gameData?.question || !gameData?.choices) {
                setIsLoading(false);
                return;
            }
            if (!initialState) {
                setMonster({
                    word: gameData.question.word,
                    audioUrl: gameData.question.soundSrc,
                    position: { x: width / 2, y: height / 2 },
                });

                const newCagedWords = gameData.choices.map(choice => {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 150 + Math.random() * (width / 2 - 200);
                    return {
                        id: choice.id,
                        word: choice.word,
                        isCorrect: choice.isCorrect,
                        audioUrl: choice.soundSrc,
                        strength: choice.strength || 1,
                        position: {
                            x: width / 2 + Math.cos(angle) * distance,
                            y: height / 2 + Math.sin(angle) * distance,
                        },
                        velocity: { x: 0, y: 0 },
                    };
                });
                setCagedWords(newCagedWords);
            }
            try {
                const allGameObjects = [monster, ...cagedWords];
                const audioUrls = allGameObjects.map(obj => obj?.audioUrl).filter(Boolean);
                const preloadPromises = audioUrls.map(url =>
                    new Promise((resolve) => {
                        const audio = new Audio(url);
                        audio.addEventListener('canplaythrough', () => resolve());
                        audio.addEventListener('error', () => resolve()); 
                        setTimeout(() => resolve(), 5000);
                    })
                );
                await Promise.all(preloadPromises);
            } catch (error) {
                console.error("Error preloading assets:", error);
            } finally {
                 setIsLoading(false);
            }
        };

        setupAndPreload();
    }, [gameData, width, height]);

    // Effect to save game progress
    useEffect(() => {
        if (!isLoading && monster) {
            const gameState = { score, player, cagedWords, monster };
            localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
        }
    }, [score, player, cagedWords, monster, isLoading]);

    return {
        isLoading,
        score, setScore,
        player, setPlayer,
        cagedWords, setCagedWords,
        monster, setMonster,
        messages, setMessages,
        fishLogics, setFishLogics, // --- FIX: Export the state and setter
    };
};