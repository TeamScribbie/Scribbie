// AI Context/Frontend/components/cards/CourseCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, CardActions, Button, Box, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings'; // Using a different icon for "Manage Lessons"

const CourseCard = ({ course, onManageLessons, onEdit, onDelete, isAdminOrSuperAdmin, currentUserId }) => {
    const creatorName = course?.creator?.name || course?.creator?.teacherId || 'N/A';
    const canModify = isAdminOrSuperAdmin || (course?.creator && course.creator.teacherId === currentUserId);

    return (
        <Card sx={{
            height: '100%', // ... other styles
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid #FFE8A3',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
            }
        }}>
            <CardContent>
                {/* ... title, description, creator chip ... */}
                <Typography variant="h6" component="div" gutterBottom sx={{ color: '#451513', fontWeight: 'bold' }}>
                    {course?.title || 'Untitled Course'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: '60px' }}>
                    {course?.description ?
                        (course.description.length > 100 ? `${course.description.substring(0, 100)}...` : course.description)
                        : 'No description available.'}
                </Typography>
                {course?.creator && (
                     <Chip
                        label={`Creator: ${creatorName}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                    />
                )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 1, borderTop: '1px solid #eee' }}>
                 <Button
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => onManageLessons(course.courseId)} // Re-added this
                    sx={{ color: '#451513' }}
                >
                    Manage Lessons
                </Button>
                <Box> {/* Wrapper for edit/delete icons to keep them grouped to the right */}
                    {canModify && (
                        <>
                            <IconButton
                                size="small"
                                onClick={() => onEdit(course)}
                                sx={{ color: 'primary.main' }}
                                aria-label="edit course"
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => onDelete(course)}
                                sx={{ color: 'error.main' }}
                                aria-label="delete course"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </>
                    )}
                </Box>
            </CardActions>
        </Card>
    );
};

CourseCard.propTypes = {
    course: PropTypes.shape({
        courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string,
        description: PropTypes.string,
        creator: PropTypes.shape({
            teacherId: PropTypes.string,
            name: PropTypes.string
        }),
    }).isRequired,
    onManageLessons: PropTypes.func.isRequired, // Re-added
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    isAdminOrSuperAdmin: PropTypes.bool.isRequired,
    currentUserId: PropTypes.string,
};

export default CourseCard;