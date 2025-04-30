import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentNavbar from "../../components/layout/StudentNavbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const StudentClass = () => {
  const { className } = useParams();
  const navigate = useNavigate();

  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleOpenModal = () => setOpenJoinModal(true);
  const handleCloseModal = () => {
    setNewClassName("");
    setOpenJoinModal(false);
  };

  const handleJoinClass = () => {
    if (newClassName.trim()) {
      navigate(`/student-class/${newClassName.trim()}`);
      handleCloseModal();
    }
  };

  const activities = [
    { title: "📢 New Announcement", content: "Your teacher posted a reminder for the quiz tomorrow." },
    { title: "📝 Challenge #3", content: "Complete the Vocabulary Builder for this week!" },
    { title: "📚 Lesson 5", content: "New lesson available: 'Using Context Clues'" },
  ];

  return (
    <div style={{ backgroundColor: "#FFFBE0", minHeight: "100vh", overflowX: "hidden" }}>
      <StudentNavbar />
      <StudentSidebar onToggle={setSidebarOpen} />

      {/* Top Controls */}
      <Box
        sx={{
          paddingTop: "70px", // space below fixed navbar
          paddingLeft: sidebarOpen ? "240px" : "80px",
          paddingRight: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "padding-left 0.3s",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#542d1d" }}>
          {className ? `Classroom: ${className}` : "Welcome to Your Class!"}
        </Typography>

        <Button
          onClick={handleOpenModal}
          variant="contained"
          sx={{
            backgroundColor: "#FFCE58",
            color: "#542d1d",
            fontWeight: "bold",
            borderRadius: "10px",
            paddingX: "20px",
            paddingY: "10px",
            '&:hover': {
              backgroundColor: "#ffd74f",
            }
          }}
        >
          + Join Class
        </Button>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          padding: "30px 20px 20px",
          marginLeft: sidebarOpen ? "220px" : "60px",
          transition: "margin-left 0.3s",
        }}
      >
        {/* Welcome Section */}
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#542d1d", marginBottom: 1 }}>
          🎉 Yay! You’ve entered your classroom. Let’s start learning together!
        </Typography>

        <Typography sx={{ fontSize: "16px", color: "#6d4c41", marginBottom: 2 }}>
          This is your very own space where you can learn new things, complete fun challenges, and explore lessons every day!
        </Typography>

        <Typography sx={{ fontWeight: "bold", fontSize: "17px", color: "#542d1d", marginBottom: 0.5 }}>
          🥅 Goals for Today:
        </Typography>

        <ul style={{ paddingLeft: "20px", color: "#6d4c41", fontSize: "15px", marginTop: 0, marginBottom: "30px" }}>
          <li>Learn something new from your lesson</li>
          <li>Finish at least one challenge</li>
          <li>Have fun and do your best!</li>
        </ul>

        {/* Activities */}
        <Grid container spacing={3}>
          {activities.map((activity, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{
                backgroundColor: "#FFF9D9",
                border: "2px solid #FFD966",
                borderRadius: "15px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.1)"
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#542d1d" }}>
                    {activity.title}
                  </Typography>
                  <Typography sx={{ marginTop: 1, color: "#6d4c41" }}>
                    {activity.content}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Join Class Modal */}
      <Dialog
        open={openJoinModal}
        onClose={handleCloseModal}
        PaperProps={{
          style: {
            backgroundColor: "#FFE9A7",
            borderRadius: "15px",
          },
        }}
      >
        <DialogTitle style={{ color: "#542d1d", fontWeight: "bold" }}>
          Enter Class Code
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Code:"
            type="text"
            fullWidth
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            InputProps={{
              style: {
                backgroundColor: "white",
                borderRadius: "8px",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="error">Cancel</Button>
          <Button onClick={handleJoinClass} variant="contained" color="primary">Join</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentClass;
