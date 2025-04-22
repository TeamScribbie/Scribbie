// src/components/layout/TeacherSidebar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TeacherSidebar = ({ isOpen, activeItem = 'Classes' }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
    if (path === '/teacher/classes') {
      navigate('/teacher-homepage');
    } else if (path === '/teacher/grades') {
       console.log('Navigate to Grades (not implemented)');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Typography variant="h6" className="sidebar-title">
        Menu
      </Typography>
      <div
        className={`sidebar-item ${activeItem === 'Classes' ? 'active' : ''}`}
        onClick={() => handleNavigation('/teacher/classes')}
      >
        Classes
      </div>
      <div
        className={`sidebar-item ${activeItem === 'Grades' ? 'active' : ''}`}
        onClick={() => handleNavigation('/teacher/grades')}
      >
        Grades
      </div>
    </>
  );
};

TeacherSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  activeItem: PropTypes.string,
};

export default TeacherSidebar;