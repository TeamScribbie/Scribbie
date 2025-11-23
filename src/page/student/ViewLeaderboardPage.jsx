import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboardSnapshot } from '../../services/challengeService';
import { Box, Typography, CircularProgress, Alert, Paper, List, ListItem, ListItemText, Divider, Button, Avatar } from '@mui/material';
import Navbar from '../../components/layout/navbar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import leaderboardBg from '../../assets/leaderboard-bg.jpg';

const ViewLeaderboardPage = () => {
    const { lessonDefinitionId } = useParams();
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!lessonDefinitionId || !authState.token) {
            setError("Missing lesson ID or authentication.");
            setLoading(false);
            return;
        }

        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getLeaderboardSnapshot(lessonDefinitionId, 100, authState.token);
                setLeaderboard(data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                setError(err.message || "Could not load the leaderboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [lessonDefinitionId, authState.token]);

    const getTrophyColor = (rank) => {
        if (rank === 0) return '#FFD700'; // Gold
        if (rank === 1) return '#C0C0C0'; // Silver
        if (rank === 2) return '#CD7F32'; // Bronze
        return 'grey';
    };
    
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundImage: `url(${leaderboardBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <Navbar className="sidebar-closed" />

            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '60px', display: 'flex', justifyContent: 'center' }}>
                <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: '800px', bgcolor: '#FFFBE0' }}>
                    <Typography variant="h4" component="h1" gutterBottom textAlign="center" fontWeight="bold">
                        🏆 Leaderboard 🏆
                    </Typography>
                    
                    {loading && <Box textAlign="center" my={4}><CircularProgress /></Box>}
                    {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                    
                    {!loading && !error && (
                        <List>
                            {leaderboard.length > 0 ? leaderboard.map((player, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <Avatar sx={{ mr: 2, bgcolor: getTrophyColor(index) }}>
                                            <EmojiEventsIcon />
                                        </Avatar>
                                        <ListItemText
                                            primary={`${index + 1}. ${player.studentName || 'Unknown Player'}`}
                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                        />
                                        {/* Use totalScore from API, with a safe fallback to score if needed */}
                                        <Typography variant="h6" color="primary">
                                            {(player.totalScore ?? player.score ?? 0).toLocaleString()}
                                        </Typography>
                                    </ListItem>
                                    {index < leaderboard.length - 1 && <Divider />}
                                </React.Fragment>
                            )) : (
                                <Typography textAlign="center" my={4}>No scores submitted yet. Be the first!</Typography>
                            )}
                        </List>
                    )}

                    <Box textAlign="center" mt={4}>
                         <Button variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ViewLeaderboardPage;