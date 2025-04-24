// src/page/teacher/TeacherHomepage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    CircularProgress,
    Alert,
    Box // Import Box for layout
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import components
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import ClassroomCard from '../../components/cards/ClassroomCard';
import AddClassCard from '../../components/cards/AddClassCard';
import AddClassDialog from '../../components/dialogs/AddClassDialog';
import TeacherRequestsTable from '../../components/layout/TeacherRequestsTable.jsx';

// Import services
import {
    getTeacherClassrooms,
    createClassroom,
    getPendingRequests,
    updateEnrollmentStatus
} from '../../services/classroomService';

import '../../styles/TeacherHomepage.css';

const TeacherHomepage = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  // State for Classrooms
  const [classrooms, setClassrooms] = useState([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
  const [errorClassrooms, setErrorClassrooms] = useState(null);

  // State for Add Class Dialog
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);

  // State for Pending Requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [errorRequests, setErrorRequests] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null); // Track studentId being processed

  // State for Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);


  // --- Fetch Classrooms Function ---
  const fetchClassrooms = useCallback(async () => {
    // Add these logs:
    console.log("Fetching classrooms for teacher identifier:", authState.user?.identifier);
    console.log("Using auth token:", authState.token ? 'Token Present' : 'Token Missing!');

    if (!authState.user?.identifier || !authState.token) {
        console.log("Skipping classroom fetch: Missing identifier or token."); // Add this log
        return;
    }
    setIsLoadingClassrooms(true);
    setErrorClassrooms(null);
    try {
        console.log("Calling getTeacherClassrooms service..."); // Log before call
        const fetchedClassrooms = await getTeacherClassrooms(authState.user.identifier, authState.token);
        // Log the result *before* setting state
        console.log("Received from getTeacherClassrooms:", fetchedClassrooms);
        setClassrooms(Array.isArray(fetchedClassrooms) ? fetchedClassrooms : []);
    } catch (err) {
        // Log the specific error
        console.error("Error caught in fetchClassrooms:", err);
        setErrorClassrooms(err.message || "Could not fetch classrooms.");
        setClassrooms([]);
    } finally {
        setIsLoadingClassrooms(false);
    }
  }, [authState.user?.identifier, authState.token]); // useCallback dependency


  // --- Fetch Pending Requests for ALL Classrooms ---
   const fetchPendingRequestsForAllClassrooms = useCallback(async () => {
      // Only run if classrooms have been loaded and token exists
      if (classrooms.length === 0 || !authState.token) {
          console.log("Skipping pending requests fetch: No classrooms loaded or token missing.");
          setPendingRequests([]); // Ensure empty if no classrooms or no token
          return;
      }

      setIsLoadingRequests(true);
      setErrorRequests(null);
      console.log("Fetching pending requests for classrooms:", classrooms.map(c => c.classroomId));

      try {
          const requestPromises = classrooms.map(cls =>
              getPendingRequests(cls.classroomId, authState.token)
                  .then(requests =>
                      requests.map(req => ({ ...req, classroomId: cls.classroomId }))
                  )
                  .catch(err => {
                      console.error(`Failed to fetch pending requests for class ${cls.classroomId}:`, err);
                      return []; // Return empty array for this classroom on error
                  })
          );

          const results = await Promise.all(requestPromises);
          const allPendingRequests = results.flat();

          console.log("Aggregated Pending Requests:", allPendingRequests);
          
          setPendingRequests(allPendingRequests);

      } catch (err) {
          console.error("Error fetching pending requests:", err);
          setErrorRequests("Could not load all pending requests.");
          setPendingRequests([]);
      } finally {
          setIsLoadingRequests(false);
      }
  }, [classrooms, authState.token]); // useCallback dependencies


  // --- Initial Fetch Logic ---
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchClassrooms(); // Fetch classrooms first
    } else {
      setClassrooms([]); // Clear data if not authenticated
      setPendingRequests([]);
      setErrorClassrooms(null);
      setErrorRequests(null);
    }
  }, [authState.isAuthenticated, fetchClassrooms]); // Depend on fetchClassrooms useCallback


  // --- Fetch Requests AFTER Classrooms are Loaded ---
  useEffect(() => {
      // If classrooms are loaded (or fetch attempt finished) and user is authenticated
      if (!isLoadingClassrooms && authState.isAuthenticated && classrooms.length > 0) {
          fetchPendingRequestsForAllClassrooms();
      }
      // If classrooms array becomes empty after being populated (e.g., due to an error during fetch or logout), clear requests
      else if (!isLoadingClassrooms && classrooms.length === 0){
           setPendingRequests([]);
      }
  }, [isLoadingClassrooms, authState.isAuthenticated, classrooms, fetchPendingRequestsForAllClassrooms]); // Add classrooms to dependency array


  // --- Classroom Creation Handler ---
  const handleAddClassroom = async (newClassData) => {
     if (!authState.token) {
       alert("Authentication error. Please log in again.");
       // Maybe set an error state instead of alert
       return;
     }
     // Add loading state for creation maybe?
     try {
       console.log("Attempting to create classroom:", newClassData);
       const createdClassroom = await createClassroom(newClassData, authState.token);
       console.log("Classroom created:", createdClassroom);
       setIsAddClassDialogOpen(false); // Close dialog on success
       fetchClassrooms(); // Refresh the classroom list
     } catch (err) {
       console.error("Failed to create classroom:", err);
       // Display error to user (e.g., in the dialog or as an Alert)
       alert(`Failed to create classroom: ${err.message}`);
     }
  };

  // --- Classroom Card Click Handler ---
  const handleClassCardClick = (classroom) => {
    console.log(`Navigate to teacher view for class: ${classroom.classroomName} (ID: ${classroom.classroomId})`);
    // Example navigation:
    // navigate(`/teacher/class/${classroom.classroomId}`);
  };


  // --- Request Accept/Reject Handlers ---
  const handleUpdateRequestStatus = async (classroomId, studentId, newStatus) => {
      if (!authState.token) {
          alert("Authentication error. Please log in again.");
          return;
      }
      const uniqueProcessingId = `${classroomId}-${studentId}`;
      setProcessingRequestId(uniqueProcessingId);
      setErrorRequests(null);

      try {
          console.log(`Attempting to ${newStatus} student ${studentId} in class ${classroomId}`);
          await updateEnrollmentStatus(classroomId, studentId, newStatus, authState.token);
          console.log(`Successfully ${newStatus} student ${studentId}`);
          // Refresh the pending list ONLY
          fetchPendingRequestsForAllClassrooms();
      } catch (err) {
          console.error(`Failed to ${newStatus} student ${studentId}:`, err);
          setErrorRequests(`Failed to ${newStatus} request: ${err.message}`);
      } finally {
          setProcessingRequestId(null); // Clear processing state
      }
  };

  const handleAcceptRequest = (classroomId, studentId) => {
      handleUpdateRequestStatus(classroomId, studentId, 'APPROVED');
  };

  const handleRejectRequest = (classroomId, studentId) => {
      handleUpdateRequestStatus(classroomId, studentId, 'REJECTED');
  };
  // --- End Request Handlers ---


  // *** Log the state right before rendering ***
  console.log("Rendering TeacherHomepage, classrooms state:", classrooms);


  return (
    <div className="teacher-homepage-container">
      {/* --- Sidebar --- */}
      <div className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <TeacherSidebar isOpen={sidebarOpen} activeItem="Classes"/>
      </div>

      {/* --- Main Content Area --- */}
      <div className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="teacher-main-content">
          {/* --- Active Classes Section --- */}
          <Typography variant="h5" className="main-content-heading">Active Classes</Typography>
          {isLoadingClassrooms && <CircularProgress size={24} />}
          {errorClassrooms && <Alert severity="error" sx={{ mb: 2 }}>{errorClassrooms}</Alert>}

          {/* --- Classroom Card Rendering --- */}
          {!isLoadingClassrooms && !errorClassrooms && authState.isAuthenticated && (
              <div className="card-container">
                  {/* Map over the classrooms state */}
                  {classrooms.map((classroom, index) => {
                       // *** Log each item being mapped ***
                       console.log(`Mapping classroom item ${index}:`, classroom);
                       return (
                          <ClassroomCard
                              // Use properties from ClassroomSummaryResponse
                              key={classroom.classroomId}
                              classroomId={classroom.classroomId}
                              name={classroom.classroomName}
                              // status prop is not available in ClassroomSummaryResponse
                              // We can remove it or pass null/undefined
                              // status={undefined}
                              onClick={() => handleClassCardClick(classroom)}
                          />
                      );
                   })}
                  {/* Add Class Card */}
                  <AddClassCard onClick={() => setIsAddClassDialogOpen(true)} />
              </div>
          )}
          {/* Message if no classrooms */}
          {!isLoadingClassrooms && !errorClassrooms && classrooms.length === 0 && authState.isAuthenticated && (
             <Typography sx={{ mt: 2 }}>You haven't created any classes yet. Click '+' to add one!</Typography>
          )}
          {/* Message if not logged in */}
          {!authState.isAuthenticated && !isLoadingClassrooms && (
             <Typography sx={{ mt: 2 }}>Please log in to view or create classes.</Typography>
          )}


          {/* --- Requests Section --- */}
          {authState.isAuthenticated && (
              <div className="requests-section" style={{ marginTop: '40px' }}>
                <Typography variant="h5" className="main-content-heading" style={{ marginBottom: '10px' }}>
                  Pending Requests
                </Typography>
                {isLoadingRequests && <CircularProgress size={24} />}
                {errorRequests && <Alert severity="error" sx={{ mb: 2 }}>{errorRequests}</Alert>}

                {!isLoadingRequests && (
                    <TeacherRequestsTable
                        requests={pendingRequests}
                        onAccept={handleAcceptRequest}
                        onReject={handleRejectRequest}
                        processingRequestId={processingRequestId}
                    />
                )}
              </div>
          )}
          {/* --- End Requests Section --- */}

        </div> {/* End teacher-main-content */}
      </div> {/* End teacher-content-area */}

      {/* --- Dialogs --- */}
      <AddClassDialog
        open={isAddClassDialogOpen}
        onClose={() => setIsAddClassDialogOpen(false)}
        onAddClass={handleAddClassroom}
      />
    </div> // End teacher-homepage-container
  );
};

export default TeacherHomepage;