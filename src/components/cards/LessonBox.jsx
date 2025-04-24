// src/components/cards/LessonBox.jsx
import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/LessonPage.css'; // Use the LessonPage CSS file

const LessonBox = ({ lessonNumber, title }) => {
  return (
    <div className="lesson-box">
      <h2>{`Lesson ${lessonNumber}: ${title}`}</h2>
      {/* Add any other header elements here if needed */}
    </div>
  );
};

LessonBox.propTypes = {
  lessonNumber: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

export default LessonBox;