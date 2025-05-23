import React from 'react';
import { TableRow, TableCell, Button, Tooltip, Typography } from '@mui/material'; // Box removed as not used
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled, useTheme } from '@mui/material/styles'; // Added useTheme

// Helper to format time (assuming it's the same as previously provided)
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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#FFD966', // This is a good theme-aware choice
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    '&:hover': {
        // Using a slightly more theme-cohesive hover, can be adjusted
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
    }
}));

const StudentProgressRow = ({
                                studentId,
                                studentName,
                                completedLessons,
                                totalLessonsInCourse,
                                averageScore,
                                totalTimeSpent,
                                onViewDetails,
                                yellowAccent // MODIFIED: Accept yellowAccent as a prop
                            }) => {
    const theme = useTheme(); // Access theme for score colors if not directly from palette

    const lessonsProgress = totalLessonsInCourse > 0 ?
        `${completedLessons ?? '0'} / ${totalLessonsInCourse}` : 'N/A';

    const scoreDisplay = averageScore !== null && averageScore !== undefined ?
        `${averageScore.toFixed(1)}%` : 'N/A';

    let scoreColor = theme.palette.text.primary; // Default to primary text color
    if (averageScore !== null && averageScore !== undefined) {
        if (averageScore < 50) scoreColor = theme.palette.error.main;
        else if (averageScore >= 85) scoreColor = theme.palette.success.main;
        // Using warning.main for better compatibility, warning.dark might be too dark or not defined
        else if (averageScore >= 70) scoreColor = theme.palette.warning.main;
    }

    return (
        <StyledTableRow>
            <TableCell component="th" scope="row">
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                    {studentName || 'Unknown Student'}
                </Typography>
            </TableCell>
            <TableCell align="center">
                <Typography variant="body2" color="text.secondary">{lessonsProgress}</Typography>
            </TableCell>
            <TableCell align="center">
                <Typography variant="body2" sx={{ color: scoreColor, fontWeight: 'medium' }}>
                    {scoreDisplay}
                </Typography>
            </TableCell>
            <TableCell align="center">
                <Typography variant="body2" color="text.secondary">{formatTime(totalTimeSpent)}</Typography>
            </TableCell>
            <TableCell align="center">
                <Tooltip title="View Detailed Progress">
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={onViewDetails}
                        sx={{
                            // MODIFIED: Apply yellowAccent if available, otherwise fallback or use theme's primary
                            backgroundColor: yellowAccent ? yellowAccent.main : theme.palette.primary.main,
                            color: yellowAccent ? yellowAccent.contrastText : theme.palette.primary.contrastText,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: yellowAccent ? yellowAccent.hover : theme.palette.primary.dark,

                            }
                        }}
                    >
                        Details
                    </Button>
                </Tooltip>
            </TableCell>
        </StyledTableRow>
    );
};

export default StudentProgressRow;