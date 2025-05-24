import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassroomCourseProgressOverview } from '../../services/progressService';
import { getClassroomById, removeStudentFromClassroom } from '../../services/classroomService';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Tooltip,
    Breadcrumbs, Link as MuiLink, useTheme, CssBaseline,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, IconButton
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// highlight-start
// Import the component from its own file
import StudentProgressRow from './StudentProgressRow';
// highlight-end
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import '../../styles/TeacherHomepage.css';
import DeleteIcon from '@mui/icons-material/Delete';

const ClassroomStudentProgressOverviewPage = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const theme = useTheme();

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
    const [courseName, setCourseName] = useState('');
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
            setCourseName(classroomDetails.assignedCourse?.courseName || 'N/A');

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
                courseName: courseName,
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
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default, minHeight: 'calc(100vh - 64px)'}}>
                    {/* Breadcrumbs and Header */}
                    {/* ... (This part remains the same) ... */}
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2.5 }}>
                        <MuiLink component="button" onClick={() => navigate('/teacher-homepage')} sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: yellowAccent.main }}}>
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Teacher Home
                        </MuiLink>
                        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>Student Progress Overview</Typography>
                    </Breadcrumbs>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, mt: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: brownAccent.main }}>
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
                            <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher-homepage')} sx={{ backgroundColor: yellowAccent.main, color: yellowAccent.contrastText, '&:hover': { backgroundColor: yellowAccent.hover }, mt: { xs: 1, sm: 0 }, fontWeight: 500 }}>
                                Back to Home
                            </Button>
                        </Tooltip>
                    </Box>
                    {/* End Breadcrumbs and Header */}

                    <Paper elevation={2} sx={{ mt: 2, overflowX: 'auto', borderRadius: 2 }}>
                        <TableContainer>
                            <Table stickyHeader aria-label="student progress table">
                                <TableHead>
                                    <TableRow sx={{"& th": {backgroundColor: brownAccent.main, color: brownAccent.contrastText, fontWeight: '600', py: 1.2, fontSize: '0.875rem', borderBottom: `1px solid ${theme.palette.grey[400]}`}}}>
                                        <TableCell>Student Name</TableCell>
                                        <TableCell align="center">Lessons Completed</TableCell>
                                        <TableCell align="center">Avg. Score (%)</TableCell>
                                        <TableCell align="center">Total Time Spent</TableCell>
                                        <TableCell align="center">View Details</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {progressData.map((studentProgress) => (
                                        <StudentProgressRow
                                            key={studentProgress.studentId}
                                            {...studentProgress}
                                            onViewDetails={() => handleStudentClick(studentProgress)}
                                            yellowAccent={yellowAccent}
                                            onRemove={() => handleOpenRemoveDialog(studentProgress)}
                                            sx={{'&:hover': {backgroundColor: theme.palette.action.hover}, '&:last-child td, &:last-child th': { border: 0 }}}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </div>

            <Dialog open={!!studentToRemove} onClose={handleCloseRemoveDialog}>
                <DialogTitle>{"Remove Student from Classroom?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove <strong>{studentToRemove?.studentName}</strong> from this classroom? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRemoveDialog} disabled={isRemoving}>Cancel</Button>
                    <Button onClick={handleConfirmRemove} color="error" autoFocus disabled={isRemoving}>
                        {isRemoving ? <CircularProgress size={24} /> : 'Remove'}
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