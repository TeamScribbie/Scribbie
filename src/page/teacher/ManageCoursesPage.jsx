// AI Context/Frontend/page/teacher/ManageCoursesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    CircularProgress,
    Alert,
    Box,
    Grid,
    Fab,
    Card,
    CardContent,
    Button,
    Chip,
    Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Corrected path

import TeacherNavbar from '../../components/layout/TeacherNavbar'; // Corrected path
import TeacherSidebar from '../../components/layout/TeacherSidebar'; // Corrected path
import CourseCard from '../../components/cards/CourseCard.jsx'; // Corrected path
import AddCourseDialog from '../../components/dialogs/AddCourseDialog.jsx'; // Corrected path
import DeleteCourseDialog from '../../components/dialogs/DeleteCourseDialog.jsx'; // Corrected path
import EditCourseDialog from '../../components/dialogs/EditCourseDialog.jsx'; // Import EditCourseDialog

import { getAllCoursesForAdmin, createCourse, deleteCourse, updateCourse } from '../../services/courseService'; // Import updateCourse

import '../../styles/TeacherHomepage.css'; // Corrected path

const ManageCoursesPage = () => {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [addCourseError, setAddCourseError] = useState(null);
    const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
    const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeletingCourse, setIsDeletingCourse] = useState(false);
    const [deleteCourseError, setDeleteCourseError] = useState(null);

    // Edit Course Dialog State
    const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null); // Stores the full course object to edit
    const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
    const [updateCourseError, setUpdateCourseError] = useState(null);

    // Notification state
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    // Ensure sidebar starts closed on smaller screens
    useEffect(() => {
        if (window.innerWidth <= 1024) {
            setSidebarOpen(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
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
        if (!authState.token) {
            setAddCourseError("Authentication error. Cannot add course."); return;
        }
        setIsSubmittingCourse(true); setAddCourseError(null);
        try {
            const createdCourse = await createCourse(newCourseData, authState.token);
            setCourses(prevCourses => [...prevCourses, createdCourse]);
            setIsAddCourseDialogOpen(false);
            showNotification('Course created successfully!', 'success');
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

    const handleOpenDeleteDialog = (course) => {
        setCourseToDelete(course);
        setDeleteCourseError(null);
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
            setCourses(prevCourses => prevCourses.filter(c => c.courseId !== courseToDelete.courseId));
            handleCloseDeleteDialog();
            showNotification('Course deleted successfully!', 'success');
        } catch (err) {
            console.error("ManageCoursesPage: Error deleting course", err);
            setDeleteCourseError(err.message || "Failed to delete course. Please try again.");
        } finally {
            setIsDeletingCourse(false);
        }
    };

    const handleOpenEditDialog = (course) => {
        setEditingCourse(course); // Set the course to be edited
        setUpdateCourseError(null); // Clear previous edit errors
        setIsEditCourseDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setIsEditCourseDialogOpen(false);
        setEditingCourse(null);
    };

    const handleConfirmUpdateCourse = async (updatedData) => {
        if (!editingCourse || !authState.token) {
            setUpdateCourseError("Course data or token missing. Cannot update.");
            return;
        }
        setIsUpdatingCourse(true);
        setUpdateCourseError(null);
        try {
            const returnedUpdatedCourse = await updateCourse(editingCourse.courseId, updatedData, authState.token);
            setCourses(prevCourses =>
                prevCourses.map(c => (c.courseId === editingCourse.courseId ? returnedUpdatedCourse : c))
            );
            handleCloseEditDialog();
            showNotification('Course updated successfully!', 'success');
        } catch (err) {
            console.error("ManageCoursesPage: Error updating course", err);
            setUpdateCourseError(err.message || "Failed to update course. Please try again.");
        } finally {
            setIsUpdatingCourse(false);
        }
    };

    const showNotification = (message, severity = 'info') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <Box className="teacher-homepage-container">
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
            </Box>

            {sidebarOpen && (
                <div
                    className="teacher-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <TeacherNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="teacher-main-content">
                    {/* Modern Header Section */}
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
                                Course Management
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
                                Create, edit, and manage courses for your educational platform.
                            </Typography>
                        </Box>

                        {/* Stats Card */}
                        <Card
                            elevation={0}
                            sx={{
                                p: 3,
                                background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                                color: '#451513',
                                borderRadius: 3,
                                mb: 4,
                                maxWidth: 300
                            }}
                        >
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                {courses.length}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                Total Courses
                            </Typography>
                        </Card>
                    </Box>

                    {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
                    {error && !isLoading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {!isLoading && !error && userHasRequiredRoles && (
                        <Box>
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
                                    All Courses
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                                    Manage your course catalog and content
                                </Typography>
                            </Box>

                            {Array.isArray(courses) && courses.length > 0 ? (
                                <Grid container spacing={3}>
                                    {courses.map((course) => (
                                        <Grid item xs={12} sm={6} md={4} key={course.courseId || Math.random()}>
                                            <CourseCard
                                                course={course}
                                                onManageLessons={handleManageLessons}
                                                onEdit={handleOpenEditDialog}
                                                onDelete={handleOpenDeleteDialog}
                                                isAdminOrSuperAdmin={userHasRequiredRoles}
                                                currentUserId={authState.user?.id}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        py: 8,
                                        px: 4,
                                        backgroundColor: '#fffbf5',
                                        borderRadius: 3,
                                        border: '1px solid #FFE8A3'
                                    }}
                                >
                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#64748b', mb: 2 }}>
                                        No courses yet
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
                                        Create your first course to start building your curriculum
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => { setAddCourseError(null); setIsAddCourseDialogOpen(true); }}
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
                                        Create First Course
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                    {authState.isAuthenticated && !userHasRequiredRoles && !isLoading && (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 6,
                                px: 4,
                                backgroundColor: '#fef2f2',
                                borderRadius: 3,
                                border: '1px solid #fecaca'
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#dc2626', mb: 2 }}>
                                Access Denied
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#7f1d1d' }}>
                                You do not have permission to manage courses. Contact your administrator for access.
                            </Typography>
                        </Box>
                    )}
                    {!authState.isAuthenticated && !isLoading && (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 6,
                                px: 4,
                                backgroundColor: '#fffbeb',
                                borderRadius: 3,
                                border: '1px solid #fde68a'
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#d97706', mb: 2 }}>
                                Authentication Required
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#92400e' }}>
                                Please log in to access the course management system.
                            </Typography>
                        </Box>
                    )}
                </Box>

                {userHasRequiredRoles && courses.length > 0 && (
                    <Fab
                        color="primary"
                        aria-label="add course"
                        onClick={() => { setAddCourseError(null); setIsAddCourseDialogOpen(true); }}
                        sx={{
                            position: 'fixed',
                            bottom: 32,
                            right: 32,
                            background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                            color: '#451513',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)',
                                transform: 'scale(1.1)'
                            },
                            zIndex: 1050,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <AddIcon />
                    </Fab>
                )}
            </Box>

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
                    error={deleteCourseError} // Pass error to dialog
                />
            )}
            {editingCourse && (
                <EditCourseDialog
                    open={isEditCourseDialogOpen}
                    onClose={handleCloseEditDialog}
                    onUpdateCourse={handleConfirmUpdateCourse}
                    course={editingCourse}
                    isLoading={isUpdatingCourse}
                    error={updateCourseError}
                />
            )}

            {/* Notifications */}
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
        </Box>
    );
};

export default ManageCoursesPage;