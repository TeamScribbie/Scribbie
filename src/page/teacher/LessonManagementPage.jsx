// src/page/teacher/LessonManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import {
    Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText,
    IconButton, Button, Divider, Collapse
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getCourseById } from '../../services/courseService';
import {
    getLessonDefinitions,
    getActivityNodeTypesForLesson,
    createLessonDefinition,
    createActivityNodeTypeForLesson
} from '../../services/lessonService';
import AddLessonDialog from '../../components/dialogs/AddLessonDialog';
import AddActivityNodeDialog from '../../components/dialogs/AddActivityNodeDialog';

// Reusing styles from TeacherHomepage.css for overall layout
import '../../styles/TeacherHomepage.css';

const LessonManagementPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [courseDetails, setCourseDetails] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activityNodesByLesson, setActivityNodesByLesson] = useState({});

    const [isLoadingCourse, setIsLoadingCourse] = useState(true);
    const [errorCourse, setErrorCourse] = useState(null);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);
    const [errorLessons, setErrorLessons] = useState(null);
    const [isLoadingActivities, setIsLoadingActivities] = useState({}); // Tracks loading per lesson

    const [expandedLessonId, setExpandedLessonId] = useState(null);

    // State for Add Lesson Dialog
    const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false);
    const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
    const [addLessonError, setAddLessonError] = useState(null);

    // State for Add Activity Node Dialog
    const [isAddActivityNodeDialogOpen, setIsAddActivityNodeDialogOpen] = useState(false);
    const [currentLessonIdForNode, setCurrentLessonIdForNode] = useState(null);
    const [isSubmittingActivityNode, setIsSubmittingActivityNode] = useState(false);
    const [addActivityNodeError, setAddActivityNodeError] = useState(null);

    // State for Authentication Loading
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Wait for AuthContext to restore state
        if (authState.isAuthenticated && authState.token) {
            setAuthLoading(false);
        } else if (!authState.isAuthenticated && !authState.token) {
            // If not authenticated after a short delay, stop loading
            const timeout = setTimeout(() => setAuthLoading(false), 500);
            return () => clearTimeout(timeout);
        }
    }, [authState.isAuthenticated, authState.token]);

    // Fetch Course Details
    const fetchCourseDetails = useCallback(async () => {
        if (!courseId || !authState.token) return;
        setIsLoadingCourse(true);
        setErrorCourse(null);
        console.log(`LessonManagementPage: Fetching course details for courseId: ${courseId}`);
        try {
            const details = await getCourseById(courseId, authState.token);
            setCourseDetails(details);
            console.log("LessonManagementPage: Course details fetched:", details);
        } catch (err) {
            console.error("LessonManagementPage: Error fetching course details:", err);
            setErrorCourse(err.message || "Could not load course details.");
        } finally {
            setIsLoadingCourse(false);
        }
    }, [courseId, authState.token]);

    // Fetch Lesson Definitions for the Course
    const fetchLessons = useCallback(async () => {
        if (!courseId || !authState.token) return;
        setIsLoadingLessons(true);
        setErrorLessons(null);
        console.log(`LessonManagementPage: Fetching lessons for courseId: ${courseId}`);
        try {
            const lessonDefs = await getLessonDefinitions(courseId, authState.token);
            setLessons(Array.isArray(lessonDefs) ? lessonDefs : []);
            console.log("LessonManagementPage: Lessons fetched:", lessonDefs);
        } catch (err) {
            console.error("LessonManagementPage: Error fetching lessons:", err);
            setErrorLessons(err.message || "Could not load lessons for this course.");
            setLessons([]);
        } finally {
            setIsLoadingLessons(false);
        }
    }, [courseId, authState.token]);

    // Fetch Activity Nodes for a specific lesson
    const fetchActivityNodes = useCallback(async (lessonDefinitionId) => {
        if (!lessonDefinitionId || !authState.token) return;
        console.log(`LessonManagementPage: Fetching activity nodes for lessonId: ${lessonDefinitionId}`);
        setIsLoadingActivities(prev => ({ ...prev, [lessonDefinitionId]: true }));
        try {
            const nodes = await getActivityNodeTypesForLesson(lessonDefinitionId, authState.token);
            setActivityNodesByLesson(prev => ({
                ...prev,
                [lessonDefinitionId]: Array.isArray(nodes) ? nodes.sort((a, b) => a.orderIndex - b.orderIndex) : []
            }));
            console.log(`LessonManagementPage: Activity nodes for lesson ${lessonDefinitionId} fetched:`, nodes);
        } catch (err) {
            console.error(`LessonManagementPage: Error fetching activity nodes for lesson ${lessonDefinitionId}:`, err);
            setActivityNodesByLesson(prev => ({ ...prev, [lessonDefinitionId]: [] }));
        } finally {
            setIsLoadingActivities(prev => ({ ...prev, [lessonDefinitionId]: false }));
        }
    }, [authState.token]);

    useEffect(() => {
        if (!authLoading && authState.isAuthenticated && authState.token) {
            fetchCourseDetails();
            fetchLessons();
        }
    }, [authLoading, authState.isAuthenticated, authState.token, fetchCourseDetails, fetchLessons]);

    const handleToggleLessonExpand = (lessonId) => {
        const newExpandedLessonId = expandedLessonId === lessonId ? null : lessonId;
        setExpandedLessonId(newExpandedLessonId);
        if (newExpandedLessonId && (!activityNodesByLesson[newExpandedLessonId] || activityNodesByLesson[newExpandedLessonId].length === 0)) {
            fetchActivityNodes(newExpandedLessonId);
        }
    };

    // --- Lesson CRUD Handlers ---
    const handleOpenAddLessonDialog = () => {
        setAddLessonError(null);
        setIsAddLessonDialogOpen(true);
    };

    const handleConfirmAddLesson = async (lessonFormData) => {
        if (!authState.token || !courseId) {
            setAddLessonError("Authentication or Course ID missing.");
            return;
        }
        setIsSubmittingLesson(true);
        setAddLessonError(null);
        try {
            console.log("LessonManagementPage: Submitting new lesson data:", lessonFormData);
            await createLessonDefinition(courseId, lessonFormData, authState.token);
            fetchLessons(); // Refresh lessons list
            setIsAddLessonDialogOpen(false);
        } catch (err) {
            console.error("LessonManagementPage: Error adding lesson:", err);
            setAddLessonError(err.message || "Failed to add lesson. Please try again.");
        } finally {
            setIsSubmittingLesson(false);
        }
    };

    const handleEditLesson = (lesson) => {
        alert(`Edit lesson: ${lesson.lessonTitle} (ID: ${lesson.lessonDefinitionId}) - To Be Implemented`);
        // navigate(`/teacher/course/${courseId}/lesson/${lesson.lessonDefinitionId}/edit`);
    };

    const handleDeleteLesson = (lesson) => {
        if (window.confirm(`Are you sure you want to delete lesson "${lesson.lessonTitle}"? This will also delete all its activity nodes.`)) {
            alert(`Delete lesson: ${lesson.lessonTitle} (ID: ${lesson.lessonDefinitionId}) - To Be Implemented`);
            // Call deleteLessonDefinition service: deleteLessonDefinition(lesson.lessonDefinitionId, authState.token).then(() => fetchLessons());
        }
    };

    // --- Activity Node CRUD Handlers ---
    const handleAddActivityNode = (lessonDefinitionId) => {
        console.log("LessonManagementPage: Opening Add Activity Node dialog for lesson ID:", lessonDefinitionId);
        setCurrentLessonIdForNode(lessonDefinitionId);
        setAddActivityNodeError(null);
        setIsAddActivityNodeDialogOpen(true);
    };

    const handleConfirmAddActivityNode = async (activityNodeData) => {
        if (!currentLessonIdForNode || !authState.token) {
            setAddActivityNodeError("Lesson context or authentication missing.");
            return;
        }
        setIsSubmittingActivityNode(true);
        setAddActivityNodeError(null);
        try {
            console.log("LessonManagementPage: Submitting new activity node data:", activityNodeData, "for lesson ID:", currentLessonIdForNode);
            await createActivityNodeTypeForLesson(currentLessonIdForNode, activityNodeData, authState.token);
            fetchActivityNodes(currentLessonIdForNode); // Refresh activity nodes for the current lesson
            setIsAddActivityNodeDialogOpen(false);
        } catch (err) {
            console.error("LessonManagementPage: Error adding activity node:", err);
            setAddActivityNodeError(err.message || "Failed to add activity node. Please try again.");
        } finally {
            setIsSubmittingActivityNode(false);
        }
    };

    const handleManageActivityNode = (activityNode, lessonDefinitionId) => {
        console.log(`LessonManagementPage: Navigating to edit Activity Node ID: ${activityNode.activityNodeTypeId} for Lesson ID: ${lessonDefinitionId} in Course ID: ${courseId}`);
        navigate(`/teacher/course/${courseId}/lesson/${lessonDefinitionId}/node/${activityNode.activityNodeTypeId}/edit`);
    };


    if (isLoadingCourse) {
        return (
            <Box className="teacher-homepage-container">
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
                <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <Box className="teacher-main-content" sx={{ textAlign: 'center', pt: 5 }}>
                        <CircularProgress /> <Typography sx={{ ml: 1, display: 'inline' }}>Loading course details...</Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (errorCourse) {
        return (
            <Box className="teacher-homepage-container">
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
                <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <Box className="teacher-main-content" sx={{ textAlign: 'center', pt: 5 }}>
                        <Alert severity="error">{errorCourse}</Alert>
                        <Button component={RouterLink} to="/teacher/manage-courses" sx={{ mt: 2 }} variant="outlined">Back to Courses</Button>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (authLoading) {
        return (
            <Box className="teacher-homepage-container">
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
                <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <Box className="teacher-main-content" sx={{ textAlign: 'center', pt: 5 }}>
                        <CircularProgress /> <Typography sx={{ ml: 1, display: 'inline' }}>Checking authentication...</Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!authState.isAuthenticated || !authState.token) {
        return (
            <Box className="teacher-homepage-container">
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
                <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <Box className="teacher-main-content" sx={{ textAlign: 'center', pt: 5 }}>
                        <Alert severity="warning">You must be logged in to manage lessons. Please log in again.</Alert>
                        <Button component={RouterLink} to="/teacher-login" sx={{ mt: 2 }} variant="outlined">Go to Login</Button>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="teacher-homepage-container">
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
            </Box>
            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="teacher-main-content">
                    <Button
                        component={RouterLink}
                        to="/teacher/manage-courses"
                        startIcon={<ArrowBackIcon />}
                        sx={{ mb: 2 }}
                        variant="outlined"
                    >
                        Back to Courses
                    </Button>
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, bgcolor: '#fffcf2' }} elevation={2}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#451513' }}>
                            {courseDetails?.title || 'Course Lessons'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            Course ID: {courseDetails?.courseId}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {courseDetails?.description || 'Manage lessons and their activity nodes for this course.'}
                        </Typography>
                        {courseDetails?.creator && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                Created by: {courseDetails.creator.name} (ID: {courseDetails.creator.teacherId})
                            </Typography>
                        )}
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#451513' }}>
                            Lessons
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenAddLessonDialog}
                            sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' } }}
                        >
                            Add Lesson
                        </Button>
                    </Box>

                    {isLoadingLessons && <Box sx={{ textAlign: 'center', my: 3 }}><CircularProgress /> <Typography>Loading lessons...</Typography></Box>}
                    {errorLessons && <Alert severity="error" sx={{ my: 2 }}>{errorLessons}</Alert>}

                    {!isLoadingLessons && !errorLessons && lessons.length === 0 && (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff9e6' }} elevation={1}>
                            <Typography color="text.secondary">No lessons have been defined for this course yet. Click "Add Lesson" to get started!</Typography>
                        </Paper>
                    )}

                    {!isLoadingLessons && lessons.length > 0 && (
                        <List sx={{ width: '100%' }}>
                            {lessons.map((lesson, index) => (
                                <Paper key={lesson.lessonDefinitionId} sx={{ mb: 2, borderRadius: '8px' }} elevation={3}>
                                    <ListItem
                                        onClick={() => handleToggleLessonExpand(lesson.lessonDefinitionId)}
                                        sx={{
                                            cursor: 'pointer',
                                            borderBottom: expandedLessonId === lesson.lessonDefinitionId ? 'none' : '1px solid #eee',
                                            '&:hover': { bgcolor: 'action.hover' },
                                            py: 1.5,
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <ListItemText
                                            primary={`${index + 1}. ${lesson.lessonTitle || 'Untitled Lesson'}`}
                                            secondary={lesson.lessonDescription || 'No description available.'}
                                            primaryTypographyProps={{ fontWeight: 'medium', fontSize: '1.1rem', color: '#451513' }}
                                            secondaryTypographyProps={{ noWrap: true, textOverflow: 'ellipsis', color: 'text.secondary' }}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                                            <IconButton edge="end" aria-label="edit lesson" onClick={(e) => { e.stopPropagation(); handleEditLesson(lesson); }} sx={{ mx: 0.5 }} size="small">
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete lesson" onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson); }} sx={{ color: 'error.main', mx: 0.5 }} size="small">
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton edge="end" aria-label="expand lesson" sx={{ mx: 0.5 }} size="small">
                                                {expandedLessonId === lesson.lessonDefinitionId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                    <Collapse in={expandedLessonId === lesson.lessonDefinitionId} timeout="auto" unmountOnExit>
                                        <Divider />
                                        <Box sx={{ p: 2, bgcolor: '#fdfcf7' }}>
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: '#5d211f' }}>Activity Nodes:</Typography>
                                            {isLoadingActivities[lesson.lessonDefinitionId] && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}><CircularProgress size={20} /> <Typography variant="body2">Loading activities...</Typography></Box>}

                                            {!isLoadingActivities[lesson.lessonDefinitionId] && (
                                                activityNodesByLesson[lesson.lessonDefinitionId]?.length > 0 ? (
                                                    <List dense component={Paper} variant="outlined" sx={{ bgcolor: 'background.paper', mt:1 }}>
                                                        {activityNodesByLesson[lesson.lessonDefinitionId].map(node => (
                                                            <ListItem
                                                                key={node.activityNodeTypeId}
                                                                secondaryAction={
                                                                    <IconButton edge="end" aria-label="manage activity node" onClick={() => handleManageActivityNode(node, lesson.lessonDefinitionId)} title="Edit Questions/Choices">
                                                                        <SettingsIcon />
                                                                    </IconButton>
                                                                }
                                                                sx={{ borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}
                                                            >
                                                                <ListItemText
                                                                    primary={`${node.orderIndex + 1}. ${node.activityTitle || 'Untitled Activity'}`}
                                                                    secondary={`Type: ${node.activityType || 'N/A'} | Instructions: ${node.instructions || "None"}`}
                                                                    primaryTypographyProps={{ fontWeight: 'normal' }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" sx={{ my: 1, fontStyle: 'italic' }}>No activity nodes defined for this lesson yet.</Typography>
                                                )
                                            )}
                                            <Button
                                                size="small"
                                                startIcon={<AddIcon />}
                                                onClick={() => handleAddActivityNode(lesson.lessonDefinitionId)}
                                                sx={{ mt: 2 }}
                                                variant="outlined"
                                            >
                                                Add Activity Node
                                            </Button>
                                        </Box>
                                    </Collapse>
                                </Paper>
                            ))}
                        </List>
                    )}
                </Box> {/* End teacher-main-content */}
            </Box> {/* End teacher-content-area */}

            <AddLessonDialog
                open={isAddLessonDialogOpen}
                onClose={() => setIsAddLessonDialogOpen(false)}
                onAddLesson={handleConfirmAddLesson}
                isLoading={isSubmittingLesson}
                error={addLessonError}
            />
            <AddActivityNodeDialog
                open={isAddActivityNodeDialogOpen}
                onClose={() => setIsAddActivityNodeDialogOpen(false)}
                onConfirm={handleConfirmAddActivityNode}
                isLoading={isSubmittingActivityNode}
                error={addActivityNodeError}
            />
        </Box> // End teacher-homepage-container
    );
};

export default LessonManagementPage;