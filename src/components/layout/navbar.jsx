// src/components/layout/navbar.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Avatar, Badge, Menu, MenuItem, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

// Remove userType prop, get from context instead
const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { authState, logout } = useAuth(); // Get state and logout from context
  const openMenu = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Use context logout function
  const handleLogout = () => {
    handleCloseMenu();
    logout(); // Call context logout
    // Navigate to a public page after logout
    navigate('/student-login'); // Or a landing page '/'
  };

  // Navigate based on context userType
  const handleAccount = () => {
    handleCloseMenu();
     if (authState.userType === 'Teacher') {
      navigate('/teacher-profile');
    } else if (authState.userType === 'Student'){
      navigate('/student-profile');
    }
  }

  return (
    <div className="navbar-container">
      <div className="navbar-left">
        {setSidebarOpen && (
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} className="navbar-icon-button">
              <MenuIcon />
            </IconButton>
        )}
      </div>

      <div className="navbar-right">
        {/* Use userType from authState */}
        {authState.isAuthenticated && authState.userType && (
          <Chip label={authState.userType.toUpperCase()} size="small" className="user-type-indicator" />
        )}

        {/* Only show notifications/profile if authenticated */}
        {authState.isAuthenticated && (
          <>
            <IconButton color="inherit" className="navbar-icon-button">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileClick} className="navbar-avatar-button">
              {/* Display initials or name if available */}
              <Avatar className="navbar-avatar">
                 {authState.user?.name ? authState.user.name.charAt(0).toUpperCase() : <AccountCircle />}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              // ... (menu props)
            >
              <MenuItem onClick={handleAccount}>My Account</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
         {/* Optionally show Login/Register buttons if not authenticated */}
         {!authState.isAuthenticated && (
             <>
                {/* Add Login/Register buttons or links here if desired */}
             </>
         )}
      </div>
    </div>
  );
};

// Update PropTypes - userType is no longer passed directly
Navbar.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func,
};

export default Navbar;