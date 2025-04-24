// src/components/ActivityNode.jsx
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/LessonPage.css';

// Icon logic remains the same
const getNodeIcon = (gameType, isFinished) => {
  if (isFinished) return '✅';
  switch (gameType) {
    case 1: return '📖';
    case 2: return '🎮';
    case 3: return '✍️';
    default: return '🔵';
  }
};

// highlight-start
// Array of CSS variable names for colors (matches CSS :root)
// Ensure these match the names defined in LessonPage.css
const lessonColorVars = [
    { bg: '--lesson-color-1', border: '--lesson-border-1'},
    { bg: '--lesson-color-2', border: '--lesson-border-2'},
    { bg: '--lesson-color-3', border: '--lesson-border-3'},
    { bg: '--lesson-color-4', border: '--lesson-border-4'},
    { bg: '--lesson-color-5', border: '--lesson-border-5'},
];

// Accept lessonIndex prop again
const ActivityNode = ({ activityData, onClick, lessonIndex }) => {
// highlight-end
  const { gameType, isFinished } = activityData;

  // highlight-start
  // Calculate color index, cycling through the 5 colors
  const colorIndex = lessonIndex % 5;
  const colorVar = lessonColorVars[colorIndex];

  // Define inline style to set CSS variables for this specific node
  const nodeStyle = {
    // Only set variables if the node isn't finished
    // The .finished class in CSS will override these otherwise
    '--node-bg-color': `var(${colorVar.bg})`,
    '--node-border-color': `var(${colorVar.border})`,
  };
  // highlight-end

  const isClickable = !isFinished;
  // Add 'finished' class if applicable, CSS handles the override
  const nodeClass = `activity-node ${isFinished ? 'finished' : ''} ${!isClickable ? 'disabled' : ''}`;
  const icon = getNodeIcon(gameType, isFinished);

  return (
    <button
        className={nodeClass}
        onClick={onClick}
        disabled={!isClickable}
        aria-label={`Activity ${activityData.activityId}, Status: ${isFinished ? 'Completed' : 'Pending'}`}
        // highlight-start
        // Apply the style containing the CSS variables
        style={nodeStyle}
        // highlight-end
    >
      <span className="activity-node-icon">{icon}</span>
    </button>
  );
};

ActivityNode.propTypes = {
  activityData: PropTypes.shape({
    activityId: PropTypes.number.isRequired,
    gameType: PropTypes.number.isRequired,
    isFinished: PropTypes.bool.isRequired,
    totalScore: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  // highlight-start
  // Add lessonIndex back to propTypes
  lessonIndex: PropTypes.number.isRequired,
  // highlight-end
};

export default ActivityNode;