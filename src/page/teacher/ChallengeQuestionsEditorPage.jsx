// src/page/teacher/ChallengeQuestionsEditorPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import {
    Typography, Box, CircularProgress, Alert, Paper, Button,
    List, ListItem, ListItemText, IconButton, Divider, Snackbar, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import SaveIcon from '@mui/icons-material/Save'; // If order saving is needed

// Import services for challenge questions (to be created/used from challengeService.js)
import {
    getChallengeConfigurationForLesson, // To get challenge details (title, type etc.)
    getCustomQuestionsForChallengeDefinition,
    addCustomQuestionToChallenge,
    updateCustomChallengeQuestion,
    deleteCustomChallengeQuestion,
    // Choice services will be needed by the dialog
} from '../../services/challengeService';

import AddEditQuestionDialog from '../../components/dialogs/AddEditQuestionDialog'; // Reusable

import '../../styles/TeacherHomepage.css'; // Reusing for consistent styling

const ChallengeQuestionsEditorPage = () => {
    const { courseId, lessonDefinitionId, challengeDefinitionId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [challengeDetails, setChallengeDetails] = useState(null); // Store details of the parent ChallengeDefinition
    const [customQuestions, setCustomQuestions] = useState([]);
    // const [modifiedQuestionOrderIds, setModifiedQuestionOrderIds] = useState(new Set()); // If order saving needed

    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [pageError, setPageError] = useState(null);

    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isDialogSaving, setIsDialogSaving] = useState(false);
    const [dialogError, setDialogError] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        if (authState.isAuthenticated && authState.token) {
            setAuthLoading(false);
        } else if (authState.token === null && !authState.isAuthenticated) {
            const timeout = setTimeout(() => setAuthLoading(false), 500);
            return () => clearTimeout(timeout);
        }
    }, [authState.isAuthenticated, authState.token]);


    const fetchChallengeDetailsAndQuestions = useCallback(async () => {
        if (!challengeDefinitionId || !lessonDefinitionId || !authState.token) {
            setPageError("Required IDs or authentication token is missing.");
            setIsLoadingPage(false);
            return;
        }
        setIsLoadingPage(true);
        setPageError(null);
        try {
            // Fetch parent challenge definition details (e.g., type, for context)
            // getChallengeConfigurationForLesson expects lessonDefinitionId
            const configDetails = await getChallengeConfigurationForLesson(lessonDefinitionId, authState.token);
            setChallengeDetails(configDetails); // This will contain the full ChallengeDefinitionResponseDto

            // Fetch custom questions for this challenge definition
            const fetchedQuestions = await getCustomQuestionsForChallengeDefinition(challengeDefinitionId, authState.token);
            const formattedQuestions = (Array.isArray(fetchedQuestions) ? fetchedQuestions : []).map((q, index) => ({
                ...q, // questionId, questionText, instructional, questionImageUrl, questionSoundUrl, orderIndex
                choices: Array.isArray(q.choices) ? q.choices.map(c => ({ ...c, tempChoiceId: c.choiceId || `c-${Date.now()}-${Math.random()}`, isNew: false, isModified: false, isDeleted: false })) : [],
                isNew: false, isModified: false, isDeleted: false,
                // Backend ChallengeQuestion entity should have orderIndex
                orderIndex: q.orderIndex !== undefined ? q.orderIndex : index,
            })).sort((a, b) => a.orderIndex - b.orderIndex);
            setCustomQuestions(formattedQuestions);

        } catch (err) {
            setPageError(err.message || "Could not load challenge questions data.");
            setCustomQuestions([]);
            setChallengeDetails(null);
        } finally {
            setIsLoadingPage(false);
        }
    }, [challengeDefinitionId, lessonDefinitionId, authState.token]);

    useEffect(() => {
        if (!authLoading && authState.isAuthenticated && authState.token) {
            fetchChallengeDetailsAndQuestions();
        } else if (!authLoading && !authState.isAuthenticated) {
            setPageError("User not authenticated. Please log in.");
            setIsLoadingPage(false);
        }
    }, [authLoading, authState.isAuthenticated, authState.token, fetchChallengeDetailsAndQuestions]);


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

    const handleDeleteQuestion = async (questionIdToDelete, indexInUI) => {
        const question = customQuestions[indexInUI];
        if (window.confirm(`Are you sure you want to delete this custom challenge question: "${question.questionText.substring(0,30)}..."?`)) {
            setIsDialogSaving(true); // Use a general saving indicator
            try {
                await deleteCustomChallengeQuestion(challengeDefinitionId, questionIdToDelete, authState.token);
                setSnackbarMessage("Custom challenge question deleted successfully!");
                setSnackbarOpen(true);
                fetchChallengeDetailsAndQuestions(); // Refresh list
            } catch (err) {
                setSnackbarMessage(`Error deleting question: ${err.message}`);
                setSnackbarOpen(true);
            } finally {
                setIsDialogSaving(false);
            }
        }
    };
    
    const handleSaveQuestionFromDialog = async (payloadFromDialog) => {
        if (!authState.token) {
            setDialogError("Authentication missing."); return;
        }
        setIsDialogSaving(true); setDialogError(null);

        try {
            const { choices, isNew, questionId, ...questionDataForApi } = payloadFromDialog;
            // Ensure orderIndex is included, even if not directly edited in dialog, might get from existing or next available
            if (isNew || !questionId) { // Adding new question
                 questionDataForApi.orderIndex = editingQuestion?.orderIndex ?? customQuestions.length;
            } else { // Updating existing
                 questionDataForApi.orderIndex = editingQuestion?.orderIndex;
            }


            let savedOrUpdatedQuestion;
            if (isNew || !questionId) {
                // For addCustomQuestionToChallenge, backend expects questionData (text, instructional, urls, orderIndex) and choices
                // The backend DTO CreateQuestionRequestDto includes choices directly
                const apiPayload = {
                    ...questionDataForApi,
                    choices: choices.map(c => ({ choiceText: c.choiceText, isCorrect: !!c.isCorrect })) // Simplified choice for creation
                };
                savedOrUpdatedQuestion = await addCustomQuestionToChallenge(challengeDefinitionId, apiPayload, authState.token);
                setSnackbarMessage("Custom question added successfully!");
            } else {
                 // For updateCustomChallengeQuestion, backend also expects CreateQuestionRequestDto structure
                const apiPayload = {
                    ...questionDataForApi,
                    choices: choices.map(c => ({ choiceId: c.isNew ? null : c.choiceId, choiceText: c.choiceText, isCorrect: !!c.isCorrect, isDeleted: !!c.isDeleted }))
                };
                savedOrUpdatedQuestion = await updateCustomChallengeQuestion(challengeDefinitionId, questionId, apiPayload, authState.token);
                setSnackbarMessage("Custom question updated successfully!");
            }
            
            // The backend should handle choice creation/update/deletion based on the payload in CreateQuestionRequestDto (for PUT)
            // or by separate calls if the addCustomQuestionToChallenge doesn't deeply save choices (it should per backend code)

            setIsQuestionDialogOpen(false);
            fetchChallengeDetailsAndQuestions(); // Refresh the list
        } catch (err) {
            console.error("Error saving custom challenge question from dialog:", err);
            setDialogError(`Save failed: ${err.message || "An unexpected error occurred."}`);
        } finally {
            setIsDialogSaving(false);
        }
    };
    
    // Placeholder for order saving logic if implemented
    // const handleSaveOrder = async () => { ... };


    const pageTitle = challengeDetails
        ? `Custom Questions for: ${challengeDetails.lessonTitle || 'Challenge'}` // Assuming ChallengeDefinitionResponseDto has lessonTitle via LessonDefinition
        : 'Loading Custom Challenge Questions...';
    const backToLessonManagementPath = `/teacher/course/${courseId}/lessons`;


    if (isLoadingPage || authLoading) { /* ... Loading UI ... */ }
    if (pageError) { /* ... Error UI ... */ }
    if (!authLoading && !authState.isAuthenticated) { /* ... Not Authenticated UI ... */ }


    return (
        <Box className="teacher-homepage-container">
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageCourses" />
            </Box>
            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="teacher-main-content">
                    <Button component={RouterLink} to={backToLessonManagementPath} state={{ courseId: courseId, lessonDefinitionId: lessonDefinitionId }}
                        startIcon={<ArrowBackIcon />} sx={{ mb: 2 }} variant="outlined">
                        Back to Lesson Management
                    </Button>

                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, bgcolor: '#fffcf2' }} elevation={2}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#451513' }}>{pageTitle}</Typography>
                        {challengeDetails && (
                            <Typography variant="body1" color="text.secondary">
                                Editing custom questions for the challenge associated with lesson: {challengeDetails.lessonDefinitionId}. <br/>
                                Challenge Type: <Chip label={challengeDetails.challengeType?.replace('_',' ') || "N/A"} size="small"/>
                            </Typography>
                        )}
                    </Paper>

                    {isLoadingPage && <Box sx={{ textAlign: 'center', my: 3 }}><CircularProgress /> <Typography>Loading questions...</Typography></Box>}
                    {pageError && <Alert severity="error" sx={{ my: 2 }}>{pageError}</Alert>}

                    {!isLoadingPage && !pageError && challengeDetails && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#451513' }}>Custom Questions</Typography>
                                <Box>
                                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddQuestionDialog}
                                        sx={{ mr: 2 }} disabled={isDialogSaving /*|| isOrderSaving*/}>
                                        Add Custom Question
                                    </Button>
                                    {/* Add Save Order button if implementing order changes here */}
                                </Box>
                            </Box>

                            {customQuestions.length === 0 ? (
                                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff9e6', mt: 2 }} elevation={1}>
                                    <Typography color="text.secondary">No custom questions defined for this challenge yet.</Typography>
                                </Paper>
                            ) : (
                                <List>
                                    {customQuestions.map((question, index) => (
                                        <Paper key={question.questionId || `q-${index}`} elevation={2} sx={{ mb: 1.5, overflow: 'hidden' }}>
                                            <ListItem sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1.5 }}>
                                                {/* Order Icons if needed */}
                                                <ListItemText
                                                    primary={`${index + 1}. ${question.questionText || 'Untitled Question'}`}
                                                    secondary={`Instructional: ${question.instructional ? 'Yes' : 'No'} | Choices: ${question.choices?.filter(c=>!c.isDeleted).length || 0}`}
                                                />
                                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', pl: 1}}>
                                                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditQuestionDialog(question)} sx={{mr:0.5}} disabled={isDialogSaving /*|| isOrderSaving*/}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(question.questionId, index)} disabled={isDialogSaving /*|| isOrderSaving*/}>
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
                    // Pass challengeDefinitionId instead of activityNodeTypeId
                    // The dialog might need to be made more generic or duplicated/adapted
                    // For now, we assume AddEditQuestionDialog can handle it if onSave is adapted.
                    // We need a contextId (challengeDefinitionId here) for the save operation.
                    // Let's pass it as a distinct prop or make onSave smarter.
                    // For simplicity now, onSave will use `challengeDefinitionId` from `useParams`.
                    activityNodeTypeId={null} // Or pass challengeDefinitionId if dialog is adapted
                    isLoading={isDialogSaving}
                    error={dialogError}
                    orderIndexForNewQuestion={editingQuestion ? editingQuestion.orderIndex : customQuestions.length}
                />
            )}
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} />
        </Box>
    );
};

export default ChallengeQuestionsEditorPage;