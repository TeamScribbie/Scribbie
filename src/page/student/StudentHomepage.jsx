import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/scribbie-logo.png"; // Update path if needed

const StudentHomepage = () => {
  const navigate = useNavigate();
  const [expandClass, setExpandClass] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const styles = {
    container: {
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    header: {
      height: "60px",
      backgroundColor: "#451513",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
    },
    logo: {
      height: "40px",
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      overflow: "hidden",
    },
    sidebar: {
      width: isMobile ? "100%" : "220px",
      backgroundColor: "#FFE9A7",
      padding: "20px",
      borderRight: isMobile ? "none" : "2px solid #e5c27c",
      borderBottom: isMobile ? "2px solid #e5c27c" : "none",
      display: "flex",
      flexDirection: "column",
    },
    menuItem: {
      fontWeight: "bold",
      fontSize: "18px",
      color: "#542d1d",
      marginBottom: "10px",
      cursor: "pointer",
      padding: "8px 12px",
      borderRadius: "10px",
      backgroundColor: expandClass ? "#FFCE58" : "transparent",
    },
    submenuItem: {
      fontSize: "16px",
      marginLeft: "20px",
      color: "#FFA500",
      marginBottom: "6px",
      cursor: "pointer",
    },
    content: {
      flex: 1,
      padding: "30px",
      backgroundColor: "#FFFBE0",
      overflowY: "auto",
      boxSizing: "border-box",
      maxWidth: "100%",
    },
    title: {
      fontWeight: "bold",
      fontSize: "22px",
      color: "#542d1d",
      marginBottom: "20px",
    },
    classCards: {
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
    },
    classCard: {
      width: isMobile ? "100%" : "150px",
      height: "120px",
      backgroundColor: "#FFCE58",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "16px",
      color: "#542d1d",
      cursor: "pointer",
    },
    joinCard: {
      backgroundColor: "#FFE9A7",
    },
    rightControls: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    status: {
      backgroundColor: "#38E54D",
      color: "white",
      padding: "4px 10px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    bell: {
      backgroundColor: "#FFD966",
      width: "35px",
      height: "35px",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
      cursor: "pointer",
    },
    profile: {
      width: "35px",
      height: "35px",
      borderRadius: "50%",
      backgroundColor: "#542d1d",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "white",
      fontWeight: "bold",
    },
    dropdown: {
      position: "absolute",
      top: "60px",
      right: "20px",
      backgroundColor: "white",
      border: "1px solid #ccc",
      borderRadius: "10px",
      padding: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      zIndex: 999,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <img src={logo} alt="Scribbie Logo" style={styles.logo} />
        <div style={styles.rightControls}>
          <div style={styles.status}>STUDENT</div>
          <div style={styles.bell}>🔔</div>
          <div style={styles.profile} onClick={() => setShowDropdown(!showDropdown)}>👤</div>
          {showDropdown && (
            <div style={styles.dropdown}>
              <div style={{ marginBottom: "10px", cursor: "pointer" }}>My Account</div>
              <div style={{ cursor: "pointer" }} onClick={() => navigate("/student-login")}>
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div style={styles.main}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.menuItem} onClick={() => setExpandClass(!expandClass)}>
            Class
          </div>
          {expandClass && (
            <>
              <div style={styles.submenuItem} onClick={() => navigate("/student-lesson")}>
                Lesson
              </div>
              <div style={styles.submenuItem} onClick={() => navigate("/student-challenge")}>
                Challenge
              </div>
            </>
          )}
          <div style={{ ...styles.menuItem, marginTop: "20px", backgroundColor: "transparent" }}>
            Leaderboard
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <Typography style={styles.title}>Active Classes</Typography>
          <div style={styles.classCards}>
            <div style={styles.classCard}>Class 1</div>
            <div style={{ ...styles.classCard, ...styles.joinCard }}>+ Join class</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHomepage;
