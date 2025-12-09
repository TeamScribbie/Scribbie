// src/components/layout/StudentNavbar.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  IconButton, 
  Avatar, 
  Badge, 
  Menu, 
  MenuItem, 
  Chip, 
  Box, 
  Typography,
  Tooltip 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ScribbieLogo from '../../assets/ScribbieLogoV2.png';

const StudentNavbar = ({ transparent, onMobileMenuToggle, className, hideHomeButton }) => {
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

  const handleProfile = () => {
    handleCloseMenu();
    navigate('/student-profile');
  };

  const handleSettings = () => {
    handleCloseMenu();
    navigate('/student/settings');
  };

  const handleLogoClick = () => {
    navigate('/student-homepage');
  };

  const handleHomeClick = () => {
    navigate('/student-homepage');
  };

  const userName = authState.user?.name || 'Student';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Box
      sx={{
        height: '70px',
        background: transparent 
          ? 'rgba(253, 177, 13, 0.95)' 
          : 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: { xs: 2, sm: 3, md: 4 },
        boxShadow: '0 2px 12px rgba(253, 177, 13, 0.15), 0 1px 3px rgba(253, 177, 13, 0.1)',
        position: 'fixed',
        top: 0,
        left: { 
          xs: 0,           // Mobile: no sidebar
          md: '68px',      // Tablet: 70px sidebar - 2px overlap
          lg: '78px',      // Desktop: 80px sidebar - 2px overlap
          xl: '88px'       // Large: 90px sidebar - 2px overlap
        },
        right: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        ...(className && { className })
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Mobile Menu Toggle */}
        {isMobile && onMobileMenuToggle && (
          <Tooltip title="Open menu">
            <IconButton 
              onClick={onMobileMenuToggle}
              sx={{
                color: '#451513',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                p: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {/* Logo */}
        <Box
          onClick={handleLogoClick}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          <img
            src={ScribbieLogo}
            alt="Scribbie Logo"
            style={{ height: isMobile ? '28px' : '36px' }}
          />
        </Box>

        {/* Home Button - Desktop only (can be hidden via prop) */}
        {!isMobile && !hideHomeButton && (
          <Tooltip title="Home">
            <IconButton
              onClick={handleHomeClick}
              sx={{
                color: '#451513',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                p: 1,
                ml: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        {authState.isAuthenticated && (
          <>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: '#451513',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 2,
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'white',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                <Badge badgeContent={0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User Section */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 },
              pl: { xs: 1, sm: 2 },
              borderLeft: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
              {/* Student Chip */}
              <Chip
                label="STUDENT"
                size="small"
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#451513',
                  fontWeight: 700,
                  height: { xs: 28, sm: 32 },
                  borderRadius: 2,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.4)',
                    background: 'white'
                  }
                }}
              />

              {/* User Info - Hide on mobile */}
              {!isMobile && (
                <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#451513',
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '120px'
                    }}
                  >
                    {userName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(69, 21, 19, 0.7)',
                      fontSize: '0.75rem'
                    }}
                  >
                    Student
                  </Typography>
                </Box>
              )}
            
              {/* Avatar */}
              <Tooltip title="User menu">
                <IconButton
                  onClick={handleProfileClick}
                  sx={{
                    p: 0,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#FDB10D',
                      fontWeight: 700,
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 3px 10px rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'white',
                        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.5)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {userInitials}
                  </Avatar>
                </IconButton>
              </Tooltip>
            
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
                    borderRadius: 3,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(253, 177, 13, 0.1)',
                    overflow: 'hidden'
                  }
                }}
              >
                <MenuItem 
                  onClick={handleProfile} 
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(253, 177, 13, 0.1)'
                    }
                  }}
                >
                  <AccountCircle sx={{ mr: 2, color: '#FDB10D' }} />
                  My Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleSettings} 
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(253, 177, 13, 0.1)'
                    }
                  }}
                >
                  <SettingsIcon sx={{ mr: 2, color: '#FDB10D' }} />
                  Settings
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    py: 1.5, 
                    px: 2, 
                    color: '#ef4444',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }
                  }}
                >
                  <LogoutIcon sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

StudentNavbar.propTypes = {
  transparent: PropTypes.bool,
  onMobileMenuToggle: PropTypes.func,
  className: PropTypes.string,
  hideHomeButton: PropTypes.bool,
};

StudentNavbar.defaultProps = {
  transparent: false,
  hideHomeButton: false,
};

export default StudentNavbar;
