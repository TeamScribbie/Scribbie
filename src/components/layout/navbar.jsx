import React, { useState } from "react";
import { IconButton, Avatar, Badge, Menu, MenuItem } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
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

  return (
    <div style={styles.navbar}>
      <div style={styles.navLeft}>
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>
      </div>

      <div style={styles.navRight}>
        <IconButton color="inherit">
          <Badge badgeContent={3} color="error">
            <NotificationsIcon sx={{ bgcolor: "#FFD966" }} />
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
  );
};

const styles = {
  navbar: {
    height: "60px",
    backgroundColor: "#451513",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "2px solid #FFE8A3",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
};

export default Navbar;
