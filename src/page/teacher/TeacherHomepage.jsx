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
import Navbar from "../../components/layout/navbar";
import styles from "../../components/styles/TeacherHomepageStyles";

const TeacherHomepage = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [enrollmentLimit, setEnrollmentLimit] = useState("");
  const [classes, setClasses] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleAddClass = () => {
    if (className.trim() && classCode.trim() && enrollmentLimit.trim()) {
      setClasses([...classes, className]);
      setClassName("");
      setClassCode("");
      setEnrollmentLimit("");
      setOpenDialog(false);
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? "200px" : "0",
          padding: sidebarOpen ? "20px" : "0",
          overflowX: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        {sidebarOpen && (
          <>
            <Typography variant="h6" style={styles.sidebarTitle}>
              Menu
            </Typography>
            <div
              style={{
                ...styles.sidebarItem,
                backgroundColor: "#FFD966",
                borderRadius: "100px",
              }}
              onClick={() => navigate("/teacher-homepage")}
            >
              My Classes
            </div>

            <div style={styles.classList}>
              {classes.map((cls, index) => (
                <div key={index} style={styles.subItem}>
                  {cls}
                </div>
              ))}
            </div>

            <div
              style={{ ...styles.sidebarItem, marginTop: "50px" }}
              onClick={() => navigate("/teacher-challenges")}
            >
              Challenges
            </div>
          </>
        )}
      </div>

      <div
        style={{
          ...styles.content,
          marginLeft: sidebarOpen ? "200px" : "0",
          transition: "margin 0.3s ease",
        }}
      >
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
        />

        <div style={styles.main}>
          <Typography variant="h5" style={styles.heading}>
            Active Classes
          </Typography>

          <div style={styles.cardContainer}>
            {classes.map((name, index) => (
              <div
                key={index}
                style={styles.classCard}
                onClick={() => navigate("/classroomcard")}
              >
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
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ backgroundColor: "#FFE8A3" }}>Create a class</DialogTitle>
        <DialogContent sx={{ backgroundColor: "#FFE8A3" }}>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Class Code"
            fullWidth
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Enrollment Limit"
            fullWidth
            type="number"
            value={enrollmentLimit}
            onChange={(e) => setEnrollmentLimit(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#FFE8A3" }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddClass}
            variant="contained"
            sx={{
              backgroundColor: "#451513",
              "&:hover": { backgroundColor: "#2f0f0e" },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeacherHomepage;
