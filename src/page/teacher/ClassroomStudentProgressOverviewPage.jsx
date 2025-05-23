import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassroomCourseProgressOverview } from '../../services/progressService';
import { getClassroomById } from '../../services/classroomService';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Tooltip,
    Breadcrumbs, Link as MuiLink, useTheme, CssBaseline
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StudentProgressRow from './StudentProgressRow';
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import '../../styles/TeacherHomepage.css';

const ClassroomStudentProgressOverviewPage = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const theme = useTheme();

    // Define desired yellow color (consistent with StudentCourseDetailPage)
    const yellowAccent = {
        main: '#FFC107', // Amber/yellow
        hover: '#FFA000', // Darker shade for hover
        contrastText: theme.palette.getContrastText('#FFC107'),
    };

    // --- NEW: Define brown color ---
    const brownAccent = {
        main: '#795548', // A common brown color (Material Design Brown 500)
        contrastText: theme.palette.getContrastText('#795548'), // Auto-detects best contrast (black or white)
    };

    const [progressData, setProgressData] = useState([]);
    const [classroomName, setClassroomName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const fetchData = useCallback(async () => {
        // ... (fetchData logic remains the same)
        if (!classroomId) {
            setError("Classroom ID is missing.");
            setLoading(false);
            return;
        }
        if (!authState.token) {
            setError("Authentication token not found. Please log in again.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        let currentClassroomName = `Classroom ${classroomId}`;
        let currentCourseName = 'N/A';

        try {
            try {
                const classroomDetails = await getClassroomById(classroomId, authState.token);
                currentClassroomName = classroomDetails.classroomName || currentClassroomName;
                if (classroomDetails.assignedCourse) {
                    currentCourseName = classroomDetails.assignedCourse.courseName || currentCourseName;
                }
            } catch (classroomError) {
                console.error("Failed to fetch classroom details:", classroomError);
                setError(prev => prev ? `${prev}\nFailed to load classroom details: ${classroomError.message}` : `Failed to load classroom details: ${classroomError.message}`);
            }
            setClassroomName(currentClassroomName);

            const overview = await getClassroomCourseProgressOverview(classroomId);
            setProgressData(Array.isArray(overview) ? overview : []);
            if (Array.isArray(overview) && overview.length > 0 && overview[0].courseName) {
                setCourseName(overview[0].courseName);
            } else if (currentCourseName !== 'N/A') {
                setCourseName(currentCourseName);
            }
        } catch (err) {
            console.error("Error fetching progress data:", err);
            setError(prev => prev ? `${prev}\nFailed to load progress data: ${err.message || 'Please try again.'}` : `Failed to load progress data: ${err.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    }, [classroomId, authState.token]);

    useEffect(() => {
        if (authState.token && classroomId) {
            fetchData();
        } else if (!classroomId) {
            setError("Classroom ID is missing in URL.");
            setLoading(false);
        } else if (!authState.token) {
            setError("Authentication required to view this page.");
            setLoading(false);
        }
    }, [fetchData, authState.token, classroomId]);

    const handleStudentClick = (student) => {
        navigate(`/teacher/classroom/${classroomId}/student/${student.studentId}/progress`, {
            state: {
                courseId: student.courseId,
                courseName: courseName,
                studentName: student.studentName
            }
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }} color="text.secondary">Loading Student Progress...</Typography>
            </Box>
        );
    }

    return (
        <div className="teacher-homepage-container">
            <CssBaseline />
            <div className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="Classes"/>
            </div>

            <div className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default, minHeight: 'calc(100vh - 64px)'}}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2.5 }}>
                        <MuiLink
                            component="button"
                            onClick={() => navigate('/teacher-homepage')}
                            sx={{
                                display: 'flex', alignItems: 'center', color: 'text.secondary',
                                fontSize: '0.875rem', textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline', color: yellowAccent.main }
                            }}
                        >
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Teacher Home
                        </MuiLink>
                        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>Student Progress Overview</Typography>
                    </Breadcrumbs>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, mt: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography
                                variant="h4" component="h1" gutterBottom
                                sx={{
                                    fontWeight: 'bold',
                                    color: brownAccent.main // MODIFIED: Title color to brown
                                }}
                            >
                                Student Progress Overview
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.4 }}>
                                Classroom: {classroomName}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.4 }}>
                                Course: {courseName || 'Not specified'}
                            </Typography>
                        </Box>
                        <Tooltip title="Back to Teacher Homepage">
                            <Button
                                variant="contained"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/teacher-homepage')}
                                sx={{
                                    backgroundColor: yellowAccent.main,
                                    color: yellowAccent.contrastText,
                                    '&:hover': { backgroundColor: yellowAccent.hover },
                                    mt: { xs: 1, sm: 0 }, fontWeight: 500
                                }}
                            >
                                Back to Home
                            </Button>
                        </Tooltip>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 3 }} variant="outlined">{error.trim()}</Alert>
                    )}

                    {!loading && progressData.length === 0 && !error.includes("Failed to load progress data") && (
                        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', mt: 3, backgroundColor: 'transparent', border: `1px dashed ${theme.palette.divider}` }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>No Progress Data Found</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Currently, there's no student progress data available for this course.
                            </Typography>
                        </Paper>
                    )}

                    {!loading && progressData.length > 0 && (
                        <Paper elevation={2} sx={{ mt: 2, overflowX: 'auto', borderRadius: 2 }}>
                            <TableContainer>
                                <Table stickyHeader aria-label="student progress table">
                                    <TableHead>
                                        <TableRow sx={{
                                            "& th": {
                                                backgroundColor: brownAccent.main, // MODIFIED: Table header background to brown
                                                color: brownAccent.contrastText, // MODIFIED: Table header text color for contrast
                                                fontWeight: '600',
                                                py: 1.2,
                                                fontSize: '0.875rem',
                                                // Optional: if you want a border matching the brown
                                                // borderBottom: `1px solid ${theme.palette.augmentColor({ color: { main: brownAccent.main } }).dark}`
                                                borderBottom: `1px solid ${theme.palette.grey[400]}` // A neutral border
                                            },
                                        }}>
                                            <TableCell>Student Name</TableCell>
                                            <TableCell align="center">Lessons Completed</TableCell>
                                            <TableCell align="center">Avg. Score (%)</TableCell>
                                            <TableCell align="center">Total Time Spent</TableCell>
                                            <TableCell align="center">View Details</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {progressData.map((studentProgress, index) => (
                                            <StudentProgressRow
                                                key={studentProgress.studentId || index}
                                                studentId={studentProgress.studentId}
                                                studentName={studentProgress.studentName}
                                                completedLessons={studentProgress.completedLessons}
                                                totalLessonsInCourse={studentProgress.totalLessons}
                                                averageScore={studentProgress.overallScore}
                                                totalTimeSpent={studentProgress.totalTimeSpent}
                                                onViewDetails={() => handleStudentClick(studentProgress)}
                                                yellowAccent={yellowAccent} // Pass yellow for the "Details" button
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.action.hover
                                                    },
                                                    '&:last-child td, &:last-child th': { border: 0 }
                                                }}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </Box>
            </div>
        </div>
    );
};

export default ClassroomStudentProgressOverviewPage;