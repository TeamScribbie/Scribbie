// AI Context/Frontend/page/teacher/ManageAdminsPage.jsx_new
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    CircularProgress,
    Alert,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Switch,
    Tooltip,
    Card,
    Avatar,
    Snackbar
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import TeacherNavbar from '../../components/layout/TeacherNavbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import { getAllTeachers, assignRoleToTeacher, revokeRoleFromTeacher } from '../../services/teacherServices'; // Fixed service name
import '../../styles/TeacherHomepage.css'; // Reusing for consistent styling

const ManageAdminsPage = () => {
    const { authState } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [processingTeacherId, setProcessingTeacherId] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    const fetchTeachers = useCallback(async () => {
        if (!authState.token) return;
        setIsLoading(true);
        setError(null);
        try {
            const fetchedTeachers = await getAllTeachers(authState.token);
            setTeachers(fetchedTeachers.map(teacher => ({
                ...teacher,
                isAdmin: teacher.userRoles.includes('ROLE_ADMIN')
            })));
        } catch (err) {
            setError(err.message || "Could not fetch teachers.");
            setTeachers([]);
        } finally {
            setIsLoading(false);
        }
    }, [authState.token]);

    useEffect(() => {
        if (authState.isAuthenticated && authState.user?.roles?.includes("ROLE_SUPERADMIN")) {
            fetchTeachers();
        }
    }, [authState.isAuthenticated, authState.user?.roles, fetchTeachers]);

    const handleRoleChange = async (teacherId, currentIsAdmin) => {
        if (!authState.token) {
            setError("Authentication error.");
            return;
        }
        setProcessingTeacherId(teacherId);
        setError(null);

        try {
            let updatedTeacher;
            if (currentIsAdmin) { // If they are currently an admin, revoke ROLE_ADMIN
                console.log(`Attempting to revoke ROLE_ADMIN from ${teacherId}`);
                updatedTeacher = await revokeRoleFromTeacher(teacherId, 'ROLE_ADMIN', authState.token);
            } else { // If they are not an admin, assign ROLE_ADMIN
                console.log(`Attempting to assign ROLE_ADMIN to ${teacherId}`);
                updatedTeacher = await assignRoleToTeacher(teacherId, 'ROLE_ADMIN', authState.token);
            }
            // Update the local state for the specific teacher
            setTeachers(prevTeachers =>
                prevTeachers.map(t =>
                    t.teacherId === teacherId
                        ? { ...updatedTeacher, isAdmin: updatedTeacher.userRoles.includes('ROLE_ADMIN') }
                        : t
                )
            );
            const action = currentIsAdmin ? 'revoked admin access from' : 'granted admin access to';
            const teacherName = teachers.find(t => t.teacherId === teacherId)?.name || 'teacher';
            showNotification(`Successfully ${action} ${teacherName}`, 'success');
        } catch (err) {
            console.error("Failed to update role:", err);
            setError(err.message || "Failed to update role.");
            // Optionally, refetch all teachers to ensure UI consistency on error
            // fetchTeachers(); 
        } finally {
            setProcessingTeacherId(null);
        }
    };
    
    const isSuperAdmin = (teacher) => teacher.userRoles.includes('ROLE_SUPERADMIN');
    
    const showNotification = (message, severity = 'info') => {
        setNotification({ open: true, message, severity });
    };
    
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <Box className="teacher-homepage-container"> {/* MUI Box can take className */}
            {/*// highlight-start*/}
            {/* Wrap TeacherSidebar in a Box with the correct classes */}
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageAdmins" />
            </Box>
            {/*// highlight-end*/}

            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <TeacherNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="teacher-main-content">
                    {/* Modern Header Section */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ mb: 4 }}>
                            <Typography 
                                variant="h3" 
                                sx={{ 
                                    mb: 1, 
                                    fontWeight: 700, 
                                    color: '#1a1a1a',
                                    fontSize: { xs: '1.8rem', md: '2.5rem' }
                                }}
                            >
                                Admin Management
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    color: '#64748b', 
                                    fontWeight: 400,
                                    fontSize: '1.1rem',
                                    maxWidth: '600px'
                                }}
                            >
                                Manage administrative roles and permissions for teachers in your organization.
                            </Typography>
                        </Box>
                        
                        {/* Stats Cards */}
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                            <Card 
                                elevation={0}
                                sx={{ 
                                    p: 3, 
                                    background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                                    color: '#451513',
                                    borderRadius: 3,
                                    minWidth: 200
                                }}
                            >
                                <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                    {teachers.length}
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                    Total Teachers
                                </Typography>
                            </Card>
                            
                            <Card 
                                elevation={0}
                                sx={{ 
                                    p: 3, 
                                    background: 'linear-gradient(135deg, #36B8E4 0%, #4FACFE 100%)',
                                    color: 'white',
                                    borderRadius: 3,
                                    minWidth: 200
                                }}
                            >
                                <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, fontSize: '2.5rem' }}>
                                    {teachers.filter(t => t.isAdmin).length}
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                    Active Admins
                                </Typography>
                            </Card>
                        </Box>
                    </Box>

                    {isLoading && <CircularProgress />}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {!isLoading && !error && (
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
                                    Teacher Roles
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                                    Grant or revoke administrative privileges for teachers
                                </Typography>
                            </Box>
                            
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    width: '100%', 
                                    overflow: 'hidden', 
                                    borderRadius: 3,
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                                    <Table stickyHeader aria-label="manage admins table">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#fffbf5' }}>
                                                <TableCell sx={{ fontWeight: 700, color: '#451513', fontSize: '0.9rem' }}>Teacher</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#451513', fontSize: '0.9rem' }}>ID</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#451513', fontSize: '0.9rem' }}>Email</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#451513', fontSize: '0.9rem' }}>Roles</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700, color: '#451513', fontSize: '0.9rem' }}>Admin Access</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {teachers.map((teacher) => (
                                                <TableRow 
                                                    hover 
                                                    key={teacher.teacherId}
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: '#fffbf5'
                                                        }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar 
                                                                sx={{ 
                                                                    width: 40, 
                                                                    height: 40,
                                                                    background: 'linear-gradient(135deg, #f9b121 0%, #FFD966 100%)',
                                                                    color: '#451513',
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {teacher.name.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                                    {teacher.name}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                                                            {teacher.teacherId}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                            {teacher.email}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            {teacher.userRoles?.map(role => (
                                                                <Chip
                                                                    key={role}
                                                                    label={role.replace('ROLE_', '')}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem',
                                                                        ...(role === 'ROLE_SUPERADMIN' && {
                                                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                                            color: 'white'
                                                                        }),
                                                                        ...(role === 'ROLE_ADMIN' && {
                                                                            background: 'linear-gradient(135deg, #36B8E4 0%, #4FACFE 100%)',
                                                                            color: 'white'
                                                                        }),
                                                                        ...(role === 'ROLE_TEACHER' && {
                                                                            background: 'linear-gradient(135deg, #FFE8A3 0%, #FFEDB6 100%)',
                                                                            color: '#451513'
                                                                        })
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                            {isSuperAdmin(teacher) ? (
                                                                <Tooltip title="Superadmin role cannot be changed here.">
                                                                    <span>
                                                                        <Switch
                                                                            checked={teacher.isAdmin}
                                                                            disabled={true}
                                                                            sx={{
                                                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                                                    color: '#f9b121'
                                                                                },
                                                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                                    backgroundColor: '#FFD966'
                                                                                }
                                                                            }}
                                                                        />
                                                                    </span>
                                                                </Tooltip>
                                                            ) : (
                                                                <Switch
                                                                    checked={teacher.isAdmin}
                                                                    onChange={() => handleRoleChange(teacher.teacherId, teacher.isAdmin)}
                                                                    disabled={processingTeacherId === teacher.teacherId}
                                                                    sx={{
                                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                                            color: '#f9b121'
                                                                        },
                                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                            backgroundColor: '#FFD966'
                                                                        }
                                                                    }}
                                                                    inputProps={{ 'aria-label': `toggle admin status for ${teacher.name}` }}
                                                                />
                                                            )}
                                                            {processingTeacherId === teacher.teacherId && (
                                                                <CircularProgress size={20} sx={{ color: '#f9b121' }} />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {teachers.length === 0 && !isLoading && (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                                            No teachers found
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                            There are no teachers in the system to manage
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Box>
            
            {/* Notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageAdminsPage;