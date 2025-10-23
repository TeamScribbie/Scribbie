import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/StudentSidebar.css';

import ClassIcon from '@mui/icons-material/School';
import ChallengesIcon from '@mui/icons-material/EmojiEvents';
import ProfileIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/ExitToApp';

const StudentSidebar = ({ isOpen = true, isMobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!authState.isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/student-login');
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const menuItems = [
    {
      label: 'Classes',
      icon: <ClassIcon fontSize="medium" />,
      path: '/student-homepage',
    },
    {
      label: 'Profile',
      icon: <ProfileIcon fontSize="medium" />,
      path: '/student-profile',
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`student-sidebar ${
          isMobile 
            ? isMobileOpen 
              ? 'mobile-open' 
              : 'mobile-hidden'
            : ''
        }`}
      >
        {/* Menu Items */}
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <div
              key={item.label}
              className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="sidebar-menu-icon">
                {item.icon}
              </div>
              <span className="sidebar-menu-label">
                {item.label}
              </span>
            </div>
          );
        })}
        
        {/* Logout Button */}
        <div 
          className="sidebar-menu-item"
          onClick={handleLogout}
          style={{ marginTop: 'auto', marginBottom: '20px' }}
        >
          <div className="sidebar-menu-icon">
            <LogoutIcon fontSize="medium" />
          </div>
          <span className="sidebar-menu-label">
            Logout
          </span>
        </div>
      </div>
    </>
  );
};

StudentSidebar.propTypes = {
  isOpen: PropTypes.bool,
  isMobileOpen: PropTypes.bool,
  onMobileClose: PropTypes.func,
};

export default StudentSidebar;
