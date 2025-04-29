import React, { useState } from "react";
import { IconButton, Avatar, Badge, Menu, MenuItem } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/scribbie-logo.png"; // adjust the path if needed

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const openProfileMenu = Boolean(anchorEl);
  const openNotifMenu = Boolean(notifAnchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleCloseNotifMenu = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseProfileMenu();
    navigate("/teacher-login");
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.navLeft}>
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>
        <img src={logo} alt="Scribbie Logo" style={styles.logo} />
      </div>

      <div style={styles.navRight}>
        <span style={styles.roleBadge}>TEACHER</span>

        <IconButton color="inherit" onClick={handleNotifClick}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon sx={{ bgcolor: "#FFD966" }} />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notifAnchorEl}
          open={openNotifMenu}
          onClose={handleCloseNotifMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem disabled><strong>Notifications</strong></MenuItem>
          <MenuItem onClick={handleCloseNotifMenu}>New consultation scheduled</MenuItem>
          <MenuItem onClick={handleCloseNotifMenu}>Parent confirmed meeting</MenuItem>
          <MenuItem onClick={handleCloseNotifMenu}>Reminder: Upcoming consultation</MenuItem>
        </Menu>

        <IconButton onClick={handleProfileClick}>
          <Avatar sx={{ bgcolor: "#FFD966", width: 32, height: 32 }}>
            <AccountCircle />
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={openProfileMenu}
          onClose={handleCloseProfileMenu}
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
    gap: "10px",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logo: {
    height: "40px",
  },
  roleBadge: {
    backgroundColor: "#00D651",
    color: "white",
    fontWeight: "bold",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    letterSpacing: "0.5px",
  },
};

export default Navbar;
