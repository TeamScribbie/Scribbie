import React, { useState } from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  MenuItem,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/TeacherNavbar";
import Sidebar from "../../components/layout/TeacherSidebar";
import styles from "../../components/styles/TeacherHomepageStyles";

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from "dayjs";

const TeacherChallenges = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [activityTitle, setActivityTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [activityType, setActivityType] = useState("");
  const [classroom, setClassroom] = useState(""); // ✅ classroom selector
  const [duration, setDuration] = useState("");
  const [startDateTime, setStartDateTime] = useState(dayjs());
  const [endDateTime, setEndDateTime] = useState(dayjs());
  const [attachment, setAttachment] = useState("");
  const [classes, setClasses] = useState(["Challenge 1", "Challenge 2"]);
  const [classrooms, ] = useState(["Classroom 1", "Classroom 2"]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleCreateActivity = () => {
    if (!activityTitle.trim() || !classroom) return;

    setClasses([...classes, activityTitle]);

    // Reset form
    setActivityTitle("");
    setInstructions("");
    setActivityType("");
    setClassroom("");
    setDuration("");
    setStartDateTime(dayjs());
    setEndDateTime(dayjs());
    setAttachment("");
    setOpenDialog(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div style={styles.container}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          classes={classes}
          activeItem="Challenges"
        />

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
            <div
              style={{
                backgroundColor: "#FFE8A3",
                borderRadius: "20px",
                padding: "30px",
              }}
            >
              <Typography variant="h5" style={styles.heading}>
                Challenges
              </Typography>

              <div style={styles.cardContainer}>
                {classes
                  .sort((a, b) => a.localeCompare(b))
                  .map((cls, index) => (
                    <div
                      key={index}
                      style={styles.classCard}
                      onClick={() => navigate(`/challenges/${index + 1}`)}
                    >
                      <EmojiEventsIcon
                        sx={{ color: "#451513", fontSize: 32, mb: 1 }}
                      />
                      <Tooltip title={`Go to ${cls}`}>
                        <Typography variant="subtitle1">{cls}</Typography>
                      </Tooltip>
                    </div>
                  ))}

                <div
                  style={{ ...styles.classCard, ...styles.addCard }}
                  onClick={() => setOpenDialog(true)}
                >
                  + Add
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ backgroundColor: "#FFE8A3" }}>
            Create an Activity
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#FFE8A3" }}>
            <TextField
              autoFocus
              margin="dense"
              label="Activity Title"
              fullWidth
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
            />

            <TextField
              margin="dense"
              label="Instructions / Description"
              multiline
              rows={3}
              fullWidth
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />

            {/* ✅ Select classroom */}
            <TextField
              margin="dense"
              label="Assign to Classroom"
              select
              fullWidth
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
            >
              {classrooms.map((room, idx) => (
                <MenuItem key={idx} value={room}>
                  {room}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              margin="dense"
              label="Activity Type"
              select
              fullWidth
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
            >
              <MenuItem value="quiz">Quiz</MenuItem>
              <MenuItem value="drawing">Drawing</MenuItem>
              <MenuItem value="matching">Matching</MenuItem>
              <MenuItem value="video">Video Task</MenuItem>
              <MenuItem value="written">Written Answer</MenuItem>
            </TextField>

            <TextField
              margin="dense"
              label="Duration"
              select
              fullWidth
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <MenuItem value="today">Today Only</MenuItem>
              <MenuItem value="1day">1-Day Activity</MenuItem>
              <MenuItem value="3days">3-Day Challenge</MenuItem>
              <MenuItem value="1week">1-Week Challenge</MenuItem>
              <MenuItem value="custom">Custom Date Range</MenuItem>
            </TextField>

            {duration === "custom" && (
              <>
                <DateTimePicker
                  label="Start Date & Time"
                  value={startDateTime}
                  onChange={setStartDateTime}
                  sx={{ mt: 2, width: "100%" }}
                />
                <DateTimePicker
                  label="End Date & Time"
                  value={endDateTime}
                  onChange={setEndDateTime}
                  sx={{ mt: 2, width: "100%" }}
                />
              </>
            )}

            <TextField
              margin="dense"
              label="Attachment / Link (optional)"
              fullWidth
              value={attachment}
              onChange={(e) => setAttachment(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ backgroundColor: "#FFE8A3" }}>
            <Button onClick={() => setOpenDialog(false)}>CANCEL</Button>
            <Button
              onClick={handleCreateActivity}
              variant="contained"
              sx={{
                backgroundColor: "#451513",
                "&:hover": { backgroundColor: "#2f0f0e" },
              }}
            >
              CREATE
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default TeacherChallenges;
