// src/components/cards/JoinClassCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

const JoinClassCard = ({ onClick }) => {
  return (
    <div className="join-class-card" onClick={onClick}>
      + Join class
    </div>
  );
};

JoinClassCard.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default JoinClassCard;