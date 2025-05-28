import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { getActivityDetails } from '../../services/activityService';
import { useAuth } from '../../context/AuthContext';

const GAME_MODES = {
    READING: 'READING',
    FILL_BLANKS: 'FILL_BLANKS'
};

const ActivityNodePage = () => {
    const { activityId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { authState } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // We don't need to store activityData as state since we'll redirect immediately
    useEffect(() => {
        const fetchAndRedirect = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getActivityDetails(activityId, authState.token);
                
                // Redirect based on game mode
                switch (data.gameMode) {
                    case GAME_MODES.READING:
                        navigate(`/student/activity/reading/${activityId}`, { 
                            state: { 
                                ...location.state,
                                activityData: data 
                            } 
                        });
                        break;
                    case GAME_MODES.FILL_BLANKS:
                        navigate(`/student/activity/fill-blanks/${activityId}`, { 
                            state: { 
                                ...location.state,
                                activityData: data 
                            } 
                        });
                        break;
                    default:
                        setError(`Unsupported game mode: ${data.gameMode}`);
                        setLoading(false);
                }
            } catch (err) {
                setError(err.message || 'Failed to load activity');
                setLoading(false);
            }
        };

        if (activityId && authState.token) {
            fetchAndRedirect();
        }
    }, [activityId, authState.token, navigate, location.state]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return null; // We should never reach this point as we'll always redirect or show loading/error
};

export default ActivityNodePage;
