// AI Context/Frontend/page/teacher/ManageCoursesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    CircularProgress,
    Alert,
    Box,
    Grid,
    Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import CourseCard from '../../components/cards/CourseCard.jsx';
import AddCourseDialog from '../../components/dialogs/AddCourseDialog.jsx';
import DeleteCourseDialog from '../../components/dialogs/DeleteCourseDialog.jsx'; // Import DeleteCourseDialog

import { getAllCoursesForAdmin, createCourse, deleteCourse } from '../../services/courseService'; // Import deleteCourse

import '../../styles/TeacherHomepage.css';

const ManageCoursesPage = () => {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add Course Dialog State
    const [addCourseError, setAddCourseError] = useState(null);
    const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
    const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

    // Delete Course Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null); // Stores { courseId, title }
    const [isDeletingCourse, setIsDeletingCourse] = useState(false);
    const [deleteCourseError, setDeleteCourseError] = useState(null);


    const fetchCourses = useCallback(async () => {
        // ... (fetchCourses logic remains the same as previous correct version)
        if (!authState.token) {
            console.log("ManageCoursesPage: No auth token, skipping fetch.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const fetchedCourses = await getAllCoursesForAdmin(authState.token);
            if (Array.isArray(fetchedCourses)) {
                setCourses(fetchedCourses);
            } else {
                setCourses([]);
            }
        } catch (err) {
            setError(err.message || "Could not fetch courses.");
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    }, [authState.token]);

    const userHasRequiredRoles = authState.isAuthenticated &&
                                 authState.user &&
                                 Array.isArray(authState.user.roles) &&
                                 (authState.user.roles.includes("ROLE_ADMIN") || authState.user.roles.includes("ROLE_SUPERADMIN"));

    useEffect(() => {
        // ... (useEffect logic remains the same as previous correct version)
        if (authState.isAuthenticated) {
            if (userHasRequiredRoles) {
                fetchCourses();
            } else {
                setError("You do not have permission to view this page.");
                setCourses([]);
            }
        } else {
            setCourses([]);
            setError("Please log in to manage courses.");
        }
    }, [authState.isAuthenticated, authState.user, fetchCourses, userHasRequiredRoles]);


    const handleAddCourse = async (newCourseData) => {
        // ... (handleAddCourse logic remains the same)
        if (!authState.token) {
            setAddCourseError("Authentication error. Cannot add course."); return;
        }
        setIsSubmittingCourse(true); setAddCourseError(null);
        try {
            const createdCourse = await createCourse(newCourseData, authState.token);
            setCourses(prevCourses => [...prevCourses, createdCourse]);
            setIsAddCourseDialogOpen(false);
        } catch (err) {
            setAddCourseError(err.message || "Failed to create course.");
        } finally {
            setIsSubmittingCourse(false);
        }
    };

    const handleManageLessons = (courseId) => {
        console.log(`Navigating to lesson management for course ID: ${courseId}`);
        navigate(`/teacher/course/${courseId}/lessons`); 
    };

    // --- Delete Course Handlers ---
    const handleOpenDeleteDialog = (course) => {
        // course object now contains courseId and title from CourseCard
        setCourseToDelete(course);
        setDeleteCourseError(null); // Clear previous delete errors
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setCourseToDelete(null);
    };

    const handleConfirmDeleteCourse = async () => {
        if (!courseToDelete || !authState.token) {
            setDeleteCourseError("Course data or token missing. Cannot delete.");
            return;
        }
        setIsDeletingCourse(true);
        setDeleteCourseError(null);
        try {
            await deleteCourse(courseToDelete.courseId, authState.token);
            // On successful deletion:
            setCourses(prevCourses => prevCourses.filter(c => c.courseId !== courseToDelete.courseId));
            handleCloseDeleteDialog();
            // Optionally, show a success notification (e.g., using a Snackbar)
        } catch (err) {
            console.error("ManageCoursesPage: Error deleting course", err);
            setDeleteCourseError(err.message || "Failed to delete course. Please try again.");
            // Dialog can remain open for user to see error, or close it:
            // handleCloseDeleteDialog(); 
        } finally {
            setIsDeletingCourse(false);
        }
    };
    // --- End Delete Course Handlers ---


    const handleEditCourse = (course) => {
        alert(`Edit course: ${course.title} (To Be Implemented)`);
        // For later: setEditingCourse(course); setIsEditCourseDialogOpen(true);
    };

    // ... (Return statement needs to be updated to include DeleteCourseDialog)

    return (
        <Box className="teacher-homepage-container">
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
            </Box>
            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}> {/* FAB will be a child of this */}
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="teacher-main-content">
                    <Typography variant="h5" className="main-content-heading" gutterBottom>
                        Course Management
                    </Typography>

                    {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress /></Box>}
                    {error && !isLoading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {!isLoading && !error && userHasRequiredRoles && (
                        <>
                            <Grid container spacing={3}>
                                {Array.isArray(courses) && courses.map((course) => (
                                    <Grid item xs={12} sm={6} md={4} key={course.courseId || Math.random()}>
                                        <CourseCard
                                            course={course}
                                            onManageLessons={handleManageLessons} 
                                            onEdit={handleEditCourse}
                                            onDelete={handleOpenDeleteDialog}
                                            isAdminOrSuperAdmin={userHasRequiredRoles}
                                            currentUserId={authState.user?.id}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            {!isLoading && !error && Array.isArray(courses) && courses.length === 0 && (
                                <Typography sx={{mt: 2, textAlign:'center'}}>No courses found. Click the '+' button to add a new course.</Typography>
                            )}
                        </>
                    )}
                     {authState.isAuthenticated && !userHasRequiredRoles && !isLoading && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            You do not have permission to manage courses.
                        </Alert>
                    )}
                    {!authState.isAuthenticated && !isLoading && (
                         <Alert severity="warning" sx={{ mt: 2 }}>
                            Please log in to manage courses.
                        </Alert>
                    )}
                </Box> {/* End of teacher-main-content */}

                {/* FAB is NOW a direct child of teacher-content-area, sibling to teacher-main-content */}
                {userHasRequiredRoles && (
                    <Fab
                        color="primary"
                        aria-label="add course"
                        onClick={() => { setAddCourseError(null); setIsAddCourseDialogOpen(true); }}
                        sx={{
                            position: 'fixed',
                            bottom: 32,
                            right: 32, // This should be relative to teacher-content-area if it creates a new context, or viewport
                            bgcolor: '#451513',
                            '&:hover': { bgcolor: '#5d211f' },
                            zIndex: 1050 // Good to have a z-index
                        }}
                    >
                        <AddIcon />
                    </Fab>
                )}
            </Box> {/* End of teacher-content-area */}

            {/* Dialogs can remain at the end of the top-level Box or here */}
            <AddCourseDialog
                open={isAddCourseDialogOpen}
                onClose={() => setIsAddCourseDialogOpen(false)}
                onAddCourse={handleAddCourse}
                isLoading={isSubmittingCourse}
                error={addCourseError}
            />
            {courseToDelete && (
                <DeleteCourseDialog
                    open={isDeleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    onConfirmDelete={handleConfirmDeleteCourse}
                    courseName={courseToDelete.title}
                    isLoading={isDeletingCourse}
                />
            )}
        </Box> // End of teacher-homepage-container
    );
};

export default ManageCoursesPage;