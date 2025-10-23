import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/navbar";
import StudentSidebar from "../../components/layout/StudentSidebar";
import "../../styles/StudentProfile.css";

const StudentProfile = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Mock student data - replace with actual data from context/API
  const studentData = {
    name: authState.user?.name || "John Doe",
    email: authState.user?.email || "john.doe@student.edu",
    studentId: "2024-001-123",
    grade: "Grade 10",
    section: "Section A",
    school: "Scribbie Academy",
    joinDate: "September 2024"
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
      <div className="student-sidebar">
        <StudentSidebar 
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileSidebarClose}
        />
      </div>

      <div className="profile-content-area">
        {/* Navbar */}
        <Navbar onMobileMenuToggle={handleMobileMenuToggle} />

        {/* Back Button */}
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>

        <div className="profile-main-content">
          {/* Header */}
          <div className="profile-header">
            <h1 className="profile-title">My Profile</h1>
            <p className="profile-subtitle">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Layout */}
          <div className="profile-layout">
            {/* Sidebar */}
            <div className="profile-sidebar">
              <div className="sidebar-header">
                Account Settings
              </div>
              <div className="sidebar-menu">
                <div 
                  className={`sidebar-item ${activeSection === 'personal' ? 'active' : ''}`}
                  onClick={() => handleSectionChange('personal')}
                >
                  👤 Personal Information
                </div>
                <div 
                  className={`sidebar-item ${activeSection === 'academic' ? 'active' : ''}`}
                  onClick={() => handleSectionChange('academic')}
                >
                  📚 Academic Details
                </div>
                <div 
                  className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
                  onClick={() => handleSectionChange('security')}
                >
                  🔒 Security Settings
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-card-content">
                {/* Avatar Section */}
                <div className="avatar-section">
                  <div className="avatar-container">
                    <span className="avatar-placeholder">
                      {studentData.name.charAt(0).toUpperCase()}
                    </span>
                    <button className="avatar-upload-btn" onClick={handleImageUpload}>
                      +
                    </button>
                  </div>
                  <button className="change-photo-btn" onClick={handleImageUpload}>
                    Change Photo
                  </button>
                </div>

                {/* Profile Details */}
                <div className="profile-details">
                  {activeSection === 'personal' && (
                    <>
                      <div className="detail-group">
                        <label className="detail-label">Full Name</label>
                        <div className="detail-value editable">{studentData.name}</div>
                      </div>
                      
                      <div className="detail-group">
                        <label className="detail-label">Email Address</label>
                        <div className="detail-value editable">{studentData.email}</div>
                      </div>
                      
                      <div className="detail-group">
                        <label className="detail-label">Student ID</label>
                        <div className="detail-value">{studentData.studentId}</div>
                      </div>
                    </>
                  )}

                  {activeSection === 'academic' && (
                    <>
                      <div className="detail-group">
                        <label className="detail-label">Grade Level</label>
                        <div className="detail-value">{studentData.grade}</div>
                      </div>
                      
                      <div className="detail-group">
                        <label className="detail-label">Section</label>
                        <div className="detail-value">{studentData.section}</div>
                      </div>
                      
                      <div className="detail-group">
                        <label className="detail-label">School</label>
                        <div className="detail-value">{studentData.school}</div>
                      </div>
                      
                      <div className="detail-group">
                        <label className="detail-label">Enrollment Date</label>
                        <div className="detail-value">{studentData.joinDate}</div>
                      </div>
                    </>
                  )}

                  {activeSection === 'security' && (
                    <>
                      <div className="detail-group">
                        <label className="detail-label">Password</label>
                        <div className="detail-value editable">••••••••</div>
                      </div>
                      
                      <div className="detail-group">
                        <label className="detail-label">Two-Factor Authentication</label>
                        <div className="detail-value editable">Disabled</div>
                      </div>
                      
                      <div className="detail-group">
                        <label className="detail-label">Last Login</label>
                        <div className="detail-value">Today, 10:30 AM</div>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="profile-actions">
                    <button className="action-btn action-btn-primary" onClick={handleEditProfile}>
                      ✏️ Edit Profile
                    </button>
                    <button className="action-btn action-btn-secondary">
                      📄 Download Info
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
