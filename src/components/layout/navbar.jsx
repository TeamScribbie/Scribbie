// src/components/layout/navbar.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { IconButton, Avatar, Badge, Menu, MenuItem, Chip, Typography } from '@mui/material'; // Import Chip
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css'; // Import the CSS file

// Accept userType prop ('Teacher', 'Student', or null/undefined)
const Navbar = ({ sidebarOpen, setSidebarOpen, userType }) => {
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
    // Navigate based on user type or to a generic landing page
    if (userType === 'Teacher') {
      navigate('/teacher-login');
    } else {
      navigate('/student-login'); // Default or student login
    }
  };

  const handleAccount = () => {
    handleCloseMenu();
     // Navigate based on user type
     if (userType === 'Teacher') {
      navigate('/teacher-profile'); // Example teacher profile route
    } else {
      navigate('/student-profile'); // Example student profile route
    }
  }

  return (
    // Use class name for main container
    <div className="navbar-container">
      <div className="navbar-left">
        {/* Allow sidebar toggle */}
        {setSidebarOpen && ( // Only show if function is provided
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} className="navbar-icon-button">
              <MenuIcon />
            </IconButton>
        )}
      </div>

      <div className="navbar-right">
        {/* Conditionally render the User Type Indicator */}
        {userType && (
          <Chip label={userType.toUpperCase()} size="small" className="user-type-indicator" />
        )}

        <IconButton color="inherit" className="navbar-icon-button">
          <Badge badgeContent={3} color="error"> {/* Example badge content */}
            <NotificationsIcon /> {/* Bell Icon */}
          </Badge>
        </IconButton>

        <IconButton onClick={handleProfileClick} className="navbar-avatar-button">
          <Avatar className="navbar-avatar">
            <AccountCircle />
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleAccount}>My Account</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </div>
    </div>
  );
};

// Define prop types
Navbar.propTypes = {
  sidebarOpen: PropTypes.bool, // Make optional if not always used
  setSidebarOpen: PropTypes.func, // Make optional
  userType: PropTypes.oneOf(['Teacher', 'Student']), // Make optional or required based on usage
};

export default Navbar;