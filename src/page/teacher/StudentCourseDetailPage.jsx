import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Button, Paper,
    Breadcrumbs, Link as MuiLink, useTheme, CssBaseline
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getStudentDetailedLessonProgress } from "../../services/progressService"; //
import LessonProgressDisplayCard from './LessonProgressDisplayCard'; //
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import '../../styles/TeacherHomepage.css';

const StudentCourseDetailPage = () => {
    const { classroomId, studentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();

    const yellowAccent = {
        main: '#FFC107',
        hover: '#FFA000',
        contrastText: theme.palette.getContrastText('#FFC107'),
    };

    const courseIdFromState = location.state?.courseId;
    const courseNameFromState = location.state?.courseName;
    const studentNameFromState = location.state?.studentName;

    const [detailedProgress, setDetailedProgress] = useState([]);
    const [studentName, setStudentName] = useState(studentNameFromState || (studentId ? `Student ID: ${studentId}` : 'N/A'));
    const [courseName, setCourseName] = useState(courseNameFromState || (courseIdFromState ? `Course ID: ${courseIdFromState}` : 'N/A'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const fetchData = useCallback(async () => {
        // --- LOG: Input IDs for fetching data ---
        console.log(`[StudentCourseDetailPage] Fetching data for studentId: ${studentId}, courseId: ${courseIdFromState}`);

        if (!studentId || !courseIdFromState) {
            setError("Student ID or Course ID is missing. Cannot load details.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const progress = await getStudentDetailedLessonProgress(studentId, courseIdFromState); //
            // --- LOG: Raw progress data from API ---
            console.log('[StudentCourseDetailPage] Raw progress data from API:', JSON.parse(JSON.stringify(progress)));
            setDetailedProgress(Array.isArray(progress) ? progress : []);
        } catch (err) {
            setError(err.message || 'Failed to load detailed progress. Please try again.');
            console.error("[StudentCourseDetailPage] Error fetching detailed progress:", err);
        } finally {
            setLoading(false);
        }
    }, [studentId, courseIdFromState]); // Added courseIdFromState to dependency array for correctness

    useEffect(() => {
        if (studentNameFromState) setStudentName(studentNameFromState);
        if (courseNameFromState) setCourseName(courseNameFromState);

        if (studentId && courseIdFromState) {
            fetchData();
        } else {
            // --- LOG: Missing IDs in useEffect ---
            console.warn(`[StudentCourseDetailPage] Missing studentId (${studentId}) or courseIdFromState (${courseIdFromState}) in useEffect. Not fetching.`);
            setError("Required information (student ID or course ID) not available from navigation state or URL.");
            setLoading(false);
        }
    }, [fetchData, studentId, courseIdFromState, studentNameFromState, courseNameFromState]);


    // --- LOG: Current detailedProgress state before rendering ---
    useEffect(() => {
        if (!loading) { // Log only after initial load attempt
            console.log('[StudentCourseDetailPage] Current detailedProgress state:', JSON.parse(JSON.stringify(detailedProgress)));
        }
    }, [detailedProgress, loading]);


    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }} color="text.secondary">Loading Detailed Lesson Progress...</Typography>
            </Box>
        );
    }

    return (
        <div className="teacher-homepage-container">
            <CssBaseline />
            <div className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="Classes" />
            </div>

            <div className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default, minHeight: 'calc(100vh - 64px)' }}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2.5 }}>
                        <MuiLink component="button" onClick={() => navigate('/teacher/home')} sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: yellowAccent.main } }}>
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Teacher Home
                        </MuiLink>
                        {classroomId && (
                            <MuiLink component="button" onClick={() => navigate(`/teacher/classroom/${classroomId}/progress`)} sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: yellowAccent.main } }}>
                                <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                                Student Progress
                            </MuiLink>
                        )}
                        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>Lesson Details</Typography>
                    </Breadcrumbs>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, mt: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#795548' }}>
                                Lesson Progress Details
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.4 }}>
                                Student: {studentName}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.4 }}>
                                Course: {courseName}
                            </Typography>
                        </Box>
                        {classroomId && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(`/teacher/classroom/${classroomId}/progress`)}
                                sx={{
                                    backgroundColor: yellowAccent.main,
                                    color: yellowAccent.contrastText,
                                    '&:hover': { backgroundColor: yellowAccent.hover, },
                                    mt: { xs: 1, sm: 0 }, fontWeight: 500
                                }}
                            >
                                Back to Overview
                            </Button>
                        )}
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 3 }} variant="outlined">{error.trim()}</Alert>
                    )}

                    {!loading && detailedProgress.length === 0 && !error && (
                        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', mt: 3, backgroundColor: 'transparent', border: `1px dashed ${theme.palette.divider}` }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>No Lesson Data Found</Typography>
                            <Typography variant="body2" color="text.secondary" >
                                No detailed lesson progress is available for this student in this course.
                            </Typography>
                        </Paper>
                    )}

                    {!loading && detailedProgress.length > 0 && (
                        <Box sx={{ '& > .MuiPaper-root': { mb: 2 } }}>
                            {detailedProgress.map((lessonProgress, index) => {
                                // --- LOG: Data being passed to each LessonProgressDisplayCard ---
                                console.log(`[StudentCourseDetailPage] Passing to LessonProgressDisplayCard (index ${index}):`, {
                                    lessonTitle: lessonProgress.lessonTitle || `Lesson ID: ${lessonProgress.lessonDefinitionId}`,
                                    lessonStatus: lessonProgress.status,
                                    lessonScore: lessonProgress.score,
                                    lessonTimeSpent: lessonProgress.timeSpent,
                                    activityNodeProgressesList: JSON.parse(JSON.stringify(lessonProgress.activityNodeProgresses || []))
                                });
                                return (
                                    <LessonProgressDisplayCard
                                        key={lessonProgress.lessonProgressId || lessonProgress.lessonDefinitionId || index}
                                        lessonTitle={lessonProgress.lessonTitle || `Lesson ID: ${lessonProgress.lessonDefinitionId}`}
                                        lessonStatus={lessonProgress.status}
                                        lessonScore={lessonProgress.score}
                                        lessonTimeSpent={lessonProgress.timeSpent}
                                        activityNodeProgressesList={lessonProgress.activityNodeProgresses || []}
                                    />
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </div>
        </div>
    );
};

export default StudentCourseDetailPage;