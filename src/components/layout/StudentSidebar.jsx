// AI Context/Frontend/components/layout/StudentSidebar.jsx
import React from 'react';
import PropTypes from 'prop-types';
// highlight-start
import { Typography, Box } from '@mui/material'; // Import Box
// highlight-end
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import ClassIcon from '@mui/icons-material/School';
import GradesIcon from '@mui/icons-material/Assessment';
import ChallengesIcon from '@mui/icons-material/EmojiEvents';

const StudentSidebar = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  let activeItem = 'Classes';
  if (location.pathname.includes('/student/grades')) {
    activeItem = 'Grades';
  } else if (location.pathname.includes('/student/challenges')) {
    activeItem = 'Challenges';
  } else if (location.pathname.startsWith('/student/classroom') || location.pathname === '/student-homepage') {
    activeItem = 'Classes';
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (!isOpen || !authState.isAuthenticated) {
    return null;
  }

  return (
    // Using React.Fragment <>...</> because Box was removed as the top-level wrapper
    // If you intended Box for layout, you can re-add it here.
    // For now, assuming the parent component handles the main sidebar layout Box.
    <>
      <Typography variant="h6" className="sidebar-title">
        Menu
      </Typography>
      {/* Each item is now a Box for styling consistency with MUI */}
      <Box
        className={`sidebar-item ${activeItem === 'Classes' ? 'active' : ''}`}
        onClick={() => handleNavigation('/student-homepage')}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} // Added sx for alignment
      >
        <ClassIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
        My Classes
      </Box>
      <Box
        className={`sidebar-item ${activeItem === 'Challenges' ? 'active' : ''}`}
        onClick={() => {
            alert("Student Challenges Overview - To Be Implemented");
        }}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} // Added sx for alignment
      >
        <ChallengesIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
        Challenges
      </Box>
      <Box
        className={`sidebar-item ${activeItem === 'Grades' ? 'active' : ''}`}
        onClick={() => {
            alert("Student Grades - To Be Implemented");
        }}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} // Added sx for alignment
      >
        <GradesIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
        My Grades
      </Box>
    </>
  );
};

StudentSidebar.propTypes = {
  isOpen: PropTypes.bool,
};

export default StudentSidebar;