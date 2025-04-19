import React from "react";
import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/navbar";

const StudentHomepage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <Typography variant="h6" style={styles.menuItem}>
          Class
        </Typography>
        <Typography variant="h6" style={styles.menuItem}>
          Lesson
        </Typography>
        <Typography variant="h6" style={styles.menuItem}>
          Challenge
        </Typography>
        <Typography variant="h6" style={styles.menuItem}>
          Leaderboard
        </Typography>
      </div>

      <div style={styles.content}>
        <Typography variant="h5" style={styles.title}>
          Active Classes
        </Typography>
        <div style={styles.classCards}>
          <div style={styles.classCard}>Class 1</div>
          <div style={styles.classCard}>+ Join class</div>
        </div>
      </div>

      <div style={styles.topbar}>
        <Button onClick={() => navigate("/student-login")} style={styles.logoutButton}>
          Log Out
        </Button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#FFFBE0",
  },
  sidebar: {
    width: "20%",
    backgroundColor: "#FFD966",
    padding: "20px",
  },
  menuItem: {
    marginBottom: "20px",
    cursor: "pointer",
  },
  content: {
    flexGrow: 1,
    padding: "20px",
  },
  title: {
    fontWeight: "bold",
  },
  classCards: {
    display: "flex",
    gap: "20px",
  },
  classCard: {
    width: "120px",
    height: "100px",
    backgroundColor: "#FFDE9A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    cursor: "pointer",
  },
  topbar: {
    position: "absolute",
    top: "10px",
    right: "10px",
  },
  logoutButton: {
    backgroundColor: "#451513",
    color: "white",
  },
};

export default StudentHomepage;
