import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import {
    Typography, Box, CircularProgress, Alert, Paper, Button,
    List, ListItem, ListItemText, IconButton, Snackbar, Chip, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';

import { getActivityNodeTypeDetails, updateActivityNodeTypeDetails  } from '../../services/activityService';
import {
    deleteQuestion,
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

    const [detailsFormData, setDetailsFormData] = useState({
        activityTitle: '',
        instructions: '',
        flagA: '',
        flagB: '',
        flagC: '',
    });

    const [isDetailsSaving, setIsDetailsSaving] = useState(false);

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
            const data = await getActivityNodeTypeDetails(activityNodeTypeId, authState.token);
            setActivityNodeDetails(data);
            setDetailsFormData({
                activityTitle: data.activityTitle || '',
                instructions: data.instructions || '',
                flagA: data.flagA || '',
                flagB: data.flagB || '',
                flagC: data.flagC || '',
            });
            const formattedQuestions = (data.questions || []).map((q, index) => ({
                ...q,
                choices: Array.isArray(q.choices) ? q.choices.map(c => ({ ...c, tempChoiceId: c.choiceId || `c-${Date.now()}-${Math.random()}` })) : [],
                orderIndex: q.orderIndex !== undefined ? q.orderIndex : index,
            })).sort((a, b) => a.orderIndex - b.orderIndex);
            setQuestions(formattedQuestions);
            setModifiedQuestionOrderIds(new Set());
        } catch (err) {
            setPageError(err.message || "Could not load activity node details.");
            setQuestions([]);
        } finally {
            setIsLoadingPage(false);
        }
    }, [activityNodeTypeId, authState.token]);

    useEffect(() => {
        if (authState.isAuthenticated && authState.token) {
            fetchActivityNodeData();
        } else if (authState.isAuthenticated === false) {
            setPageError("User not authenticated. Please log in.");
            setIsLoadingPage(false);
        }
    }, [authState.isAuthenticated, authState.token, fetchActivityNodeData]);

    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setDetailsFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveDetails = async () => {
        if (!authState.token) {
            setSnackbarMessage("Authentication missing.");
            setSnackbarOpen(true);
            return;
        }
        setIsDetailsSaving(true);
        try {
            await updateActivityNodeTypeDetails(activityNodeTypeId, detailsFormData, authState.token);
            setSnackbarMessage("Activity details updated successfully!");
            setSnackbarOpen(true);
        } catch (err) {
            setSnackbarMessage(`Error saving details: ${err.message}`);
            setSnackbarOpen(true);
        } finally {
            setIsDetailsSaving(false);
        }
    };

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
        const questionToDelete = questions[indexInUI];
        if (window.confirm(`Are you sure you want to delete Question ${indexInUI + 1}: "${questionToDelete.questionText.substring(0, 30)}..."?`)) {
            if (!questionToDelete.questionId) {
                setQuestions(prev => prev.filter((_, idx) => idx !== indexInUI)
                    .map((q, newIdx) => ({ ...q, orderIndex: newIdx })));
                setSnackbarMessage("Unsaved question removed locally.");
                setSnackbarOpen(true);
                return;
            }
            setIsOrderSaving(true);
            try {
                await deleteQuestion(activityNodeTypeId, questionToDelete.questionId, authState.token);
                setSnackbarMessage("Question deleted successfully!");
                setSnackbarOpen(true);
                fetchActivityNodeData();
            } catch (err) {
                setSnackbarMessage(`Error deleting question: ${err.message}`);
                setSnackbarOpen(true);
            } finally {
                setIsOrderSaving(false);
            }
        }
    };

    const handleSaveQuestionFromDialog = async (payload) => {
        if (!authState.token || !activityNodeTypeId) {
            setDialogError("Missing auth or activity ID.");
            return;
        }

        setIsDialogSaving(true);
        setDialogError(null);

        try {
            const formData = new FormData();
            const dto = { ...payload };

            // ✨ FIX: Filter out choices marked for deletion before sending to backend
            if (dto.choices) {
                dto.choices = dto.choices.filter(choice => !choice.isDeleted);
            }

            const generateUniqueName = (prefix, file) =>
                `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;

            if (dto.imageFile) {
                const uniqueImageName = generateUniqueName("questionImage", dto.imageFile);
                dto.questionImageUrl = uniqueImageName;
                formData.append('files', dto.imageFile, uniqueImageName);
            }

            if (dto.audioFile) {
                const uniqueAudioName = generateUniqueName("questionAudio", dto.audioFile);
                dto.questionSoundUrl = uniqueAudioName;
                formData.append('files', dto.audioFile, uniqueAudioName);
            }

            (dto.choices || []).forEach(choice => {
                if (choice.imageFile) {
                    const uniqueName = generateUniqueName("choiceImage", choice.imageFile);
                    choice.imageFileName = uniqueName;
                    formData.append('files', choice.imageFile, uniqueName);
                }
                if (choice.audioFile) {
                    const uniqueName = generateUniqueName("choiceAudio", choice.audioFile);
                    choice.audioFileName = uniqueName;
                    formData.append('files', choice.audioFile, uniqueName);
                }
            });

            formData.append('questionDto', JSON.stringify(dto));

            const isUpdating = !!payload.questionId;
            const url = isUpdating
                ? `${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions/${payload.questionId}`
                : `${API_BASE_URL}/activity-node-types/${activityNodeTypeId}/questions`;

            const response = await fetch(url, {
                method: isUpdating ? 'PUT' : 'POST',
                // ✨ FIX: Explicitly set the Authorization header for FormData requests
                headers: {
                    'Authorization': `Bearer ${authState.token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to save question.');
            }

            setSnackbarMessage("Question saved successfully!");
            setIsQuestionDialogOpen(false);
            fetchActivityNodeData();

        } catch (err) {
            console.error("Error in saveQuestion:", err);
            setDialogError(`Save failed: ${err.message}`);
        } finally {
            setIsDialogSaving(false);
        }
    };

    const handleMoveQuestion = (currentIndex, direction) => {
        const newQuestions = [...questions];
        const targetIndex = currentIndex + direction;

        if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

        [newQuestions[currentIndex], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[currentIndex]];

        const reorderedQuestions = newQuestions.map((q, idx) => {
            const orderChanged = q.orderIndex !== idx;
            if (q.questionId && orderChanged) {
                setModifiedQuestionOrderIds(prev => new Set(prev).add(q.questionId));
            }
            return { ...q, orderIndex: idx };
        });
        setQuestions(reorderedQuestions);
    };

    const handleSaveOrder = async () => {
        if (!authState.token) {
            setSnackbarMessage("Authentication missing.");
            setSnackbarOpen(true);
            return;
        }
        if (modifiedQuestionOrderIds.size === 0) {
            setSnackbarMessage("No order changes to save.");
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

    const pageTitle = detailsFormData.activityTitle
        ? `Editor: ${detailsFormData.activityTitle}`
        : 'Loading Activity Node Editor...';
    const lessonManagementPath = `/teacher/course/${courseId}/lessons`;

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
                            <Box component="form" noValidate autoComplete="off">
                                <TextField
                                    fullWidth label="Activity Title" name="activityTitle"
                                    value={detailsFormData.activityTitle} onChange={handleDetailsChange}
                                    variant="outlined" sx={{ mb: 2 }} disabled={isDetailsSaving}
                                />
                                <TextField
                                    fullWidth label="Instructions" name="instructions"
                                    value={detailsFormData.instructions} onChange={handleDetailsChange}
                                    multiline rows={3} variant="outlined" sx={{ mb: 2 }} disabled={isDetailsSaving}
                                />
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        label="Game Flag A" name="flagA" value={detailsFormData.flagA}
                                        onChange={handleDetailsChange} variant="outlined" helperText="Custom game parameter"
                                        sx={{ flex: 1 }} disabled={isDetailsSaving}
                                    />
                                    <TextField
                                        label="Game Flag B" name="flagB" value={detailsFormData.flagB}
                                        onChange={handleDetailsChange} variant="outlined" helperText="Custom game parameter"
                                        sx={{ flex: 1 }} disabled={isDetailsSaving}
                                    />
                                    <TextField
                                        label="Game Flag C" name="flagC" value={detailsFormData.flagC}
                                        onChange={handleDetailsChange} variant="outlined" helperText="Custom game parameter"
                                        sx={{ flex: 1 }} disabled={isDetailsSaving}
                                    />
                                </Box>
                                <Button
                                    variant="contained" startIcon={<SaveIcon />} onClick={handleSaveDetails}
                                    disabled={isDetailsSaving} sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
                                >
                                    {isDetailsSaving ? <CircularProgress size={24} color="inherit" /> : "Save Details"}
                                </Button>
                            </Box>
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