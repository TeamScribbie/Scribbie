import React from "react";
import { Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/scribbie-logo.png"; 

const StudentProfile = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
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
    contentWrapper: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      padding: "20px",
    },
    backBtn: {
      position: "absolute",
      top: "80px",
      left: "20px",
      backgroundColor: "#451513",
      color: "white",
      border: "none",
      fontSize: "20px",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      cursor: "pointer",
    },
    sidebar: {
      width: "220px",
      backgroundColor: "#FFD966",
      borderRadius: "10px",
      padding: "15px",
      marginRight: "30px",
      height: "fit-content",
    },
    sidebarHeader: {
      backgroundColor: "#451513",
      color: "white",
      padding: "10px",
      borderTopLeftRadius: "10px",
      borderTopRightRadius: "10px",
      fontWeight: "bold",
      textAlign: "center",
    },
    sidebarItem: {
      backgroundColor: "white",
      color: "#451513",
      borderRadius: "8px",
      textAlign: "center",
      padding: "10px",
      marginTop: "10px",
      fontWeight: "bold",
      cursor: "pointer",
    },
    profileCard: {
      backgroundColor: "#FFF2D0",
      borderRadius: "15px",
      display: "flex",
      padding: "30px",
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "space-between",
    },
    imageBox: {
      width: "150px",
      height: "150px",
      backgroundColor: "#FFD966",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    plusButton: {
      position: "absolute",
      bottom: "-10px",
      right: "-10px",
      backgroundColor: "#E63946",
      color: "white",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      cursor: "pointer",
      border: "none",
    },
    details: {
      marginLeft: "40px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    label: {
      fontWeight: "bold",
      fontSize: "20px",
      color: "#451513",
    },
    subtext: {
      fontSize: "16px",
      color: "#555",
    },
    boldSub: {
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <img src={logo} alt="Scribbie Logo" style={styles.logo} />
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ backgroundColor: "#38E54D", color: "white", padding: "4px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold" }}>
            STUDENT
          </div>
          <div style={{ backgroundColor: "#FFD966", width: "35px", height: "35px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>🔔</div>
          <div style={{ width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "#542d1d", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>👤</div>
        </div>
      </div>

      <button style={styles.backBtn} onClick={() => navigate(-1)}>←</button>

      {/* Content */}
      <div style={styles.contentWrapper}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>Account Details</div>
          <div style={styles.sidebarItem}>Personal Information</div>
        </div>

        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.imageBox}>
            <span style={{ fontSize: "14px", color: "#451513" }}>Profile Image</span>
            <button style={styles.plusButton}>+</button>
          </div>

          <div style={styles.details}>
            <Typography style={styles.label}>Name</Typography>
            <Typography style={styles.subtext}>Student</Typography>
            <Typography style={styles.subtext}>ID Number<br /><span className={styles.boldSub}>xx-xxxx-xxx</span></Typography>
            <Typography style={styles.subtext}>Grade <span className={styles.boldSub}>Section</span></Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
