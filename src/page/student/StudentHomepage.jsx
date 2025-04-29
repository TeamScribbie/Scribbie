import React, { useState } from "react";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../../components/layout/StudentNavbar";
import StudentSidebar from "../../components/layout/StudentSidebar";

const StudentHomepage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [classCode, setClassCode] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setClassCode("");
  };

  const handleJoinClass = () => {
    if (classCode.trim()) {
      navigate(`/student-class/${classCode.trim()}`); // ✅ Navigate to dynamic class page
      handleClose();
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      width: "100vw",
      overflow: "hidden",
      backgroundColor: "#FFFBE0",
    },
    navbar: {
      height: "60px",
      width: "100%",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000,
    },
    main: {
      display: "flex",
      marginTop: "60px",
      height: "calc(100vh - 60px)",
    },
    sidebar: {
      width: "200px",
      height: "100%",
      backgroundColor: "#FFE9A7",
      borderRight: "2px solid #e5c27c",
      position: "fixed",
      top: "60px",
      left: 0,
      bottom: 0,
      overflowY: "auto",
      padding: "20px",
    },
    content: {
      marginLeft: "220px",
      flex: 1,
      padding: "30px",
      overflowY: "auto",
      boxSizing: "border-box",
      backgroundColor: "#FFFBE0",
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
      width: "150px",
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
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <StudentNavbar />
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <StudentSidebar />
        </div>

        {/* Content */}
        <div style={styles.content}>
          <Typography style={styles.title}>Active Classes</Typography>
          <div style={styles.classCards}>
            {/* Example class cards */}
            <div style={styles.classCard}>Class 1</div>

            {/* Join Class Card */}
            <div
              style={{ ...styles.classCard, ...styles.joinCard }}
              onClick={handleOpen}
            >
              + Join class
            </div>
          </div>
        </div>
      </div>

      {/* Join Class Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            backgroundColor: "#FFE9A7", // Same as sidebar
            borderRadius: "15px",
          },
        }}
      >
        <DialogTitle style={{ color: "#542d1d", fontWeight: "bold" }}>
          Enter Class Name
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            type="text"
            fullWidth
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            InputProps={{
              style: {
                backgroundColor: "white",
                borderRadius: "8px",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleJoinClass} variant="contained" color="primary">
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentHomepage;
