import React from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SidebarStyles from "../styles/SidebarStyles";

const Sidebar = ({ sidebarOpen, classes, activeItem }) => {
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
              backgroundColor:
                activeItem === "My Classes" ? "#FFD966" : "transparent",
              borderRadius: "15px",
              width: "100%",
              paddingLeft: "20px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/teacher-homepage")}
            onMouseOver={(e) => {
              if (activeItem !== "My Classes")
                e.currentTarget.style.backgroundColor = "#f5c842";
            }}
            onMouseOut={(e) => {
              if (activeItem !== "My Classes")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            My Classes
          </div>

          {/* Classroom subitems under My Classes */}
          {activeItem === "My Classes" && (
            <div style={SidebarStyles.classList}>
              <div
                style={{
                  ...SidebarStyles.subItem,
                  cursor: "pointer",
                }}
                onClick={() => navigate("/classroom/1")}
              >
                Classroom 1
              </div>
              <div
                style={{
                  ...SidebarStyles.subItem,
                  cursor: "pointer",
                }}
                onClick={() => navigate("/classroom/2")}
              >
                Classroom 2
              </div>
            </div>
          )}

          {/* Challenges */}
          <div
            style={{
              ...SidebarStyles.sidebarItem,
              backgroundColor:
                activeItem === "Challenges" ? "#FFD966" : "transparent",
              marginTop: "20px",
              borderRadius: "15px",
              width: "100%",
              paddingLeft: "20px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/teacher-challenges")}
            onMouseOver={(e) => {
              if (activeItem !== "Challenges")
                e.currentTarget.style.backgroundColor = "#f5c842";
            }}
            onMouseOut={(e) => {
              if (activeItem !== "Challenges")
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Challenges
          </div>

          {/* Challenge subitems */}
          {activeItem === "Challenges" && (
            <div style={SidebarStyles.classList}>
              {classes.map((cls, index) => (
                <div
                  key={index}
                  style={{
                    ...SidebarStyles.subItem,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/challenges/${index + 1}`)}
                >
                  {cls}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;
