import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, Avatar, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboardByLessonDef } from '../../services/challengeService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Navbar from '../../components/layout/navbar';
import StudentSidebar from '../../components/layout/StudentSidebar';
import '../../styles/StudentHomepage.css';

const ViewLeaderboardPage = () => {
    const { lessonDefinitionId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!lessonDefinitionId || !authState.token) {
                setError('Missing required data to fetch leaderboard.');
                setLoading(false);
                return;
            }

            try {
                const data = await getLeaderboardByLessonDef(lessonDefinitionId, authState.token);
                setLeaderboardData(data);
            } catch (err) {
                setError(err.message || 'Failed to load leaderboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [lessonDefinitionId, authState.token]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="student-homepage-container">
                <div className={`student-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                    <StudentSidebar isOpen={sidebarOpen} />
                </div>
                <div className={`student-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: 'calc(100vh - 64px)',
                        p: 3
                    }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Loading Leaderboard...</Typography>
                    </Box>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-homepage-container">
                <div className={`student-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                    <StudentSidebar isOpen={sidebarOpen} />
                </div>
                <div className={`student-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                    <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <Box sx={{ p: 3 }}>
                        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
                            {error}
                            <Button 
                                onClick={handleBack}
                                sx={{ mt: 2, display: 'block' }}
                            >
                                Go Back
                            </Button>
                        </Alert>
                    </Box>
                </div>
            </div>
        );
    }

    return (
        <div className="student-homepage-container">
            <div className={`student-sidebar ${sidebarOpen ? '' : 'closed'}`}>
                <StudentSidebar isOpen={sidebarOpen} />
            </div>
            <div className={`student-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Box className="student-main-content">
                    <Container maxWidth="md" sx={{ pt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Button
                                onClick={handleBack}
                                startIcon={<ArrowBackIcon />}
                                sx={{ color: '#451513' }}
                            >
                                Back
                            </Button>
                        </Box>

                        <Typography 
                            variant="h4" 
                            sx={{ 
                                textAlign: 'center', 
                                mb: 4, 
                                color: '#451513',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2
                            }}
                        >
                            <EmojiEventsIcon sx={{ fontSize: 40 }} />
                            Challenge Leaderboard
                        </Typography>
                        
                        {leaderboardData.map((entry, index) => (
                            <Paper
                                key={entry.studentId}
                                elevation={3}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: index < 3 ? 'rgba(255, 217, 102, 0.3)' : 'white',
                                    border: index < 3 ? '2px solid #FFD966' : 'none',
                                }}
                            >
                                <Typography 
                                    sx={{ 
                                        minWidth: 40, 
                                        fontWeight: 'bold',
                                        color: index < 3 ? '#FF6D00' : '#451513'
                                    }}
                                >
                                    #{index + 1}
                                </Typography>
                                <Avatar 
                                    sx={{ 
                                        bgcolor: index < 3 ? '#FF6D00' : '#451513',
                                        mx: 2
                                    }}
                                >
                                    {entry.studentName?.charAt(0) || '?'}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 'bold' }}>
                                        {entry.studentName || 'Anonymous'}
                                    </Typography>                            <Typography variant="body2" color="text.secondary">
                                        Score: {entry.totalScore.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <WhatshotIcon sx={{ color: '#FF6D00' }} />
                                    <Typography sx={{ color: '#FF6D00', fontWeight: 'bold' }}>
                                        {entry.highestStreak}x
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}

                        {leaderboardData.length === 0 && (
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                                }}
                            >
                                <Typography color="text.secondary">
                                    No scores recorded yet. Be the first to complete this challenge!
                                </Typography>
                            </Paper>
                        )}
                    </Container>
                </Box>
            </div>
        </div>
    );
};

export default ViewLeaderboardPage;
