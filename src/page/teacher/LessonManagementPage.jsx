// src/page/teacher/LessonManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import {
    Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText,
    IconButton, Button, Divider, Collapse, Chip, Snackbar // Added Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Icon for Challenge

import { getCourseById } from '../../services/courseService';
import {
    getLessonDefinitions,
    getActivityNodeTypesForLesson,
    createLessonDefinition,
    createActivityNodeTypeForLesson
    // deleteLessonDefinition // Import if you implement lesson deletion
} from '../../services/lessonService';
import { // Import challenge services
    configureChallengeForLesson,
    getChallengeConfigurationForLesson,
    deleteChallengeConfiguration
} from '../../services/challengeService';

import AddLessonDialog from '../../components/dialogs/AddLessonDialog';
import AddActivityNodeDialog from '../../components/dialogs/AddActivityNodeDialog';
import ConfigureChallengeDialog from '../../components/dialogs/ConfigureChallengeDialog'; // New Dialog
import DeleteChallengeDialog from '../../components/dialogs/DeleteChallengeDialog'; // New Dialog


import '../../styles/TeacherHomepage.css';

const LessonManagementPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [courseDetails, setCourseDetails] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activityNodesByLesson, setActivityNodesByLesson] = useState({});
    const [challengeConfigByLesson, setChallengeConfigByLesson] = useState({}); // Store fetched challenge configs

    const [isLoadingCourse, setIsLoadingCourse] = useState(true);
    const [errorCourse, setErrorCourse] = useState(null);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);
    const [errorLessons, setErrorLessons] = useState(null);
    const [isLoadingActivities, setIsLoadingActivities] = useState({});
    const [isLoadingChallengeConfig, setIsLoadingChallengeConfig] = useState({}); // Loading state per lesson for challenge config

    const [expandedLessonId, setExpandedLessonId] = useState(null);

    const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false);
    const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
    const [addLessonError, setAddLessonError] = useState(null);

    const [isAddActivityNodeDialogOpen, setIsAddActivityNodeDialogOpen] = useState(false);
    const [currentLessonIdForNode, setCurrentLessonIdForNode] = useState(null);
    const [isSubmittingActivityNode, setIsSubmittingActivityNode] = useState(false);
    const [addActivityNodeError, setAddActivityNodeError] = useState(null);

    // State for Challenge Configuration Dialog
    const [isConfigureChallengeDialogOpen, setIsConfigureChallengeDialogOpen] = useState(false);
    const [currentLessonForChallenge, setCurrentLessonForChallenge] = useState(null); // Store {lessonDefinitionId, lessonTitle}
    const [existingChallengeConfigData, setExistingChallengeConfigData] = useState(null);
    const [isSubmittingChallengeConfig, setIsSubmittingChallengeConfig] = useState(false);
    const [configureChallengeError, setConfigureChallengeError] = useState(null);

    // State for Delete Challenge Dialog
    const [isDeleteChallengeDialogOpen, setIsDeleteChallengeDialogOpen] = useState(false);
    const [lessonToDeleteChallengeFrom, setLessonToDeleteChallengeFrom] = useState(null); // Store {lessonDefinitionId, lessonTitle}
    const [isDeletingChallenge, setIsDeletingChallenge] = useState(false);
    const [deleteChallengeError, setDeleteChallengeError] = useState(null);


    const [authLoading, setAuthLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');


    useEffect(() => {
        if (authState.isAuthenticated && authState.token) {
            setAuthLoading(false);
        } else if (!authState.isAuthenticated && authState.token === null) {
            const timeout = setTimeout(() => setAuthLoading(false), 500);
            return () => clearTimeout(timeout);
        }
    }, [authState.isAuthenticated, authState.token]);

    const fetchCourseDetails = useCallback(async () => {
        if (!courseId || !authState.token) return;
        setIsLoadingCourse(true); setErrorCourse(null);
        try {
            const details = await getCourseById(courseId, authState.token);
            setCourseDetails(details);
        } catch (err) { setErrorCourse(err.message || "Could not load course details.");
        } finally { setIsLoadingCourse(false); }
    }, [courseId, authState.token]);

    const fetchLessons = useCallback(async () => {
        if (!courseId || !authState.token) return;
        setIsLoadingLessons(true); setErrorLessons(null); setLessons([]); setChallengeConfigByLesson({});
        try {
            const lessonDefs = await getLessonDefinitions(courseId, authState.token);
            // Assuming lessonDefs items have `lessonDefinitionId` and potentially `challengeDefinitionId` or `hasChallenge`
            setLessons(Array.isArray(lessonDefs) ? lessonDefs : []);
        } catch (err) { setErrorLessons(err.message || "Could not load lessons."); setLessons([]);
        } finally { setIsLoadingLessons(false); }
    }, [courseId, authState.token]);

    useEffect(() => {
        if (!authLoading && authState.isAuthenticated && authState.token) {
            fetchCourseDetails();
            fetchLessons();
        }
    }, [authLoading, authState.isAuthenticated, authState.token, fetchCourseDetails, fetchLessons]);

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

    const fetchChallengeConfig = useCallback(async (lessonDefinitionId) => {
        if (!lessonDefinitionId || !authState.token) return;
        setIsLoadingChallengeConfig(prev => ({ ...prev, [lessonDefinitionId]: true }));
        try {
            const config = await getChallengeConfigurationForLesson(lessonDefinitionId, authState.token);
            setChallengeConfigByLesson(prev => ({ ...prev, [lessonDefinitionId]: config })); // config can be null
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
            // Also fetch challenge config if lesson has one and it's not already fetched
            const lesson = lessons.find(l => l.lessonDefinitionId === newExpandedLessonId);
            if (lesson && (lesson.hasChallenge || lesson.challengeDefinitionId) && !challengeConfigByLesson[newExpandedLessonId]) {
                fetchChallengeConfig(newExpandedLessonId);
            }
        }
    };

    // --- Lesson Handlers ---
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
    const handleEditLesson = (lesson) => alert(`Edit lesson: ${lesson.lessonTitle} - To Be Implemented`);
    const handleDeleteLesson = (lesson) => {
        if (window.confirm(`Delete lesson "${lesson.lessonTitle}"?`)) {
            alert(`Delete lesson: ${lesson.lessonTitle} - To Be Implemented`);
            // deleteLessonDefinition(lesson.lessonDefinitionId, authState.token).then(() => fetchLessons());
        }
    };

    // --- Activity Node Handlers ---
    const handleAddActivityNode = (lessonDefId) => {
        setCurrentLessonIdForNode(lessonDefId);
        setIsAddActivityNodeDialogOpen(true); setAddActivityNodeError(null);
    };
    const handleConfirmAddActivityNode = async (activityNodeData) => {
        if (!currentLessonIdForNode || !authState.token) { setAddActivityNodeError("Context error."); return; }
        setIsSubmittingActivityNode(true); setAddActivityNodeError(null);
        try {
            await createActivityNodeTypeForLesson(currentLessonIdForNode, activityNodeData, authState.token);
            fetchActivityNodes(currentLessonIdForNode);
            setIsAddActivityNodeDialogOpen(false);
            setSnackbarMessage("Activity node added!"); setSnackbarOpen(true);
        } catch (err) { setAddActivityNodeError(err.message || "Failed to add node.");
        } finally { setIsSubmittingActivityNode(false); }
    };
    const handleManageActivityNode = (activityNode, lessonDefId) => {
        navigate(`/teacher/course/${courseId}/lesson/${lessonDefId}/node/${activityNode.activityNodeTypeId}/edit`);
    };

    // --- Challenge Configuration Handlers ---
    const handleOpenConfigureChallengeDialog = (lesson) => {
        setCurrentLessonForChallenge(lesson);
        setExistingChallengeConfigData(challengeConfigByLesson[lesson.lessonDefinitionId] || null);
        setIsConfigureChallengeDialogOpen(true);
        setConfigureChallengeError(null);
    };

    const handleSaveChallengeConfiguration = async (configData) => {
        if (!currentLessonForChallenge || !authState.token) {
            setConfigureChallengeError("Lesson context or auth token missing."); return;
        }
        setIsSubmittingChallengeConfig(true); setConfigureChallengeError(null);
        try {
            await configureChallengeForLesson(currentLessonForChallenge.lessonDefinitionId, configData, authState.token);
            fetchChallengeConfig(currentLessonForChallenge.lessonDefinitionId); // Re-fetch to update display
            fetchLessons(); // Re-fetch lessons as challengeDefinitionId might have been added/updated
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
            setChallengeConfigByLesson(prev => ({ ...prev, [lessonToDeleteChallengeFrom.lessonDefinitionId]: null }));
            fetchLessons(); // To update hasChallenge or challengeDefinitionId on lesson object
            setIsDeleteChallengeDialogOpen(false);
            setSnackbarMessage("Challenge configuration deleted."); setSnackbarOpen(true);
        } catch (err) {
            setDeleteChallengeError(err.message || "Failed to delete challenge.");
        } finally {
            setIsDeletingChallenge(false);
        }
    };
    
    const handleManageCustomChallengeQuestions = (lesson) => {
        // We need challengeDefinitionId to navigate
        // It should be available either directly on the lesson object (if DTO includes it and it's not null)
        // or on the fetched currentChallengeConfigDetails
        const challengeDefId = lesson.challengeDefinitionId || challengeConfigByLesson[lesson.lessonDefinitionId]?.challengeDefinitionId;

        if (challengeDefId) {
            console.log(`Navigating to manage custom challenge questions for Lesson ID: ${lesson.lessonDefinitionId}, Challenge Definition ID: ${challengeDefId}`);
            navigate(`/teacher/course/${courseId}/lesson/${lesson.lessonDefinitionId}/challenge/${challengeDefId}/edit-questions`);
        } else {
            setSnackbarMessage("Challenge not fully configured or ID missing. Cannot manage custom questions.");
            setSnackbarOpen(true);
            console.error("Cannot navigate to manage custom questions: challengeDefinitionId is missing for lesson", lesson);
        }
    };


    // Render loading/error states for auth and course details
    if (authLoading || isLoadingCourse) {
        return (
            <Box className="teacher-homepage-container">
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
                <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <Box className="teacher-main-content" sx={{ textAlign: 'center', pt: 5 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 1, display: 'inline' }}>
                            {authLoading ? "Checking authentication..." : "Loading course details..."}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }
     if (!authState.isAuthenticated) {
        return (
             <Box className="teacher-homepage-container">
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
                <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <Box className="teacher-main-content" sx={{ textAlign: 'center', pt: 5 }}>
                        <Alert severity="warning">You must be logged in to manage lessons. Please <RouterLink to="/teacher-login">log in</RouterLink>.</Alert>
                    </Box>
                </Box>
            </Box>
        );
    }
    if (errorCourse) { /* Handle errorCourse display */ }


    return (
        <Box className="teacher-homepage-container">
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
            </Box>
            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="teacher-main-content">
                    <Button component={RouterLink} to="/teacher/manage-courses" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }} variant="outlined">
                        Back to Courses
                    </Button>
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, bgcolor: '#fffcf2' }} elevation={2}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#451513' }}>
                            {courseDetails?.title || 'Course Lessons'}
                        </Typography>
                         {/* ... course details display ... */}
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#451513' }}>Lessons</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddLessonDialog}
                            sx={{ bgcolor: '#451513', '&:hover': { bgcolor: '#5d211f' } }}>
                            Add Lesson
                        </Button>
                    </Box>

                    {isLoadingLessons && <Box sx={{ textAlign: 'center', my: 3 }}><CircularProgress /> <Typography>Loading lessons...</Typography></Box>}
                    {errorLessons && <Alert severity="error" sx={{ my: 2 }}>{errorLessons}</Alert>}
                    {!isLoadingLessons && !errorLessons && lessons.length === 0 && (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff9e6' }} elevation={1}>
                            <Typography color="text.secondary">No lessons defined. Click "Add Lesson".</Typography>
                        </Paper>
                    )}

                    {!isLoadingLessons && lessons.length > 0 && (
                        <List sx={{ width: '100%' }}>
                            {lessons.map((lesson, index) => {
                                const currentChallengeConfig = challengeConfigByLesson[lesson.lessonDefinitionId];
                                const lessonHasChallengeConfigured = !!currentChallengeConfig;

                                return (
                                <Paper key={lesson.lessonDefinitionId} sx={{ mb: 2, borderRadius: '8px' }} elevation={3}>
                                    <ListItem onClick={() => handleToggleLessonExpand(lesson.lessonDefinitionId)}
                                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, py: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                                        <ListItemText
                                            primary={`${index + 1}. ${lesson.lessonTitle || 'Untitled Lesson'}`}
                                            secondary={lesson.lessonDescription || 'No description available.'}
                                            primaryTypographyProps={{ fontWeight: 'medium', fontSize: '1.1rem', color: '#451513' }}
                                            secondaryTypographyProps={{ noWrap: true, textOverflow: 'ellipsis', color: 'text.secondary' }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                                            {/* Edit/Delete Lesson Buttons */}
                                            <IconButton onClick={(e) => { e.stopPropagation(); handleEditLesson(lesson); }} sx={{ mx: 0.5 }} size="small" title="Edit Lesson Details"><EditIcon fontSize="small"/></IconButton>
                                            <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson); }} sx={{ color: 'error.main', mx: 0.5 }} size="small" title="Delete Lesson"><DeleteIcon fontSize="small"/></IconButton>
                                            <IconButton edge="end" aria-label="expand lesson" sx={{ mx: 0.5 }} size="small">{expandedLessonId === lesson.lessonDefinitionId ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                                        </Box>
                                    </ListItem>
                                    <Collapse in={expandedLessonId === lesson.lessonDefinitionId} timeout="auto" unmountOnExit>
                                        <Divider />
                                        <Box sx={{ p: 2, bgcolor: '#fdfcf7' }}> {/* Activity Nodes Section */}
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: '#5d211f' }}>Activity Nodes:</Typography>
                                            {isLoadingActivities[lesson.lessonDefinitionId] && <CircularProgress size={20} />}
                                            {!isLoadingActivities[lesson.lessonDefinitionId] && (
                                                activityNodesByLesson[lesson.lessonDefinitionId]?.length > 0 ? (
                                                    <List dense component={Paper} variant="outlined" sx={{ bgcolor: 'background.paper', mt:1 }}>
                                                        {activityNodesByLesson[lesson.lessonDefinitionId].map(node => (
                                                            <ListItem key={node.activityNodeTypeId} secondaryAction={
                                                                <IconButton edge="end" title="Manage Activity Content" onClick={() => handleManageActivityNode(node, lesson.lessonDefinitionId)}><SettingsIcon /></IconButton>}
                                                                sx={{ borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
                                                                <ListItemText primary={`${node.orderIndex + 1}. ${node.activityTitle || 'Untitled Node'}`} secondary={`Type: ${node.activityType}`} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : <Typography variant="body2" color="text.secondary" sx={{ my: 1, fontStyle: 'italic' }}>No activity nodes.</Typography>
                                            )}
                                            <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddActivityNode(lesson.lessonDefinitionId)} sx={{ mt: 1.5 }} variant="outlined">Add Activity Node</Button>
                                        </Box>
                                        <Divider />
                                        {/* Challenge Section */}
                                        <Box sx={{ p: 2, bgcolor: lessonHasChallengeConfigured ? '#fffde7' : '#fdfcf7' /* Yellowish if configured */ }}>
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: '#5d211f' }}>Challenge:</Typography>
                                            {isLoadingChallengeConfig[lesson.lessonDefinitionId] && <CircularProgress size={20} />}
                                            {!isLoadingChallengeConfig[lesson.lessonDefinitionId] && (
                                                lessonHasChallengeConfigured ? (
                                                    <Box>
                                                        <Typography variant="body2" component="div">
                                                            Type: <Chip label={currentChallengeConfig.challengeType?.replace('_', ' ') || 'N/A'} size="small" /> <br />
                                                            {currentChallengeConfig.challengeType === 'HEALTH_BASED' && `Health: ${currentChallengeConfig.initialHealth || 'N/A'}`}
                                                            {currentChallengeConfig.challengeType === 'HEALTH_BASED' && <br />}
                                                            Time/Q: {currentChallengeConfig.initialQuestionTimeSeconds || 'N/A'}s | Min Time: {currentChallengeConfig.minQuestionTimeSeconds || 'N/A'}s <br/>
                                                            Reduction: {currentChallengeConfig.timeReductionPerCorrectSeconds || 0}s/correct
                                                        </Typography>
                                                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenConfigureChallengeDialog(lesson)} sx={{ mt: 1, mr: 1 }} variant="outlined">Edit Settings</Button>
                                                        <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleOpenDeleteChallengeDialog(lesson)} sx={{ mt: 1, mr: 1 }} color="error" variant="outlined">Delete Challenge</Button>
                                                        <Button size="small" startIcon={<EmojiEventsIcon />} onClick={() => handleManageCustomChallengeQuestions(lesson)} sx={{ mt: 1 }} variant="outlined" color="secondary">Manage Custom Questions</Button>

                                                    </Box>
                                                ) : (
                                                    <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenConfigureChallengeDialog(lesson)} sx={{ mt: 1 }} variant="contained" color="warning">
                                                        Add Challenge to Lesson
                                                    </Button>
                                                )
                                            )}
                                        </Box>
                                    </Collapse>
                                </Paper>
                            )})}
                        </List>
                    )}
                </Box> {/* End teacher-main-content */}
            </Box> {/* End teacher-content-area */}

            <AddLessonDialog open={isAddLessonDialogOpen} onClose={() => setIsAddLessonDialogOpen(false)} onAddLesson={handleConfirmAddLesson} isLoading={isSubmittingLesson} error={addLessonError} />
            <AddActivityNodeDialog open={isAddActivityNodeDialogOpen} onClose={() => setIsAddActivityNodeDialogOpen(false)} onConfirm={handleConfirmAddActivityNode} isLoading={isSubmittingActivityNode} error={addActivityNodeError} />

            {currentLessonForChallenge && (
                <ConfigureChallengeDialog
                    open={isConfigureChallengeDialogOpen}
                    onClose={() => setIsConfigureChallengeDialogOpen(false)}
                    onSave={handleSaveChallengeConfiguration}
                    existingConfig={existingChallengeConfigData}
                    isLoading={isSubmittingChallengeConfig}
                    error={configureChallengeError}
                />
            )}
            {lessonToDeleteChallengeFrom && (
                <DeleteChallengeDialog
                    open={isDeleteChallengeDialogOpen}
                    onClose={() => setIsDeleteChallengeDialogOpen(false)}
                    onConfirmDelete={handleConfirmDeleteChallenge}
                    isLoading={isDeletingChallenge}
                    lessonTitle={lessonToDeleteChallengeFrom?.lessonTitle}
                    // error={deleteChallengeError} // Can add error display to dialog if needed
                />
            )}
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} />
        </Box> // End teacher-homepage-container
    );
};

export default LessonManagementPage;