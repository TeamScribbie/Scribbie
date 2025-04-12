import React, { useState } from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";

const TeacherHomepage = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [enrollmentLimit, setEnrollmentLimit] = useState("");
  const [classes, setClasses] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    navigate("/teacher-login");
  };

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
      <div style={styles.sidebar}>
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
      </div>

      <div style={styles.content}>
        <div style={styles.navbar}>
          <div style={styles.navRight}>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ bgcolor: "#FFD966"}} />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileClick}>
              <Avatar sx={{ bgcolor: "#FFD966", width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={() => navigate("/teacher-profile")}>My Account</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        </div>

        <div style={styles.main}>
          <Typography variant="h5" style={styles.heading}>
            Active Classes
          </Typography>

          <div style={styles.cardContainer}>
            {classes.map((name, index) => (
              <div
                key={index}
                style={styles.classCard}
                onClick={() => navigate("/teacher-classroomcard")}
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
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddClass} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: "200px",
    backgroundColor: "#FFE8A3",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    color: "#451513",
    position: "fixed",
    top: "60px",
    bottom: "0",
    zIndex: 1,
  },
  sidebarTitle: {
    marginBottom: "20px",
    fontWeight: "bold",
  },
  sidebarItem: {
    cursor: "pointer",
    fontWeight: "bold",
    padding: "10px 15px",
    marginBottom: "10px",
    transition: "all 0.3s",
  },
  classList: {
    marginTop: "10px",
    marginLeft: "10px",
  },
  subItem: {
    fontSize: "14px",
    marginBottom: "5px",
    cursor: "pointer",
  },
  content: {
    flexGrow: 1,
    marginLeft: "240px",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    height: "60px",
    backgroundColor: "#451513",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "2px solid #FFE8A3",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  main: {
    flexGrow: 1,
    padding: "30px",
    backgroundColor: "#FFFBE0",
    marginTop: "60px",
  },
  heading: {
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
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
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "0.3s ease-in-out",
  },
  addCard: {
    backgroundColor: "#FFEDB6",
    color: "#000",
  },
};

export default TeacherHomepage;
