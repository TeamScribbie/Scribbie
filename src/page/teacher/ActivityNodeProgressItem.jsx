import React from 'react';
import { Box, Typography, Chip, Grid, Tooltip, Paper } from '@mui/material';
import {
    CheckCircleOutline as CheckCircleIcon, // Completed
    HighlightOffOutlined as IncompleteIcon,  // Not completed (or CancelIcon)
    RadioButtonUncheckedOutlined as NotStartedIcon, // Alternative for not completed if preferred
    DescriptionOutlined as TextIcon,
    OndemandVideoOutlined as VideoIcon,
    QuizOutlined as QuizIcon,
    HelpOutlineOutlined as UnknownTypeIcon,
    ExtensionOutlined as GenericActivityIcon // For other types
} from '@mui/icons-material';

// Helper to get an icon and user-friendly label based on ActivityType from backend
const getActivityTypeDetails = (typeStr) => {
    const type = String(typeStr).toUpperCase(); // Ensure comparison is case-insensitive

    switch (type) {
        case 'TEXT':
        case 'MARKDOWN':
            return { icon: <TextIcon fontSize="small" />, label: "Reading/Text" };
        case 'VIDEO':
            return { icon: <VideoIcon fontSize="small" />, label: "Video" };
        case 'QUIZ_SINGLE_ANSWER':
        case 'QUIZ_MULTIPLE_CHOICE':
        case 'QUESTION_NODE': // Add any other quiz/question related types
            return { icon: <QuizIcon fontSize="small" />, label: "Quiz/Question" };
        // Add more cases as needed for your ActivityType enum
        // E.g., case 'IMAGE': return { icon: <ImageIcon />, label: "Image" };
        default:
            return { icon: <GenericActivityIcon fontSize="small" />, label: typeStr ? String(typeStr).replace(/_/g, ' ') : "Activity" };
    }
};

const ActivityNodeProgressItem = ({
                                      nodeTitle,
                                      nodeType,      // String representation of ActivityType from backend
                                      nodeIsCompleted, // Boolean: true if completed, false otherwise
                                      nodeScore        // Number (percentage) or null/undefined
                                  }) => {
    const { icon: NodeTypeIcon, label: nodeTypeLabel } = getActivityTypeDetails(nodeType);

    const scoreDisplay = nodeScore !== null && nodeScore !== undefined ?
        `${nodeScore.toFixed(0)}%` : 'N/A'; // Assuming score is a percentage, show as integer

    return (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'background.default' }}>
            <Grid container spacing={1} alignItems="center" wrap="wrap">
                {/* Activity Title and Type */}
                <Grid item xs={12} sm={6} md={7}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: {xs: 0.5, sm: 0} }}>
                        <Tooltip title={nodeTypeLabel}>
                            <Box component="span" sx={{ mr: 1, display: 'inline-flex', color: 'text.secondary' }}>{NodeTypeIcon}</Box>
                        </Tooltip>
                        <Typography variant="body1" component="div" sx={{ fontWeight: 'medium', flexGrow: 1, wordBreak: 'break-word' }}>
                            {nodeTitle || 'Unnamed Activity'}
                        </Typography>
                    </Box>
                </Grid>

                {/* Completion Status */}
                <Grid item xs={6} sm={3} md={2.5} sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                    <Chip
                        icon={nodeIsCompleted ? <CheckCircleIcon /> : <IncompleteIcon />} // Or NotStartedIcon
                        label={nodeIsCompleted ? 'Completed' : 'Incomplete'}
                        color={nodeIsCompleted ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                {/* Score */}
                <Grid item xs={6} sm={3} md={2.5} sx={{ textAlign: { xs: 'right', sm: 'right' } }}>
                    <Typography variant="body2" color="text.secondary">
                        Score: {scoreDisplay}
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ActivityNodeProgressItem;