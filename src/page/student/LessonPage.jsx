// src/page/student/LessonPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/navbar';
// REMOVE: import LessonBox from '../../components/cards/LessonBox'; // Will be replaced
// REMOVE: import ActivityNode from '../../components/ActivityNode'; // Will be replaced
import { CircularProgress, Alert, Typography, Box, Paper, List, ListItem, ListItemText, ListItemIcon, Collapse, IconButton } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import {
    getLessonDefinitions,
    getActivityNodeTypesForLesson,
    getStudentLessonProgress,
    startLessonProgress
} from '../../services/lessonService';
import { getClassroomDetails } from '../../services/classroomService';

// Icons for list items
import ClassIcon from '@mui/icons-material/School'; // For lesson title
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ActivityIcon from '@mui/icons-material/Extension'; // Generic for activity
import ChallengeIcon from '@mui/icons-material/EmojiEvents'; // For challenge

import '../../styles/LessonPage.css'; // Keep for general page styling

// New/Modified Child Components (to be created/updated separately)
// For now, we'll put placeholder logic directly in LessonPage and extract later if needed.

const LessonPage = () => {
  const { classroomId } = useParams();
  const { authState } = useAuth();
  const navigate = useNavigate();

  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState(`Loading Lessons...`);
  const [expandedLessonId, setExpandedLessonId] = useState(null); // For accordion behavior

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
    let courseId = null;
    let classroomName = `Classroom ${classroomId}`;

    try {
      console.log(`Workspaceing details for classroom ${classroomId} to find course ID...`);
      const classroomDetails = await getClassroomDetails(classroomId, authState.token);
      classroomName = classroomDetails?.classroomName || classroomName;
      setPageTitle(`Lessons for ${classroomName}`);

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
      
      console.log("Fetched Lesson Definitions:", JSON.stringify(fetchedDefinitions, null, 2));


      const lessonsWithDetails = await Promise.all(
        fetchedDefinitions.map(async (def, lessonIndex) => {
          let activityNodes = [];
          let lessonProgress = null;
          try {
             const nodeTypes = await getActivityNodeTypesForLesson(def.lessonDefinitionId, authState.token);
             console.log(`NodeTypes for lesson ${def.lessonDefinitionId}:`, JSON.stringify(nodeTypes, null, 2));

             // Attempt to get student's progress for this specific lesson
             lessonProgress = await getStudentLessonProgress(authState.user.identifier, def.lessonDefinitionId, authState.token);
             console.log(`LessonProgress for lesson ${def.lessonDefinitionId}:`, JSON.stringify(lessonProgress, null, 2));

             activityNodes = nodeTypes.map(nodeType => {
                const activityProgress = lessonProgress?.activityNodeProgressList?.find(
                    p => p.activityNodeTypeId === nodeType.activityNodeTypeId // Updated to match DTO
                );
                const isFinished = activityProgress?.finished || false;
                // const totalScore = activityProgress?.totalScore || 0; // Not directly used in this view change yet

                // Map backend ActivityType to a simpler gameType or icon identifier if needed
                let UIGameType = 'default_activity'; // Fallback
                switch (nodeType.activityType) {
                    case 'QUIZ_MCQ': UIGameType = 'quiz'; break;
                    case 'MATCHING': UIGameType = 'matching'; break;
                    case 'WRITING_PROMPT': UIGameType = 'writing'; break;
                    // Add more cases as your ActivityType enum grows
                }
                return {
                    activityId: nodeType.activityNodeTypeId,
                    activityTitle: nodeType.activityTitle || `Activity ${nodeType.orderIndex + 1}`, // Use title
                    gameType: UIGameType, // Store a UI-friendly type or icon key
                    isFinished: isFinished,
                    orderIndex: nodeType.orderIndex,
                    instructions: nodeType.instructions || '',
                };
             }).sort((a, b) => a.orderIndex - b.orderIndex); // Ensure sorted by orderIndex
          } catch (innerErr) {
             console.error(`Failed to fetch details for lesson ${def.lessonDefinitionId}:`, innerErr);
             activityNodes = []; // Default to empty if there's an error for this lesson's activities/progress
          }
          return {
            lessonDefinitionId: def.lessonDefinitionId, // Ensure this is correct
            lessonTitle: def.lessonTitle,
            lessonDescription: def.lessonDescription,
            activityNodes: activityNodes,
            progressStatus: lessonProgress?.status || 'NOT_STARTED',
            lessonProgressId: lessonProgress?.lessonProgressId || null,
            challengeDefinitionId: def.challengeDefinitionId || null, // From updated DTO
            // For locking logic:
            isLessonLocked: false, // Will be determined later based on previous lesson
            rawOrder: lessonIndex, // Keep original fetched order for sequential locking
          };
        })
      );
      
      // Determine lesson locking state
      let previousLessonCompleted = true; // First lesson is implicitly unlocked by this
      const finalLessonsData = lessonsWithDetails
        .sort((a,b) => a.rawOrder - b.rawOrder) // Ensure they are in sequence
        .map(lesson => {
            const isLocked = !previousLessonCompleted;
            if (lesson.progressStatus === 'COMPLETED') {
                previousLessonCompleted = true;
            } else {
                previousLessonCompleted = false;
            }
            return { ...lesson, isLessonLocked: isLocked };
      });

      setLessonsData(finalLessonsData);
    } catch (err) {
      console.error("Error fetching classroom or lesson data:", err);
      setError(err.message || "Could not load lesson data.");
      setLessonsData([]);
      setPageTitle(`Error loading lessons for ${classroomName}`);
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

  const handleActivityNodeClick = async (activityNode, lesson) => {
    if (activityNode.isFinished) {
        console.log(`Activity ${activityNode.activityTitle} is already finished.`);
        // Optionally navigate to a review page or do nothing
        return;
    }
    if (!authState.token) { setError("Authentication token missing."); return; }
    try {
        let currentLessonProgressId = lesson.lessonProgressId;
        // Start lesson progress if not already started (or if no progressId)
        if (!currentLessonProgressId || lesson.progressStatus === 'NOT_STARTED') {
             console.log(`Starting progress for lesson: ${lesson.lessonTitle}`);
             const progressData = await startLessonProgress(lesson.lessonDefinitionId, authState.token);
             currentLessonProgressId = progressData?.lessonProgressId;
             
             // Update local state for this lesson immediately
             setLessonsData(prevData => prevData.map(l =>
                 l.lessonDefinitionId === lesson.lessonDefinitionId
                     ? { ...l, lessonProgressId: currentLessonProgressId, progressStatus: 'IN_PROGRESS' }
                     : l
             ));
             if (!currentLessonProgressId) throw new Error("Failed to obtain Lesson Progress ID.");
        }
        
        navigate(
            `/student/lesson/${lesson.lessonDefinitionId}/activity/${activityNode.activityId}`,
            { state: { lessonProgressId: currentLessonProgressId, activityInstructions: activityNode.instructions, classroomId: classroomId, activityTitle: activityNode.activityTitle } }
        );
    } catch (err) {
        setError(`Could not start or navigate to the activity: ${err.message}`);
        console.error("Error in handleActivityNodeClick: ", err);
    }
 };

  const handleChallengeClick = (lesson) => {
    console.log(`Clicked Challenge for Lesson ID (LessonDefinitionId): ${lesson.lessonDefinitionId}`);
    if (!lesson.challengeDefinitionId) {
        setError("This lesson does not have a challenge configured.");
        return;
    }
    navigate(`/student/lesson/${lesson.lessonDefinitionId}/challenge`, {
        state: { classroomId: classroomId, lessonTitle: lesson.lessonTitle }
    });
  };


  if (isLoading) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
            <Navbar />
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: '60px' }}>
                <CircularProgress /><Typography sx={{ml: 2}}>Loading lessons...</Typography>
            </Box>
        </Box>
    );
  }

  if (error) {
      return (
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
              <Navbar />
              <Box sx={{ flexGrow: 1, p:3, mt: '60px', textAlign:'center' }}>
                  <Alert severity="error">{error}</Alert>
                  <Button onClick={() => navigate('/student-homepage')} sx={{mt: 2}}>Back to Homepage</Button>
              </Box>
          </Box>
      );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FFFBE0' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: '60px' }}>
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
            const isCurrentLessonLocked = lesson.isLessonLocked;
            const isCurrentLessonCompleted = lesson.progressStatus === 'COMPLETED';
            let allPreviousNodesCompleted = true; // For unlocking challenge within this lesson

            return (
              <Paper key={lesson.lessonDefinitionId} elevation={2} sx={{ mb: 2, borderRadius: '8px', overflow: 'hidden' }}>
                <ListItem
                  button={!isCurrentLessonLocked} // Button only if not locked
                  onClick={!isCurrentLessonLocked ? () => handleToggleExpand(lesson.lessonDefinitionId) : undefined}
                  aria-expanded={expandedLessonId === lesson.lessonDefinitionId}
                  sx={{ 
                    bgcolor: isCurrentLessonLocked ? '#e0e0e0' : (isCurrentLessonCompleted ? '#c8e6c9' :'#FFFBE0'), // Grey if locked, Green if complete
                    py: 1.5, 
                    borderBottom: '1px solid #ddd',
                    cursor: isCurrentLessonLocked ? 'not-allowed' : 'pointer',
                    opacity: isCurrentLessonLocked ? 0.7 : 1,
                  }}
                >
                  <ListItemIcon>
                    {isCurrentLessonLocked ? <LockIcon /> : (isCurrentLessonCompleted ? <CheckCircleIcon color="success" /> : <ClassIcon color="primary"/>)}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${lessonIdx + 1}. ${lesson.lessonTitle}`}
                    secondary={isCurrentLessonLocked ? "Complete previous lesson to unlock" : (lesson.lessonDescription || "Expand to see activities")}
                    primaryTypographyProps={{ fontWeight: 'medium', color: isCurrentLessonLocked ? 'text.disabled' : '#451513' }}
                  />
                  {!isCurrentLessonLocked && (expandedLessonId === lesson.lessonDefinitionId ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItem>

                <Collapse in={expandedLessonId === lesson.lessonDefinitionId && !isCurrentLessonLocked} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ bgcolor: '#fffcf2', p:1 }}>
                    {lesson.activityNodes.map((node, nodeIdx) => {
                      const isNodeLocked = (nodeIdx > 0 && !lesson.activityNodes[nodeIdx - 1].isFinished) || !allPreviousNodesCompleted;
                      if (!node.isFinished && isNodeLocked) {
                          allPreviousNodesCompleted = false; // If a node is locked and not finished, subsequent can't be unlocked by this rule
                      }
                       if(node.isFinished && isNodeLocked && nodeIdx > 0 && !lesson.activityNodes[nodeIdx - 1].isFinished){
                        // This case means this node IS finished, but the previous one ISN'T.
                        // This implies a potential state where a later node was completed before an earlier one,
                        // or data inconsistency. For locking, we rely on previous one being finished.
                        // So if previous is not finished, this one is still "locked" from progression standpoint.
                      }


                      return (
                        <ListItem
                          button={!isNodeLocked && !node.isFinished}
                          key={node.activityId}
                          onClick={!isNodeLocked && !node.isFinished ? () => handleActivityNodeClick(node, lesson) : undefined}
                          sx={{ 
                            pl: 4, 
                            cursor: isNodeLocked || node.isFinished ? 'default' : 'pointer',
                            opacity: isNodeLocked ? 0.6 : 1,
                            bgcolor: node.isFinished ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                            my: 0.5, borderRadius: '4px'
                          }}
                          disabled={isNodeLocked || node.isFinished}
                        >
                          <ListItemIcon>
                            {isNodeLocked ? <LockIcon fontSize="small" /> : (node.isFinished ? <CheckCircleIcon fontSize="small" color="success" /> : <ActivityIcon fontSize="small" color="action"/>)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={node.activityTitle} 
                            secondary={node.isFinished ? "Completed" : (isNodeLocked ? "Locked" : "Ready to Start")} 
                            primaryTypographyProps={{color: isNodeLocked ? 'text.disabled' : 'text.primary'}}
                          />
                        </ListItem>
                      );
                    })}
                    
                    {/* Challenge Item */}
                    {lesson.challengeDefinitionId && (
                      (() => {
                        const areAllNodesInLessonCompleted = lesson.activityNodes.every(an => an.isFinished);
                        const isChallengeLocked = !areAllNodesInLessonCompleted;
                        // How to determine if challenge itself is "completed"?
                        // For now, let's assume if it's unlocked, it's playable. Completion status of challenge itself
                        // might need to be part of lessonProgress or a separate ChallengeProgress status.
                        // Let's assume `lesson.progressStatus === 'COMPLETED'` implies challenge was also done if it exists.
                        const isChallengeEffectivelyCompleted = isCurrentLessonCompleted;


                        return (
                          <ListItem
                            button={!isChallengeLocked && !isChallengeEffectivelyCompleted}
                            onClick={!isChallengeLocked && !isChallengeEffectivelyCompleted ? () => handleChallengeClick(lesson) : undefined}
                            sx={{ 
                                pl: 4, 
                                mt: 1, 
                                borderTop: '1px dashed #ddd', 
                                bgcolor: isChallengeLocked ? 'rgba(255,232,163,0.3)' : (isChallengeEffectivelyCompleted ? 'rgba(76,175,80,0.15)' : '#fffde7'),
                                cursor: isChallengeLocked || isChallengeEffectivelyCompleted ? 'default' : 'pointer',
                                opacity: isChallengeLocked ? 0.6 : 1,
                                my: 0.5, borderRadius: '4px'
                            }}
                            disabled={isChallengeLocked || isChallengeEffectivelyCompleted}
                          >
                            <ListItemIcon>
                              {isChallengeLocked ? <LockIcon fontSize="small" /> : (isChallengeEffectivelyCompleted ? <CheckCircleIcon fontSize="small" color="success"/> :<ChallengeIcon fontSize="small" sx={{color: '#FFC107'}}/>)}
                            </ListItemIcon>
                            <ListItemText 
                                primary={`${lesson.lessonTitle} - Challenge!`}
                                secondary={isChallengeLocked ? "Complete all activities above to unlock" : (isChallengeEffectivelyCompleted ? "Challenge Completed!" : "Ready to Play!")}
                                primaryTypographyProps={{color: isChallengeLocked ? 'text.disabled' : '#c77700', fontWeight: 'medium'}}
                            />
                          </ListItem>
                        );
                      })()
                    )}
                  </List>
                </Collapse>
              </Paper>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default LessonPage;