import React, { useEffect, useState } from "react";
import StudentNavbar from "../../components/layout/StudentNavbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import { Box, Avatar } from "@mui/material";

const LeaderboardBox = () => {
  const [scores, setScores] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state

  useEffect(() => {
    const playerScore = parseInt(localStorage.getItem("scribbieScore")) || 0;

    const dummyLeaderboard = [
      { name: "Player A", score: 30000 },
      { name: "Player B", score: 25000 },
      { name: "You", score: playerScore },
      { name: "Player C", score: 20000 },
      { name: "Player D", score: 18000 },
    ];

    const sortedScores = dummyLeaderboard.sort((a, b) => b.score - a.score);
    setScores(sortedScores);
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 0) return "👑";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `${rank + 1}.`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FFFBE0" }}>
      {sidebarOpen && (
        <div style={{ width: 250 }}>
          <StudentSidebar />
        </div>
      )}
      <div style={{ flexGrow: 1 }}>
        <StudentNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Box sx={{ padding: 4, textAlign: "center" }}>
          <h2 style={{ color: "#451513", marginBottom: "30px" }}>🏆 Leaderboard</h2>
          <Box
            sx={{
              backgroundColor: "#FFD966",
              margin: "0 auto",
              maxWidth: "700px",
              padding: 3,
              borderRadius: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#FFCE58" }}>
                  <th style={styles.th}>Rank</th>
                  <th style={styles.th}>Player</th>
                  <th style={styles.th}>Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((player, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#FFF9E6" : "#FFECB3",
                      fontWeight: player.name === "You" ? "bold" : "normal",
                    }}
                  >
                    <td style={styles.td}>{getRankIcon(index)}</td>
                    <td style={styles.td}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar
                          alt={player.name}
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}`}
                          sx={{ width: 32, height: 32 }}
                        />
                        {player.name}
                      </Box>
                    </td>
                    <td style={styles.td}>{player.score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
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
  },
};

export default LeaderboardBox;
