
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getLessonDefinitions, getActivityNodeTypesForLesson, getStudentLessonProgress } from '../../services/lessonService';

// Import Level Navigation Renderers
import BalloonGameLevelNavigator from '../../components/LevelNavigationRenderers/BalloonGameLevelNavigator';
import MemoryGameLevelNavigator from '../../components/LevelNavigationRenderers/MemoryGameLevelNavigator';

const LESSON_TYPE_TO_RENDERER = {
  BALLOONGAME: BalloonGameLevelNavigator,
  MEMORYGAME: MemoryGameLevelNavigator,
};

const ActivityNodePage = () => {
  const { lessonId, activityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);

  // Fetch all lessons and their activity nodes
  useEffect(() => {
    const fetchLessons = async () => {
      if (!authState.token || !lessonId) {
        setError('Missing authentication or lesson ID');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Assume courseId is passed in location.state or can be derived
        const courseId = location.state?.courseId;
        if (!courseId) throw new Error('Course ID not found in navigation state');
        const lessonDefs = await getLessonDefinitions(courseId, authState.token);
        // For each lesson, fetch its activity nodes
        const lessonsWithNodes = await Promise.all(
          lessonDefs.map(async (lessonDef) => {
            let activityNodes = [];
            try {
              const nodeTypes = await getActivityNodeTypesForLesson(lessonDef.lessonDefinitionId, authState.token);
              activityNodes = nodeTypes.map((nodeType, idx) => ({
                activityId: nodeType.activityNodeTypeId,
                activityTitle: nodeType.activityTitle || `Activity ${idx + 1}`,
                orderIndex: nodeType.orderIndex,
                instructions: nodeType.instructions || '',
              })).sort((a, b) => a.orderIndex - b.orderIndex);
            } catch (e) {
              // If node fetch fails, just leave empty
            }
            return {
              ...lessonDef,
              activityNodes,
            };
          })
        );
        setLessons(lessonsWithNodes);
        // Set current lesson index
        const idx = lessonsWithNodes.findIndex(l => String(l.lessonDefinitionId) === String(lessonId));
        setCurrentLessonIdx(idx >= 0 ? idx : 0);
      } catch (err) {
        setError(err.message || 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [authState.token, lessonId, location.state]);

  // Navigation handlers
  const handlePrevLesson = useCallback(() => {
    if (currentLessonIdx > 0) {
      const prevLesson = lessons[currentLessonIdx - 1];
      navigate(`/student/lesson/${prevLesson.lessonDefinitionId}/activity-node/${prevLesson.activityNodes[0]?.activityId || ''}`, {
        state: { ...location.state },
      });
    }
  }, [currentLessonIdx, lessons, navigate, location.state]);

  const handleNextLesson = useCallback(() => {
    if (currentLessonIdx < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIdx + 1];
      navigate(`/student/lesson/${nextLesson.lessonDefinitionId}/activity-node/${nextLesson.activityNodes[0]?.activityId || ''}`, {
        state: { ...location.state },
      });
    }
  }, [currentLessonIdx, lessons, navigate, location.state]);

  const handleSelectNode = useCallback((node) => {
    // Navigate to the selected activity node in the current lesson
    const lesson = lessons[currentLessonIdx];
    navigate(`/student/lesson/${lesson.lessonDefinitionId}/activity-node/${node.activityId}`, {
      state: { ...location.state },
    });
  }, [lessons, currentLessonIdx, navigate, location.state]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Render the correct Level Navigation Renderer based on lesson type
  const lesson = lessons[currentLessonIdx];
  if (!lesson) return null;
  const Renderer = LESSON_TYPE_TO_RENDERER[lesson.type];

  if (!Renderer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No Level Navigation Renderer for lesson type: {lesson.type}</Alert>
      </Box>
    );
  }

  return (
    <Renderer
      lesson={lesson}
      activityNodes={lesson.activityNodes}
      onSelectNode={handleSelectNode}
      onPrevLesson={handlePrevLesson}
      onNextLesson={handleNextLesson}
    />
  );
};

export default ActivityNodePage;
