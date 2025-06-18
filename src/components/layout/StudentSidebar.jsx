import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import ClassIcon from '@mui/icons-material/School';
import GradesIcon from '@mui/icons-material/Assessment';
import ChallengesIcon from '@mui/icons-material/EmojiEvents';

const StudentSidebar = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  if (!isOpen || !authState.isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      label: 'Classes',
      icon: <ClassIcon fontSize="medium" />,
      path: '/student-homepage',
    },
    {
      label: 'Challenges',
      icon: <ChallengesIcon fontSize="medium" />,
      path: '/student-challenges',
    },
    {
      label: 'Grades',
      icon: <GradesIcon fontSize="medium" />,
      path: '/student-grades',
    },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '80px',
        backgroundColor: '#f9b121',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '80px',
        zIndex: 10,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {menuItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);

        return (
          <Box
            key={item.label}
            onClick={() => navigate(item.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <Box
              sx={{
                backgroundColor: isActive ? '#fff' : '#ffffff55',
                color: isActive ? '#f9b121' : '#2d2d2d',
                borderRadius: '50%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </Box>
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                color: isActive ? '#fff' : '#2d2d2d',
                fontWeight: isActive ? 700 : 500,
                fontSize: '11px',
                textAlign: 'center',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

StudentSidebar.propTypes = {
  isOpen: PropTypes.bool,
};

export default StudentSidebar;
