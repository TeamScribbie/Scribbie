// src/page/student/LessonPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/navbar';
import LessonBox from '../../components/cards/LessonBox';
import ActivityNode from '../../components/ActivityNode';
import '../../styles/LessonPage.css'; // Ensure correct path
import { CircularProgress, Alert, Typography, Button, Box, Paper } from '@mui/material'; // Added Box, Paper
import { useAuth } from '../../context/AuthContext';
import {
    getLessonDefinitions,
    getActivityNodeTypesForLesson,
    getStudentLessonProgress,
    startLessonProgress
} from '../../services/lessonService';
import { getClassroomDetails } from '../../services/classroomService';
// Assume ChallengeDefinition will be part of LessonDefinition DTO from backend if a challenge exists for it
// Or we might need a separate check if a lessonDefinition has a challenge.
// For now, let's assume lessonDefinition DTO has a 'hasChallenge: true/false' or 'challengeDefinitionId: null/number'

const LessonPage = () => {
  const { classroomId } = useParams();
  const { authState } = useAuth();
  const navigate = useNavigate();

  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState(`Loading Lessons...`);

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
    setPageTitle(`Loading Lessons for Classroom ${classroomId}...`);
    let courseId = null;
    let classroomName = `Classroom ${classroomId}`;

    try {
      console.log(`Workspaceing details for classroom ${classroomId} to find course ID...`);
      const classroomDetails = await getClassroomDetails(classroomId, authState.token);
      classroomName = classroomDetails?.classroomName || classroomName;

      if (classroomDetails && classroomDetails.assignedCourseId) {
        courseId = classroomDetails.assignedCourseId;
        console.log(`Found assignedCourseId: ${courseId} for classroom ${classroomName}`);
        setPageTitle(`Lessons for ${classroomName}`);
      } else {
        throw new Error("Could not determine the assigned course for this classroom.");
      }

      const fetchedDefinitions = await getLessonDefinitions(courseId, authState.token);
      if (!Array.isArray(fetchedDefinitions) || fetchedDefinitions.length === 0) {
          setLessonsData([]);
          setIsLoading(false);
          return;
      }

      const lessonsWithDetails = await Promise.all(
        fetchedDefinitions.map(async (def) => {
          let activityNodes = [];
          let lessonProgress = null;
          try {
             const nodeTypes = await getActivityNodeTypesForLesson(def.lessonDefinitionId, authState.token);
             lessonProgress = await getStudentLessonProgress(authState.user.identifier, def.lessonDefinitionId, authState.token);

             activityNodes = nodeTypes.map(nodeType => {
                const activityProgress = lessonProgress?.activityNodeProgressList?.find(
                    p => p.activityNodeType?.activityNodeTypeId === nodeType.activityNodeTypeId
                );
                const isFinished = activityProgress?.finished || false;
                const totalScore = activityProgress?.totalScore || 0;
                let gameType = 0;
                switch (nodeType.activityType) {
                    case 'QUIZ_MCQ': gameType = 1; break;
                    case 'MATCHING': gameType = 2; break;
                    case 'WRITING_PROMPT': gameType = 3; break;
                    default: gameType = 0;
                }
                return {
                    activityId: nodeType.activityNodeTypeId,
                    gameType: gameType,
                    isFinished: isFinished,
                    totalScore: totalScore,
                    orderIndex: nodeType.orderIndex,
                    instructions: nodeType.instructions || '',
                };
             });
          } catch (innerErr) {
             console.error(`Failed to fetch details for lesson ${def.lessonDefinitionId}:`, innerErr);
             activityNodes = [];
          }
          return {
            lessonId: def.lessonDefinitionId, // This is lessonDefinitionId
            lessonTitle: def.lessonTitle,
            lessonDescription: def.lessonDescription,
            activityNodes: activityNodes.sort((a, b) => a.orderIndex - b.orderIndex),
            progressStatus: lessonProgress?.status || 'NOT_STARTED',
            lessonProgressId: lessonProgress?.lessonProgressId || null,
            // *** ADDING A FLAG - THIS NEEDS TO COME FROM BACKEND ***
            // Backend should update LessonDefinitionSummaryDto or a full LessonDefinitionDto
            // to include info if a challenge is associated with it.
            // For now, let's assume a field `challengeDefinitionId` (could be null)
            // or a boolean `hasChallenge` is present in the 'def' object.
            challengeDefinitionId: def.challengeDefinitionId || null, // Assumes this field comes from backend DTO
          };
        })
      );
      setLessonsData(lessonsWithDetails);
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

  const handleNodeClick = async (activity, lesson) => {
    if (activity.isFinished) return;
    if (!authState.token) { setError("Authentication token missing."); return; }
    try {
        let currentLessonProgressId = lesson.lessonProgressId;
        if (!currentLessonProgressId) {
             const progressData = await startLessonProgress(lesson.lessonId, authState.token);
             currentLessonProgressId = progressData?.lessonProgressId;
             setLessonsData(prevData => prevData.map(l =>
                 l.lessonId === lesson.lessonId
                     ? { ...l, lessonProgressId: currentLessonProgressId, progressStatus: 'IN_PROGRESS' }
                     : l
             ));
        }
        if (!currentLessonProgressId) throw new Error("Failed to obtain Lesson Progress ID.");
        navigate(
            `/student/lesson/${lesson.lessonId}/activity/${activity.activityId}`,
            { state: { lessonProgressId: currentLessonProgressId, activityInstructions: activity.instructions, classroomId: classroomId } }
        );
    } catch (err) {
        setError(`Could not start or navigate to the activity: ${err.message}`);
    }
 };

  // --- ✨ New Handler for Challenge Node Click ---
  const handleChallengeNodeClick = (lesson) => {
    console.log(`Clicked Challenge for Lesson ID (LessonDefinitionId): ${lesson.lessonId}`);
    if (!lesson.challengeDefinitionId) { // Or check a `hasChallenge` flag
        setError("This lesson does not have a challenge configured.");
        return;
    }
    // Navigate to the challenge page, passing the lessonDefinitionId
    navigate(`/student/lesson/${lesson.lessonId}/challenge`, {
        state: { classroomId: classroomId } // Pass classroomId for back navigation context
    });
  };
  // --- End New Handler ---

  return (
    <div className="lesson-page-container">
      <Navbar />
      <div className="lesson-page-content">
        <Typography variant="h4" className="lesson-page-title" sx={{fontWeight: 'bold'}}>
          {pageTitle}
        </Typography>

        {isLoading && <CircularProgress sx={{ mt: 4 }} />}
        {!isLoading && error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: '600px' }}>{error}</Alert>
        )}
        {!isLoading && !error && lessonsData.length === 0 && authState.isAuthenticated && (
            <Typography sx={{ mt: 4 }}>No lessons found for this classroom's assigned course.</Typography>
        )}

        {!isLoading && !error && lessonsData.length > 0 && (
          <div className="lesson-path">
            {lessonsData.map((lesson, lessonIndex) => (
              <Paper key={lesson.lessonId} elevation={2} sx={{
                width: '100%',
                maxWidth: '500px', // Max width for each lesson block
                mb: 4, // Margin bottom between lesson blocks
                p: 2, // Padding inside paper
                backgroundColor: '#FFFAF0' // Light cream background for lesson block
              }}>
                <LessonBox
                  lessonNumber={lessonIndex + 1}
                  title={lesson.lessonTitle}
                />
                {lesson.lessonDescription && (
                    <Typography variant="body2" color="text.secondary" sx={{my: 1, textAlign: 'center'}}>
                        {lesson.lessonDescription}
                    </Typography>
                )}
                 {lesson.activityNodes.length === 0 && !lesson.challengeDefinitionId && ( // Check for challenge too
                     <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic', textAlign: 'center' }}>
                        (No activities or challenge defined for this lesson)
                     </Typography>
                 )}
                <div className="activity-node-group">
                  {lesson.activityNodes.map((activity) => (
                    <ActivityNode
                      key={activity.activityId}
                      activityData={activity}
                      onClick={() => handleNodeClick(activity, lesson)}
                      lessonIndex={lessonIndex}
                    />
                  ))}
                  {/* --- ✨ Render Challenge Button/Node if available --- */}
                  {lesson.challengeDefinitionId && ( // Or use lesson.hasChallenge
                      <Box sx={{mt: 2, width: '100%', display: 'flex', justifyContent: 'center'}}>
                        <Button
                            variant="contained"
                            onClick={() => handleChallengeNodeClick(lesson)}
                            sx={{
                                // Styling for the challenge button
                                bgcolor: '#E63946', // A distinct color for challenges
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: '20px',
                                padding: '10px 25px',
                                fontSize: '1rem',
                                '&:hover': {
                                    bgcolor: '#C32F3A',
                                    transform: 'scale(1.03)'
                                },
                                // You can also make it look like an ActivityNode if preferred
                                // Or use an icon like 🏆
                            }}
                        >
                           🏆 Play Challenge!
                        </Button>
                      </Box>
                  )}
                  {/* --- End Challenge Button/Node --- */}
                </div>
              </Paper>
            ))}
          </div>
        )}
         {!isLoading && !authState.isAuthenticated && (
             <Alert severity="warning" sx={{ mt: 4, width: '100%', maxWidth: '600px' }}>Please log in to view lesson content.</Alert>
         )}
      </div>
    </div>
  );
};

export default LessonPage;