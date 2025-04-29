// src/page/student/LessonPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/navbar';
import LessonBox from '../../components/cards/LessonBox';
import ActivityNode from '../../components/ActivityNode';
import '../../styles/LessonPage.css';
import { CircularProgress, Alert, Typography, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import {
    getLessonDefinitions,
    getActivityNodeTypesForLesson,
    getStudentLessonProgress,
    startLessonProgress
} from '../../services/lessonService';
// Import the new function from classroomService
import { getClassroomDetails } from '../../services/classroomService';

const LessonPage = () => {
  const { classroomId } = useParams();
  const { authState } = useAuth();
  const navigate = useNavigate();

  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading immediately
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState(`Loading Lessons...`); // Initial loading title

  // --- Combined Fetch Function ---
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
    setPageTitle(`Loading Lessons for Classroom ${classroomId}...`); // Update title during load

    let courseId = null;
    let classroomName = `Classroom ${classroomId}`; // Default name

    try {
      // --- Step 1: Fetch Classroom Details to get Course ID ---
      console.log(`Fetching details for classroom ${classroomId} to find course ID...`);
      const classroomDetails = await getClassroomDetails(classroomId, authState.token);
      classroomName = classroomDetails?.classroomName || classroomName; // Update name if available

      // --- Step 2: Extract assignedCourseId ---
      // *** THIS REQUIRES BACKEND UPDATE TO ClassroomSummaryResponse ***
      if (classroomDetails && classroomDetails.assignedCourseId) {
        courseId = classroomDetails.assignedCourseId;
        console.log(`Found assignedCourseId: ${courseId} for classroom ${classroomName}`);
        setPageTitle(`Lessons for ${classroomName}`); // Set final title
      } else {
        // Handle missing courseId - Stop lesson fetching
        console.error("Failed to get 'assignedCourseId' from classroom details response:", classroomDetails);
        throw new Error("Could not determine the assigned course for this classroom. Please contact your teacher.");
      }

      // --- Step 3: Fetch Lesson Definitions using the obtained courseId ---
      console.log(`Fetching lesson definitions for course ${courseId}`);
      const fetchedDefinitions = await getLessonDefinitions(courseId, authState.token);
      console.log("Fetched Definitions:", fetchedDefinitions);

      if (!Array.isArray(fetchedDefinitions) || fetchedDefinitions.length === 0) {
          console.log("No lesson definitions found for this course.");
          setLessonsData([]);
          setIsLoading(false);
          return;
      }

      // --- Step 4: Fetch Activity Nodes and Progress for Each Lesson ---
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
             activityNodes = []; // Show lesson but no activities on inner error
          }

          return {
            lessonId: def.lessonDefinitionId,
            lessonTitle: def.lessonTitle,
            lessonDescription: def.lessonDescription,
            activityNodes: activityNodes.sort((a, b) => a.orderIndex - b.orderIndex),
            progressStatus: lessonProgress?.status || 'NOT_STARTED',
            lessonProgressId: lessonProgress?.lessonProgressId || null,
          };
        })
      );

      console.log("Final lessons data with details:", lessonsWithDetails);
      setLessonsData(lessonsWithDetails);

    } catch (err) {
      console.error("Error fetching classroom or lesson data:", err);
      // Set a general error message, potentially overwriting specific ones from inner steps
      setError(err.message || "Could not load lesson data.");
      setLessonsData([]);
       // Update title to reflect error state
       setPageTitle(`Error loading lessons for ${classroomName}`);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, authState.isAuthenticated, authState.token, authState.user?.identifier]);

  // Effect to trigger fetch on load and when dependencies change
  useEffect(() => {
    fetchClassroomAndLessonData();
  }, [fetchClassroomAndLessonData]); // Depend only on the callback

  // --- Activity Node Click Handler (Keep as is for now) ---
  const handleNodeClick = async (activity, lesson) => {
     console.log(`Clicked Activity Node: ID=${activity.activityId}, Type=${activity.gameType}, Finished=${activity.isFinished}, LessonID=${lesson.lessonId}`);
      // ... (rest of the handleNodeClick logic remains the same) ...
     if (activity.isFinished) {
         console.log("Activity already finished.");
         return;
     }
     if (!authState.token) {
         setError("Authentication token missing. Please log in again.");
         return;
     }
     try {
         let lessonProgressId = lesson.lessonProgressId;
         if (!lessonProgressId) {
              console.log(`Progress not started for lesson ${lesson.lessonId}. Calling startLessonProgress...`);
              const progressData = await startLessonProgress(lesson.lessonId, authState.token);
              lessonProgressId = progressData?.lessonProgressId;
              console.log(`Lesson progress started/retrieved. Progress ID: ${lessonProgressId}`);
              // Refresh data to get the new progress ID reflected in state? Or update locally?
              // For simplicity, we might need a refresh or local update here if immediate subsequent clicks depend on it.
              // Refreshing might be easier for now:
              // fetchClassroomAndLessonData(); // <-- Could cause a flicker, local update might be better
         } else {
             console.log(`Lesson progress already exists (ID: ${lessonProgressId}).`);
         }

         if (!lessonProgressId) {
             throw new Error("Failed to obtain Lesson Progress ID.");
         }

         console.log(`Navigating to activity ${activity.activityId} for lesson ${lesson.lessonId} with progress ID ${lessonProgressId}`);
         navigate(`/student/lesson/${lesson.lessonId}/activity/${activity.activityId}`, {
             state: { lessonProgressId: lessonProgressId, activityInstructions: activity.instructions }
         });

     } catch (err) {
         console.error("Error handling node click:", err);
         setError(`Could not start or navigate to the activity: ${err.message}`);
     }
  };

  // --- Render Logic ---
  return (
    <div className="lesson-page-container">
      <Navbar />
      <div className="lesson-page-content">
        <Typography variant="h4" className="lesson-page-title">
          {pageTitle} {/* Dynamic Title */}
        </Typography>


        {/* Loading State */}
        {isLoading && <CircularProgress sx={{ mt: 4 }} />}

        {/* Error State */}
        {!isLoading && error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: '600px' }}>{error}</Alert>
        )}

        {/* No Lessons Found State */}
        {!isLoading && !error && lessonsData.length === 0 && authState.isAuthenticated && (
            <Typography sx={{ mt: 4 }}>No lessons found for this classroom's assigned course.</Typography>
        )}

        {/* Lessons Display */}
        {!isLoading && !error && lessonsData.length > 0 && (
          <div className="lesson-path">
            {lessonsData.map((lesson, lessonIndex) => (
              <React.Fragment key={lesson.lessonId}>
                <LessonBox
                  lessonNumber={lessonIndex + 1}
                  title={lesson.lessonTitle}
                />
                 {lesson.activityNodes.length === 0 && (
                     <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                        (No activities defined for this lesson)
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
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

         {/* Not Authenticated State */}
         {!isLoading && !authState.isAuthenticated && (
             <Alert severity="warning" sx={{ mt: 4, width: '100%', maxWidth: '600px' }}>Please log in to view lesson content.</Alert>
         )}
      </div>
    </div>
  );
};

export default LessonPage;