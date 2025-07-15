import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import{Application, extend} from '@pixi/react';
import {Container,Graphics,Sprite,} from 'pixi.js';
import {useRef} from 'react';

extend({
    Container,Graphics,Sprite,
});

const WordFeastGame= ({ questions = [], onGameComplete, activityTitle }) => {
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const startTimeRef = useRef(Date.now());

    // When the game is over, call the onGameComplete callback
    useEffect(() => {
        if (gameOver) {
            const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
            onGameComplete({
                score,
                status: 'COMPLETED',
                timeTaken,
                highestStreak: 0,
                accuracy: 100,
                questionsAttempted: score / 10,
            });
        }
    }, [gameOver, score, onGameComplete]);

    return (
        <Application>
            
        </Application>
    );
};

WordFeastGame.propTypes = {
    questions: PropTypes.array.isRequired,
    onGameComplete: PropTypes.func.isRequired,
    activityTitle: PropTypes.string,
};

export default WordFeastGame;