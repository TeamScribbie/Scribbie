import React, { useEffect, useState } from "react";

const LeaderboardBox = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    // Load the scores from localStorage
    const playerScore = parseInt(localStorage.getItem('scribbieScore')) || 0;

    // Dummy scores for example
    const dummyLeaderboard = [
      { name: "Player A", score: 30000 },
      { name: "Player B", score: 25000 },
      { name: "You", score: playerScore }, // <-- Your own score!
      { name: "Player C", score: 20000 },
    ];

    // Sort the scores from highest to lowest
    const sortedScores = dummyLeaderboard.sort((a, b) => b.score - a.score);

    setScores(sortedScores);
  }, []);

  return (
    <div style={{
      padding: "40px",
      backgroundColor: "#FFFBE0",
      minHeight: "100vh",
      textAlign: "center"
    }}>
      <h2 style={{ color: "#451513", marginBottom: "20px" }}>🏆 Leaderboard</h2>

      <div style={{
        backgroundColor: "#FFD966",
        margin: "0 auto",
        maxWidth: "600px",
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#FFCE58" }}>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((player, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#FFF9E6" : "#FFECB3" }}>
                <td style={styles.td}>{index + 1}</td>
                <td style={{ ...styles.td, fontWeight: player.name === "You" ? "bold" : "normal" }}>
                  {player.name}
                </td>
                <td style={styles.td}>{player.score.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  th: {
    padding: "12px",
    color: "#451513",
    fontWeight: "bold",
    fontSize: "18px",
    borderBottom: "2px solid #e5c27c",
  },
  td: {
    padding: "10px",
    fontSize: "16px",
    color: "#451513",
  }
};

export default LeaderboardBox;
