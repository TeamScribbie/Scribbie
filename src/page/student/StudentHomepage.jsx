import React, { useState } from "react";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../../components/layout/StudentNavbar";
import StudentSidebar from "../../components/layout/StudentSidebar";

const StudentHomepage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true); // NEW

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setClassCode("");
  };

  const handleJoinClass = () => {
    if (classCode.trim()) {
      navigate(`/student-class/${classCode.trim()}`);
      handleClose();
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#FFFBE0",
      overflow: "hidden",
    },
    content: {
      marginLeft: sidebarOpen ? "220px" : "60px", // DYNAMIC SIDEBAR WIDTH
      transition: "margin-left 0.3s",
      padding: "90px 30px 30px", // accounts for fixed navbar
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
      <StudentNavbar />
      <StudentSidebar onToggle={setSidebarOpen} />

      <Box style={styles.content}>
        <Typography style={styles.title}>Active Classes</Typography>
        <div style={styles.classCards}>
          <div
            style={{ ...styles.classCard, ...styles.joinCard }}
            onClick={handleOpen}
          >
            + Join class
          </div>
        </div>
      </Box>

      {/* Join Class Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            backgroundColor: "#FFE9A7",
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
