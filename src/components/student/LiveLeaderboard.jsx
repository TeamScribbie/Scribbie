import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext'; // To get current student's name
import { getLeaderboardSnapshot } from '../../services/challengeService'; // Service to fetch snapshot

const LiveLeaderboard = ({ lessonDefinitionId, currentPlayerLocalScore, onInitialLoadError }) => {
    const { authState } = useAuth();
    const [topPlayers, setTopPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!lessonDefinitionId || !authState.token) {
                setError("Missing data to fetch leaderboard.");
                setIsLoading(false);
                if (onInitialLoadError) onInitialLoadError("Leaderboard disabled: Missing data.");
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const snapshot = await getLeaderboardSnapshot(lessonDefinitionId, 5, authState.token);
                setTopPlayers(snapshot || []);
            } catch (err) {
                console.error("Failed to fetch leaderboard snapshot:", err);
                setError(err.message || "Could not load leaderboard data.");
                if (onInitialLoadError) onInitialLoadError(err.message || "Could not load leaderboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
        // Fetch only once on mount as per our simplified design
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonDefinitionId, authState.token]); // Removed onInitialLoadError from deps to prevent re-fetch on its change

    const rankedPlayers = useMemo(() => {
        // Combine fetched top players with the current player's local score
        const currentStudentName = authState.user?.name || "You";
        let allEntries = [
            ...topPlayers,
            // Add current player if not already in topPlayers (e.g., if their previous score was there)
            // This ensures the current player is always considered for ranking with their live score.
            // We filter out the current player from `topPlayers` if their old score was fetched,
            // to avoid duplicate entries if their name is the same.
            // This assumes `studentName` in LeaderboardEntryDto is unique or identifiable.
            // A more robust way would be to use studentId if available in LeaderboardEntryDto.
            // For now, we'll rely on name, and if the local player isn't in topPlayers based on name, add them.
            !topPlayers.some(p => p.studentName === currentStudentName)
                ? { studentName: currentStudentName, totalScore: currentPlayerLocalScore, isCurrentPlayer: true }
                : null
        ].filter(Boolean); // Remove null if current player was already in topPlayers by name

        // Update current player's score if they were in topPlayers
        allEntries = allEntries.map(p =>
            p.studentName === currentStudentName
                ? { ...p, totalScore: currentPlayerLocalScore, isCurrentPlayer: true }
                : p
        );

        // Sort by score descending
        allEntries.sort((a, b) => b.totalScore - a.totalScore);

        // Assign ranks
        return allEntries.map((player, index) => ({
            ...player,
            rank: index + 1,
        }));
    }, [topPlayers, currentPlayerLocalScore, authState.user?.name]);

    const currentPlayerEntry = rankedPlayers.find(p => p.isCurrentPlayer);
    const displayedTopPlayers = rankedPlayers.slice(0, 5);

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30} /></Box>;
    }

    if (error) {
        return <Alert severity="warning" sx={{ m: 1, fontSize: '0.8rem' }}>Leaderboard: {error}</Alert>;
    }

    return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 232, 163, 0.9)', borderRadius: '8px', width: '250px', maxHeight: '400px', overflowY: 'auto' }}>
            <Typography variant="h6" sx={{ color: '#451513', textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
                🏆 Leaderboard
            </Typography>
            <List dense disablePadding>
                {displayedTopPlayers.map((player) => (
                    <ListItem key={player.rank} sx={{
                        py: 0.5,
                        backgroundColor: player.isCurrentPlayer ? 'rgba(255, 217, 102, 0.7)' : 'transparent',
                        borderRadius: '4px',
                        mb: 0.5
                    }}>
                        <ListItemText
                            primaryTypographyProps={{ fontWeight: player.isCurrentPlayer ? 'bold' : 'normal', color: '#451513', fontSize: '0.9rem' }}
                            secondaryTypographyProps={{ color: '#5d211f', fontSize: '0.85rem' }}
                            primary={`${player.rank}. ${player.studentName}`}
                            secondary={`Score: ${player.totalScore.toLocaleString()}`}
                        />
                    </ListItem>
                ))}
            </List>
            {currentPlayerEntry && !displayedTopPlayers.some(p => p.isCurrentPlayer) && ( // If current player is not in top 5
                <>
                    <Divider sx={{ my: 1, borderColor: 'rgba(69, 21, 19, 0.3)' }}><Typography variant="caption" sx={{color: '#451513'}}>Your Rank</Typography></Divider>
                    <ListItem sx={{ py: 0.5, backgroundColor: 'rgba(255, 217, 102, 0.7)', borderRadius: '4px' }}>
                        <ListItemText
                            primaryTypographyProps={{ fontWeight: 'bold', color: '#451513', fontSize: '0.9rem' }}
                            secondaryTypographyProps={{ color: '#5d211f', fontSize: '0.85rem' }}
                            primary={`${currentPlayerEntry.rank}. ${currentPlayerEntry.studentName}`}
                            secondary={`Score: ${currentPlayerEntry.totalScore.toLocaleString()}`}
                        />
                    </ListItem>
                </>
            )}
            {rankedPlayers.length === 0 && !isLoading && (
                 <Typography variant="body2" sx={{textAlign: 'center', color: '#451513', mt: 2}}>No scores yet!</Typography>
            )}
        </Paper>
    );
};

LiveLeaderboard.propTypes = {
    lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    currentPlayerLocalScore: PropTypes.number.isRequired,
    onInitialLoadError: PropTypes.func, // Optional callback for parent to know if leaderboard failed to load initially
};

export default LiveLeaderboard;