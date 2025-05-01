import React from "react";
import GameComponent from "./GameComponent";

const dummyChallenges = {
  1: {
    title: "Challenge 1",
    questions: [
      { question: "The sun is ___?", choices: ["hot", "cold", "green", "blue"], correctAnswer: "hot" },
      { question: "Water is ___?", choices: ["solid", "gas", "liquid", "fire"], correctAnswer: "liquid" },
      { question: "Bananas are ___?", choices: ["yellow", "blue", "red", "green"], correctAnswer: "yellow" },
    ]
  },
  2: {
    title: "Challenge 2",
    questions: [
      { question: "Fire is ___?", choices: ["cold", "hot", "wet", "solid"], correctAnswer: "hot" },
      { question: "Snow is ___?", choices: ["hot", "cold", "blue", "green"], correctAnswer: "cold" },
      { question: "Apples are ___?", choices: ["red", "blue", "yellow", "black"], correctAnswer: "red" },
    ]
  },
};

const LoadChallengeData = ({ challengeId }) => {
  const challenge = dummyChallenges[parseInt(challengeId)]; // <-- THIS MUST BE PARSED.

  if (!challenge) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>⚠️ Challenge not found!</div>;
  }

  return (
    <div>
      <h2 style={{ textAlign: "center", color: "#451513", marginBottom: "20px" }}>{challenge.title}</h2>
      <GameComponent questions={challenge.questions} />
    </div>
  );
};

export default LoadChallengeData;
