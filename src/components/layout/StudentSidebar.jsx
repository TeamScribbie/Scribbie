import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentSidebar = () => {
  const navigate = useNavigate();
  const [expandClass, setExpandClass] = useState(true);

  const styles = {
    sidebar: {
      width: "220px",
      backgroundColor: "#FFE9A7",
      padding: "10px",
      borderRight: "2px solid #e5c27c",
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
  };

  return (
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
      <div
        style={{ ...styles.menuItem, marginTop: "20px", backgroundColor: "transparent", cursor: "pointer" }}
        onClick={() => navigate('/student-leaderboard')}
      >
        Leaderboard
      </div>
    </div>
  );
};

export default StudentSidebar;
