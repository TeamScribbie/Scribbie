// src/page/student/LessonPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/navbar';
import StudentSidebar from '../../components/layout/StudentSidebar'; // Import StudentSidebar
import {
    Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText,
    ListItemIcon, Collapse, IconButton, Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import {
    getLessonDefinitions,
    getActivityNodeTypesForLesson,
    getStudentLessonProgress,
    startLessonProgress
} from '../../services/lessonService';
import { getClassroomDetails } from '../../services/classroomService';

// Icons
import ClassIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'; // Not used in this version
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ActivityIcon from '@mui/icons-material/Extension';
import ChallengeIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';
// LockIcon is no longer needed for challenge button logic
// import LockIcon from '@mui/icons-material/Lock'; 


import '../../styles/TeacherHomepage.css';
import '../../styles/LessonPage.css'; 

const LessonPage = () => {
    const { classroomId } = useParams();
    const { authState } = useAuth();
    const navigate = useNavigate();

    const [lessonsData, setLessonsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageTitle, setPageTitle] = useState(`Loading Lessons...`);
    const [expandedLessonId, setExpandedLessonId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const fetchClassroomAndLessonData = useCallback(async () => {
        if (!classroomId || !authState.isAuthenticated || !authState.token || !authState.user?.identifier) {
            setError("Authentication missing or classroom ID not specified.");
            setIsLoading(false);
            setLessonsData([]);
            setPageTitle(`Error Loading Lessons`);
            return;
        }
        setIsLoading(true);
        setError(null);
        setLessonsData([]);
        // Removed setPageTitle here to avoid "Loading..." when classroomName is known
        let courseId = null;
        let classroomName = `Classroom ${classroomId}`;

        try {
            const classroomDetails = await getClassroomDetails(classroomId, authState.token);
            classroomName = classroomDetails?.classroomName || classroomName;
            setPageTitle(`${classroomName} - Lessons`); // Set title once classroomName is fetched

            if (classroomDetails && classroomDetails.assignedCourseId) {
                courseId = classroomDetails.assignedCourseId;
            } else {
                throw new Error("Could not determine the assigned course for this classroom.");
            }

            const fetchedDefinitions = await getLessonDefinitions(courseId, authState.token);
            if (!Array.isArray(fetchedDefinitions) || fetchedDefinitions.length === 0) {
                setLessonsData([]);
                setIsLoading(false);
                return;
            }

            const lessonsWithDetailsPromises = fetchedDefinitions.map(async (def, lessonIndex) => {
                let activityNodes = [];
                let lessonProgress = null;
                try {
                    const nodeTypes = await getActivityNodeTypesForLesson(def.lessonDefinitionId, authState.token);
                    lessonProgress = await getStudentLessonProgress(authState.user.identifier, def.lessonDefinitionId, authState.token);

                    activityNodes = nodeTypes.map(nodeType => {
                        const activityProgress = lessonProgress?.activityNodeProgressList?.find(
                            p => p.activityNodeTypeId === nodeType.activityNodeTypeId // Corrected based on DTO
                        );
                        const isFinished = activityProgress?.finished || false;
                        let UIGameType = 'default_activity';
                        switch (nodeType.activityType) {
                            case 'QUIZ_MCQ': UIGameType = 'quiz'; break;
                            case 'MATCHING': UIGameType = 'matching'; break;
                            case 'WRITING_PROMPT': UIGameType = 'writing'; break;
                            default: UIGameType = 'activity'; break;
                        }
                        return {
                            activityId: nodeType.activityNodeTypeId,
                            activityTitle: nodeType.activityTitle || `Activity ${nodeType.orderIndex + 1}`,
                            gameType: UIGameType,
                            isFinished: isFinished,
                            orderIndex: nodeType.orderIndex,
                            instructions: nodeType.instructions || '',
                        };
                    }).sort((a, b) => a.orderIndex - b.orderIndex);
                } catch (innerErr) {
                    console.error(`Failed to fetch node/progress details for lesson ${def.lessonDefinitionId}:`, innerErr);
                    activityNodes = []; // Gracefully handle error for a single lesson's activities
                }
                return {
                    lessonDefinitionId: def.lessonDefinitionId,
                    lessonTitle: def.lessonTitle,
                    lessonDescription: def.lessonDescription,
                    activityNodes: activityNodes,
                    progressStatus: lessonProgress?.status || 'NOT_STARTED',
                    lessonProgressId: lessonProgress?.lessonProgressId || null,
                    challengeDefinitionId: def.challengeDefinitionId || null,
                    rawOrder: lessonIndex,
                };
            });
            
            const lessonsWithDetails = await Promise.all(lessonsWithDetailsPromises);
            setLessonsData(lessonsWithDetails.sort((a, b) => a.rawOrder - b.rawOrder));

        } catch (err) {
            console.error("Error fetching classroom or lesson data:", err);
            setError(err.message || "Could not load lesson data.");
            setLessonsData([]);
            setPageTitle(`Error loading lessons for ${classroomName}`); // Show error in title if main fetch fails
        } finally {
            setIsLoading(false);
        }
    }, [classroomId, authState.isAuthenticated, authState.token, authState.user?.identifier]);

    useEffect(() => {
        fetchClassroomAndLessonData();
    }, [fetchClassroomAndLessonData]);

    const handleToggleExpand = (lessonId) => {
        setExpandedLessonId(prevId => (prevId === lessonId ? null : lessonId));
    };

    const handleActivityNodeClick = async (activityNode, lesson, isReplay = false) => {
        // activityNode is expected to have: activityId (which is activityNodeTypeId), activityTitle, instructions, isFinished
        // lesson is expected to have: lessonDefinitionId, lessonProgressId (can be null initially)

        console.log(`[LessonPage] Activity Clicked: "${activityNode.activityTitle || 'Untitled Activity'}", Node ID (activityNodeTypeId): ${activityNode.activityId}, LessonDef ID: ${lesson.lessonDefinitionId}, isReplay: ${isReplay}`);
        
        if (!isReplay && activityNode.isFinished) {
            console.log(`Activity "${activityNode.activityTitle}" is already finished. Use the replay button to play again.`);
            setSnackbarMessage(`Activity "${activityNode.activityTitle}" is complete. Click replay to try again.`); // Using snackbar state if available
            setSnackbarOpen(true); // Assuming you have these states for snackbar
            return; 
        }

        if (!authState.token || !authState.user?.identifier) {
            setError("Authentication details missing. Please log in again.");
            console.error("[LessonPage] Auth token or user identifier missing.");
            return;
        }

        try {
            let currentLessonProgressId = lesson.lessonProgressId;

            if (!currentLessonProgressId) {
                console.log(`[LessonPage] No lessonProgressId for lesson ${lesson.lessonDefinitionId}. Calling startLessonProgress.`);
                const progressData = await startLessonProgress(lesson.lessonDefinitionId, authState.token);
                if (!progressData?.lessonProgressId) {
                    throw new Error("Failed to obtain a valid Lesson Progress ID from startLessonProgress.");
                }
                currentLessonProgressId = progressData.lessonProgressId;
                
                // Update local state to reflect new progressId and status for this lesson
                setLessonsData(prevData => prevData.map(l =>
                    l.lessonDefinitionId === lesson.lessonDefinitionId
                        ? { ...l, lessonProgressId: currentLessonProgressId, progressStatus: progressData.status || 'IN_PROGRESS' }
                        : l
                ));
                 console.log(`[LessonPage] Started/updated lesson progress. New ID: ${currentLessonProgressId}`);
            } else {
                 console.log(`[LessonPage] Using existing lessonProgressId: ${currentLessonProgressId} for lesson ${lesson.lessonDefinitionId}.`);
            }
            
            console.log(`[LessonPage] Navigating to Activity Player Page. Route: /student/lesson/${lesson.lessonDefinitionId}/activity-node/${activityNode.activityId}/play`);
            
            navigate(
                // Ensure params match the route definition in App.jsx
                `/student/lesson/${lesson.lessonDefinitionId}/activity-node/${activityNode.activityId}/play`,
                { 
                    state: { 
                        lessonProgressId: currentLessonProgressId, 
                        activityInstructions: activityNode.instructions, 
                        activityTitle: activityNode.activityTitle,
                        classroomId: classroomId, // Make sure classroomId is available in LessonPage's scope
                        // isReplay // You can pass this if the player page needs to distinguish
                    } 
                }
            );
        } catch (err) {
            setError(`Could not start or navigate to the activity: ${err.message}`);
            console.error("[LessonPage] Error in handleActivityNodeClick: ", err);
             setSnackbarMessage(`Error starting activity: ${err.message}`); // Using snackbar state
             setSnackbarOpen(true); // Assuming you have these states for snackbar
        }
    };

    
    const handleChallengeClick = (lesson, isReplay = false) => {
        console.log(`Clicked Challenge for Lesson ID: ${lesson.lessonDefinitionId} (Replay: ${isReplay})`);
        if (!lesson.challengeDefinitionId) {
            setError("This lesson does not have a challenge configured.");
            return;
        }
        navigate(`/student/lesson/${lesson.lessonDefinitionId}/challenge`, {
            state: { 
                classroomId: classroomId, 
                lessonTitle: lesson.lessonTitle,
                isReplay 
            }
        });
    };

    if (isLoading) { 
        return ( <Box className="teacher-homepage-container"><Navbar /><Box className="teacher-main-content" sx={{ textAlign: 'center', pt: 5 }}><CircularProgress /><Typography>Loading lessons...</Typography></Box></Box>);
    }
    if (error) {  
        return ( <Box className="teacher-homepage-container"><Navbar /><Box className="teacher-main-content" sx={{ textAlign: 'center', pt: 5 }}><Alert severity="error">{error}</Alert></Box></Box>);
    }

    return (
        <Box className="teacher-homepage-container">
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <StudentSidebar isOpen={sidebarOpen} />
            </Box>
            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box component="main" className="teacher-main-content" sx={{p: { xs: 1, sm: 2, md: 3 } }}>
                    <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#451513', fontWeight: 'bold', mb: 3 }}>
                        {pageTitle}
                    </Typography>

                    {lessonsData.length === 0 && !isLoading && (
                        <Paper elevation={1} sx={{p:3, textAlign:'center', bgcolor: '#fff9e6'}}>
                            <Typography color="text.secondary">No lessons found for this classroom's assigned course yet.</Typography>
                        </Paper>
                    )}

                    <List sx={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
                        {lessonsData.map((lesson, lessonIdx) => {
                            const isCurrentLessonCompleted = lesson.progressStatus === 'COMPLETED';
                            const isChallengeEffectivelyCompleted = isCurrentLessonCompleted && lesson.challengeDefinitionId;
                            
                            // For testing: Challenge is always playable if it exists.
                            const isChallengePlayableForTesting = !!lesson.challengeDefinitionId;


                            return (
                                <Paper key={lesson.lessonDefinitionId} elevation={2} sx={{ mb: 2, borderRadius: '8px', overflow: 'hidden' }}>
                                    <ListItem
                                        button 
                                        onClick={() => handleToggleExpand(lesson.lessonDefinitionId)}
                                        aria-expanded={expandedLessonId === lesson.lessonDefinitionId}
                                        sx={{ 
                                            bgcolor: isCurrentLessonCompleted ? 'rgba(144, 238, 144, 0.3)' :'#FFFBE0',
                                            py: 1.5, borderBottom: '1px solid #ddd',
                                        }}
                                    >
                                        <ListItemIcon>
                                            {isCurrentLessonCompleted ? <CheckCircleIcon color="success" /> : <ClassIcon color="primary"/>}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${lessonIdx + 1}. ${lesson.lessonTitle}`}
                                            secondary={lesson.lessonDescription || "Expand to see activities"}
                                            primaryTypographyProps={{ fontWeight: 'medium', color: '#451513' }}
                                        />
                                        {expandedLessonId === lesson.lessonDefinitionId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItem>

                                    <Collapse in={expandedLessonId === lesson.lessonDefinitionId} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding sx={{ bgcolor: '#fffcf2', p:1 }}>
                                            {lesson.activityNodes.map((node) => (
                                                <ListItem
                                                    button
                                                    key={node.activityId}
                                                    onClick={() => handleActivityNodeClick(node, lesson, node.isFinished)}
                                                    sx={{ 
                                                        pl: 4, 
                                                        bgcolor: node.isFinished ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                                        my: 0.5, borderRadius: '4px',
                                                        '&:hover': { bgcolor: 'action.hover' }
                                                    }}
                                                >
                                                    <ListItemIcon>
                                                        {node.isFinished ? <CheckCircleIcon fontSize="small" color="success" /> : <ActivityIcon fontSize="small" color="action"/>}
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={node.activityTitle} 
                                                        secondary={node.isFinished ? "Completed - Click to Replay" : "Ready to Start"} 
                                                    />
                                                    {node.isFinished && (
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={(e) => { e.stopPropagation(); handleActivityNodeClick(node, lesson, true); }}
                                                            title="Replay Activity"
                                                        >
                                                            <ReplayIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </ListItem>
                                            ))}
                                            
                                            {lesson.challengeDefinitionId && (
                                                <ListItem
                                                    button
                                                    onClick={() => {
                                                        // Removed the lock check for testing
                                                        handleChallengeClick(lesson, isChallengeEffectivelyCompleted);
                                                    }}
                                                    sx={{ 
                                                        pl: 4, mt: 1, borderTop: '1px dashed #ddd', 
                                                        // Simplified background for testing: always indicates playable or completed
                                                        bgcolor: isChallengeEffectivelyCompleted ? 'rgba(76,175,80,0.15)' : '#fff0b2', 
                                                        my: 0.5, borderRadius: '4px',
                                                        cursor: 'pointer', // Always clickable for testing
                                                        opacity: 1, // Always full opacity for testing
                                                        '&:hover': { bgcolor: isChallengeEffectivelyCompleted ? 'rgba(76,175,80,0.25)' : '#ffe999'}
                                                    }}
                                                >
                                                    <ListItemIcon>
                                                        {isChallengeEffectivelyCompleted ? <CheckCircleIcon fontSize="small" color="success"/> :
                                                          <ChallengeIcon fontSize="small" sx={{color: '#FFA000'}}/>
                                                        }
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={`${lesson.lessonTitle} - Challenge!`}
                                                        // Simplified secondary text for testing
                                                        secondary={isChallengeEffectivelyCompleted ? "Challenge Completed! Click to Replay" : "Ready to Play (Testing Mode)"}
                                                        primaryTypographyProps={{color: '#A15C00', fontWeight: 'medium'}}
                                                    />
                                                    {isChallengeEffectivelyCompleted && (
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={(e) => { e.stopPropagation(); handleChallengeClick(lesson, true); }}
                                                            title="Replay Challenge"
                                                        >
                                                            <ReplayIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </ListItem>
                                            )}
                                        </List>
                                    </Collapse>
                                </Paper>
                            );
                        })}
                    </List>
                </Box>
            </Box>
        </Box>
    );
};

export default LessonPage;