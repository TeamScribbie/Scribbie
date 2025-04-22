// src/components/cards/ClassroomCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

const ClassroomCard = ({ name, onClick }) => {
  return (
    <div className="classroom-card" onClick={onClick}>
      <Typography variant="subtitle1" component="div">
        {name}
      </Typography>
    </div>
  );
};

ClassroomCard.propTypes = {
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ClassroomCard;