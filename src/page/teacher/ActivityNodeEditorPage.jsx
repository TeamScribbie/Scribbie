// AI Context/Frontend/page/teacher/ActivityNodeEditorPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import {
    Typography, Box, CircularProgress, Alert, Paper, Button,
    List, ListItem, ListItemText, IconButton, Snackbar, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';

import { getActivityNodeTypeDetails } from '../../services/activityService';
import {
    createQuestionForActivityNode,
    updateQuestion,
    deleteQuestion,
    createChoiceForQuestion,
    updateChoice,
    deleteChoice,
    updateQuestionOrderForActivityNode
} from '../../services/lessonService';

import AddEditQuestionDialog from '../../components/dialogs/AddEditQuestionDialog';

import '../../styles/TeacherHomepage.css';

const ActivityNodeEditorPage = () => {
    const { courseId, lessonDefinitionId, activityNodeTypeId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [activityNodeDetails, setActivityNodeDetails] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [modifiedQuestionOrderIds, setModifiedQuestionOrderIds] = useState(new Set());

    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [pageError, setPageError] = useState(null);

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isDialogSaving, setIsDialogSaving] = useState(false);
    const [isOrderSaving, setIsOrderSaving] = useState(false);
    const [dialogError, setDialogError] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const fetchActivityNodeData = useCallback(async () => {
        if (!activityNodeTypeId || !authState.token) {
            setPageError("Activity Node ID or authentication token is missing.");
            setIsLoadingPage(false);
            return;
        }
        setIsLoadingPage(true);
        setPageError(null);
        try {
            const data = await getActivityNodeTypeDetails(activityNodeTypeId, authState.token); //
            setActivityNodeDetails(data);
            const formattedQuestions = (data.questions || []).map((q, index) => ({ //
                ...q,
                choices: Array.isArray(q.choices) ? q.choices.map(c => ({ ...c, tempChoiceId: c.choiceId || `c-${Date.now()}-${Math.random()}`, isNew: false, isModified: false, isDeleted: false })) : [], //
                orderIndex: q.orderIndex !== undefined ? q.orderIndex : index, //
                isNew: false,
                isModified: false,
                isDeleted: false,
            })).sort((a, b) => a.orderIndex - b.orderIndex); //
            setQuestions(formattedQuestions);
            setModifiedQuestionOrderIds(new Set());
        } catch (err) {
            setPageError(err.message || "Could not load activity node details."); //
            setQuestions([]);
        } finally {
            setIsLoadingPage(false);
        }
    }, [activityNodeTypeId, authState.token]);

    useEffect(() => {
        if (authState.isAuthenticated && authState.token) {
            fetchActivityNodeData();
        } else if (authState.isAuthenticated === false) {
            setPageError("User not authenticated. Please log in."); //
            setIsLoadingPage(false);
        }
    }, [authState.isAuthenticated, authState.token, fetchActivityNodeData]);

    const handleOpenAddQuestionDialog = () => {
        setEditingQuestion(null);
        setDialogError(null);
        setIsQuestionDialogOpen(true);
    };

    const handleOpenEditQuestionDialog = (questionToEdit) => {
        setEditingQuestion(JSON.parse(JSON.stringify(questionToEdit)));
        setDialogError(null);
        setIsQuestionDialogOpen(true);
    };

    const handleDeleteQuestionLocalOrApi = async (questionId, indexInUI) => {
        const questionToDelete = questions[indexInUI]; //
        if (window.confirm(`Are you sure you want to delete Question ${indexInUI + 1}: "${questionToDelete.questionText.substring(0, 30)}..."?`)) { //
            if (!questionToDelete.questionId) {
                setQuestions(prev => prev.filter((_, idx) => idx !== indexInUI)
                    .map((q, newIdx) => ({ ...q, orderIndex: newIdx })));
                setSnackbarMessage("Unsaved question removed locally.");
                setSnackbarOpen(true);
                return;
            }
            setIsOrderSaving(true);
            try {
                await deleteQuestion(activityNodeTypeId, questionToDelete.questionId, authState.token); //
                setSnackbarMessage("Question deleted successfully!"); //
                setSnackbarOpen(true);
                fetchActivityNodeData();
            } catch (err) {
                setSnackbarMessage(`Error deleting question: ${err.message}`); //
                setSnackbarOpen(true);
            } finally {
                setIsOrderSaving(false);
            }
        }
    };

    const handleSaveQuestionFromDialog = async (payloadFromDialog) => {
        // This function remains the same as it handles full updates from the dialog correctly.
        if (!authState || !authState.token) {
            setDialogError("Authentication missing. Please log in again.");
            setIsDialogSaving(false);
            return;
        }

        if (!activityNodeTypeId) {
            setDialogError("Activity Node ID context is missing. Cannot save question.");
            setIsDialogSaving(false);
            return;
        }

        setIsDialogSaving(true);
        setDialogError(null);

        try {
            if (payloadFromDialog.isNew || !payloadFromDialog.questionId) {
                const { choices, ...questionDataForApi } = payloadFromDialog;
                const savedOrUpdatedQuestion = await createQuestionForActivityNode( //
                    activityNodeTypeId,
                    questionDataForApi,
                    authState.token
                );

                if (savedOrUpdatedQuestion && savedOrUpdatedQuestion.questionId && choices && choices.length > 0) {
                    for (const choice of choices) {
                        const choicePayload = { choiceText: choice.choiceText, isCorrect: !!choice.isCorrect };
                        await createChoiceForQuestion( //
                            activityNodeTypeId,
                            savedOrUpdatedQuestion.questionId,
                            choicePayload,
                            authState.token
                        );
                    }
                    setSnackbarMessage("Question and choices added successfully!");
                } else {
                    setSnackbarMessage("Question added successfully.");
                }

            } else {
                await updateQuestion( //
                    activityNodeTypeId,
                    payloadFromDialog.questionId,
                    payloadFromDialog,
                    authState.token
                );
                setSnackbarMessage("Question updated successfully!");
            }
            setIsQuestionDialogOpen(false);
            setEditingQuestion(null);
            fetchActivityNodeData();
        } catch (err) {
            console.error("Error saving question from dialog:", err);
            const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
            setDialogError(`Save failed: ${errorMessage}`);
        } finally {
            setIsDialogSaving(false);
        }
    };

    const handleMoveQuestion = (currentIndex, direction) => {
        const newQuestions = [...questions]; //
        const targetIndex = currentIndex + direction; //

        if (targetIndex < 0 || targetIndex >= newQuestions.length) return; //

        [newQuestions[currentIndex], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[currentIndex]]; //

        const reorderedQuestions = newQuestions.map((q, idx) => { //
            const orderChanged = q.orderIndex !== idx; //
            if (q.questionId && orderChanged) {
                setModifiedQuestionOrderIds(prev => new Set(prev).add(q.questionId)); //
            }
            return { ...q, orderIndex: idx };
        });
        setQuestions(reorderedQuestions); //
    };

    const handleSaveOrder = async () => {
        if (!authState.token) {
            setSnackbarMessage("Authentication missing.");
            setSnackbarOpen(true);
            return;
        }
        if (modifiedQuestionOrderIds.size === 0) { //
            setSnackbarMessage("No order changes to save."); //
            setSnackbarOpen(true);
            return;
        }

        setIsOrderSaving(true);
        setSnackbarMessage('');

        try {
            await updateQuestionOrderForActivityNode(activityNodeTypeId, questions, authState.token);

            setSnackbarMessage("Question order saved successfully!");
            setModifiedQuestionOrderIds(new Set());
            fetchActivityNodeData();
        } catch (err) {
            console.error("Failed to update question order:", err);
            setSnackbarMessage(`Error saving order: ${err.message}`);
        } finally {
            setIsOrderSaving(false);
            setSnackbarOpen(true);
        }
    };

    const pageTitle = activityNodeDetails
        ? `Editor: ${activityNodeDetails.activityTitle || activityNodeDetails.activityType || 'Activity Node'}` //
        : 'Loading Activity Node Editor...';
    const lessonManagementPath = `/teacher/course/${courseId}/lessons`; //

    return (
        <Box className="teacher-homepage-container">
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
            </Box>
            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="teacher-main-content">
                    <Button component={RouterLink} to={lessonManagementPath} state={{ courseId: courseId, lessonDefinitionId: lessonDefinitionId }}
                            startIcon={<ArrowBackIcon />} sx={{ mb: 2 }} variant="outlined">
                        Back to Lessons for Course {courseId}
                    </Button>

                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, bgcolor: '#fffcf2' }} elevation={2}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#451513' }}>{pageTitle}</Typography>
                        {activityNodeDetails && (
                            <Typography variant="body1" color="text.secondary">
                                Type: {activityNodeDetails.activityType} | Instructions: {activityNodeDetails.instructions || "None"}
                            </Typography>
                        )}
                    </Paper>

                    {isLoadingPage && <Box sx={{ textAlign: 'center', my: 3 }}><CircularProgress /> <Typography>Loading details...</Typography></Box>}
                    {pageError && <Alert severity="error" sx={{ my: 2 }}>{pageError}</Alert>}

                    {!isLoadingPage && !pageError && activityNodeDetails && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#451513' }}>Questions</Typography>
                                <Box>
                                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddQuestionDialog}
                                            sx={{ mr: 2 }} disabled={isDialogSaving || isOrderSaving}>
                                        Add New Question
                                    </Button>
                                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveOrder}
                                            disabled={isDialogSaving || isOrderSaving || modifiedQuestionOrderIds.size === 0}
                                            sx={{ bgcolor: '#FFC107', color: 'black', '&:hover': { bgcolor: '#FFA000' } }}>
                                        {isOrderSaving ? <CircularProgress size={24} color="inherit" /> : "Save Order"}
                                    </Button>
                                </Box>
                            </Box>

                            {questions.length === 0 ? (
                                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff9e6', mt: 2 }} elevation={1}>
                                    <Typography color="text.secondary">No questions defined yet. Click "Add New Question" to start.</Typography>
                                </Paper>
                            ) : (
                                <List>
                                    {questions.map((question, index) => (
                                        <Paper key={question.questionId || `q-${index}`} elevation={2} sx={{ mb: 1.5, overflow: 'hidden' }}>
                                            <ListItem sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1.5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1, alignSelf: 'stretch', justifyContent: 'center' }}>
                                                    <IconButton onClick={() => handleMoveQuestion(index, -1)} disabled={index === 0 || isDialogSaving || isOrderSaving} size="small" title="Move Up">
                                                        <ArrowUpwardIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleMoveQuestion(index, 1)} disabled={index === questions.length - 1 || isDialogSaving || isOrderSaving} size="small" title="Move Down">
                                                        <ArrowDownwardIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography component="span" sx={{ fontWeight: 'medium', color: '#451513', mr: 1 }}>
                                                                {`${index + 1}. ${question.questionText || 'Untitled Question'}`}
                                                            </Typography>
                                                            {modifiedQuestionOrderIds.has(question.questionId) &&
                                                                <Chip label="Order Changed" size="small" color="info" sx={{ml: 1, fontSize: '0.65rem', height: '16px', fontStyle: 'italic'}}/>
                                                            }
                                                        </Box>
                                                    }
                                                    // --- THIS IS THE REVERTED CHANGE ---
                                                    // Restoring the detailed choices display
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                                                                {question.instructional ? "Instructional (No Challenge)" : "Standard Question"}
                                                            </Typography>
                                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                Choices: {(question.choices && question.choices.filter(c => !c.isDeleted).length > 0)
                                                                ? question.choices.filter(c => !c.isDeleted).slice(0, 2).map(c => `"${c.choiceText.substring(0,15) + (c.choiceText.length > 15 ? "..." : "")}"`).join(' | ') + (question.choices.filter(c => !c.isDeleted).length > 2 ? "..." : "")
                                                                : "None"}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', pl: 1}}>
                                                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditQuestionDialog(question)} sx={{mr:0.5}} disabled={isDialogSaving || isOrderSaving}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestionLocalOrApi(question.questionId, index)} disabled={isDialogSaving || isOrderSaving}>
                                                        <DeleteIcon color="error" />
                                                    </IconButton>
                                                </Box>
                                            </ListItem>
                                        </Paper>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
            {isQuestionDialogOpen && (
                <AddEditQuestionDialog
                    open={isQuestionDialogOpen}
                    onClose={() => setIsQuestionDialogOpen(false)}
                    onSave={handleSaveQuestionFromDialog}
                    existingQuestion={editingQuestion}
                    activityNodeTypeId={activityNodeTypeId}
                    isLoading={isDialogSaving}
                    error={dialogError}
                    orderIndexForNewQuestion={editingQuestion ? editingQuestion.orderIndex : questions.length}
                />
            )}
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} />
        </Box>
    );
};

export default ActivityNodeEditorPage;