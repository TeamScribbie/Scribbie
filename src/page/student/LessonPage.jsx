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
  // Hooks
  const { classroomId } = useParams(); // Get classroomId from URL
  const { authState } = useAuth();
  const navigate = useNavigate();

  // State
  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState(`Loading Lessons...`);

  // --- Combined Fetch Function for Classroom and Lesson Data ---
  const fetchClassroomAndLessonData = useCallback(async () => {
    // Check prerequisites
    if (!classroomId || !authState.isAuthenticated || !authState.token || !authState.user?.identifier) {
      setError("Authentication missing or classroom ID not specified.");
      setIsLoading(false);
      setLessonsData([]);
      setPageTitle(`Error Loading Lessons`);
      return;
    }

    // Reset state for loading
    setIsLoading(true);
    setError(null);
    setLessonsData([]);
    setPageTitle(`Loading Lessons for Classroom ${classroomId}...`);

    let courseId = null;
    let classroomName = `Classroom ${classroomId}`; // Default name

    try {
      // Step 1: Fetch Classroom Details to get Course ID and Name
      console.log(`Workspaceing details for classroom ${classroomId} to find course ID...`);
      const classroomDetails = await getClassroomDetails(classroomId, authState.token);
      classroomName = classroomDetails?.classroomName || classroomName;

      // Step 2: Extract assignedCourseId (Requires backend DTO update)
      if (classroomDetails && classroomDetails.assignedCourseId) {
        courseId = classroomDetails.assignedCourseId;
        console.log(`Found assignedCourseId: ${courseId} for classroom ${classroomName}`);
        setPageTitle(`Lessons for ${classroomName}`); // Set final page title
      } else {
        console.error("Backend Error: 'assignedCourseId' missing from classroom details response:", classroomDetails);
        throw new Error("Could not determine the assigned course for this classroom. Please contact your teacher or check backend DTO.");
      }

      // Step 3: Fetch Lesson Definitions for the Course
      console.log(`Workspaceing lesson definitions for course ${courseId}`);
      const fetchedDefinitions = await getLessonDefinitions(courseId, authState.token);
      console.log("Fetched Definitions:", fetchedDefinitions);

      if (!Array.isArray(fetchedDefinitions) || fetchedDefinitions.length === 0) {
          console.log("No lesson definitions found for this course.");
          setLessonsData([]);
          setIsLoading(false);
          return;
      }

      // Step 4: Fetch Activity Nodes and Progress for Each Lesson Definition
      const lessonsWithDetails = await Promise.all(
        fetchedDefinitions.map(async (def) => {
          let activityNodes = [];
          let lessonProgress = null;

          try {
             // Fetch node types (structure of the lesson)
             const nodeTypes = await getActivityNodeTypesForLesson(def.lessonDefinitionId, authState.token);
             // Fetch existing progress (if any)
             lessonProgress = await getStudentLessonProgress(authState.user.identifier, def.lessonDefinitionId, authState.token); // Returns null if 404

             // Map node types to the structure needed by ActivityNode component
             activityNodes = nodeTypes.map(nodeType => {
                // Find corresponding progress for this specific node within the overall lesson progress
                const activityProgress = lessonProgress?.activityNodeProgressList?.find(
                    p => p.activityNodeType?.activityNodeTypeId === nodeType.activityNodeTypeId
                );
                const isFinished = activityProgress?.finished || false; // Check if this node is marked finished
                const totalScore = activityProgress?.totalScore || 0;  // Get score if available

                // Determine gameType (you might adjust this based on actual ActivityType strings)
                let gameType = 0;
                switch (nodeType.activityType) {
                    case 'QUIZ_MCQ': gameType = 1; break;
                    case 'MATCHING': gameType = 2; break;
                    case 'WRITING_PROMPT': gameType = 3; break;
                    // Add other cases as needed
                    default: gameType = 0;
                }

                // Return the object structure expected by ActivityNode props
                return {
                    activityId: nodeType.activityNodeTypeId, // This is the ID needed for navigation/fetching details
                    gameType: gameType,
                    isFinished: isFinished,
                    totalScore: totalScore,
                    orderIndex: nodeType.orderIndex,
                    instructions: nodeType.instructions || '', // Pass instructions
                };
             });

          } catch (innerErr) {
             console.error(`Failed to fetch details for lesson ${def.lessonDefinitionId}:`, innerErr);
             activityNodes = []; // Default to empty if inner fetch fails
          }

          // Return the combined data object for this lesson
          return {
            lessonId: def.lessonDefinitionId,
            lessonTitle: def.lessonTitle,
            lessonDescription: def.lessonDescription,
            activityNodes: activityNodes.sort((a, b) => a.orderIndex - b.orderIndex), // Ensure sorted by orderIndex
            progressStatus: lessonProgress?.status || 'NOT_STARTED', // Status of the overall lesson attempt
            lessonProgressId: lessonProgress?.lessonProgressId || null, // ID of the overall lesson attempt record
            // Add hasChallenge here if/when backend provides it
            // hasChallenge: def.hasChallenge || false,
          };
        })
      );

      console.log("Final lessons data with details:", lessonsWithDetails);
      setLessonsData(lessonsWithDetails); // Update state with processed data

    } catch (err) {
      console.error("Error fetching classroom or lesson data:", err);
      setError(err.message || "Could not load lesson data.");
      setLessonsData([]);
      setPageTitle(`Error loading lessons for ${classroomName}`);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
    // Dependencies for useCallback
  }, [classroomId, authState.isAuthenticated, authState.token, authState.user?.identifier]);

  // Effect to trigger fetch on initial load and when dependencies change
  useEffect(() => {
    fetchClassroomAndLessonData();
  }, [fetchClassroomAndLessonData]);

  // --- Activity Node Click Handler (Corrected Navigation) ---
  const handleNodeClick = async (activity, lesson) => {
    // Log using corrected template literals
    console.log(`Clicked Activity Node: ID=${activity.activityId}, Type=${activity.gameType}, Finished=${activity.isFinished}, LessonID=${lesson.lessonId}`);

    // Prevent action if activity is already finished
    if (activity.isFinished) {
        console.log("Activity already finished.");
        return;
    }
    // Check for auth token
    if (!authState.token) {
        setError("Authentication token missing. Please log in again.");
        return;
    }

    try {
        // Find the current lesson's data from state to get existing progress ID
        let currentLessonData = lessonsData.find(l => l.lessonId === lesson.lessonId);
        let lessonProgressId = currentLessonData?.lessonProgressId;

        // If no progress ID exists in state (lesson not started), call API to start it
        if (!lessonProgressId) {
             console.log(`Progress not found or not started for lesson ${lesson.lessonId}. Calling startLessonProgress...`);
             const progressData = await startLessonProgress(lesson.lessonId, authState.token);
             lessonProgressId = progressData?.lessonProgressId; // Get the new ID
             console.log(`Lesson progress started/retrieved. Progress ID: ${lessonProgressId}`);
             // Update local state immediately with the new progress ID and status
             setLessonsData(prevData => prevData.map(l =>
                 l.lessonId === lesson.lessonId
                     ? { ...l, lessonProgressId: lessonProgressId, progressStatus: 'IN_PROGRESS' }
                     : l
             ));
        } else {
            console.log(`Lesson progress already exists (ID: ${lessonProgressId}).`);
        }

        // If we still don't have a progress ID after trying to start, throw error
        if (!lessonProgressId) {
            throw new Error("Failed to obtain Lesson Progress ID.");
        }

        console.log(`Navigating to activity ${activity.activityId} for lesson ${lesson.lessonId} with progress ID ${lessonProgressId}`);

        // --- CORRECTED navigate call ---
        // Use backticks (`) and ${variable} syntax
        // Pass classroomId in state for potential use in ActivityPage or SummaryPage navigation
        // highlight-start
        navigate(
            `/student/lesson/${lesson.lessonId}/activity/${activity.activityId}`,
            {
                state: {
                    lessonProgressId: lessonProgressId,
                    activityInstructions: activity.instructions,
                    classroomId: classroomId // Pass the classroomId from useParams
                }
            }
        );
        // highlight-end
        // --- End Correction ---

    } catch (err) {
        console.error("Error handling node click:", err);
        setError(`Could not start or navigate to the activity: ${err.message}`);
    }
 };

 // --- TODO: Add handleChallengeNodeClick handler here later ---
 // const handleChallengeNodeClick = (lesson) => { ... navigate to challenge page ... }


  // --- Render Logic ---
  return (
    <div className="lesson-page-container">
      <Navbar />
      <div className="lesson-page-content">
        {/* Page Title */}
        <Typography variant="h4" className="lesson-page-title">
          {pageTitle}
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
            {/* Map through each lesson */}
            {lessonsData.map((lesson, lessonIndex) => (
              <React.Fragment key={lesson.lessonId}>
                {/* Lesson Header Box */}
                <LessonBox
                  lessonNumber={lessonIndex + 1}
                  title={lesson.lessonTitle}
                />
                {/* Message if no activities */}
                 {lesson.activityNodes.length === 0 && (
                     <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                        (No activities defined for this lesson)
                     </Typography>
                 )}
                 {/* Container for Activity Nodes */}
                <div className="activity-node-group">
                  {/* Map through activities for this lesson */}
                  {lesson.activityNodes.map((activity) => (
                    <ActivityNode
                      key={activity.activityId}
                      activityData={activity}
                      onClick={() => handleNodeClick(activity, lesson)} // Pass activity and lesson data
                      lessonIndex={lessonIndex} // Pass index for color cycling
                    />
                  ))}
                  {/* --- TODO: Add conditional rendering for Challenge Node here --- */}
                  {/*
                  {lesson.hasChallenge && (
                      <ActivityNode
                          key={`challenge-${lesson.lessonId}`}
                          activityData={{ activityId: -1, gameType: 99, isFinished: false }} // Mock data
                          onClick={() => handleChallengeNodeClick(lesson)}
                          lessonIndex={lessonIndex}
                          // Add specific styling/icon props?
                      />
                  )}
                  */}
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