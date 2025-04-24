// src/components/layout/StudentSidebar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Making this identical to TeacherSidebar for now
const StudentSidebar = ({ isOpen = true, activeItem = 'Classes' }) => { // Assume open by default if not controlled
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    console.log(`Student Navigating to ${path}`);
    // Use student-specific routes later if needed
    if (path === '/student/classes') {
      navigate('/student-homepage'); // Navigate to student homepage for 'Classes'
    } else if (path === '/student/grades') {
       console.log('Navigate to Student Grades (not implemented)');
       // navigate('/student-grades'); // Navigate to student grades page when it exists
    }
  };

  // If collapsible feature is added later, use isOpen to conditionally render
  // if (!isOpen) {
  //   return null;
  // }

  return (
    <>
      {/* Use Typography matching TeacherSidebar */}
      <Typography variant="h6" className="sidebar-title"> {/* Use Teacher's class */}
        Menu
      </Typography>
      {/* Use structure and classes matching TeacherSidebar */}
      <div
        className={`sidebar-item ${activeItem === 'Classes' ? 'active' : ''}`}
        onClick={() => handleNavigation('/student/classes')} // Point to student routes
      >
        Classes
      </div>
      <div
        className={`sidebar-item ${activeItem === 'Grades' ? 'active' : ''}`}
        onClick={() => handleNavigation('/student/grades')} // Point to student routes
      >
        Grades
      </div>
    </>
  );
};

// Add prop types if using props like isOpen
StudentSidebar.propTypes = {
  isOpen: PropTypes.bool,
  activeItem: PropTypes.string,
};

export default StudentSidebar;