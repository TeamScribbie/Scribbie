import React from "react";
import GameChallengeLogic from "./GameChallengeLogic";

const GameComponent = ({ questions }) => {
  return (
    <div>
      <GameChallengeLogic questions={questions} />
    </div>
  );
};

export default GameComponent;