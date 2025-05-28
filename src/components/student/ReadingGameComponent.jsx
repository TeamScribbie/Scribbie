import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper } from '@mui/material';

const ReadingGameComponent = ({ activityData }) => {
    return (
        <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="h4" gutterBottom>
                    {activityData?.title || 'Reading Activity'}
                </Typography>
                <Typography paragraph>
                    {activityData?.content || 'Loading content...'}
                </Typography>
            </Paper>
        </Box>
    );
};

ReadingGameComponent.propTypes = {
    activityData: PropTypes.shape({
        title: PropTypes.string,
        content: PropTypes.string,
    }).isRequired,
};

export default ReadingGameComponent;
