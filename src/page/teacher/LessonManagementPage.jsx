// src/page/teacher/LessonManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import {
    Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText,
    IconButton, Button, Divider, Collapse, Chip, Snackbar
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
    const [existingChallengeConfigData, setExistingChallengeConfigData] = useState(null);
    const [isSubmittingChallengeConfig, setIsSubmittingChallengeConfig] = useState(false);
    const [configureChallengeError, setConfigureChallengeError] = useState(null);

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
    const [editingNodeForDetails, setEditingNodeForDetails] = useState(null); // Node object for the details dialog
    const [isSavingNodeDetails, setIsSavingNodeDetails] = useState(false);
    const [editNodeDetailsError, setEditNodeDetailsError] = useState(null);

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

    // ✨ Handlers for the new Edit Activity Node Details Dialog ✨
    const handleOpenEditNodeDetailsDialog = (node) => {
        setEditingNodeForDetails(node); // Use the new state variable
        setEditNodeDetailsError(null);
        setIsEditNodeDetailsDialogOpen(true);
    };

    const handleCloseEditNodeDetailsDialog = () => {
        setIsEditNodeDetailsDialogOpen(false);
        setEditingNodeForDetails(null); // Use the new state variable
    };

    // ... other handlers and useEffects ...
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
            if (lesson && (lesson.hasChallenge || lesson.challengeDefinitionId) && !challengeConfigByLesson[newExpandedLessonId]) {
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
            setLessons(prevLessons => prevLessons.filter(l => l.lessonDefinitionId !== lessonToDelete.lessonDefinitionId));
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
            const updatedLesson = await updateLessonDefinition(
                courseId,
                editingLesson.lessonDefinitionId,
                lessonUpdateData,
                authState.token
            );
            setLessons(prevLessons =>
                prevLessons.map(l => l.lessonDefinitionId === updatedLesson.lessonDefinitionId ? updatedLesson : l)
            );
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
            fetchChallengeConfig(currentLessonForChallenge.lessonDefinitionId);
            fetchLessons();
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
            fetchLessons();
            setIsDeleteChallengeDialogOpen(false);
            setSnackbarMessage("Challenge configuration deleted."); setSnackbarOpen(true);
        } catch (err) {
            setDeleteChallengeError(err.message || "Failed to delete challenge.");
        } finally {
            setIsDeletingChallenge(false);
        }
    };

    const handleManageCustomChallengeQuestions = (lesson) => {
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
            {/* ... other JSX ... */}
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
                                            <IconButton onClick={(e) => { e.stopPropagation(); handleEditLesson(lesson); }} sx={{ mx: 0.5 }} size="small" title="Edit Lesson Details"><EditIcon fontSize="small"/></IconButton>
                                            <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson); }} sx={{ color: 'error.main', mx: 0.5 }} size="small" title="Delete Lesson"><DeleteIcon fontSize="small"/></IconButton>
                                            <IconButton edge="end" aria-label="expand lesson" sx={{ mx: 0.5 }} size="small">{expandedLessonId === lesson.lessonDefinitionId ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                                        </Box>
                                    </ListItem>
                                    <Collapse in={expandedLessonId === lesson.lessonDefinitionId} timeout="auto" unmountOnExit>
                                        <Divider />
                                        <Box sx={{ p: 2, bgcolor: '#fdfcf7' }}>
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: '#5d211f' }}>Activity Nodes:</Typography>
                                            {isLoadingActivities[lesson.lessonDefinitionId] && <CircularProgress size={20} />}
                                            {!isLoadingActivities[lesson.lessonDefinitionId] && (
                                                activityNodesByLesson[lesson.lessonDefinitionId]?.length > 0 ? (
                                                    <List dense component={Paper} variant="outlined" sx={{ bgcolor: 'background.paper', mt:1 }}>
                                                        {/* ✨ GUARD ADDED HERE ✨ */}
                                                        {activityNodesByLesson[lesson.lessonDefinitionId]?.map(node => (
                                                            <ListItem key={node.activityNodeTypeId} secondaryAction={
                                                                <Box>

                                                                    <IconButton edge="end" title="Manage Activity Content" onClick={() => handleManageActivityNode(node, lesson.lessonDefinitionId)}>
                                                                        <SettingsIcon />
                                                                    </IconButton>
                                                                    <IconButton edge="end" title="Delete Activity Node" onClick={() => handleDeleteActivityNode(node, lesson.lessonDefinitionId)}>
                                                                        <DeleteIcon color="error" />
                                                                    </IconButton>
                                                                </Box>
                                                            }>
                                                                <ListItemText primary={`${node.orderIndex + 1}. ${node.activityTitle || 'Untitled Node'}`} secondary={`Type: ${node.activityType}`} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : <Typography variant="body2" color="text.secondary" sx={{ my: 1, fontStyle: 'italic' }}>No activity nodes.</Typography>
                                            )}
                                            <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddActivityNode(lesson.lessonDefinitionId)} sx={{ mt: 1.5 }} variant="outlined">Add Activity Node</Button>
                                        </Box>
                                        <Divider />
                                        <Box sx={{ p: 2, bgcolor: lessonHasChallengeConfigured ? '#fffde7' : '#fdfcf7' }}>
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: '#5d211f' }}>Challenge:</Typography>
                                            {isLoadingChallengeConfig[lesson.lessonDefinitionId] && <CircularProgress size={20} />}
                                            {!isLoadingChallengeConfig[lesson.lessonDefinitionId] && (
                                                lessonHasChallengeConfigured ? (
                                                    <Box>
                                                        {/* ... challenge details ... */}
                                                    </Box>
                                                ) : (
                                                    <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenConfigureChallengeDialog(lesson)} sx={{ mt: 1 }} variant="contained" color="warning">
                                                        Add Challenge to Lesson
                                                    </Button>
                                                )
                                            )}
                                        </Box>
                                    </Collapse>
                                    {/* ✨ DUPLICATE COLLAPSE REMOVED FROM HERE ✨ */}
                                </Paper>
                            )
                        })}
                    </List>
                </Box>
            </Box>

            {/* ... DIALOGS ... */}
            <AddLessonDialog open={isAddLessonDialogOpen} onClose={() => setIsAddLessonDialogOpen(false)} onAddLesson={handleConfirmAddLesson} isLoading={isSubmittingLesson} error={addLessonError} />
            <AddActivityNodeDialog open={isAddActivityNodeDialogOpen} onClose={() => setIsAddActivityNodeDialogOpen(false)} onConfirm={handleConfirmAddActivityNode} isLoading={isSubmittingActivityNode} error={addActivityNodeError} />

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

            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} />
        </Box>
    );
};

export default LessonManagementPage;