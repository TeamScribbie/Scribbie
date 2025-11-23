// src/page/teacher/LessonManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TeacherNavbar from '../../components/layout/TeacherNavbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import {
    Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText,
    IconButton, Button, Divider, Collapse, Chip, Snackbar, Card, CardContent, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { getCourseById } from '../../services/courseService';
import {
    getLessonDefinitions,
    getActivityNodeTypesForLesson,
    createLessonDefinition,
    createActivityNodeTypeForLesson,
    updateLessonDefinition,
    deleteLessonDefinition,
    deleteActivityNode
} from '../../services/lessonService';
import {
    configureChallengeForLesson,
    getChallengeConfigurationForLesson,
    deleteChallengeConfiguration
} from '../../services/challengeService';

import AddLessonDialog from '../../components/dialogs/AddLessonDialog';
import AddActivityNodeDialog from '../../components/dialogs/AddActivityNodeDialog';
import EditLessonDialog from '../../components/dialogs/EditLessonDialog';
import ConfigureChallengeDialog from '../../components/dialogs/ConfigureChallengeDialog';
import DeleteChallengeDialog from '../../components/dialogs/DeleteChallengeDialog';
import DeleteLessonDialog from '../../components/dialogs/DeleteLessonDialog';
import DeleteActivityNodeDialog from '../../components/dialogs/DeleteActivityNodeDialog';
import { updateActivityNodeTypeDetails } from '../../services/activityService';

import '../../styles/TeacherHomepage.css';
import EditActivityNodeDetailsDialog from "../../components/dialogs/EditActivityNodeDetailsDialog.jsx";

const LessonManagementPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [courseDetails, setCourseDetails] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activityNodesByLesson, setActivityNodesByLesson] = useState({});
    const [challengeConfigByLesson, setChallengeConfigByLesson] = useState({});

    const [isLoadingCourse, setIsLoadingCourse] = useState(true);
    const [errorCourse, setErrorCourse] = useState(null);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);
    const [errorLessons, setErrorLessons] = useState(null);
    const [isLoadingActivities, setIsLoadingActivities] = useState({});
    const [isLoadingChallengeConfig, setIsLoadingChallengeConfig] = useState({});

    const [expandedLessonId, setExpandedLessonId] = useState(null);
    const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false);
    const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
    const [addLessonError, setAddLessonError] = useState(null);

    const [isAddActivityNodeDialogOpen, setIsAddActivityNodeDialogOpen] = useState(false);
    const [currentLessonIdForNode, setCurrentLessonIdForNode] = useState(null);
    const [isSubmittingActivityNode, setIsSubmittingActivityNode] = useState(false);
    const [addActivityNodeError, setAddActivityNodeError] = useState(null);

    const [isConfigureChallengeDialogOpen, setIsConfigureChallengeDialogOpen] = useState(false);
    const [currentLessonForChallenge, setCurrentLessonForChallenge] = useState(null);
    

    const [isDeleteChallengeDialogOpen, setIsDeleteChallengeDialogOpen] = useState(false);
    const [lessonToDeleteChallengeFrom, setLessonToDeleteChallengeFrom] = useState(null);
    const [isDeletingChallenge, setIsDeletingChallenge] = useState(false);
    const [deleteChallengeError, setDeleteChallengeError] = useState(null);

    const [authLoading, setAuthLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [isEditLessonDialogOpen, setIsEditLessonDialogOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);
    const [updateLessonError, setUpdateLessonError] = useState(null);

    const [isDeleteLessonDialogOpen, setIsDeleteLessonDialogOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [isDeletingLesson, setIsDeletingLesson] = useState(false);
    const [deleteLessonError, setDeleteLessonError] = useState(null);

    const [isDeleteNodeDialogOpen, setIsDeleteNodeDialogOpen] = useState(false);
    const [nodeToDelete, setNodeToDelete] = useState(null);
    const [isDeletingNode, setIsDeletingNode] = useState(false);
    const [deleteNodeError, setDeleteNodeError] = useState(null);

    const [isEditNodeDetailsDialogOpen, setIsEditNodeDetailsDialogOpen] = useState(false);
    const [editingNodeForDetails, setEditingNodeForDetails] = useState(null);
    const [isSavingNodeDetails, setIsSavingNodeDetails] = useState(false);
    const [editNodeDetailsError, setEditNodeDetailsError] = useState(null);

    const [isConfigDialogOpen, setConfigDialogOpen] = useState(false);

    

    const handleDeleteActivityNode = (node, lessonDefId) => {
        setNodeToDelete({ ...node, lessonDefinitionId: lessonDefId });
        setDeleteNodeError(null);
        setIsDeleteNodeDialogOpen(true);
    };

    const handleConfirmDeleteNode = async () => {
        if (!nodeToDelete || !authState.token) {
            setDeleteNodeError("Node data missing, cannot delete.");
            return;
        }
        setIsDeletingNode(true);
        setDeleteNodeError(null);
        try {
            await deleteActivityNode(nodeToDelete.activityNodeTypeId, authState.token);
            fetchActivityNodes(nodeToDelete.lessonDefinitionId);
            setIsDeleteNodeDialogOpen(false);
            setSnackbarMessage("Activity node deleted successfully!");
            setSnackbarOpen(true);
        } catch (err) {
            setDeleteNodeError(err.message || "Failed to delete activity node.");
        } finally {
            setIsDeletingNode(false);
        }
    };

    const fetchActivityNodes = useCallback(async (lessonDefinitionId) => {
        if (!lessonDefinitionId || !authState.token) return;
        setIsLoadingActivities(prev => ({ ...prev, [lessonDefinitionId]: true }));
        try {
            const nodes = await getActivityNodeTypesForLesson(lessonDefinitionId, authState.token);
            setActivityNodesByLesson(prev => ({
                ...prev,
                [lessonDefinitionId]: Array.isArray(nodes) ? nodes.sort((a, b) => a.orderIndex - b.orderIndex) : []
            }));
        } catch (err) {
            setActivityNodesByLesson(prev => ({ ...prev, [lessonDefinitionId]: [] }));
            setSnackbarMessage(`Error loading activities for lesson ${lessonDefinitionId}: ${err.message}`);
            setSnackbarOpen(true);
        } finally {
            setIsLoadingActivities(prev => ({ ...prev, [lessonDefinitionId]: false }));
        }
    }, [authState.token]);

    const handleOpenEditNodeDetailsDialog = (node) => {
        setEditingNodeForDetails(node);
        setEditNodeDetailsError(null);
        setIsEditNodeDetailsDialogOpen(true);
    };

    const handleCloseEditNodeDetailsDialog = () => {
        setIsEditNodeDetailsDialogOpen(false);
        setEditingNodeForDetails(null);
    };

    const handleConfirmSaveNodeDetails = async (detailsData) => {
        if (!editingNodeForDetails || !editingNodeForDetails.activityNodeTypeId || !authState.token) {
            setEditNodeDetailsError("Node data or authentication missing for details update.");
            return;
        }
        setIsSavingNodeDetails(true);
        setEditNodeDetailsError(null);
        try {
            const payload = {
                activityTitle: detailsData.activityTitle,
                instructions: detailsData.instructions
            };

            await updateActivityNodeTypeDetails(editingNodeForDetails.activityNodeTypeId, payload, authState.token);

            setSnackbarMessage("Activity node details updated successfully!");
            setSnackbarOpen(true);
            handleCloseEditNodeDetailsDialog();

            if (editingNodeForDetails.lessonDefinition && editingNodeForDetails.lessonDefinition.lessonDefinitionId) {
                fetchActivityNodes(editingNodeForDetails.lessonDefinition.lessonDefinitionId);
            } else if (expandedLessonId) {
                fetchActivityNodes(expandedLessonId);
            }

        } catch (err) {
            setEditNodeDetailsError(err.message || "Failed to save activity node details.");
        } finally {
            setIsSavingNodeDetails(false);
        }
    };

    useEffect(() => {
        if (authState.isAuthenticated && authState.token) {
            setAuthLoading(false);
        } else if (!authState.isAuthenticated && authState.token === null) {
            const timeout = setTimeout(() => setAuthLoading(false), 500);
            return () => clearTimeout(timeout);
        }
    }, [authState.isAuthenticated, authState.token]);

    // Ensure sidebar starts closed on smaller screens
    useEffect(() => {
        if (window.innerWidth <= 1024) {
            setSidebarOpen(false);
        }
    }, []);

    const fetchCourseDetails = useCallback(async () => {
        if (!courseId || !authState.token) return;
        setIsLoadingCourse(true); setErrorCourse(null);
        try {
            const details = await getCourseById(courseId, authState.token);
            setCourseDetails(details);
        } catch (err) { setErrorCourse(err.message || "Could not load course details.");
        } finally { setIsLoadingCourse(false); }
    }, [courseId, authState.token]);

    // ✨✨✨ THE FIX IS HERE ✨✨✨
    const fetchLessons = useCallback(async () => {
        if (!courseId || !authState.token) return;
        setIsLoadingLessons(true);
        setErrorLessons(null);
        // The line `setChallengeConfigByLesson({})` was removed from here.
        // It was incorrectly clearing the detailed challenge configurations
        // every time the main lesson list was refreshed, causing the UI to "forget"
        // that a challenge was just added.
        try {
            const lessonDefs = await getLessonDefinitions(courseId, authState.token);
            setLessons(Array.isArray(lessonDefs) ? lessonDefs : []);
        } catch (err) {
            setErrorLessons(err.message || "Could not load lessons.");
            setLessons([]); // On error, clear lessons to avoid showing stale data.
        } finally {
            setIsLoadingLessons(false);
        }
    }, [courseId, authState.token]);

    useEffect(() => {
        if (!authLoading && authState.isAuthenticated && authState.token) {
            fetchCourseDetails();
            fetchLessons();
        }
    }, [authLoading, authState.isAuthenticated, authState.token, fetchCourseDetails, fetchLessons]);

    const fetchChallengeConfig = useCallback(async (lessonDefinitionId) => {
        if (!lessonDefinitionId || !authState.token) return;
        setIsLoadingChallengeConfig(prev => ({ ...prev, [lessonDefinitionId]: true }));
        try {
            const config = await getChallengeConfigurationForLesson(lessonDefinitionId, authState.token);
            setChallengeConfigByLesson(prev => ({ ...prev, [lessonDefinitionId]: config }));
        } catch (err) {
            setSnackbarMessage(`Error loading challenge config for lesson ${lessonDefinitionId}: ${err.message}`);
            setSnackbarOpen(true);
            setChallengeConfigByLesson(prev => ({ ...prev, [lessonDefinitionId]: null }));
        } finally {
            setIsLoadingChallengeConfig(prev => ({ ...prev, [lessonDefinitionId]: false }));
        }
    }, [authState.token]);

    const handleToggleLessonExpand = (lessonId) => {
        const newExpandedLessonId = expandedLessonId === lessonId ? null : lessonId;
        setExpandedLessonId(newExpandedLessonId);
        if (newExpandedLessonId) {
            if (!activityNodesByLesson[newExpandedLessonId]) {
                fetchActivityNodes(newExpandedLessonId);
            }
            const lesson = lessons.find(l => l.lessonDefinitionId === newExpandedLessonId);
            // This logic now works reliably with the backend fix (sending challengeDefinitionId)
            // and the frontend fix (not clearing challengeConfigByLesson).
            if (lesson && lesson.challengeDefinitionId && !challengeConfigByLesson[newExpandedLessonId]) {
                fetchChallengeConfig(newExpandedLessonId);
            }
        }
    };

    const handleOpenAddLessonDialog = () => { setIsAddLessonDialogOpen(true); setAddLessonError(null); };
    const handleConfirmAddLesson = async (lessonFormData) => {
        if (!authState.token || !courseId) { setAddLessonError("Auth error."); return; }
        setIsSubmittingLesson(true); setAddLessonError(null);
        try {
            await createLessonDefinition(courseId, lessonFormData, authState.token);
            fetchLessons();
            setIsAddLessonDialogOpen(false);
            setSnackbarMessage("Lesson added successfully!"); setSnackbarOpen(true);
        } catch (err) { setAddLessonError(err.message || "Failed to add lesson.");
        } finally { setIsSubmittingLesson(false); }
    };

    const handleChallengeConfigured = (challengeDef) => {
    setSnackbarMessage("Challenge saved successfully!");
    setSnackbarOpen(true);
    // Refresh the data to show the new configuration
    fetchChallengeConfig(challengeDef.lessonDefinitionId);
    // Re-fetch the main lesson list to get updated challengeDefinitionId
    fetchLessons();
    };

    const handleDeleteLesson = (lesson) => {
        setLessonToDelete(lesson);
        setDeleteLessonError(null);
        setIsDeleteLessonDialogOpen(true);
    };

    const handleConfirmDeleteLesson = async () => {
        if (!lessonToDelete || !courseId || !authState.token) {
            setDeleteLessonError("Data missing, cannot delete.");
            return;
        }
        setIsDeletingLesson(true);
        setDeleteLessonError(null);
        try {
            await deleteLessonDefinition(courseId, lessonToDelete.lessonDefinitionId, authState.token);
            // Instead of just filtering, re-fetch to ensure data consistency.
            fetchLessons();
            setIsDeleteLessonDialogOpen(false);
            setSnackbarMessage("Lesson deleted successfully!");
            setSnackbarOpen(true);
        } catch (err) {
            setDeleteLessonError(err.message || "Failed to delete lesson.");
        } finally {
            setIsDeletingLesson(false);
        }
    };

    const handleEditLesson = (lesson) => {
        setEditingLesson(lesson);
        setUpdateLessonError(null);
        setIsEditLessonDialogOpen(true);
    };

    const handleConfirmUpdateLesson = async (lessonUpdateData) => {
        if (!editingLesson || !courseId || !authState.token) {
            setUpdateLessonError("Data missing, cannot update.");
            return;
        }
        setIsUpdatingLesson(true);
        setUpdateLessonError(null);
        try {
            await updateLessonDefinition(
                courseId,
                editingLesson.lessonDefinitionId,
                lessonUpdateData,
                authState.token
            );
            // Re-fetch lessons to show updated data.
            fetchLessons();
            setIsEditLessonDialogOpen(false);
            setSnackbarMessage("Lesson updated successfully!");
            setSnackbarOpen(true);
        } catch (err) {
            setUpdateLessonError(err.message || "Failed to update lesson.");
        } finally {
            setIsUpdatingLesson(false);
        }
    };

    const handleAddActivityNode = (lessonDefId) => {
        setCurrentLessonIdForNode(lessonDefId);
        setIsAddActivityNodeDialogOpen(true); setAddActivityNodeError(null);
    };
    const handleConfirmAddActivityNode = async (activityNodeData) => {
        if (!currentLessonIdForNode || !authState.token) {
            setAddActivityNodeError("Context error.");
            return;
        }
        setIsSubmittingActivityNode(true);
        setAddActivityNodeError(null);
        try {
            // No changes are needed here - your function is already correct!
            // It correctly takes the full 'activityNodeData' object...
            await createActivityNodeTypeForLesson(currentLessonIdForNode, activityNodeData, authState.token);

            // ...and passes it to the service.
            fetchActivityNodes(currentLessonIdForNode);
            setIsAddActivityNodeDialogOpen(false);
            setSnackbarMessage("Activity node added!");
            setSnackbarOpen(true);
        } catch (err) {
            setAddActivityNodeError(err.message || "Failed to add node.");
        } finally {
            setIsSubmittingActivityNode(false);
        }
    };
    const handleManageActivityNode = (activityNode, lessonDefId) => {
        navigate(`/teacher/course/${courseId}/lesson/${lessonDefId}/node/${activityNode.activityNodeTypeId}/edit`);
    };

    const handleOpenConfigureChallengeDialog = (lesson) => {
    setCurrentLessonForChallenge(lesson);
    // This is much simpler now
    setIsConfigureChallengeDialogOpen(true);
    };

    const handleSaveChallengeConfiguration = async (configData) => {
        if (!currentLessonForChallenge || !authState.token) {
            setConfigureChallengeError("Lesson context or auth token missing."); return;
        }
        setIsSubmittingChallengeConfig(true); setConfigureChallengeError(null);
        try {
            await configureChallengeForLesson(currentLessonForChallenge.lessonDefinitionId, configData, authState.token);
            // Fetch the details for the lesson we just configured.
            await fetchChallengeConfig(currentLessonForChallenge.lessonDefinitionId);
            // Then, fetch the main lesson list. This will now have the updated challengeDefinitionId from the backend
            // and will NOT clear the challengeConfigByLesson state.
            await fetchLessons();
            setIsConfigureChallengeDialogOpen(false);
            setSnackbarMessage("Challenge configuration saved!"); setSnackbarOpen(true);
        } catch (err) {
            setConfigureChallengeError(err.message || "Failed to save challenge configuration.");
        } finally {
            setIsSubmittingChallengeConfig(false);
        }
    };

    const handleOpenDeleteChallengeDialog = (lesson) => {
        setLessonToDeleteChallengeFrom(lesson);
        setIsDeleteChallengeDialogOpen(true);
        setDeleteChallengeError(null);
    };

    const handleConfirmDeleteChallenge = async () => {
        if (!lessonToDeleteChallengeFrom || !authState.token) {
            setDeleteChallengeError("Lesson context or auth token missing."); return;
        }
        setIsDeletingChallenge(true); setDeleteChallengeError(null);
        try {
            await deleteChallengeConfiguration(lessonToDeleteChallengeFrom.lessonDefinitionId, authState.token);
            // Explicitly set the config for this lesson to null.
            setChallengeConfigByLesson(prev => ({ ...prev, [lessonToDeleteChallengeFrom.lessonDefinitionId]: null }));
            // Re-fetch lessons to update the list (the lesson's challengeDefinitionId will be null now).
            await fetchLessons();
            setIsDeleteChallengeDialogOpen(false);
            setSnackbarMessage("Challenge configuration deleted."); setSnackbarOpen(true);
        } catch (err) {
            setDeleteChallengeError(err.message || "Failed to delete challenge.");
        } finally {
            setIsDeletingChallenge(false);
        }
    };

    const handleManageCustomChallengeQuestions = (lesson) => {
        // This logic is more robust now with the backend DTO fix.
        const challengeDefId = lesson.challengeDefinitionId || challengeConfigByLesson[lesson.lessonDefinitionId]?.challengeDefinitionId;
        if (challengeDefId) {
            navigate(`/teacher/course/${courseId}/lesson/${lesson.lessonDefinitionId}/challenge/${challengeDefId}/edit-questions`);
        } else {
            setSnackbarMessage("Challenge not fully configured or ID missing. Cannot manage custom questions.");
            setSnackbarOpen(true);
        }
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
                    <Button 
                        component={RouterLink} 
                        to="/teacher/manage-courses" 
                        startIcon={<ArrowBackIcon />} 
                        sx={{ 
                            mb: 3,
                            color: '#64748b',
                            borderColor: '#e2e8f0',
                            '&:hover': {
                                borderColor: '#f9b121',
                                backgroundColor: '#fffbf5'
                            }
                        }} 
                        variant="outlined"
                    >
                        Back to Courses
                    </Button>
                    
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
                                {courseDetails?.title || 'Course Lessons'}
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
                                Manage lessons, activities, and challenges for your course curriculum.
                            </Typography>
                        </Box>
                        
                        {/* Stats Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card 
                                    elevation={0}
                                    sx={{ 
                                        p: 3, 
                                        background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                                        color: '#451513',
                                        borderRadius: 3
                                    }}
                                >
                                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                        {lessons.length}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Total Lessons
                                    </Typography>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={4}>
                                <Card 
                                    elevation={0}
                                    sx={{ 
                                        p: 3, 
                                        background: 'linear-gradient(135deg, #36B8E4 0%, #4FACFE 100%)',
                                        color: 'white',
                                        borderRadius: 3
                                    }}
                                >
                                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                        {Object.values(activityNodesByLesson).reduce((total, nodes) => total + (nodes?.length || 0), 0)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Activities
                                    </Typography>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={4}>
                                <Card 
                                    elevation={0}
                                    sx={{ 
                                        p: 3, 
                                        background: 'linear-gradient(135deg, #FFE8A3 0%, #FFEDB6 100%)',
                                        color: '#451513',
                                        borderRadius: 3
                                    }}
                                >
                                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                        {Object.keys(challengeConfigByLesson).filter(key => challengeConfigByLesson[key]).length}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Challenges
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 700, 
                                        color: '#1a1a1a', 
                                        mb: 1,
                                        fontSize: { xs: '1.5rem', md: '2rem' }
                                    }}
                                >
                                    Course Lessons
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b' }}>
                                    Create and organize your lesson content
                                </Typography>
                            </Box>
                            <Button 
                                variant="contained" 
                                startIcon={<AddIcon />} 
                                onClick={handleOpenAddLessonDialog}
                                sx={{
                                    background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                                    color: '#451513',
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #FDB10D 0%, #f9b121 100%)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Add Lesson
                            </Button>
                        </Box>
                    </Box>

                    {isLoadingLessons && <Box sx={{ textAlign: 'center', my: 3 }}><CircularProgress /> <Typography>Loading lessons...</Typography></Box>}
                    {errorLessons && <Alert severity="error" sx={{ my: 2 }}>{errorLessons}</Alert>}
                    {!isLoadingLessons && !errorLessons && lessons.length === 0 && (
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
                                No lessons yet
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
                                Create your first lesson to start building your course content
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddLessonDialog}
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
                                Create First Lesson
                            </Button>
                        </Box>
                    )}
                    <List sx={{ width: '100%' }}>
                        {lessons.map((lesson, index) => {
                            const currentChallengeConfig = challengeConfigByLesson[lesson.lessonDefinitionId];
                            // This check is now robust. It's true if we have detailed config.
                            // The UI to show the 'Add' button vs 'Edit' button relies on this.
                            const lessonHasChallengeConfigured = !!currentChallengeConfig;

                            return (
                                <Paper 
                                    key={lesson.lessonDefinitionId} 
                                    sx={{ 
                                        mb: 2, 
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: '#f9b121',
                                            boxShadow: '0 4px 20px rgba(249, 177, 33, 0.1)'
                                        }
                                    }} 
                                    elevation={0}
                                >
                                    <ListItem 
                                        onClick={() => handleToggleLessonExpand(lesson.lessonDefinitionId)}
                                        sx={{ 
                                            cursor: 'pointer', 
                                            '&:hover': { bgcolor: '#fffbf5' }, 
                                            py: 2, 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            borderRadius: '12px 12px 0 0'
                                        }}
                                    >
                                        <ListItemText
                                            primary={`${index + 1}. ${lesson.lessonTitle || 'Untitled Lesson'}`}
                                            secondary={lesson.lessonDescription || 'No description available.'}
                                            primaryTypographyProps={{ fontWeight: 600, fontSize: '1.2rem', color: '#1a1a1a' }}
                                            secondaryTypographyProps={{ noWrap: true, textOverflow: 'ellipsis', color: '#64748b' }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                                            <IconButton 
                                                onClick={(e) => { e.stopPropagation(); handleEditLesson(lesson); }} 
                                                sx={{ 
                                                    mx: 0.5,
                                                    color: '#64748b',
                                                    '&:hover': { 
                                                        backgroundColor: '#f9b121',
                                                        color: 'white'
                                                    }
                                                }} 
                                                size="small" 
                                                title="Edit Lesson Details"
                                            >
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson); }} 
                                                sx={{ 
                                                    color: '#ef4444', 
                                                    mx: 0.5,
                                                    '&:hover': { 
                                                        backgroundColor: '#fef2f2'
                                                    }
                                                }} 
                                                size="small" 
                                                title="Delete Lesson"
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton 
                                                edge="end" 
                                                aria-label="expand lesson" 
                                                sx={{ 
                                                    mx: 0.5,
                                                    color: '#f9b121'
                                                }} 
                                                size="small"
                                            >
                                                {expandedLessonId === lesson.lessonDefinitionId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                    <Collapse in={expandedLessonId === lesson.lessonDefinitionId} timeout="auto" unmountOnExit>
                                        <Divider />
                                        <Box sx={{ p: 3, bgcolor: '#fafbfc' }}>
                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>Activity Nodes</Typography>
                                            {isLoadingActivities[lesson.lessonDefinitionId] && <CircularProgress size={20} />}
                                            {!isLoadingActivities[lesson.lessonDefinitionId] && (
                                                activityNodesByLesson[lesson.lessonDefinitionId]?.length > 0 ? (
                                                    <List dense component={Paper} variant="outlined" sx={{ bgcolor: 'background.paper', mt:1 }}>
                                                        {activityNodesByLesson[lesson.lessonDefinitionId]?.map(node => (
                                                            <ListItem key={node.activityNodeTypeId} secondaryAction={
                                                                <Box>
                                                                    <IconButton edge="end" title="Edit Node Details" onClick={() => handleOpenEditNodeDetailsDialog(node)}>
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton edge="end" title="Delete Activity Node" onClick={() => handleDeleteActivityNode(node, lesson.lessonDefinitionId)}>
                                                                        <DeleteIcon color="error" />
                                                                    </IconButton>
                                                                    <IconButton edge="end" title="Manage Activity Content" onClick={() => handleManageActivityNode(node, lesson.lessonDefinitionId)}>
                                                                        <SettingsIcon />
                                                                    </IconButton>
                                                                </Box>
                                                            }>
                                                                <ListItemText primary={`${node.orderIndex + 1}. ${node.activityTitle || 'Untitled Node'}`} secondary={`Type: ${node.activityType}`} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : <Typography variant="body2" color="text.secondary" sx={{ my: 1, fontStyle: 'italic' }}>No activity nodes.</Typography>
                                            )}
                                            <Button 
                                                size="small" 
                                                startIcon={<AddIcon />} 
                                                onClick={() => handleAddActivityNode(lesson.lessonDefinitionId)} 
                                                sx={{ 
                                                    mt: 2,
                                                    borderColor: '#f9b121',
                                                    color: '#f9b121',
                                                    '&:hover': {
                                                        borderColor: '#FDB10D',
                                                        backgroundColor: '#fffbf5'
                                                    }
                                                }} 
                                                variant="outlined"
                                            >
                                                Add Activity Node
                                            </Button>
                                        </Box>
                                        <Divider />
                                        <Box sx={{ p: 3, bgcolor: lessonHasChallengeConfigured ? '#f0f9ff' : '#fafbfc' }}>
                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>Challenge Configuration</Typography>
                                            {isLoadingChallengeConfig[lesson.lessonDefinitionId] && <CircularProgress size={20} />}
                                            {!isLoadingChallengeConfig[lesson.lessonDefinitionId] && (
                                                lessonHasChallengeConfigured ? (
                                                    <Box>
                                                        <Typography variant="body2" component="div">
                                                            Type: <Chip label={currentChallengeConfig.challengeType?.replace('_', ' ') || 'N/A'} size="small" color="primary" />
                                                        </Typography>
                                                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenConfigureChallengeDialog(lesson)} sx={{ mt: 1, mr: 1 }} variant="outlined">Edit Settings</Button>
                                                        <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleOpenDeleteChallengeDialog(lesson)} sx={{ mt: 1, mr: 1 }} color="error" variant="outlined">Delete Challenge</Button>
                                                        <Button size="small" startIcon={<EmojiEventsIcon />} onClick={() => handleManageCustomChallengeQuestions(lesson)} sx={{ mt: 1 }} variant="outlined" color="secondary">Manage Custom Questions</Button>
                                                    </Box>
                                                ) : (
                                                    <Button size="smaall" startIcon={<AddIcon />} onClick={() => handleOpenConfigureChallengeDialog(lesson)} sx={{ mt: 1 }} variant="contained" color="warning">
                                                        Add Challenge to Lesson
                                                    </Button>
                                                )
                                            )}
                                        </Box>
                                    </Collapse>
                                </Paper>
                            )
                        })}
                    </List>
                </Box>
            </Box>

            {/* Dialogs */}
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
            {editingLesson && (
                <EditLessonDialog
                    open={isEditLessonDialogOpen}
                    onClose={() => setIsEditLessonDialogOpen(false)}
                    onUpdateLesson={handleConfirmUpdateLesson}
                    lesson={editingLesson}
                    isLoading={isUpdatingLesson}
                    error={updateLessonError}
                />
            )}

            {currentLessonForChallenge && (
                <ConfigureChallengeDialog
                    open={isConfigureChallengeDialogOpen}
                    onClose={() => setIsConfigureChallengeDialogOpen(false)}
                    lessonDefinitionId={currentLessonForChallenge.lessonDefinitionId}
                    onConfigured={handleChallengeConfigured}
                />
            )}

            {lessonToDeleteChallengeFrom && (
                <DeleteChallengeDialog
                    open={isDeleteChallengeDialogOpen}
                    onClose={() => setIsDeleteChallengeDialogOpen(false)}
                    onConfirmDelete={handleConfirmDeleteChallenge}
                    isLoading={isDeletingChallenge}
                    lessonTitle={lessonToDeleteChallengeFrom?.lessonTitle}
                />
            )}

            {lessonToDelete && (
                <DeleteLessonDialog
                    open={isDeleteLessonDialogOpen}
                    onClose={() => setIsDeleteLessonDialogOpen(false)}
                    onConfirmDelete={handleConfirmDeleteLesson}
                    isLoading={isDeletingLesson}
                    lessonTitle={lessonToDelete.lessonTitle}
                    error={deleteLessonError}
                />
            )}
            {nodeToDelete && (
                <DeleteActivityNodeDialog
                    open={isDeleteNodeDialogOpen}
                    onClose={() => setIsDeleteNodeDialogOpen(false)}
                    onConfirmDelete={handleConfirmDeleteNode}
                    isLoading={isDeletingNode}
                    nodeTitle={nodeToDelete.activityTitle}
                    error={deleteNodeError}
                />
            )}

            {editingNodeForDetails && (
                <EditActivityNodeDetailsDialog
                    open={isEditNodeDetailsDialogOpen}
                    onClose={handleCloseEditNodeDetailsDialog}
                    onSave={handleConfirmSaveNodeDetails}
                    isLoading={isSavingNodeDetails}
                    node={editingNodeForDetails}
                    error={editNodeDetailsError}
                />
            )}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Box>
    );
};

export default LessonManagementPage;

