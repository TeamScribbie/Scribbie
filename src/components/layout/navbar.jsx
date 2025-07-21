// src/components/layout/navbar.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Avatar, Badge, Menu, MenuItem, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';
import { useAuth } from '../../context/AuthContext';
import ScribbieLogo from '../../assets/ScribbieLogoV2.png';

const Navbar = ({ sidebarOpen, setSidebarOpen, transparent }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { authState, logout } = useAuth();
  const openMenu = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate('/student-login');
  };

  const handleAccount = () => {
    handleCloseMenu();
    if (authState.userType === 'Teacher') {
      navigate('/teacher-profile');
    } else if (authState.userType === 'Student') {
      navigate('/student-profile');
    }
  };

  return (
    <div className={`navbar-container ${transparent ? 'transparent' : ''}`}>
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
        {/* 🔽 Logo image with white background */}
        <div className="navbar-logo-background">
            <img
              src={ScribbieLogo}
              alt="Scribbie Logo"
              style={{ height: '40px', cursor: 'pointer' }}
              onClick={() => navigate('/')} // Optional: navigate to home
            />
        </div>
        
        {setSidebarOpen && (
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} className="navbar-icon-button">
            <MenuIcon />
          </IconButton>
        )}
      </div>

      <div className="navbar-right">
        {authState.isAuthenticated && authState.userType && (
          <Chip label={authState.userType.toUpperCase()} size="small" className="user-type-indicator" />
        )}

        {authState.isAuthenticated && (
          <>
            <IconButton color="inherit" className="navbar-icon-button">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileClick} className="navbar-avatar-button">
              <Avatar className="navbar-avatar">
                {authState.user?.name ? authState.user.name.charAt(0).toUpperCase() : <AccountCircle />}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleAccount}>My Account</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </div>
    </div>
  );
};

Navbar.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func,
  transparent: PropTypes.bool,
};

Navbar.defaultProps = {
    transparent: false,
};

export default Navbar;