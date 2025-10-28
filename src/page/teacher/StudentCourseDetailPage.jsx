import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Button, Paper,
    Breadcrumbs, Link as MuiLink, useTheme, CssBaseline, Card, Grid
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getStudentDetailedLessonProgress } from "../../services/progressService"; //
import LessonProgressDisplayCard from './LessonProgressDisplayCard'; //
import TeacherNavbar from '../../components/layout/TeacherNavbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import '../../styles/TeacherHomepage.css';

const StudentCourseDetailPage = () => {
    const { classroomId, studentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();

    const scribbieColors = {
        primary: '#f9b121',
        primaryHover: '#FDB10D',
        secondary: '#FFD966',
        accent: '#36B8E4',
        text: '#451513',
        textSecondary: '#64748b'
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
                <TeacherNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#fafbfc', minHeight: 'calc(100vh - 64px)', mt: '80px' }}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 4 }}>
                        <MuiLink 
                            component="button" 
                            onClick={() => navigate('/teacher-homepage')} 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                color: scribbieColors.textSecondary, 
                                fontSize: '0.875rem', 
                                textDecoration: 'none', 
                                '&:hover': { 
                                    textDecoration: 'underline', 
                                    color: scribbieColors.primary 
                                } 
                            }}
                        >
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Teacher Home
                        </MuiLink>
                        {classroomId && (
                            <MuiLink 
                                component="button" 
                                onClick={() => navigate(`/teacher/classroom/${classroomId}/progress`)} 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: scribbieColors.textSecondary, 
                                    fontSize: '0.875rem', 
                                    textDecoration: 'none', 
                                    '&:hover': { 
                                        textDecoration: 'underline', 
                                        color: scribbieColors.primary 
                                    } 
                                }}
                            >
                                <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                                Student Progress
                            </MuiLink>
                        )}
                        <Typography color={scribbieColors.text} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Lesson Details</Typography>
                    </Breadcrumbs>

                    {/* Modern Header Section */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography 
                                    variant="h3" 
                                    component="h1" 
                                    sx={{ 
                                        mb: 1, 
                                        fontWeight: 700, 
                                        color: '#1a1a1a',
                                        fontSize: { xs: '1.8rem', md: '2.5rem' }
                                    }}
                                >
                                    Lesson Progress Details
                                </Typography>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: scribbieColors.textSecondary, 
                                        fontWeight: 400,
                                        fontSize: '1.1rem',
                                        mb: 0.5
                                    }}
                                >
                                    Detailed breakdown of student performance across lessons and activities.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ color: scribbieColors.textSecondary, fontWeight: 500 }}>Student:</Typography>
                                        <Typography variant="body2" sx={{ color: scribbieColors.text, fontWeight: 600 }}>{studentName}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ color: scribbieColors.textSecondary, fontWeight: 500 }}>Course:</Typography>
                                        <Typography variant="body2" sx={{ color: scribbieColors.text, fontWeight: 600 }}>{courseName}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            {classroomId && (
                                <Button
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon />}
                                    onClick={() => navigate(`/teacher/classroom/${classroomId}/progress`)}
                                    sx={{
                                        color: scribbieColors.textSecondary,
                                        borderColor: '#e2e8f0',
                                        '&:hover': {
                                            borderColor: scribbieColors.primary,
                                            backgroundColor: '#fffbf5',
                                            color: scribbieColors.primary
                                        },
                                        mt: { xs: 2, sm: 0 }, 
                                        fontWeight: 500,
                                        textTransform: 'none'
                                    }}
                                >
                                    Back to Overview
                                </Button>
                            )}
                        </Box>
                        
                        {/* Stats Summary */}
                        {!loading && detailedProgress.length > 0 && (
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card 
                                        elevation={0}
                                        sx={{ 
                                            p: 3, 
                                            background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                                            color: scribbieColors.text,
                                            borderRadius: 3
                                        }}
                                    >
                                        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                            {detailedProgress.length}
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                            Total Lessons
                                        </Typography>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card 
                                        elevation={0}
                                        sx={{ 
                                            p: 3, 
                                            background: 'linear-gradient(135deg, #36B8E4 0%, #4FACFE 100%)',
                                            color: 'white',
                                            borderRadius: 3
                                        }}
                                    >
                                        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                            {detailedProgress.filter(lesson => lesson.status === 'COMPLETED').length}
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                            Completed
                                        </Typography>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card 
                                        elevation={0}
                                        sx={{ 
                                            p: 3, 
                                            background: 'linear-gradient(135deg, #FFE8A3 0%, #FFEDB6 100%)',
                                            color: scribbieColors.text,
                                            borderRadius: 3
                                        }}
                                    >
                                        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                            {Math.round(detailedProgress.reduce((total, lesson) => total + (lesson.score || 0), 0) / Math.max(detailedProgress.length, 1))}%
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                            Average Score
                                        </Typography>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card 
                                        elevation={0}
                                        sx={{ 
                                            p: 3, 
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            borderRadius: 3
                                        }}
                                    >
                                        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                            {Math.round(detailedProgress.reduce((total, lesson) => total + (lesson.timeSpent || 0), 0) / 60)}m
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                            Total Time
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 3 }} variant="outlined">{error.trim()}</Alert>
                    )}

                    {!loading && detailedProgress.length === 0 && !error && (
                        <Box 
                            sx={{ 
                                textAlign: 'center', 
                                py: 8,
                                px: 4,
                                backgroundColor: '#fffbf5',
                                borderRadius: 3,
                                border: '1px solid #FFE8A3'
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 600, color: scribbieColors.textSecondary, mb: 2 }}>
                                No lesson data found
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                                No detailed lesson progress is available for this student in this course.
                            </Typography>
                        </Box>
                    )}

                    {!loading && detailedProgress.length > 0 && (
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 700, 
                                        color: '#1a1a1a', 
                                        mb: 1,
                                        fontSize: { xs: '1.5rem', md: '2rem' }
                                    }}
                                >
                                    Lesson Breakdown
                                </Typography>
                                <Typography variant="body1" sx={{ color: scribbieColors.textSecondary, mb: 3 }}>
                                    Detailed progress for each lesson and activity
                                </Typography>
                            </Box>
                            
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
                        </Box>
                    )}
                </Box>
            </div>
        </div>
    );
};

export default StudentCourseDetailPage;