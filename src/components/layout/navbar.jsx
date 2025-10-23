// src/components/layout/navbar.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Avatar, Badge, Menu, MenuItem, Chip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';
import { useAuth } from '../../context/AuthContext';
import ScribbieLogo from '../../assets/ScribbieLogoV2.png';

const Navbar = ({ sidebarOpen, setSidebarOpen, transparent, onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { authState, logout } = useAuth();
  const openMenu = Boolean(anchorEl);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <div className="navbar-left">
        {/* Mobile Hamburger Menu */}
        {isMobile && onMobileMenuToggle && (
          <IconButton 
            onClick={onMobileMenuToggle} 
            className="navbar-icon-button mobile-menu-btn"
            aria-label="Toggle mobile menu"
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {/* Logo */}
        <div className="navbar-logo-background">
            <img
              src={ScribbieLogo}
              alt="Scribbie Logo"
              style={{ height: isMobile ? '32px' : '40px', cursor: 'pointer' }}
              onClick={() => navigate('/')} 
            />
        </div>
        
      </div>

      <div className="navbar-right">
        {authState.isAuthenticated && (
          <div className="navbar-user-section">
            {authState.userType && (
              <Chip label={authState.userType.toUpperCase()} size="small" className="user-type-indicator" />
            )}
            
            <div className="navbar-user-info">
              <p className="navbar-user-name">
                {authState.user?.name || 'Test Student'}
              </p>
              <p className="navbar-user-email">
                {authState.user?.email || 'john.doe@student.edu'}
              </p>
            </div>
            
            <Avatar className="navbar-avatar">
              {authState.user?.name ? authState.user.name.charAt(0).toUpperCase() : 'SN'}
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
};

Navbar.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func,
  transparent: PropTypes.bool,
  onMobileMenuToggle: PropTypes.func,
};

Navbar.defaultProps = {
    transparent: false,
};

export default Navbar;