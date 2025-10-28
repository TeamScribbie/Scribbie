// AI Context/Frontend/components/layout/TeacherSidebar.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Tooltip, Avatar, Divider, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import Material-UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Import role constants (optional, but good for consistency if defined centrally)
// For now, we'll use string literals like "ROLE_ADMIN"

const TeacherSidebar = ({ isOpen, activeItem = 'Classes', onToggle }) => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const userRoles = authState.user?.roles || [];
  const userName = authState.user?.name || 'Teacher';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Helper to check for roles
  const hasRole = (role) => userRoles.includes(role);

  const handleNavigation = (path) => {
    console.log(`Teacher Sidebar: Navigating to ${path}`);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/teacher-login');
  };

  // Get user's highest role for display
  const getUserRole = () => {
    if (hasRole('ROLE_SUPERADMIN')) return { label: 'Super Admin', color: '#f093fb' };
    if (hasRole('ROLE_ADMIN')) return { label: 'Admin', color: '#36B8E4' };
    return { label: 'Teacher', color: '#f9b121' };
  };

  const userRole = getUserRole();

  // Menu items configuration
  const menuItems = [
    {
      id: 'Classes',
      label: 'My Dashboard',
      icon: DashboardIcon,
      path: '/teacher-homepage',
      roles: ['ROLE_TEACHER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN']
    },
    {
      id: 'ManageCourses',
      label: 'Manage Courses',
      icon: SchoolIcon,
      path: '/teacher/manage-courses',
      roles: ['ROLE_ADMIN', 'ROLE_SUPERADMIN']
    },
    {
      id: 'ManageAdmins',
      label: 'Manage Admins',
      icon: SupervisorAccountIcon,
      path: '/teacher/manage-admins',
      roles: ['ROLE_SUPERADMIN']
    }
  ];

  // Filter menu items based on user roles
  const visibleMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header Section */}
      <Box sx={{ p: 3, pb: 2 }}>
        {/* User Profile Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${userRole.color} 0%, ${userRole.color}CC 100%)`,
              color: 'white',
              fontWeight: 700,
              fontSize: '1.2rem',
              mr: 2,
              border: '3px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: '#451513',
                fontSize: '1rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {userName}
            </Typography>
            <Chip
              label={userRole.label}
              size="small"
              sx={{
                mt: 0.5,
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                color: '#451513',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          </Box>
        </Box>

        {/* Menu Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#451513',
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 2
          }}
        >
          Navigation
        </Typography>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, px: 2 }}>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <Tooltip
              key={item.id}
              title={item.label}
              placement="right"
              arrow
              disableHoverListener
            >
              <Box
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.4)'
                    : isHovered
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'transparent',
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(249, 177, 33, 0.3)'
                    : isHovered
                    ? '0 2px 8px rgba(249, 177, 33, 0.2)'
                    : 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: isActive ? '#451513' : 'transparent',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Icon
                  sx={{
                    fontSize: '1.4rem',
                    color: isActive ? '#451513' : 'rgba(69, 21, 19, 0.7)',
                    mr: 2,
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#451513' : 'rgba(69, 21, 19, 0.8)',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2, pt: 1 }}>
        <Divider sx={{ mb: 2, backgroundColor: 'rgba(69, 21, 19, 0.2)' }} />
        
        {/* Profile & Logout */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Tooltip title="My Profile" placement="right" arrow>
            <Box
              onClick={() => handleNavigation('/teacher/profile')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateX(2px)'
                }
              }}
            >
              <PersonIcon
                sx={{
                  fontSize: '1.2rem',
                  color: 'rgba(69, 21, 19, 0.7)',
                  mr: 2
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: 'rgba(69, 21, 19, 0.8)',
                  fontSize: '0.85rem'
                }}
              >
                My Profile
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Logout" placement="right" arrow>
            <Box
              onClick={handleLogout}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  transform: 'translateX(2px)'
                }
              }}
            >
              <LogoutIcon
                sx={{
                  fontSize: '1.2rem',
                  color: '#ef4444',
                  mr: 2
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: '#ef4444',
                  fontSize: '0.85rem'
                }}
              >
                Logout
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

TeacherSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  activeItem: PropTypes.string,
  onToggle: PropTypes.func,
};

export default TeacherSidebar;