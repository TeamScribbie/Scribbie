import React from "react";
import GameChallengeLogic from "./GameChallengeLogic";
import PictureMatchGame from "./PictureMatchGame"; // Make sure this file exists

const GameComponent = ({ questions, type, totalChallenges }) => {
  if (type === "pictureMatch") {
    return <PictureMatchGame questions={questions} totalChallenges={totalChallenges} />;
  }

  return <GameChallengeLogic questions={questions} totalChallenges={totalChallenges} />;
};

export default GameComponent;
