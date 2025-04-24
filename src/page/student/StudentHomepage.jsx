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

  return (
    <div className="student-homepage-container">
      {/* Sidebar */}
      <div className="student-sidebar">
        <StudentSidebar />
      </div>

      <div className="student-content-area">
        {/* Navbar */}
        <Navbar />

        <div className="student-main-content">
          <Typography variant="h5" className="student-main-content-heading">
            Active Classes
          </Typography>

          {/* Loading and Error Display for Classroom Fetching */}
          {isLoading && <CircularProgress size={24} />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Classroom Cards Display */}
          {!isLoading && !error && authState.isAuthenticated && (
              <div className="card-container">
                {/* Map over joined classes data */}
                {joinedClasses.map((enrollment) => (
                    <ClassroomCard
                    key={enrollment.classroomId}
                    classroomId={enrollment.classroomId}
                    name={enrollment.classroomName ?? 'Unnamed Class'}
                    status={enrollment.status}
                    // Pass the whole enrollment object or just the necessary parts
                    onClick={() => handleClassCardClick(enrollment)} // Ensure this calls the updated handler
                />
                ))}

                {/* Add the Join Class card */}
                <JoinClassCard onClick={() => { setJoinError(null); setJoinSuccess(null); setIsJoinClassDialogOpen(true); }} />
              </div>
          )}
          {/* Message if logged in but no classes */}
          {!isLoading && !error && authState.isAuthenticated && joinedClasses.length === 0 && (
            <Typography sx={{ mt: 2 }}>You haven't joined any classes yet. Click '+' to join one!</Typography>
          )}
          {/* Message if not logged in */}
          {!authState.isAuthenticated && !isLoading && (
             <Typography sx={{ mt: 2 }}>Please log in to view or join classes.</Typography>
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