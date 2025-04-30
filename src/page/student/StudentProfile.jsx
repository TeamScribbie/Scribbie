import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Fade } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import StudentNavbar from "../../components/layout/StudentNavbar";

const StudentProfile = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("studentProfile");
    return saved
      ? JSON.parse(saved)
      : { name: "Student", id: "xx-xxxxx-xxx", grade: "Section" };
  });

  const [editMode, setEditMode] = useState(false);
  const [profileImg, setProfileImg] = useState(() => {
    return localStorage.getItem("profileImg") || "";
  });

  const handleChange = (field) => (e) => {
    setProfileData({ ...profileData, [field]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem("studentProfile", JSON.stringify(profileData));
    setEditMode(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImg(reader.result);
      localStorage.setItem("profileImg", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#FFFBE0",
      paddingTop: "60px",
    },
    backButton: {
      backgroundColor: "#451513",
      color: "white",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      margin: "20px 20px 0",
      padding: "8px 12px",
      borderRadius: "8px",
    },
    contentWrapper: {
      display: "flex",
      gap: "30px",
      padding: "30px",
      justifyContent: "center",
    },
    sidebar: {
      backgroundColor: "#FFD966",
      borderRadius: "10px",
      padding: "20px",
      width: "220px",
      height: "fit-content",
    },
    sidebarHeader: {
      backgroundColor: "#451513",
      color: "white",
      padding: "10px",
      textAlign: "center",
      borderRadius: "8px 8px 0 0",
      fontWeight: "bold",
    },
    tabButton: {
      backgroundColor: "white",
      border: "none",
      padding: "10px",
      fontWeight: "bold",
      borderRadius: "5px",
      width: "100%",
      marginTop: "15px",
      cursor: "pointer",
    },
    profileCard: {
      flex: 1,
      backgroundColor: "#FFF2D0",
      borderRadius: "15px",
      padding: "40px",
      display: "flex",
      gap: "40px",
      alignItems: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      maxWidth: "900px",
    },
    profileImageBox: {
      backgroundColor: "#FFD966",
      width: "160px",
      height: "160px",
      borderRadius: "12px",
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      color: "#451513",
      fontWeight: "bold",
      fontSize: "14px",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    addIcon: {
      position: "absolute",
      bottom: "-10px",
      right: "-10px",
      backgroundColor: "#F44336",
      color: "white",
      borderRadius: "50%",
      padding: "6px",
      fontSize: "16px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      cursor: "pointer",
    },
    infoText: {
      fontSize: "16px",
      color: "#451513",
      marginBottom: "12px",
    },
    label: {
      fontWeight: "bold",
      marginRight: "5px",
    },
    fileInput: {
      display: "none",
    },
    button: {
      marginTop: "10px",
      backgroundColor: "#FFD966",
      color: "#451513",
      fontWeight: "bold",
      transition: "0.3s",
    },
  };

  return (
    <div style={styles.container}>
      <StudentNavbar />
      <button style={styles.backButton} onClick={() => navigate(-1)}>←</button>

      <div style={styles.contentWrapper}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>Account Details</div>
          <button style={styles.tabButton}>Personal Information</button>
        </div>

        {/* Profile Info */}
        <Fade in>
          <div style={styles.profileCard}>
            <div style={styles.profileImageBox}>
              {profileImg ? (
                <img src={profileImg} alt="Profile" style={styles.image} />
              ) : (
                "Profile Image"
              )}
              <label htmlFor="upload-input" style={styles.addIcon}>
                <AddIcon fontSize="small" />
              </label>
              <input
                id="upload-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={styles.fileInput}
              />
            </div>

            <div>
              {editMode ? (
                <>
                  <div style={styles.infoText}>
                    <span style={styles.label}>Name:</span>
                    <TextField variant="standard" value={profileData.name} onChange={handleChange("name")} />
                  </div>
                  <div style={styles.infoText}>
                    <span style={styles.label}>ID Number:</span>
                    <TextField variant="standard" value={profileData.id} onChange={handleChange("id")} />
                  </div>
                  <div style={styles.infoText}>
                    <span style={styles.label}>Grade:</span>
                    <TextField variant="standard" value={profileData.grade} onChange={handleChange("grade")} />
                  </div>
                  <Button variant="contained" style={styles.button} onClick={handleSave}>Save</Button>
                </>
              ) : (
                <>
                  <div style={styles.infoText}><span style={styles.label}>Name:</span> {profileData.name}</div>
                  <div style={styles.infoText}><span style={styles.label}>ID Number:</span> {profileData.id}</div>
                  <div style={styles.infoText}><span style={styles.label}>Grade:</span> {profileData.grade}</div>
                  <Button variant="contained" style={styles.button} onClick={() => setEditMode(true)}>Edit</Button>
                </>
              )}
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default StudentProfile;
