import React from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SidebarStyles from "../styles/SidebarStyles";

const Sidebar = ({ sidebarOpen, classes }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        ...SidebarStyles.sidebar,
        width: sidebarOpen ? "200px" : "0",
        padding: sidebarOpen ? "20px" : "0",
        overflowX: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {sidebarOpen && (
        <>
          <Typography
            variant="h5"
            component="h3"
            style={SidebarStyles.sidebarTitle}
          >
            Menu
          </Typography>

          {/* My Classes */}
          <div
            style={{
              ...SidebarStyles.sidebarItem,
              backgroundColor: "#FFD966",
              borderRadius: "15px",
              width: "100%",
              paddingLeft: "20px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/teacher-homepage")}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f5c842")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#FFD966")}
          >
            My Classes
          </div>

          {/* Classroom Links */}
          <div style={SidebarStyles.classList}>
            {classes.map((cls, index) => (
              <div
                key={index}
                style={{
                  ...SidebarStyles.subItem,
                  cursor: "pointer",
                  transition: "0.2s ease",
                }}
                onClick={() => navigate(`/classroom/${index + 1}`)}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                  e.currentTarget.style.backgroundColor = "#FFF4CC";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {cls}
              </div>
            ))}
          </div>

          {/* Challenges Link */}
          <div
            style={{
              ...SidebarStyles.sidebarItem,
              backgroundColor: "transparent",
              marginTop: "50px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/teacher-challenges")}
          >
            Challenges
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
