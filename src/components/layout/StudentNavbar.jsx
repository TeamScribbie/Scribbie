import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/scribbie-logo.png";

const StudentNavbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, );

  const styles = {
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
      backgroundColor: "#FFD966",
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
      backgroundColor: "black",
      border: "1px solid #ccc",
      borderRadius: "10px",
      padding: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      zIndex: 999,
    },
  };

  return (
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
  );
};

export default StudentNavbar;
