import React from 'react';
import { TableCell, TableRow, Typography, Button, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const StudentProgressRow = ({
                                studentName,
                                lessonsCompleted,
                                totalLessons,
                                totalScore, // This now receives the total score
                                totalTimeSpentSeconds,
                                onViewDetails,
                                // highlight-start
                                // Add onRemove to the props
                                onRemove,
                                // highlight-end
                                ...props
                            }) => {

    const formatTime = (totalSeconds) => {
        // Handle null, undefined, or 0 seconds case
        if (!totalSeconds) {
            return "0s";
        }

        // If the total time is less than a minute, display in seconds.
        if (totalSeconds < 60) {
            return `${totalSeconds}s`;
        }

        // If the total time is a minute or more, display in hours and minutes.
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <TableRow {...props}>
            <TableCell component="th" scope="row">
                <Typography variant="body1" fontWeight="500">{studentName}</Typography>
            </TableCell>
            <TableCell align="center">{`${lessonsCompleted} / ${totalLessons}`}</TableCell>
            <TableCell align="center">{totalScore}</TableCell>
            <TableCell align="center">{formatTime(totalTimeSpentSeconds)}</TableCell>
            <TableCell align="center">
                <Button
                    variant="contained"
                    onClick={onViewDetails}
                    sx={{
                        backgroundColor: '#FFC107',
                        color: '#000',
                        '&:hover': { backgroundColor: '#FFA000' },
                        py: 0.5,
                        px: 2
                    }}
                >
                    Details
                </Button>
            </TableCell>
            {/* highlight-start */}
            {/* Add the new cell for the remove button */}
            <TableCell align="center">
                <Tooltip title="Remove Student">
                    <IconButton onClick={onRemove} color="error" aria-label="remove student">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </TableCell>
            {/* highlight-end */}
        </TableRow>
    );
};

export default StudentProgressRow;