// src/components/layout/TeacherNavbar.jsx

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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ScribbieLogo from '../../assets/ScribbieLogoV2.png';

const TeacherNavbar = ({ sidebarOpen, setSidebarOpen, transparent, className }) => {
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
    navigate('/teacher-login');
  };

  const handleProfile = () => {
    handleCloseMenu();
    navigate('/teacher/profile');
  };

  const handleSettings = () => {
    handleCloseMenu();
    navigate('/teacher/settings');
  };

  const handleLogoClick = () => {
    navigate('/teacher-homepage');
  };

  const toggleSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Get user's highest role for display
  const getUserRole = () => {
    const userRoles = authState.user?.roles || [];
    if (userRoles.includes('ROLE_SUPERADMIN')) return { label: 'Super Admin', color: '#f093fb' };
    if (userRoles.includes('ROLE_ADMIN')) return { label: 'Admin', color: '#36B8E4' };
    return { label: 'Teacher', color: '#f9b121' };
  };

  const userRole = getUserRole();
  const userName = authState.user?.name || 'Teacher';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Box
      sx={{
        height: '80px',
        background: transparent 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 4,
        borderBottom: '1px solid rgba(249, 177, 33, 0.15)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(249, 177, 33, 0.1)',
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? '280px' : '0',
        right: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(className && { className })
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Sidebar Toggle */}
        <Tooltip title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          <IconButton 
            onClick={toggleSidebar}
            sx={{
              color: '#f9b121',
              background: 'rgba(249, 177, 33, 0.1)',
              borderRadius: 2,
              p: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(249, 177, 33, 0.2)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(249, 177, 33, 0.2)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
        
        {/* Logo - only show on mobile when sidebar is closed */}
        {(!sidebarOpen || isMobile) && (
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
                background: 'rgba(249, 177, 33, 0.1)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            <img
              src={ScribbieLogo}
              alt="Scribbie Logo"
              style={{ height: isMobile ? '32px' : '40px' }}
            />
          </Box>
        )}
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {authState.isAuthenticated && (
          <>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: '#36B8E4',
                  background: 'rgba(54, 184, 228, 0.1)',
                  borderRadius: 2,
                  p: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(54, 184, 228, 0.2)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(54, 184, 228, 0.2)'
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
              gap: 2,
              pl: 2,
              borderLeft: '1px solid rgba(249, 177, 33, 0.2)'
            }}>
              {/* Role Chip */}
              <Chip
                label={userRole.label}
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${userRole.color} 0%, ${userRole.color}CC 100%)`,
                  color: 'white',
                  fontWeight: 600,
                  height: 32,
                  borderRadius: 2,
                  border: `1px solid ${userRole.color}40`,
                  boxShadow: `0 3px 8px ${userRole.color}30`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${userRole.color}40`
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
                      color: '#1a1a1a',
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
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}
                  >
                    {userRole.label}
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
                      width: 40,
                      height: 40,
                      background: `linear-gradient(135deg, ${userRole.color} 0%, ${userRole.color}CC 100%)`,
                      color: 'white',
                      fontWeight: 700,
                      border: `2px solid ${userRole.color}40`,
                      boxShadow: `0 3px 10px ${userRole.color}30`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 15px ${userRole.color}40`,
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
                    minWidth: 220,
                    borderRadius: 3,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(249, 177, 33, 0.1)',
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
                      backgroundColor: 'rgba(249, 177, 33, 0.1)'
                    }
                  }}
                >
                  <AccountCircle sx={{ mr: 2, color: '#f9b121' }} />
                  My Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleSettings} 
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(54, 184, 228, 0.1)'
                    }
                  }}
                >
                  <SettingsIcon sx={{ mr: 2, color: '#36B8E4' }} />
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

TeacherNavbar.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func,
  transparent: PropTypes.bool,
  className: PropTypes.string,
};

TeacherNavbar.defaultProps = {
  transparent: false,
  sidebarOpen: true,
};

export default TeacherNavbar;
