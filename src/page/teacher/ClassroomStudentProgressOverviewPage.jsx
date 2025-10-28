import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassroomCourseProgressOverview } from '../../services/progressService';
// We only need getClassroomById from this service
import { getClassroomById, removeStudentFromClassroom } from '../../services/classroomService';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Tooltip,
    Breadcrumbs, Link as MuiLink, useTheme, CssBaseline,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar,
    Card, CardContent, Grid, Avatar
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StudentProgressRow from './StudentProgressRow';
import TeacherNavbar from '../../components/layout/TeacherNavbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import '../../styles/TeacherHomepage.css';
import DeleteIcon from '@mui/icons-material/Delete';

const ClassroomStudentProgressOverviewPage = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const theme = useTheme();

    const scribbieColors = {
        primary: '#f9b121',
        primaryHover: '#FDB10D',
        secondary: '#FFD966',
        accent: '#36B8E4',
        text: '#451513',
        textSecondary: '#64748b'
    };

    const yellowAccent = {
        main: '#FFC107',
        hover: '#FFA000',
        contrastText: theme.palette.getContrastText('#FFC107'),
    };

    const brownAccent = {
        main: '#795548',
        contrastText: theme.palette.getContrastText('#795548'),
    };

    const [progressData, setProgressData] = useState([]);
    const [classroomName, setClassroomName] = useState('');
    const [classCode, setClassCode] = useState(''); // State for the class code
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [studentToRemove, setStudentToRemove] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchData = useCallback(async () => {
        if (!classroomId || !authState.token) {
            setError("Classroom ID or auth token is missing.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const classroomDetails = await getClassroomById(classroomId, authState.token);
            setClassroomName(classroomDetails.classroomName);

            // Use the correct property name from the API response
            setClassCode(classroomDetails.classroomCode);

            const overview = await getClassroomCourseProgressOverview(classroomId);
            setProgressData(Array.isArray(overview) ? overview : []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(`Failed to load data: ${err.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    }, [classroomId, authState.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleStudentClick = (student) => {
        navigate(`/teacher/classroom/${classroomId}/student/${student.studentId}/progress`, {
            state: {
                courseId: student.courseId,
                // We'll keep this as classCode for consistency within the frontend
                classCode: classCode,
                studentName: student.studentName
            }
        });
    };

    const handleOpenRemoveDialog = (student) => {
        setStudentToRemove(student);
    };

    const handleCloseRemoveDialog = () => {
        setStudentToRemove(null);
    };

    const handleConfirmRemove = async () => {
        if (!studentToRemove) return;

        setIsRemoving(true);
        try {
            await removeStudentFromClassroom(classroomId, studentToRemove.studentId, authState.token);
            setSnackbar({ open: true, message: 'Student removed successfully!', severity: 'success' });
            setProgressData(prev => prev.filter(s => s.studentId !== studentToRemove.studentId));
            handleCloseRemoveDialog();
        } catch (err) {
            setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
        } finally {
            setIsRemoving(false);
        }
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
                        <Typography color={scribbieColors.text} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Student Progress Overview</Typography>
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
                                    Student Progress Overview
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
                                    Monitor student performance and engagement in your classroom.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ color: scribbieColors.textSecondary, fontWeight: 500 }}>Classroom:</Typography>
                                        <Typography variant="body2" sx={{ color: scribbieColors.text, fontWeight: 600 }}>{classroomName}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ color: scribbieColors.textSecondary, fontWeight: 500 }}>Class Code:</Typography>
                                        <Typography variant="body2" sx={{ color: scribbieColors.text, fontWeight: 600, fontFamily: 'monospace' }}>{classCode || 'Not specified'}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Button 
                                variant="outlined" 
                                startIcon={<ArrowBackIcon />} 
                                onClick={() => navigate('/teacher-homepage')} 
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
                                Back to Home
                            </Button>
                        </Box>
                        
                        {/* Stats Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={4}>
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
                                        {progressData.length}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Total Students
                                    </Typography>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={4}>
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
                                        {progressData.reduce((total, student) => total + (student.lessonsCompleted || 0), 0)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Lessons Completed
                                    </Typography>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={4}>
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
                                        {Math.round(progressData.reduce((total, student) => total + (student.totalScore || 0), 0) / Math.max(progressData.length, 1))}%
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Average Score
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>

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
                            Student Performance
                        </Typography>
                        <Typography variant="body1" sx={{ color: scribbieColors.textSecondary, mb: 3 }}>
                            Detailed progress tracking for each student
                        </Typography>
                    </Box>
                    
                    {progressData.length === 0 ? (
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
                                No students enrolled
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                                Students will appear here once they join your classroom
                            </Typography>
                        </Box>
                    ) : (
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                overflowX: 'auto', 
                                borderRadius: 3,
                                border: '1px solid #e2e8f0'
                            }}
                        >
                        <TableContainer>
                            <Table stickyHeader aria-label="student progress table">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#fffbf5' }}>
                                        <TableCell sx={{ fontWeight: 700, color: scribbieColors.text, fontSize: '0.9rem' }}>Student</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: scribbieColors.text, fontSize: '0.9rem' }}>Lessons</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: scribbieColors.text, fontSize: '0.9rem' }}>Score</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: scribbieColors.text, fontSize: '0.9rem' }}>Time Spent</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: scribbieColors.text, fontSize: '0.9rem' }}>Details</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: scribbieColors.text, fontSize: '0.9rem' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {progressData.map((studentProgress) => (
                                        <StudentProgressRow
                                            key={studentProgress.studentId}
                                            {...studentProgress}
                                            onViewDetails={() => handleStudentClick(studentProgress)}
                                            scribbieColors={scribbieColors}
                                            onRemove={() => handleOpenRemoveDialog(studentProgress)}
                                            sx={{
                                                '&:hover': { backgroundColor: '#fffbf5' }, 
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

            <Dialog 
                open={!!studentToRemove} 
                onClose={handleCloseRemoveDialog}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: '1px solid #e2e8f0'
                    }
                }}
            >
                <DialogTitle sx={{ color: scribbieColors.text, fontWeight: 600 }}>
                    Remove Student from Classroom?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: scribbieColors.textSecondary }}>
                        Are you sure you want to remove <strong style={{ color: scribbieColors.text }}>{studentToRemove?.studentName}</strong> from this classroom? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button 
                        onClick={handleCloseRemoveDialog} 
                        disabled={isRemoving}
                        sx={{
                            color: scribbieColors.textSecondary,
                            '&:hover': {
                                backgroundColor: '#f1f5f9'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmRemove} 
                        variant="contained"
                        autoFocus 
                        disabled={isRemoving}
                        sx={{
                            backgroundColor: '#ef4444',
                            '&:hover': {
                                backgroundColor: '#dc2626'
                            }
                        }}
                    >
                        {isRemoving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Remove Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ClassroomStudentProgressOverviewPage;