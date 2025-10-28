// src/page/teacher/TeacherHomepage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    CircularProgress,
    Alert,
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import components
import TeacherNavbar from '../../components/layout/TeacherNavbar';
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

  // State for notifications
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // State for creating classroom
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);

  // --- Fetch Classrooms Function ---
  const fetchClassrooms = useCallback(async () => {
    if (!authState.user?.identifier || !authState.token) {
        return;
    }
    setIsLoadingClassrooms(true);
    setErrorClassrooms(null);
    try {
        const fetchedClassrooms = await getTeacherClassrooms(authState.user.identifier, authState.token);
        setClassrooms(Array.isArray(fetchedClassrooms) ? fetchedClassrooms : []);
    } catch (err) {
        console.error("Error fetching classrooms:", err);
        setErrorClassrooms(err.message || "Could not fetch classrooms.");
        setClassrooms([]);
    } finally {
        setIsLoadingClassrooms(false);
    }
  }, [authState.user?.identifier, authState.token]);

  // --- Fetch Pending Requests for ALL Classrooms ---
   const fetchPendingRequestsForAllClassrooms = useCallback(async () => {
      if (classrooms.length === 0 || !authState.token) {
          setPendingRequests([]);
          return;
      }

      setIsLoadingRequests(true);
      setErrorRequests(null);

      try {
          const requestPromises = classrooms.map(cls =>
              getPendingRequests(cls.classroomId, authState.token)
                  .then(requests =>
                      requests.map(req => ({ ...req, classroomId: cls.classroomId }))
                  )
                  .catch(err => {
                      console.error(`Failed to fetch pending requests for class ${cls.classroomId}:`, err);
                      return [];
                  })
          );

          const results = await Promise.all(requestPromises);
          const allPendingRequests = results.flat();
          
          setPendingRequests(allPendingRequests);

      } catch (err) {
          console.error("Error fetching pending requests:", err);
          setErrorRequests("Could not load all pending requests.");
          setPendingRequests([]);
      } finally {
          setIsLoadingRequests(false);
      }
  }, [classrooms, authState.token]);

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
  }, [authState.isAuthenticated, fetchClassrooms]);

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
  }, [isLoadingClassrooms, authState.isAuthenticated, classrooms, fetchPendingRequestsForAllClassrooms]);

  // --- Classroom Creation Handler ---
  const handleAddClassroom = async (newClassData) => {
     if (!authState.token) {
       showNotification("Authentication error. Please log in again.", 'error');
       return;
     }
     
     setIsCreatingClassroom(true);
     try {
       const createdClassroom = await createClassroom(newClassData, authState.token);
       setIsAddClassDialogOpen(false);
       fetchClassrooms();
       showNotification("Classroom created successfully!", 'success');
     } catch (err) {
       console.error("Failed to create classroom:", err);
       showNotification(`Failed to create classroom: ${err.message}`, 'error');
     } finally {
       setIsCreatingClassroom(false);
     }
  };

  // --- Classroom Card Click Handler ---
  const handleClassCardClick = (classroom) => {
    navigate(`/teacher/classroom/${classroom.classroomId}/progress`);
  };

  // --- Request Accept/Reject Handlers ---
  const handleUpdateRequestStatus = async (classroomId, studentId, newStatus) => {
      if (!authState.token) {
          showNotification("Authentication error. Please log in again.", 'error');
          return;
      }
      const uniqueProcessingId = `${classroomId}-${studentId}`;
      setProcessingRequestId(uniqueProcessingId);
      setErrorRequests(null);

      try {
          await updateEnrollmentStatus(classroomId, studentId, newStatus, authState.token);
          fetchPendingRequestsForAllClassrooms();
          showNotification(`Student request ${newStatus.toLowerCase()} successfully!`, 'success');
      } catch (err) {
          console.error(`Failed to ${newStatus} student ${studentId}:`, err);
          setErrorRequests(`Failed to ${newStatus} request: ${err.message}`);
      } finally {
          setProcessingRequestId(null);
      }
  };

  const handleAcceptRequest = (classroomId, studentId) => {
      handleUpdateRequestStatus(classroomId, studentId, 'APPROVED');
  };

  const handleRejectRequest = (classroomId, studentId) => {
      handleUpdateRequestStatus(classroomId, studentId, 'REJECTED');
  };

  // --- Notification Handler ---
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <div className="teacher-homepage-container">
      {/* --- Sidebar --- */}
      <div className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <TeacherSidebar isOpen={sidebarOpen} activeItem="Classes"/>
      </div>

      {/* --- Main Content Area --- */}
      <div className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <TeacherNavbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
        />

        <div className="teacher-main-content">
          {/* --- Welcome Section --- */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}
              >
                Welcome back, {authState.user?.name || 'Teacher'}!
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#64748b', 
                  fontWeight: 400,
                  fontSize: '1.1rem',
                  maxWidth: '600px'
                }}
              >
                Manage your classrooms, track student progress, and stay connected with your learning community.
              </Typography>
            </Box>
            
            {/* Modern Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                    color: '#451513',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(249, 177, 33, 0.3)'
                    }
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                    {classrooms.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Active Classes
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)',
                    color: '#451513',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(253, 177, 13, 0.3)'
                    }
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                    {pendingRequests.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Pending Requests
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #FFE8A3 0%, #FFEDB6 100%)',
                    color: '#451513',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(255, 232, 163, 0.4)'
                    }
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                    {classrooms.reduce((total, classroom) => total + (classroom.studentCount || 0), 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Students
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #36B8E4 0%, #4FACFE 100%)',
                    color: 'white',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(54, 184, 228, 0.3)'
                    }
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                    98%
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Engagement
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* --- Active Classes Section --- */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1a1a1a', 
                mb: 1,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              My Classrooms
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Manage and monitor your active classrooms
            </Typography>
          </Box>
          {isLoadingClassrooms && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CircularProgress size={24} />
              <Typography>Loading your classrooms...</Typography>
            </Box>
          )}
          {errorClassrooms && <Alert severity="error" sx={{ mb: 2 }}>{errorClassrooms}</Alert>}

          {/* --- Classroom Card Rendering --- */}
          {!isLoadingClassrooms && !errorClassrooms && authState.isAuthenticated && (
              <Box sx={{ mb: 6 }}>
                <Grid container spacing={3}>
                  {classrooms.map((classroom) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={classroom.classroomId}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          borderRadius: 3,
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                            borderColor: '#667eea'
                          }
                        }}
                        onClick={() => handleClassCardClick(classroom)}
                      >
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 16px',
                              color: '#451513',
                              fontSize: '1.5rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {classroom.classroomName.charAt(0).toUpperCase()}
                          </Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#1a1a1a',
                              mb: 1,
                              fontSize: '1.1rem'
                            }}
                          >
                            {classroom.classroomName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {classroom.studentCount || 0} students
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  
                  {/* Add Class Card */}
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        border: '2px dashed #cbd5e1',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 200,
                        '&:hover': {
                          borderColor: '#f9b121',
                          backgroundColor: '#fffbf5',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => setIsAddClassDialogOpen(true)}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: '#FFF4E6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '2rem',
                            color: '#f9b121'
                          }}
                        >
                          +
                        </Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#64748b',
                            fontSize: '1.1rem'
                          }}
                        >
                          Add New Class
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
          )}
          {/* Empty State */}
          {!isLoadingClassrooms && !errorClassrooms && classrooms.length === 0 && authState.isAuthenticated && (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8,
                px: 4,
                backgroundColor: '#f8fafc',
                borderRadius: 3,
                border: '1px solid #e2e8f0'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#64748b', mb: 2 }}>
                No classrooms yet
              </Typography>
              <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
                Create your first classroom to start managing students and content
              </Typography>
              <Button
                variant="contained"
                onClick={() => setIsAddClassDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                  color: '#451513',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)'
                  }
                }}
              >
                Create First Classroom
              </Button>
            </Box>
          )}
          {/* Message if not logged in */}
          {!authState.isAuthenticated && !isLoadingClassrooms && (
             <Typography sx={{ mt: 2 }}>Please log in to view or create classes.</Typography>
          )}


          {/* --- Requests Section --- */}
          {authState.isAuthenticated && (
              <Box 
                sx={{ 
                  backgroundColor: 'white',
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  p: 4,
                  mt: 4
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1a1a1a', 
                      mb: 1,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    Pending Requests
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Review and manage student enrollment requests
                  </Typography>
                </Box>
                {isLoadingRequests && <CircularProgress size={24} />}
                {errorRequests && <Alert severity="error" sx={{ mb: 2 }}>{errorRequests}</Alert>}

                {!isLoadingRequests && pendingRequests.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                      No pending requests
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      All student requests have been processed
                    </Typography>
                  </Box>
                )}
                
                {!isLoadingRequests && pendingRequests.length > 0 && (
                    <TeacherRequestsTable
                        requests={pendingRequests}
                        onAccept={handleAcceptRequest}
                        onReject={handleRejectRequest}
                        processingRequestId={processingRequestId}
                    />
                )}
              </Box>
          )}
          {/* --- End Requests Section --- */}

        </div> {/* End teacher-main-content */}
      </div> {/* End teacher-content-area */}

      {/* --- Dialogs --- */}
      <AddClassDialog
        open={isAddClassDialogOpen}
        onClose={() => setIsAddClassDialogOpen(false)}
        onAddClass={handleAddClassroom}
        loading={isCreatingClassroom}
      />

      {/* --- Notifications --- */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div> // End teacher-homepage-container
  );
};

export default TeacherHomepage;