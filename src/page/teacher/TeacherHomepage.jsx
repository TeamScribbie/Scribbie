// src/page/teacher/TeacherHomepage.jsx
import React, { useState, useEffect } from 'react';
import {
    Typography,
    CircularProgress,
    Alert
} from '@mui/material'; // Base MUI components needed here
import { useNavigate } from 'react-router-dom';

// Import necessary components and hooks
import Navbar from '../../components/layout/navbar'; //
import TeacherSidebar from '../../components/layout/TeacherSidebar'; //
import ClassroomCard from '../../components/cards/ClassroomCard'; //
import AddClassCard from '../../components/cards/AddClassCard';   //
import AddClassDialog from '../../components/dialogs/AddClassDialog'; //
import { useAuth } from '../../context/AuthContext'; //

// Import the requests table component from the layout folder
import TeacherRequestsTable from '../../components/layout/TeacherRequestsTable.jsx'; // Corrected path

// Import the service functions (assuming classroomService.js exists)
import { getTeacherClassrooms, createClassroom } from '../../services/classroomService';

// Import styles
import '../../styles/TeacherHomepage.css'; //

// Mock Data for Requests (Replace with API call later)
const mockRequests = [
  { id: 'req1', studentId: 'S001', name: 'Alice Smith', grade: '9', date: '2025-04-23', classroomName: 'Algebra 1' },
  { id: 'req2', studentId: 'S002', name: 'Bob Johnson', grade: '10', date: '2025-04-24', classroomName: 'World History' },
  { id: 'req3', studentId: 'S003', name: 'Charlie Brown', grade: '9', date: '2025-04-24', classroomName: 'Algebra 1' },
];

const TeacherHomepage = () => {
  const navigate = useNavigate();
  const { authState } = useAuth(); // Get auth state from context
  const [classrooms, setClassrooms] = useState([]); // State for classrooms
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false); // Renamed for clarity
  const [errorClassrooms, setErrorClassrooms] = useState(null); // Renamed for clarity
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);

  // State for Requests - using mock data for now
  const [requests, setRequests] = useState(mockRequests);
  // Add loading/error states for requests if/when fetching from API
  // const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  // const [errorRequests, setErrorRequests] = useState(null);


  // Function to fetch classrooms
  const fetchClassrooms = async () => {
    if (!authState.user?.identifier || !authState.token) {
      console.log("User not authenticated or token missing for classroom fetch.");
      // Don't set error here, let UI reflect missing auth if needed elsewhere
      return;
    }
    setIsLoadingClassrooms(true);
    setErrorClassrooms(null);
    try {
      console.log(`Fetching classrooms for teacher ID: ${authState.user.identifier}`);
      const fetchedClassrooms = await getTeacherClassrooms(authState.user.identifier, authState.token);
      setClassrooms(Array.isArray(fetchedClassrooms) ? fetchedClassrooms : []);
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
      setErrorClassrooms(err.message || "Could not fetch classrooms.");
      setClassrooms([]);
    } finally {
      setIsLoadingClassrooms(false);
    }
  };

  // Fetch classrooms when auth state is ready
  useEffect(() => {
    // Assuming AuthContext handles its own loading state and provides stable authState
    if (authState.isAuthenticated) {
        fetchClassrooms();
    } else {
        // Clear classrooms if user logs out
        setClassrooms([]);
        setErrorClassrooms(null);
    }
  }, [authState.isAuthenticated, authState.user?.identifier, authState.token]); // Depend on auth state


  // Handle creating a new class
  const handleAddClassroom = async (newClassData) => {
    if (!authState.token) {
      alert("Authentication token not found. Please log in again.");
      return;
    }
    // Add specific loading state for creation if desired
    try {
      const createdClass = await createClassroom(newClassData, authState.token);
      console.log("Classroom created:", createdClass);
      fetchClassrooms(); // Re-fetch the list
      setIsAddClassDialogOpen(false);
    } catch (err) {
      console.error("Failed to create classroom:", err);
      alert(`Failed to create classroom: ${err.message}`); // Basic error feedback
    }
  };

  // Handle clicking on a classroom card
  const handleClassCardClick = (classroom) => {
    console.log(`Navigate to classroom: ${classroom.classroomName} (ID: ${classroom.classroomId})`);
    // navigate(`/teacher/classroom/${classroom.classroomId}`);
  };

  // --- Request Action Handlers (using mock data update for now) ---
  const handleAcceptRequest = (requestId) => {
      console.log(`UI: Accept Request ID: ${requestId}`);
      // TODO: API call to accept request
      setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleRejectRequest = (requestId) => {
      console.log(`UI: Reject Request ID: ${requestId}`);
      // TODO: API call to reject request
      setRequests(prev => prev.filter(req => req.id !== requestId));
  };
  // --- End Request Handlers ---

  return (
    <div className="teacher-homepage-container">
      <div className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <TeacherSidebar isOpen={sidebarOpen} activeItem="Classes"/>
      </div>

      <div className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="teacher-main-content">
          {/* --- Active Classes Section --- */}
          <Typography variant="h5" className="main-content-heading">
            Active Classes
          </Typography>
          {isLoadingClassrooms && <CircularProgress size={24} />}
          {errorClassrooms && <Alert severity="error" sx={{ mb: 2 }}>{errorClassrooms}</Alert>}
          {!isLoadingClassrooms && !errorClassrooms && authState.isAuthenticated && (
            <div className="card-container">
              {classrooms.map((cls) => (
                <ClassroomCard
                  key={cls.classroomId}
                  name={cls.classroomName}
                  onClick={() => handleClassCardClick(cls)}
                /> //
              ))}
              <AddClassCard onClick={() => setIsAddClassDialogOpen(true)} /> //
            </div>
          )}
          {/* Message if logged in but no classrooms */}
          {!isLoadingClassrooms && !errorClassrooms && authState.isAuthenticated && classrooms.length === 0 && (
            <Typography sx={{ mt: 2 }}>You haven't created any classes yet. Click '+' to add one!</Typography>
          )}
           {/* Message if not logged in */}
           {!authState.isAuthenticated && !isLoadingClassrooms && (
                <Typography sx={{ mt: 2 }}>Please log in to view or create classes.</Typography>
           )}


          {/* --- Requests Section --- */}
          {/* Only show requests if logged in */}
          {authState.isAuthenticated && (
              <div className="requests-section" style={{ marginTop: '40px' }}>
                <Typography variant="h5" className="main-content-heading" style={{ marginBottom: '20px' }}>
                  Pending Requests
                </Typography>

                {/* Render the TeacherRequestsTable component */}
                {/* TODO: Add loading/error state for requests when fetching from API */}
                <TeacherRequestsTable
                    requests={requests}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                />
              </div>
          )}
          {/* --- End Requests Section --- */}

        </div> {/* End teacher-main-content */}
      </div> {/* End teacher-content-area */}

      {/* Dialogs */}
      <AddClassDialog
        open={isAddClassDialogOpen}
        onClose={() => setIsAddClassDialogOpen(false)}
        onAddClass={handleAddClassroom}
      /> {/* */}
    </div> // End teacher-homepage-container
  );
};

export default TeacherHomepage;