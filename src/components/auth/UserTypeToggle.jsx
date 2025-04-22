// src/components/auth/UserTypeToggle.jsx
import React from 'react';
import PropTypes from 'prop-types';

const UserTypeToggle = ({ activeTab, onTabSwitch }) => {
  return (
    <div className="user-toggle-container">
      <button
        onClick={() => onTabSwitch('Student')}
        className={`user-toggle-button ${activeTab === 'Student' ? 'user-toggle-button-active' : ''}`}
      >
        Student
      </button>
      <button
        onClick={() => onTabSwitch('Teacher')}
        className={`user-toggle-button ${activeTab === 'Teacher' ? 'user-toggle-button-active' : ''}`}
      >
        Teacher
      </button>
    </div>
  );
};

UserTypeToggle.propTypes = {
  activeTab: PropTypes.oneOf(['Student', 'Teacher']).isRequired,
  onTabSwitch: PropTypes.func.isRequired,
};

export default UserTypeToggle;