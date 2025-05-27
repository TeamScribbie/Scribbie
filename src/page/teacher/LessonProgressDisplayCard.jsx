import React, { useState } from 'react';
import {
    Paper, Typography, Collapse, IconButton, Box, Chip, CardActionArea, Grid, Divider, LinearProgress, useTheme
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    RadioButtonUncheckedOutlined as RadioButtonUncheckedIcon,
    HourglassTop as HourglassTopIcon,
    ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import ActivityNodeProgressItem from './ActivityNodeProgressItem'; //

// Helper to format time from seconds
const formatTime = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) return 'N/A';
    if (totalSeconds === 0) return '0s';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    let timeString = '';
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m `;
    if (seconds > 0 || (hours === 0 && minutes === 0)) timeString += `${seconds}s`;
    return timeString.trim() || '0s';
};

// Component to display lesson status with appropriate icon and color
const LessonStatusChip = ({ status }) => {
    let icon, color, label;
    switch (status) {
        case 'COMPLETED':
            icon = <CheckCircleOutlineIcon />;
            color = 'success';
            label = 'Completed';
            break;
        case 'IN_PROGRESS':
            icon = <HourglassTopIcon />;
            color = 'info';
            label = 'In Progress';
            break;
        case 'NOT_STARTED':
            icon = <RadioButtonUncheckedIcon />;
            color = 'default';
            label = 'Not Started';
            break;
        default:
            icon = <ErrorOutlineIcon />;
            color = 'warning';
            label = status ? String(status).replace('_', ' ') : 'Unknown';
    }
    return <Chip icon={icon} label={label} color={color} size="small" variant="outlined" sx={{mr:1, mb: {xs: 1, sm: 0}}} />;
};


const LessonProgressDisplayCard = ({
                                       lessonTitle,
                                       lessonStatus,
                                       lessonScore,
                                       lessonTimeSpent,
                                       activityNodeProgressesList = []
                                   }) => {
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const scoreDisplay = lessonScore !== null && lessonScore !== undefined ?
        `${lessonScore.toFixed(1)}%` : 'N/A';

    // MODIFIED: Changed act.isCompleted to act.completed
    const completedActivities = activityNodeProgressesList.filter(act => act.completed).length;
    const totalActivities = activityNodeProgressesList.length;
    // MODIFIED: Also ensure lessonProgressValue considers the correct field if logic depends on it,
    // though this specific calculation primarily uses `completedActivities` count and `lessonStatus`.
    const lessonProgressValue = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : (lessonStatus === 'COMPLETED' ? 100 : 0);

    return (
        <Paper elevation={2} sx={{
            overflow: 'hidden',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper
        }}>
            <CardActionArea onClick={handleExpandClick} component="div" sx={{ padding: '12px 16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ flexGrow: 1, marginRight: 1 }}>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 500,
                                mb: 0.5,
                                color: theme.palette.text.primary
                            }}
                        >
                            {lessonTitle || 'Unnamed Lesson'}
                        </Typography>
                        <Grid container spacing={1} alignItems="center" wrap="wrap">
                            <Grid item>
                                <LessonStatusChip status={lessonStatus} />
                            </Grid>
                            <Grid item>
                                <Chip label={`Score: ${scoreDisplay}`} size="small" variant="outlined" sx={{mr:1, mb: {xs: 1, sm: 0}}}/>
                            </Grid>
                            <Grid item>
                                <Chip label={`Time: ${formatTime(lessonTimeSpent)}`} size="small" variant="outlined" sx={{mb: {xs: 1, sm: 0}}}/>
                            </Grid>
                        </Grid>
                        {lessonStatus === 'IN_PROGRESS' && totalActivities > 0 && (
                            <Box sx={{ width: '100%', mt: 1 }}>
                                <LinearProgress variant="determinate" value={lessonProgressValue} />
                                <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{
                                        textAlign: 'right',
                                        mt:0.5,
                                        color: theme.palette.text.secondary
                                    }}
                                >
                                    {completedActivities} / {totalActivities} activities
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <IconButton
                        aria-expanded={expanded}
                        aria-label="show activity details"
                        sx={{
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: (muiTheme) => muiTheme.transitions.create('transform', {
                                duration: muiTheme.transitions.duration.shortest,
                            }),
                            alignSelf: 'center',
                            color: theme.palette.action.active
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>
            </CardActionArea>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Divider />
                <Box sx={{
                    p: 2,
                    backgroundColor: theme.palette.grey[50]
                }}>
                    <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{
                            fontWeight: 'medium',
                            mb: 1.5,
                            color: theme.palette.text.primary
                        }}
                    >
                        Activity Breakdown:
                    </Typography>
                    {activityNodeProgressesList && activityNodeProgressesList.length > 0 ? (
                        <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
                            {activityNodeProgressesList.map((nodeProgress, index) => (
                                <ActivityNodeProgressItem
                                    key={nodeProgress.activityNodeProgressId || nodeProgress.activityNodeDefinitionId || index}
                                    nodeTitle={nodeProgress.activityNodeTitle || `Activity ID: ${nodeProgress.activityNodeDefinitionId}`}
                                    nodeType={String(nodeProgress.activityNodeType)}
                                    // MODIFIED: Changed nodeProgress.isCompleted to nodeProgress.completed
                                    nodeIsCompleted={nodeProgress.completed}
                                    nodeScore={nodeProgress.score}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 1, fontStyle: 'italic' }}>
                            No activity data available for this lesson, or activities have not been started.
                        </Typography>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default LessonProgressDisplayCard;