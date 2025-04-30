import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentNavbar from "../../components/layout/StudentNavbar";
import { Box, IconButton, Typography, Fade } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ChallengeListPage = () => {
  const navigate = useNavigate();
  const { className } = useParams();
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);

  const challenges = [
    { id: 1, title: "Challenge 1" },
    { id: 2, title: "Challenge 2" },
    { id: 3, title: "Challenge 3" },
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("completedChallenges")) || [];
    setCompletedChallenges(saved);
    setTimeout(() => setFadeIn(true), 200); // Trigger fade-in animation
  }, []);

  const isCompleted = (id) => completedChallenges.includes(id);

  return (
    <div style={{ backgroundColor: "#FFFBE0", minHeight: "100vh" }}>
      <StudentNavbar />

      {/* Back Button */}
      <Box sx={{ paddingTop: "80px", paddingLeft: "20px" }}>
        <IconButton
          onClick={() => navigate("/student-class/english")}
          sx={{
            backgroundColor: "#451513",
            color: "white",
            "&:hover": {
              backgroundColor: "#5b1a16",
            },
            borderRadius: "8px",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowBackIcon sx={{ marginRight: "6px" }} />
        </IconButton>
      </Box>

      {/* Challenge List */}
      <Box sx={{ padding: "30px 20px" }}>
        <h2 style={{ color: "#451513", marginBottom: "10px", textAlign: "center" }}>
          🏆 Challenges
        </h2>
        <Typography variant="body1" sx={{ textAlign: "center", color: "#7a5c58", marginBottom: "30px" }}>
          “Step up and conquer each challenge one star at a time!” ⭐
        </Typography>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {challenges.map((challenge, index) => (
            <Fade in={fadeIn} timeout={600 + index * 200} key={challenge.id}>
              <div
                onClick={() => navigate(`/challenge/${challenge.id}`)}
                style={{
                  backgroundColor: "#FFD966",
                  padding: "20px",
                  borderRadius: "16px",
                  width: "220px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.3s ease-in-out",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <h3 style={{ color: "#451513", fontWeight: "bold" }}>{challenge.title}</h3>
                {isCompleted(challenge.id) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      fontSize: "20px",
                    }}
                  >
                    ⭐⭐⭐
                  </div>
                )}
              </div>
            </Fade>
          ))}
        </div>
      </Box>
    </div>
  );
};

export default ChallengeListPage;
