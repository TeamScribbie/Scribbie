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

const Navbar = ({ sidebarOpen, setSidebarOpen, transparent, onMobileMenuToggle, className }) => {
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

  const handleLogoClick = () => {
    if (authState.isAuthenticated) {
      // If user is authenticated, navigate to their respective homepage
      if (authState.userType === 'Teacher') {
        navigate('/teacher-homepage');
      } else if (authState.userType === 'Student') {
        navigate('/student-homepage');
      }
    } else {
      // If not authenticated, go to landing page
      navigate('/');
    }
  };

  // Detect if we're on a student page
  const isStudentPage = window.location.pathname.includes('/student') || authState.userType === 'Student';

  return (
    <div className={`navbar-container ${transparent ? 'transparent' : ''} ${isStudentPage ? 'student-navbar' : ''} ${className || ''}`}>
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
              onClick={handleLogoClick} 
            />
        </div>
        
      </div>

      <div className="navbar-right">
        {authState.isAuthenticated && (
          <>
            {/* Notifications */}
            <IconButton className="navbar-icon-button" aria-label="Notifications">
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <div className="navbar-user-section">
              {authState.userType && (
                <Chip label={authState.userType.toUpperCase()} size="small" className="user-type-indicator" />
              )}
            
            <div className="navbar-user-info">
              <p className="navbar-user-name">
                {authState.user?.name || 'Test Student'}
              </p>
            </div>
            
            <IconButton
              onClick={handleProfileClick}
              className="navbar-avatar-button"
              aria-label="User menu"
            >
              <Avatar className="navbar-avatar">
                {authState.user?.name ? authState.user.name.charAt(0).toUpperCase() : 'SN'}
              </Avatar>
            </IconButton>
            
            {/* Profile Menu */}
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
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(249, 177, 33, 0.1)',
                }
              }}
            >
              <MenuItem onClick={handleAccount} sx={{ py: 1.5, px: 2 }}>
                <AccountCircle sx={{ mr: 2, color: '#451513' }} />
                My Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2, color: '#F13A50' }}>
                <span style={{ marginRight: 16 }}>🚪</span>
                Logout
              </MenuItem>
            </Menu>
            </div>
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
  onMobileMenuToggle: PropTypes.func,
  className: PropTypes.string,
};

Navbar.defaultProps = {
    transparent: false,
};

export default Navbar;