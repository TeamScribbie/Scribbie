// src/page/GamePage.jsx
import React from 'react';
import GameComponent from '../components/Games/GameComponent'; // Import the new component
// Removed: import { useGameLogic } from '../components/Games/GameLogic';
// Removed: import './GamePage.css'; // CSS is now handled by GameComponent

// Example: If using React Router, you might get lessonId like this:
// import { useParams } from 'react-router-dom';

function GamePage() {
    // Example: Get lessonId. Replace with your actual logic
    // const { lessonId } = useParams(); // If using React Router
    const lessonId = 'lesson1'; // Or get it from state, props, etc.

    return (
        <div className="game-page"> {/* Optional wrapper for page-specific layout */}
            {/* You could add headers, footers, or other page elements here */}
            <h1>My Awesome Quiz</h1>

            <GameComponent lessonId={lessonId} /> {/* Render the game component */}

            {/* You could add other elements below the game here */}
        </div>
    );
}

export default GamePage;