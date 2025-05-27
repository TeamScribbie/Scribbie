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
import { useAuth } from '../../context/AuthContext'; // Corrected path

import Navbar from '../../components/layout/navbar'; // Corrected path
import TeacherSidebar from '../../components/layout/TeacherSidebar'; // Corrected path
import CourseCard from '../../components/cards/CourseCard.jsx'; // Corrected path
import AddCourseDialog from '../../components/dialogs/AddCourseDialog.jsx'; // Corrected path
import DeleteCourseDialog from '../../components/dialogs/DeleteCourseDialog.jsx'; // Corrected path
import EditCourseDialog from '../../components/dialogs/EditCourseDialog.jsx'; // ✨ Import EditCourseDialog ✨

import { getAllCoursesForAdmin, createCourse, deleteCourse, updateCourse } from '../../services/courseService'; // ✨ Import updateCourse ✨

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

    // ✨ Edit Course Dialog State ✨
    const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null); // Stores the full course object to edit
    const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
    const [updateCourseError, setUpdateCourseError] = useState(null);
    // ✨ End Edit Course Dialog State ✨

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
        } catch (err) {
            console.error("ManageCoursesPage: Error deleting course", err);
            setDeleteCourseError(err.message || "Failed to delete course. Please try again.");
        } finally {
            setIsDeletingCourse(false);
        }
    };

    // --- ✨ Edit Course Handlers ✨ ---
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
        } catch (err) {
            console.error("ManageCoursesPage: Error updating course", err);
            setUpdateCourseError(err.message || "Failed to update course. Please try again.");
        } finally {
            setIsUpdatingCourse(false);
        }
    };
    // --- ✨ End Edit Course Handlers ✨ ---

    return (
        <Box className="teacher-homepage-container">
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
            </Box>
            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
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
                                            onEdit={handleOpenEditDialog} // ✨ Use handleOpenEditDialog ✨
                                            onDelete={handleOpenDeleteDialog}
                                            isAdminOrSuperAdmin={userHasRequiredRoles} // For UI display logic in CourseCard
                                            currentUserId={authState.user?.id} // For UI display logic in CourseCard
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
                </Box>

                {userHasRequiredRoles && (
                    <Fab
                        color="primary"
                        aria-label="add course"
                        onClick={() => { setAddCourseError(null); setIsAddCourseDialogOpen(true); }}
                        sx={{
                            position: 'fixed',
                            bottom: 32,
                            right: 32,
                            bgcolor: '#451513',
                            '&:hover': { bgcolor: '#5d211f' },
                            zIndex: 1050
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
            {/* ✨ Add EditCourseDialog to the render tree ✨ */}
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
        </Box>
    );
};

export default ManageCoursesPage;