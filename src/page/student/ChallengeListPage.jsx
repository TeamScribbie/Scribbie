import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChallengeListPage = () => {
  const navigate = useNavigate();
  const [completedChallenges, setCompletedChallenges] = useState([]);

  const challenges = [
    { id: 1, title: "Challenge 1" },
    { id: 2, title: "Challenge 2" },
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('completedChallenges')) || [];
    setCompletedChallenges(saved);
  }, []);

  const isCompleted = (id) => completedChallenges.includes(id);

  return (
    <div style={{ padding: "30px", backgroundColor: "#FFFBE0", minHeight: "100vh" }}>
      <h2 style={{ color: "#451513", marginBottom: "20px", textAlign: "center" }}>🏆 Challenges</h2>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
      }}>
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            onClick={() => navigate(`/challenge/${challenge.id}`)}
            style={{
              backgroundColor: "#FFD966",
              padding: "20px",
              borderRadius: "12px",
              width: "220px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer",
              position: "relative",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <h3 style={{ color: "#451513" }}>{challenge.title}</h3>
            {isCompleted(challenge.id) && (
              <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "18px" }}>
                ⭐⭐⭐
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeListPage;
