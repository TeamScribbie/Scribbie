import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/scribbie-logo.png";

const StudentNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const styles = {
    header: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "60px",
      backgroundColor: "#451513",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      zIndex: 1000,
      boxSizing: "border-box",
    },
    logo: {
      height: "35px",
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    status: {
      backgroundColor: "#00e035",
      color: "white",
      padding: "4px 10px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    roundBtn: {
      backgroundColor: "#FFCE58",
      width: "35px",
      height: "35px",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      fontSize: "18px",
      color: "#451513",
    },
    dropdown: {
      position: "absolute",
      top: "60px",
      right: "20px",
      backgroundColor: "black",
      color: "white",
      borderRadius: "10px",
      padding: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      zIndex: 999,
    },
  };

  return (
    <div style={styles.header}>
      <div style={styles.leftSection}>
        {isMobile && (
          <div style={styles.roundBtn} onClick={toggleSidebar} title="Toggle Sidebar">
            ☰
          </div>
        )}
        <img src={logo} alt="Scribbie Logo" style={styles.logo} />
      </div>

      <div style={styles.rightSection}>
        <div style={styles.status}>STUDENT</div>
        <div style={styles.roundBtn}>🔔</div>
        <div
          style={styles.roundBtn}
          onClick={() => setShowDropdown(!showDropdown)}
          title="Account"
        >
          👤
        </div>

        {showDropdown && (
          <div style={{
            position: "absolute",
            top: "60px",
            right: "20px",
            backgroundColor: "black",
            color: "white",
            borderRadius: "10px",
            padding: "10px",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}>
            <div
              onClick={() => navigate("/student-profile")}
              style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid white" }}
            >
              My Account
            </div>
            <div
              onClick={() => navigate("/student-login")}
              style={{ padding: "8px", cursor: "pointer" }}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNavbar;
