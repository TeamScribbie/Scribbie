// src/components/cards/AddClassCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

const AddClassCard = ({ onClick }) => {
  return (
    <div className="add-class-card" onClick={onClick}>
       + Add Class
    </div>
  );
};

AddClassCard.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default AddClassCard;