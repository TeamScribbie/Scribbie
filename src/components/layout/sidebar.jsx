import React from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SidebarStyles from "../styles/SidebarStyles";

const Sidebar = ({ sidebarOpen, classes }) => {
  const navigate = useNavigate();

  console.log("Sidebar is open:", sidebarOpen); 

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
            style={{
              ...SidebarStyles.sidebarTitle,
            }}
          >
            Menu
          </Typography>

          <div
            style={{
              ...SidebarStyles.sidebarItem,
              backgroundColor: "#FFD966",
              borderRadius: "15px",
              width: "100%",
              paddingLeft: "20px",
            }}
            onClick={() => navigate("/teacher-homepage")}
          >
            My Classes
          </div>

          <div style={SidebarStyles.classList}>
            {classes.map((cls, index) => (
              <div key={index} style={SidebarStyles.subItem}>
                {cls}
              </div>
            ))}
          </div>

          <div
         style={{
              ...SidebarStyles.sidebarItem,
                 backgroundColor: "transparent",
                 marginTop: "50px",
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
