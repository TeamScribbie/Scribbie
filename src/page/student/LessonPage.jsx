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
import WordFeastLevelNavigator from '../../components/LevelNavigationRenderers/WordFeastLevelNavigator';
import Navbar from '../../components/layout/navbar';
import BackArrowIcon from '../../assets/Button-Arrow-Left-icon.png';
import CloudAnimation from '../../assets/cloud-animation.png';

const LESSON_TYPE_TO_RENDERER = {
    BALLOONGAME: BalloonGameLevelNavigator,
    MEMORYGAME: MemoryGameLevelNavigator,
    WORDFEAST: WordFeastLevelNavigator,
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
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState('next');

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
                console.log("Lessons with details received:", lessonsWithDetails);
                setLessons(lessonsWithDetails);
                setCurrentLessonIdx(0);
            } catch (err) {
                setError(err.message || 'Failed to load lessons');
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [authState.token, classroomId, location.state, authState.user?.identifier, location.key]);

    const handlePrevLesson = useCallback(() => {
        if (currentLessonIdx > 0 && !isTransitioning) {
            setTransitionDirection('prev');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentLessonIdx(idx => idx - 1);
                setTimeout(() => setIsTransitioning(false), 600);
            }, 600);
        }
    }, [currentLessonIdx, isTransitioning]);

    const handleNextLesson = useCallback(() => {
        if (currentLessonIdx < lessons.length - 1 && !isTransitioning) {
            setTransitionDirection('next');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentLessonIdx(idx => idx + 1);
                setTimeout(() => setIsTransitioning(false), 600);
            }, 600);
        }
    }, [currentLessonIdx, lessons.length, isTransitioning]);

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
        <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            {/* Back Button */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 1000,
                }}
            >
                <img
                    src={BackArrowIcon}
                    alt="Back"
                    onClick={() => navigate('/student-homepage')}
                    style={{
                        width: '60px',
                        height: '60px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                    }}
                />
            </Box>

            {/* Cloud Wipe Transition */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 999,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    display: isTransitioning ? 'block' : 'none',
                }}
            >
                <Box
                    component="img"
                    src={CloudAnimation}
                    sx={{
                        position: 'absolute',
                        width: '150%',
                        height: '150%',
                        objectFit: 'cover',
                        animation: isTransitioning ? 'cloudWipe 1.2s ease-in-out forwards' : 'none',
                        '@keyframes cloudWipe': {
                            '0%': {
                                transform: 'translateX(-100%)',
                            },
                            '50%': {
                                transform: 'translateX(0%)',
                            },
                            '100%': {
                                transform: 'translateX(100%)',
                            },
                        },
                    }}
                />
            </Box>

            {/* Lesson Content */}
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <Renderer
                    lesson={lesson}
                    activityNodes={lesson.activityNodes}
                    activityNodeProgress={lesson.activityNodeProgress}
                    onSelectNode={handleSelectNode}
                    onPrevLesson={handlePrevLesson}
                    onNextLesson={handleNextLesson}
                    currentLessonIdx={currentLessonIdx}
                    totalLessons={lessons.length}
                />
            </Box>
        </Box>
    );
};

export default LessonPage;