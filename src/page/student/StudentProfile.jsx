import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentNavbar from "../../components/layout/StudentNavbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import "../../styles/StudentProfile_new.css";

const StudentProfile = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    // Trigger entrance animations
    setTimeout(() => setIsLoaded(true), 100);
  }, []);
  
  // Dynamic student data from authentication context
  const studentData = {
    name: authState.user?.name || "Student",
    email: authState.user?.email || "",
    // Remove static mock data - these should come from API when available
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleImageUpload = () => {
    // Handle image upload logic
    console.log("Upload image clicked");
  };

  const handleEditProfile = () => {
    // Handle edit profile logic
    console.log("Edit profile clicked");
  };

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="student-profile-container">
      {/* Sidebar */}
      <StudentSidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />

      <div className="profile-content-area">
        {/* Navbar */}
<<<<<<< Updated upstream
        <StudentNavbar onMobileMenuToggle={handleMobileMenuToggle} />
=======
        <StudentNavbar onMobileMenuToggle={handleMobileMenuToggle} hideHomeButton />
>>>>>>> Stashed changes

        {/* Back Button */}
        <button className="back-button animated-button" onClick={() => navigate(-1)}>
          <span className="back-icon">←</span>
          <span className="back-text">Back</span>
        </button>

        <div className="profile-main-content">
          {/* Header */}
          <div className={`profile-header ${isLoaded ? 'loaded' : ''}`}>
            <div className="title-container">
              <h1 className="profile-title">
                <span className="title-emoji">👋</span>
                My Profile
                <span className="title-sparkle">✨</span>
              </h1>
              <div className="title-underline"></div>
            </div>
            <p className="profile-subtitle">
              🎨 Customize your learning journey and manage your account
            </p>
          </div>

          {/* Profile Layout */}
          <div className="profile-layout">
            {/* Sidebar */}
            <div className={`profile-sidebar ${isLoaded ? 'slide-in-left' : ''}`}>
              <div className="sidebar-header">
                <span className="header-icon">⚙️</span>
                Account Settings
                <div className="header-decoration"></div>
              </div>
              <div className="sidebar-menu">
                <div 
                  className={`sidebar-item ${activeSection === 'personal' ? 'active' : ''} ${hoveredItem === 'personal' ? 'hovered' : ''}`}
                  onClick={() => handleSectionChange('personal')}
                  onMouseEnter={() => setHoveredItem('personal')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="item-icon">👤</span>
                  <span className="item-text">Personal Information</span>
                  <span className="item-arrow">→</span>
                </div>
                <div 
                  className={`sidebar-item ${activeSection === 'academic' ? 'active' : ''} ${hoveredItem === 'academic' ? 'hovered' : ''}`}
                  onClick={() => handleSectionChange('academic')}
                  onMouseEnter={() => setHoveredItem('academic')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="item-icon">📚</span>
                  <span className="item-text">Academic Details</span>
                  <span className="item-arrow">→</span>
                </div>
                <div 
                  className={`sidebar-item ${activeSection === 'security' ? 'active' : ''} ${hoveredItem === 'security' ? 'hovered' : ''}`}
                  onClick={() => handleSectionChange('security')}
                  onMouseEnter={() => setHoveredItem('security')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className="item-icon">🔒</span>
                  <span className="item-text">Security Settings</span>
                  <span className="item-arrow">→</span>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className={`profile-card ${isLoaded ? 'slide-in-right' : ''}`}>
              <div className="profile-card-content">
                {/* Avatar Section */}
                <div className="avatar-section">
                  <div className="avatar-container">
                    <div className="avatar-ring"></div>
                    <span className="avatar-placeholder">
                      {studentData.name.charAt(0).toUpperCase()}
                    </span>
                    <button className="avatar-upload-btn bounce" onClick={handleImageUpload}>
                      <span className="upload-icon">📷</span>
                    </button>
                    <div className="avatar-sparkles">
                      <span className="sparkle sparkle-1">✨</span>
                      <span className="sparkle sparkle-2">⭐</span>
                      <span className="sparkle sparkle-3">💫</span>
                    </div>
                  </div>
                  <button className="change-photo-btn animated-button" onClick={handleImageUpload}>
                    <span className="btn-icon">🎨</span>
                    Change Photo
                  </button>
                </div>

                {/* Profile Details */}
                <div className="profile-details">
                  {activeSection === 'personal' && (
                    <div className="section-content fade-in">
                      <div className="section-title">
                        <span className="section-emoji">👤</span>
                        Personal Information
                      </div>
                      <div className="detail-group animated-detail">
                        <label className="detail-label">
                          <span className="label-icon">🏷️</span>
                          Full Name
                        </label>
                        <div className="detail-value editable">
                          <span className="value-text">{studentData.name}</span>
                          <span className="edit-hint">Click to edit</span>
                        </div>
                      </div>
                      
                      {studentData.email && (
                        <div className="detail-group animated-detail">
                          <label className="detail-label">
                            <span className="label-icon">📧</span>
                            Email
                          </label>
                          <div className="detail-value">
                            <span className="value-text">{studentData.email}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSection === 'academic' && (
                    <div className="section-content fade-in">
                      <div className="section-title">
                        <span className="section-emoji">📚</span>
                        Academic Journey
                      </div>
                      <div className="academic-placeholder">
                        <div className="placeholder-icon">🎓</div>
                        <h3>Your Learning Adventure Awaits!</h3>
                        <p>Academic details will appear here once you join your first class</p>
                        <div className="coming-soon-badge">
                          <span className="badge-text">Coming Soon</span>
                          <span className="badge-sparkle">✨</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'security' && (
                    <div className="section-content fade-in">
                      <div className="section-title">
                        <span className="section-emoji">🔒</span>
                        Security & Privacy
                      </div>
                      <div className="detail-group animated-detail">
                        <label className="detail-label">
                          <span className="label-icon">🔑</span>
                          Password
                        </label>
                        <div className="detail-value editable security-field">
                          <span className="value-text">••••••••</span>
                          <span className="security-status secure">🛡️ Secure</span>
                        </div>
                      </div>
                      
                      <div className="security-tips">
                        <div className="tip-icon">💡</div>
                        <div className="tip-content">
                          <h4>Security Tips</h4>
                          <p>Keep your account safe with strong passwords and regular updates!</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="profile-actions">
                    <button className="action-btn action-btn-primary pulse" onClick={handleEditProfile}>
                      <span className="btn-icon">✏️</span>
                      <span className="btn-text">Edit Profile</span>
                      <span className="btn-shine"></span>
                    </button>
                    <button className="action-btn action-btn-secondary hover-lift">
                      <span className="btn-icon">📄</span>
                      <span className="btn-text">Download Info</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
