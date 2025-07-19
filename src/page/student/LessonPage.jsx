// src/page/student/LessonPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import {
    getLessonDefinitions,
    getActivityNodeTypesForLesson,
    startLessonProgress,
    getStudentLessonProgress
} from '../../services/lessonService';
import { getClassroomDetails } from '../../services/classroomService';

import BalloonGameLevelNavigator from '../../components/LevelNavigationRenderers/BalloonGameLevelNavigator';
import MemoryGameLevelNavigator from '../../components/LevelNavigationRenderers/MemoryGameLevelNavigator';
import Navbar from '../../components/layout/navbar';

//AADD GAME MODE FKASJHFKASDHSAHDSHAKKHAGKA KPAOY
const LESSON_TYPE_TO_RENDERER = {
    BALLOONGAME: BalloonGameLevelNavigator,
    MEMORYGAME: MemoryGameLevelNavigator,
};

const LessonPage = () => {
    const { classroomId } = useParams();
    const location = useLocation();
    const { authState } = useAuth();
    const navigate = useNavigate();

    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLessonIdx, setCurrentLessonIdx] = useState(0);

    useEffect(() => {
        const fetchLessons = async () => {
            if (!authState.token || !classroomId || !authState.user?.identifier) {
                setError('Missing authentication, user, or classroom ID');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                let courseId = location.state?.courseId;
                if (!courseId) {
                    const classroomDetails = await getClassroomDetails(classroomId, authState.token);
                    courseId = classroomDetails?.assignedCourseId;
                    if (!courseId) throw new Error('Course ID could not be determined from classroom details.');
                }
                const lessonDefs = await getLessonDefinitions(courseId, authState.token);

                const lessonsWithDetails = await Promise.all(
                    lessonDefs.map(async (def) => {
                        let activityNodes = [];
                        let lessonProgress = null;
                        try {
                            const nodeTypes = await getActivityNodeTypesForLesson(def.lessonDefinitionId, authState.token);
                            activityNodes = nodeTypes.map((nodeType, idx) => ({
                                activityId: nodeType.activityNodeTypeId,
                                activityTitle: nodeType.activityTitle || `Activity ${idx + 1}`,
                                orderIndex: nodeType.orderIndex,
                                instructions: nodeType.instructions || '',
                            })).sort((a, b) => a.orderIndex - b.orderIndex);
                            
                            lessonProgress = await getStudentLessonProgress(authState.user.identifier, def.lessonDefinitionId, authState.token);
                        } catch (e) {
                            console.error(`Failed to fetch nodeTypes or progress for lesson ${def.lessonDefinitionId}:`, e);
                        }
                        return {
                            ...def,
                            activityNodes,
                            activityNodeProgress: lessonProgress?.activityNodeProgressList || [],
                            lessonProgressId: lessonProgress?.lessonProgressId || null,
                            status: lessonProgress?.status || 'NOT_STARTED',
                        };
                    })
                );
                // highlight-start
                console.log("Lessons with details received:", lessonsWithDetails);
                // highlight-end
                setLessons(lessonsWithDetails);
                setCurrentLessonIdx(0);
            } catch (err) {
                setError(err.message || 'Failed to load lessons');
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [authState.token, classroomId, location.state, authState.user?.identifier]);

    const handlePrevLesson = useCallback(() => {
        if (currentLessonIdx > 0) {
            setCurrentLessonIdx(idx => idx - 1);
        }
    }, [currentLessonIdx]);

    const handleNextLesson = useCallback(() => {
        if (currentLessonIdx < lessons.length - 1) {
            setCurrentLessonIdx(idx => idx + 1);
        }
    }, [currentLessonIdx, lessons.length]);

    const handleSelectNode = useCallback(async (node) => {
        const lesson = lessons[currentLessonIdx];
        if (!authState.token || !authState.user?.identifier) {
            setError("Authentication details missing. Please log in again.");
            return;
        }

        try {
            let currentLessonProgressId = lesson.lessonProgressId;

            if (!currentLessonProgressId) {
                const progressData = await startLessonProgress(lesson.lessonDefinitionId, authState.token);
                if (!progressData?.lessonProgressId) {
                    throw new Error("Failed to obtain a valid Lesson Progress ID from the server.");
                }
                currentLessonProgressId = progressData.lessonProgressId;
                
                setLessons(prevLessons => prevLessons.map((l, index) =>
                    index === currentLessonIdx
                        ? { ...l, lessonProgressId: currentLessonProgressId, status: progressData.status || 'IN_PROGRESS' }
                        : l
                ));
            }

            navigate(`/student/lesson/${lesson.lessonDefinitionId}/activity-node/${node.activityId}/play`, {
                state: {
                    lessonProgressId: currentLessonProgressId,
                    activityInstructions: node.instructions,
                    activityTitle: node.activityTitle,
                    classroomId,
                },
            });

        } catch (err) {
            setError(`Could not start or navigate to the activity: ${err.message}`);
            console.error("Error in handleSelectNode: ", err);
        }
    }, [lessons, currentLessonIdx, navigate, classroomId, authState.token, authState.user?.identifier]);

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

    const lesson = lessons[currentLessonIdx];
    if (!lesson) return null;
    
    const Renderer = LESSON_TYPE_TO_RENDERER[lesson.type] || BalloonGameLevelNavigator;

    return (
        <>
            <Navbar transparent={true} /> {/* Pass transparent prop */}
            <div style={{
                position: 'fixed', top: '64px', left: 0,
                width: '100vw', height: 'calc(100vh - 64px)',
                background: '#111', color: '#fff',
                zIndex: 1000, overflow: 'auto',
            }}>
                <Renderer
                    lesson={lesson}
                    activityNodes={lesson.activityNodes}
                    activityNodeProgress={lesson.activityNodeProgress}
                    onSelectNode={handleSelectNode}
                    onPrevLesson={handlePrevLesson}
                    onNextLesson={handleNextLesson}
                />
            </div>
        </>
    );
};

export default LessonPage;