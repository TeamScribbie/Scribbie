import React from 'react';
import { TableCell, TableRow, Typography, Button, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const StudentProgressRow = ({
                                studentName,
                                completedLessons,
                                totalLessonsInCourse,
                                averageScore,
                                totalTimeSpent,
                                onViewDetails,
                                yellowAccent,
                                // highlight-start
                                // Add onRemove to the props
                                onRemove,
                                // highlight-end
                                ...props
                            }) => {
    return (
        <TableRow {...props}>
            <TableCell component="th" scope="row">
                <Typography variant="body1" fontWeight="500">{studentName}</Typography>
            </TableCell>
            <TableCell align="center">{`${completedLessons} / ${totalLessonsInCourse}`}</TableCell>
            <TableCell align="center">{averageScore?.toFixed(2) ?? 'N/A'}</TableCell>
            <TableCell align="center">{totalTimeSpent}</TableCell>
            <TableCell align="center">
                <Button
                    variant="contained"
                    onClick={onViewDetails}
                    sx={{
                        backgroundColor: yellowAccent.main,
                        color: yellowAccent.contrastText,
                        '&:hover': { backgroundColor: yellowAccent.hover },
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