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
    Switch, // Using Switch for a toggle-like feel
    Tooltip
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/navbar';
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

    return (
        <Box className="teacher-homepage-container"> {/* MUI Box can take className */}
            {/*// highlight-start*/}
            {/* Wrap TeacherSidebar in a Box with the correct classes */}
            <Box className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <TeacherSidebar isOpen={sidebarOpen} activeItem="ManageAdmins" />
            </Box>
            {/*// highlight-end*/}

            <Box className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="teacher-main-content">
                    <Typography variant="h5" className="main-content-heading">Manage Admin Roles</Typography>

                    {isLoading && <CircularProgress />}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {!isLoading && !error && (
                        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
                            <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                                <Table stickyHeader aria-label="manage admins table">
                                    <TableHead sx={{ backgroundColor: '#FFE8A3' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Name</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Teacher ID</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Email</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Current Roles</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#451513' }}>Is Admin?</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {teachers.map((teacher) => (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={teacher.teacherId}>
                                                <TableCell>{teacher.name}</TableCell>
                                                <TableCell>{teacher.teacherId}</TableCell>
                                                <TableCell>{teacher.email}</TableCell>
                                                <TableCell>
                                                    {teacher.userRoles?.map(role => (
                                                        <Chip
                                                            key={role}
                                                            label={role.replace('ROLE_', '')}
                                                            size="small"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                            color={
                                                                role === 'ROLE_SUPERADMIN' ? 'secondary' :
                                                                role === 'ROLE_ADMIN' ? 'primary' : 'default'
                                                            }
                                                        />
                                                    ))}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {isSuperAdmin(teacher) ? (
                                                         <Tooltip title="Superadmin role cannot be changed here.">
                                                            <span>
                                                                <Switch
                                                                    checked={teacher.isAdmin}
                                                                    disabled={true}
                                                                    color="primary"
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        <Switch
                                                            checked={teacher.isAdmin}
                                                            onChange={() => handleRoleChange(teacher.teacherId, teacher.isAdmin)}
                                                            disabled={processingTeacherId === teacher.teacherId}
                                                            color="primary"
                                                            inputProps={{ 'aria-label': `toggle admin status for ${teacher.name}` }}
                                                        />
                                                    )}
                                                    {processingTeacherId === teacher.teacherId && <CircularProgress size={20} sx={{ml: 1}}/>}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                             {teachers.length === 0 && !isLoading && (
                                <Typography sx={{ p: 2, textAlign: 'center' }}>No teachers found.</Typography>
                            )}
                        </Paper>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ManageAdminsPage;