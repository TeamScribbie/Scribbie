// ClassroomCard.jsx (Updated to open centered RankingModal on full Challenge 1 click)
import React, { useState } from "react";
import { Typography, Tabs, Tab, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import Navbar from "../../components/layout/navbar";
import Sidebar from "../../components/layout/TeacherSidebar";
import RankingModal from "../../components/modals/RankingModal";

const studentData = [
  { id: 1, name: "Jane Doe", lessons: 1, grade: "100%" },
  { id: 2, name: "Juvelat", lessons: 1, grade: "100%" },
  { id: 3, name: "Jenelyn", lessons: 1, grade: "100%" },
  { id: 4, name: "Julianne", lessons: 1, grade: "100%" },
];

const ClassroomCard = ({ classroomName }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activeView, setActiveView] = useState("activities");
  const [rankingOpen, setRankingOpen] = useState(false);
  const { id } = useParams();
  const classroom = classroomName || `Classroom ${id}`;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleView = (view) => {
    setActiveView(view);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <Sidebar sidebarOpen={sidebarOpen} classes={["Classroom 1", "Classroom 2"]} />
      <div style={{ flexGrow: 1, marginLeft: sidebarOpen ? "200px" : "0", transition: "margin 0.3s ease" }}>
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          anchorEl={null}
          setAnchorEl={() => {}}
        />
        <div style={{ padding: "80px 100px" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4, borderBottom: "1px solid #ccc" }}>
            <Box
              onClick={() => toggleView("activities")}
              sx={{
                mr: 5,
                pb: 1,
                fontWeight: "bold",
                cursor: "pointer",
                borderBottom: activeView === "activities" ? "3px solid #451513" : "none",
                color: activeView === "activities" ? "#451513" : "#888",
              }}
            >
              Activities
            </Box>
            <Box
              onClick={() => toggleView("classRecord")}
              sx={{
                pb: 1,
                fontWeight: "bold",
                cursor: "pointer",
                borderBottom: activeView === "classRecord" ? "3px solid #451513" : "none",
                color: activeView === "classRecord" ? "#451513" : "#888",
              }}
            >
              Class Record
            </Box>
          </Box>

          <Typography variant="h5" style={{ fontWeight: "bold", color: "#451513", marginBottom: "20px" }}>
            {classroom}
          </Typography>

          {activeView === "activities" && (
            <Box
              sx={{
                width: "100%",
                maxWidth: "720px",
                margin: "auto",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "10px 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                TabIndicatorProps={{ style: { backgroundColor: "transparent" } }}
                sx={{
                  backgroundColor: "#A86F4C",
                  "& .MuiTab-root": {
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: "bold",
                    flex: 1,
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#5C2E12",
                    borderRadius: "0px",
                    width: "100%",
                    color: "#fffff",
                  },
                }}
              >
                <Tab label="Ongoing" />
                <Tab label="Completed" />
              </Tabs>

              <Box
                sx={{
                  backgroundColor: activeTab === 0 ? "#FFD966" : "#FFD966",
                  padding: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() => setRankingOpen(true)}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mr: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Challenge 1
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "#451513",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "70px",
                      height: "70px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    {activeTab === 0 ? "80%" : "100%"}
                  </Box>
                </Box>

                <Box
                  sx={{
                    flexGrow: 1,
                    backgroundColor: "#fff4cc",
                    borderRadius: "15px",
                    padding: "15px 20px",
                  }}
                >
                  <Box sx={{ backgroundColor: "#fff", height: "10px", width: "60%", borderRadius: "5px", mb: 1 }} />
                  <Box sx={{ backgroundColor: "#fff", height: "10px", width: "50%", borderRadius: "5px", mb: 1 }} />
                  <Box sx={{ backgroundColor: "#fff", height: "10px", width: "40%", borderRadius: "5px" }} />
                </Box>
              </Box>
            </Box>
          )}

          {activeView === "classRecord" && (
            <Box
              sx={{
                backgroundColor: "#FFD966",
                borderRadius: "20px",
                maxWidth: "700px",
                margin: "0 auto",
                padding: "20px 30px",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 2fr 1fr",
                  fontWeight: "bold",
                  mb: 2,
                }}
              >
                <Typography>School ID</Typography>
                <Typography>Name</Typography>
                <Typography>Lesson Completed</Typography>
                <Typography>Grading</Typography>
              </Box>
              {studentData.map((student) => (
                <Box
                  key={student.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr 2fr 1fr",
                    backgroundColor: "#FFEA94",
                    borderRadius: "10px",
                    padding: "10px",
                    mb: 1,
                  }}
                >
                  <Typography>{student.id}</Typography>
                  <Typography sx={{ fontWeight: "bold" }}>{student.name}</Typography>
                  <Typography>{student.lessons}</Typography>
                  <Typography sx={{ fontWeight: "bold" }}>{student.grade}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </div>
        <RankingModal open={rankingOpen} onClose={() => setRankingOpen(false)} />
      </div>
    </div>
  );
};

export default ClassroomCard;
