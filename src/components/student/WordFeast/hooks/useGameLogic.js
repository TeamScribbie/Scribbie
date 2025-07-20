import { useState, useEffect } from 'react';
import { Assets } from 'pixi.js';

import playerSpriteImage from '../game/spritesheets/Player.png';
import Lvl1CageImg from '../game/icons/Lvl1Cage.png';
import Lvl2CageImg from '../game/icons/Lvl2Cage.png';
import Lvl3CageImg from '../game/icons/Lvl3Cage.png';
import BubbleImg from '../game/icons/bubble.png';
import { calculateDistance } from '../gameUtils';

const SAVE_GAME_KEY = 'wordfeast-save-data';

export const useGameLogic = (gameData, width, height) => {
    const [isLoading, setIsLoading] = useState(true);

    const loadInitialState = () => {
        localStorage.removeItem(SAVE_GAME_KEY);
        return null;
    };

    const initialState = loadInitialState();
    const [monsterDashCollisions, setMonsterDashCollisions] = useState(0);

    const MONSTER_HEIGHT = 160;
    const PLAYER_SPAWN_BUFFER = 50;
    const defaultPlayerPosition = {
        x: width / 2,
        y: height / 2 + (MONSTER_HEIGHT / 2) + PLAYER_SPAWN_BUFFER
    };

    const [score, setScore] = useState(0);
    const [player, setPlayer] = useState({
        position: defaultPlayerPosition,
        velocity: { x: 0, y: 0 },
        size: 'small',
    });
    const [cagedWords, setCagedWords] = useState([]);
    const [monster, setMonster] = useState(null);
    const [messages, setMessages] = useState([]);
    const [fishLogics, setFishLogics] = useState([]);
    const [swallowedWords, setSwallowedWords] = useState([]);

    useEffect(() => {
        const setupAndPreload = async () => {
            if (!gameData?.question || !gameData?.choices || gameData.choices.length === 0) {
                console.error("Game data is missing or invalid.");
                setIsLoading(false);
                return;
            }
            console.log("useGameLogic - Received gameData:", gameData); 

            try {
                await Assets.load([
                    playerSpriteImage,
                    Lvl1CageImg,
                    Lvl2CageImg,
                    Lvl3CageImg,
                    BubbleImg
                ]);

                const activeMonster = {
                    word: gameData.question.word,
                    audioUrl: gameData.question.soundSrc,
                    position: { x: width / 2, y: height / 2 },
                };
                setMonster(activeMonster);
                console.log("useGameLogic - Created Monster:", activeMonster);

                // --- MODIFIED: Simplified cage assignment logic ---
                let choices = [...gameData.choices];
                let cagesToCreate = [];

                // 1. Assign Level 3 to the very first choice
                const lvl3Choice = choices.shift(); // Takes the first element out of the array
                cagesToCreate.push({ ...lvl3Choice, strength: 3 });

                // 2. Assign random strength (1 or 2) to the rest of the choices
                choices.forEach(choice => {
                    cagesToCreate.push({ ...choice, strength: Math.ceil(Math.random() * 2) });
                });

                // 3. Shuffle the cages to randomize their positions
                cagesToCreate.sort(() => Math.random() - 0.5);

                const activeCagedWords = [];
                const margin = 100;
                const minDistance = 150;
                const monsterRadius = 150;

                cagesToCreate.forEach(choice => {
                    let position;
                    let isValidPosition = false;
                    let attempts = 0;

                    while (!isValidPosition && attempts < 100) {
                        const x = margin + Math.random() * (width - margin * 2);
                        const y = margin + Math.random() * (height - margin * 2);
                        position = { x, y };

                        const isFarFromMonster = calculateDistance(position, activeMonster.position) > monsterRadius;
                        
                        const isFarFromOtherCages = activeCagedWords.every(
                            (cw) => calculateDistance(position, cw.position) > minDistance
                        );

                        if (isFarFromMonster && isFarFromOtherCages) {
                            isValidPosition = true;
                        }
                        attempts++;
                    }
                    
                    activeCagedWords.push({
                        id: choice.id,
                        word: choice.word,
                        isCorrect: choice.isCorrect,
                        audioUrl: choice.soundSrc,
                        strength: choice.strength,
                        isBroken: false,
                        position: position,
                        velocity: { x: 0, y: 0 },
                    });
                });
                setCagedWords(activeCagedWords);
                console.log("useGameLogic - Created Caged Words:", activeCagedWords);

                const allGameObjects = [activeMonster, ...activeCagedWords];
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
                console.error("Failed to preload assets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        setupAndPreload();
    }, [gameData, width, height]);

    return {
        isLoading,
        score, setScore,
        player, setPlayer,
        cagedWords, setCagedWords,
        monster, setMonster,
        messages, setMessages,
        fishLogics, setFishLogics,
        swallowedWords, setSwallowedWords,
        monsterDashCollisions, setMonsterDashCollisions,
    };
};