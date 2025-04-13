import React, { useState } from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const TeacherChallenges = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState(["Classroom 2"]); // Classroom 1 removed

  const handleAddClass = () => {
    if (className.trim()) {
      setClasses([...classes, className]);
      setClassName("");
      setOpenDialog(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div
          style={{
            ...styles.sidebarItem,
            backgroundColor: "#FFD966",
            borderRadius: "10px",
          }}
          onClick={() => navigate("/teacher-homepage")}
        >
          My Classes
        </div>

        {/* Render class names as sub-items */}
        <div style={styles.classList}>
          {classes.map((cls, index) => (
            <div key={index} style={styles.subItem}>
              {cls}
            </div>
          ))}
        </div>

        <div
          style={{ ...styles.sidebarItem, marginTop: "30px" }}
          onClick={() => navigate("/teacher-challenges")}
        >
          Challenges
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <Typography variant="h5" style={styles.heading}>
          Active Classes
        </Typography>

        <div style={styles.cardContainer}>
          {classes.map((name, index) => (
            <div key={index} style={styles.classCard}>
              <Typography variant="subtitle1">{name}</Typography>
            </div>
          ))}

          <div
            style={{ ...styles.classCard, ...styles.addCard }}
            onClick={() => setOpenDialog(true)}
          >
            + Add Class
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddClass} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "220px",
    backgroundColor: "#FFE8A3",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontFamily: "Arial, sans-serif",
    color: "#451513",
  },
  sidebarItem: {
    cursor: "pointer",
    fontWeight: "bold",
    padding: "10px 15px",
  },
  subItem: {
    paddingLeft: "25px",
    fontSize: "14px",
    marginBottom: "5px",
  },
  classList: {
    marginTop: "10px",
  },
  main: {
    flexGrow: 1,
    padding: "40px",
    backgroundColor: "#FFFBE0",
  },
  heading: {
    fontWeight: "bold",
    marginBottom: "20px",
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },
  classCard: {
    width: "140px",
    height: "100px",
    backgroundColor: "#FFD966",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },
  addCard: {
    backgroundColor: "#FFEDB6",
    color: "#000",
  },
};

export default TeacherChallenges;
