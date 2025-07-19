import React from 'react';
import '../styles/memory.css';

const MemoryCard = ({ card, handleChoice, flipped, disabled }) => {
  const handleClick = () => {
    if (!disabled && !flipped) handleChoice(card);
  };

  return (
    <div className="card">
      <div className={flipped ? "flipped" : ""}>
        <div className="front" onClick={handleClick}>
          {flipped ? <img src={card.src} alt="card" className="card-img" /> : <span>❓</span>}
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
