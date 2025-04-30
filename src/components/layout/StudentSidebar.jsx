import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const StudentSidebar = ({ onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandClass, setExpandClass] = useState(true);
  const [expandLesson, setExpandLesson] = useState(true);
  const [hovered, setHovered] = useState("");

  // Notify parent on open state change
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

  const styles = {
    sidebar: {
      position: "fixed",
      top: "60px",
      left: 0,
      width: isOpen ? "223px" : "30px",
      backgroundColor: "#FFE9A7",
      padding: "23px",
      borderRight: "2px solid #e5c27c",
      height: "calc(100vh - 60px)",
      transition: "width 0.3s",
      display: "flex",
      flexDirection: "column",
      alignItems: isOpen ? "flex-start" : "center",
      zIndex: 999,
    },
    toggleBtn: {
      backgroundColor: "#FFCE58",
      border: "none",
      borderRadius: "5px",
      padding: "6px",
      cursor: "pointer",
      marginBottom: "20px",
      alignSelf: isOpen ? "flex-end" : "center",
    },
    menuItem: {
      fontWeight: "bold",
      fontSize: "18px",
      color: "#542d1d",
      marginBottom: "10px",
      cursor: "pointer",
      padding: isOpen ? "1px 6px" : "8px",
      borderRadius: "10px",
      backgroundColor: "transparent",
      textAlign: isOpen ? "left" : "center",
      width: "100%",
      transition: "box-shadow 0.3s",
    },
    submenuItem: {
      fontSize: "16px",
      marginLeft: isOpen ? "10px" : "0px",
      color: "#542d1d",
      padding: "8px 10px",
      borderRadius: "8px",
      marginBottom: "6px",
      cursor: "pointer",
      backgroundColor: "transparent",
      textAlign: isOpen ? "left" : "center",
      width: "100%",
      transition: "box-shadow 0.3s",
    },
  };

  const getHoverStyle = (key) =>
    hovered === key
      ? {
          backgroundColor: "#fff3c4",
          boxShadow: "0 0 10px #ffdd77",
        }
      : {};

  return (
    <div style={styles.sidebar}>
      <button style={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Class */}
      <div
        style={{ ...styles.menuItem, ...getHoverStyle("class") }}
        onClick={() => setExpandClass(!expandClass)}
        onMouseEnter={() => setHovered("class")}
        onMouseLeave={() => setHovered("")}
        title="Class"
      >
        {isOpen ? "Class" : "📚"}
      </div>
      {expandClass && isOpen && (
        <div
          style={{ ...styles.submenuItem, ...getHoverStyle("english") }}
          onClick={() => navigate("/student-class/english")}
          onMouseEnter={() => setHovered("english")}
          onMouseLeave={() => setHovered("")}
        >
          English
        </div>
      )}

      {/* Lesson */}
      <div
        style={{ ...styles.menuItem, ...getHoverStyle("lesson") }}
        onClick={() => setExpandLesson(!expandLesson)}
        onMouseEnter={() => setHovered("lesson")}
        onMouseLeave={() => setHovered("")}
        title="Lesson"
      >
        {isOpen ? "Lesson" : "📘"}
      </div>
      {expandLesson && isOpen && (
        <div
          style={{ ...styles.submenuItem, ...getHoverStyle("challenge") }}
          onClick={() => navigate("/student-challenge")}
          onMouseEnter={() => setHovered("challenge")}
          onMouseLeave={() => setHovered("")}
        >
          Challenge
        </div>
      )}

      {/* Leaderboard */}
      <div
        style={{
          ...styles.menuItem,
          ...getHoverStyle("leaderboard"),
          marginTop: "20px",
        }}
        onClick={() => navigate("/student-leaderboard")}
        onMouseEnter={() => setHovered("leaderboard")}
        onMouseLeave={() => setHovered("")}
        title="Leaderboard"
      >
        {isOpen ? "Leaderboard" : "🏆"}
      </div>
    </div>
  );
};

export default StudentSidebar;
