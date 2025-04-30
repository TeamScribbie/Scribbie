import React from "react";
import { useParams } from "react-router-dom";
import LoadChallengeData from "../../components/student/LoadChallengeData";

const ChallengePage = () => {
  const { id } = useParams();
  const challengeNumber = parseInt(id);

  return (
    <div style={{ backgroundColor: "#FFFBE0", minHeight: "100vh", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#451513", marginBottom: "20px" }}>
        🧩 Challenge {challengeNumber}
      </h1>
      <LoadChallengeData challengeId={id} />
    </div>
  );
};

export default ChallengePage;
