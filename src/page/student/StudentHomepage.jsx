// src/page/student/StudentHomepage.jsx
import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Alert } from '@mui/material'; // Import feedback components
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
// Import necessary components
import Navbar from '../../components/layout/navbar'; //
import StudentSidebar from '../../components/layout/StudentSidebar'; //
import ClassroomCard from '../../components/cards/ClassroomCard'; // Reused, will be modified
import JoinClassCard from '../../components/cards/JoinClassCard'; //
import JoinClassDialog from '../../components/dialogs/JoinClassDialog'; //
import puzzleIcon from '../../assets/puzzle.png';

// Import service functions
import { getStudentClassrooms, joinClassroom } from '../../services/classroomService'; //

import '../../styles/StudentHomepage.css'; // Import the CSS

const StudentHomepage = () => {
  const navigate = useNavigate();
  const { authState } = useAuth(); // Get auth state
  // State for classrooms, loading, and errors
  const [joinedClasses, setJoinedClasses] = useState([]); // Will hold data like { classroom: { classroomId, classroomName }, status: 'APPROVED'/'PENDING' }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isJoinClassDialogOpen, setIsJoinClassDialogOpen] = useState(false);
  // Add state for Join Class feedback if needed
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Function to fetch student's classrooms
  const fetchJoinedClassrooms = async () => {
      if (!authState.user?.identifier || !authState.token) {
          console.log("Student not authenticated or token missing for classroom fetch.");
          return; // Don't attempt fetch if not authenticated
      }
      setIsLoading(true);
      setError(null);
      try {
          console.log(`Fetching classrooms for student ID: ${authState.user.identifier}`);
          const classroomsData = await getStudentClassrooms(authState.user.identifier, authState.token);
          console.log("Fetched Student Classrooms Data:", classroomsData);
          setJoinedClasses(classroomsData); // Assuming service returns the array directly
      } catch (err) {
          console.error("Failed to fetch student classrooms:", err);
          setError(err.message || "Could not fetch classrooms.");
          setJoinedClasses([]); // Clear on error
      } finally {
          setIsLoading(false);
      }
  };

  

  // Fetch classrooms when auth state is ready
  useEffect(() => {
      if (authState.isAuthenticated) {
          fetchJoinedClassrooms();
      } else {
          // Clear data if user logs out
          setJoinedClasses([]);
          setError(null);
      }
  }, [authState.isAuthenticated, authState.user?.identifier, authState.token]); // Depend on auth state


  // Handle joining a class
  const handleJoinClass = async (classCode) => {
      if (!authState.token) {
          setJoinError("Authentication token not found. Please log in again.");
          return;
      }
      setJoinError(null); // Clear previous errors
      setJoinSuccess(null);
      // Add loading state specific to join action if desired

      try {
          console.log(`Attempting to join class with code: ${classCode}`);
          const result = await joinClassroom(classCode, authState.token);
          console.log("Join class result:", result);
          setJoinSuccess(`Successfully joined/requested class! Refreshing list...`); // Provide success feedback
          setIsJoinClassDialogOpen(false); // Close dialog on success
          // Refresh the classroom list after a short delay to show message
          setTimeout(() => {
              fetchJoinedClassrooms();
              setJoinSuccess(null); // Clear success message after refresh
          }, 1500);
      } catch (err) {
          console.error("Failed to join class:", err);
          setJoinError(err.message || "Failed to join class. Please check the code and try again.");
          // Keep dialog open on error? Or close it? Depends on UX choice.
          // setIsJoinClassDialogOpen(false);
      }
  };

  // Handle clicking on a classroom card (only if not pending)
  const handleClassCardClick = (classroomData) => {
    // classroomData structure is likely { classroomId, classroomName, status, ... }
    if (classroomData.status !== 'PENDING') {
        console.log(`Navigating to lessons for class: ${classroomData.classroomName} (ID: ${classroomData.classroomId})`);
        // Use navigate to go to the new route, passing the classroomId
        navigate(`/student/classroom/${classroomData.classroomId}/lessons`);
    } else {
        console.log("Cannot navigate to pending classroom.");
    }
};

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="student-homepage-container">
      {/* Interactive Background Elements */}
      <div className="floating-bubble bubble-1"></div>
      <div className="floating-bubble bubble-2"></div>
      <div className="floating-bubble bubble-3"></div>
      <div className="floating-bubble bubble-4"></div>
      <div className="floating-bubble bubble-5"></div>
      
      <div className="sparkle sparkle-1"></div>
      <div className="sparkle sparkle-2"></div>
      <div className="sparkle sparkle-3"></div>
      <div className="sparkle sparkle-4"></div>
      <div className="sparkle sparkle-5"></div>

      {/* Sidebar */}
      <div className="student-sidebar">
        <StudentSidebar 
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileSidebarClose}
        />
      </div>

      <div className="student-content-area">
        {/* Navbar */}
        <Navbar onMobileMenuToggle={handleMobileMenuToggle} />

        <div className="student-main-content">
          {/* Header */}
          <div className="header-section">
            <h1 className="student-main-content-heading">
              My Fun Classes!
            </h1>
          </div>
          
          {/* Typewriter Description */}
          <div className="typewriter-section">
            <p className="header-description">
              Hi there! Let's learn and play together! 🌟
            </p>
          </div>

          {/* Success Message Display */}
          {joinSuccess && (
            <div className="success-message">
              {joinSuccess}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading your classes...</p>
            </div>
          )}
          {error && (
            <div className="error-container">
              <Alert severity="error" sx={{ 
                backgroundColor: 'transparent !important',
                border: 'none !important',
                padding: '0 !important',
                '& .MuiAlert-message': {
                  color: '#d32f2f',
                  fontWeight: 500
                }
              }}>
                {error}
              </Alert>
            </div>
          )}

          {/* Classroom Cards Display */}
          {!isLoading && !error && authState.isAuthenticated && (
              <div className="card-container">
                {/* Map over joined classes data */}
                {joinedClasses.map((enrollment) => (
                    <div key={enrollment.classroomId} 
                         className={`classroom-card ${enrollment.status === 'PENDING' ? 'classroom-card-pending' : ''}`}
                         onClick={() => handleClassCardClick(enrollment)}>
                      <div className="classroom-card-header">
                        <div className="classroom-card-icon">
                          <img src={puzzleIcon} alt="Class" style={{ width: '36px', height: '36px' }} />
                        </div>
                        {enrollment.status === 'PENDING' && (
                          <span className="pending-badge">
                            🕐 Pending
                          </span>
                        )}
                      </div>
                      <h3 className="classroom-card-title">
                        {enrollment.classroomName ?? 'Unnamed Class'}
                      </h3>
                      <p className="classroom-card-description">
                        {enrollment.status === 'PENDING' ? '⏰ Getting ready for you!' : '🚀 Click to start learning!'}
                      </p>
                      {enrollment.status !== 'PENDING' && (
                        <div className="classroom-card-accent"></div>
                      )}
                    </div>
                ))}

                {/* Add the Join Class card */}
                <div className="join-class-card" onClick={() => { 
                  setJoinError(null); 
                  setJoinSuccess(null); 
                  setIsJoinClassDialogOpen(true); 
                }}>
                  <div className="join-class-card-icon">
                    ➕
                  </div>
                  <h3 className="join-class-card-title">
                    Join a Class
                  </h3>
                  <p className="join-class-card-description">
                    Enter a class code to join
                  </p>
                  <div className="join-class-card-accent"></div>
                </div>
              </div>
          )}
          {/* Enhanced Empty State */}
          {!isLoading && !error && authState.isAuthenticated && joinedClasses.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon-container">
                <div className="empty-state-icon">📚</div>
              </div>
              <h2 className="empty-state-title">No Classes Yet</h2>
              <p className="empty-state-description">
                You haven't joined any classes yet. Click the card below to join your first class and start learning!
              </p>
              <div className="empty-state-card-container">
                <div className="join-class-card" onClick={() => { 
                  setJoinError(null); 
                  setJoinSuccess(null); 
                  setIsJoinClassDialogOpen(true); 
                }}>
                  <div className="join-class-card-icon">
                    ➕
                  </div>
                  <h3 className="join-class-card-title">
                    Join a Class
                  </h3>
                  <p className="join-class-card-description">
                    Enter a class code to join
                  </p>
                  <div className="join-class-card-accent"></div>
                </div>
              </div>
            </div>
          )}
          {/* Enhanced Not Logged In State */}
          {!authState.isAuthenticated && !isLoading && (
            <div className="empty-state">
              <div className="empty-state-icon-container">
                <div className="empty-state-icon">🔐</div>
              </div>
              <h2 className="empty-state-title">Let's Get Started! 🌈</h2>
              <p className="empty-state-description">
                Ask a grown-up to help you log in so we can start learning together! 👨‍👩‍👧‍👦
              </p>
            </div>
          )}

        </div> {/* End student-main-content */}
      </div> {/* End student-content-area */}

      {/* Render the Join Class Dialog */}
      <JoinClassDialog
        open={isJoinClassDialogOpen}
        onClose={() => setIsJoinClassDialogOpen(false)}
        onJoinClass={handleJoinClass} // Use the new handler
        // Optionally pass joinError/joinSuccess to display in the dialog
        // error={joinError}
        // success={joinSuccess}
      />
    </div> // End student-homepage-container
  );
};

export default StudentHomepage;