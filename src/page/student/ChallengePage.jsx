import React from "react";
import { useParams } from "react-router-dom";
import LoadChallengeData from "../../components/student/LoadChallengeData";

const ChallengePage = () => {
  const { id } = useParams();
  console.log("Current challenge id:", id);

  return (
    <div style={{ backgroundColor: "#FFFBE0", minHeight: "100vh", padding: "20px" }}>
      <LoadChallengeData challengeId={id} />
    </div>
  );
};

export default ChallengePage;
