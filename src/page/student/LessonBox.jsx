import React from "react";
import "../../assets/chest.png"; // make sure chest.png is in src/assets
import chestImg from "../../assets/chest.png";
import "../css/LessonBox.css";

const LessonBox = ({ status }) => {
  return (
    <div className={`lesson-box ${status}`}>
      {status === "current" && <span className="label">START</span>}
      {status === "chest" ? (
        <img src={chestImg} alt="Chest" className="chest-icon" />
      ) : (
        <span className="star">★</span>
      )}
    </div>
  );
};

export default LessonBox;
