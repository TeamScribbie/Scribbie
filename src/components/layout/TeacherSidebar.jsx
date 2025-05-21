// AI Context/Frontend/components/layout/TeacherSidebar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth

// Import role constants (optional, but good for consistency if defined centrally)
// For now, we'll use string literals like "ROLE_ADMIN"

const TeacherSidebar = ({ isOpen, activeItem = 'Classes' }) => {
  const navigate = useNavigate();
  const { authState } = useAuth(); // Get authentication state

  const userRoles = authState.user?.roles || []; // Get roles, default to empty array

  // Helper to check for roles
  const hasRole = (role) => userRoles.includes(role);

  const handleNavigation = (path) => {
    console.log(`Teacher Sidebar: Navigating to ${path}`);
    navigate(path); // Navigate directly to the path
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Typography variant="h6" className="sidebar-title">
        Menu
      </Typography>

      {/* Common Teacher Items */}
      {(hasRole("ROLE_TEACHER") || hasRole("ROLE_ADMIN") || hasRole("ROLE_SUPERADMIN")) && (
        <div
          className={`sidebar-item ${activeItem === 'Classes' ? 'active' : ''}`}
          onClick={() => handleNavigation('/teacher-homepage')} // Main page for class/request overview
        >
          My Dashboard
        </div>
      )}
      
      {/* Example: Grades - visible to all teacher types */}
      {(hasRole("ROLE_TEACHER") || hasRole("ROLE_ADMIN") || hasRole("ROLE_SUPERADMIN")) && (
        <div
            className={`sidebar-item ${activeItem === 'Grades' ? 'active' : ''}`}
            onClick={() => console.log('Navigate to Grades (not implemented yet)')} // Placeholder
        >
            Grades
        </div>
      )}


      {/* ✨ Admin Specific Items ✨ */}
      {(hasRole("ROLE_ADMIN") || hasRole("ROLE_SUPERADMIN")) && (
        <div
          className={`sidebar-item ${activeItem === 'ManageCourses' ? 'active' : ''}`}
          onClick={() => handleNavigation('/teacher/manage-courses')} // New route
        >
          Manage Courses
        </div>
      )}

      {/* ✨ Superadmin Specific Items ✨ */}
      {hasRole("ROLE_SUPERADMIN") && (
        <div
          // highlight-start
          className={`sidebar-item ${activeItem === 'ManageAdmins' ? 'active' : ''}`}
          onClick={() => handleNavigation('/teacher/manage-admins')} // Updated path
        >
          Manage Admins 
          {/*// highlight-end*/}
        </div>
      )}
      
      {/* You can add more items and conditions here */}
    </>
  );
};

TeacherSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  activeItem: PropTypes.string,
};

export default TeacherSidebar;