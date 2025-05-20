// src/components/cards/ClassroomCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Chip, Button, Box } from '@mui/material'; // Added Button and Box
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { useAuth } from '../../context/AuthContext'; // Added to check user type

// Import the associated CSS file if styles are defined there
// import '../../styles/ClassroomCard.css';

const ClassroomCard = ({ classroomId, name, status, onClick }) => {
    const { authState } = useAuth(); // Get authentication state
    const navigate = useNavigate();

    const isPending = status === 'PENDING';
    const isTeacher = authState.userType === 'Teacher'; // Check user type
    // A student is implied if not a teacher, and the card is shown on a student-specific page.
    // Or, you might have an explicit isStudent = authState.userType === 'Student';

    const cardClassName = `classroom-card ${isPending ? 'classroom-card-pending' : ''}`;

    // Main click handler for the card itself
    const handleCardClick = () => {
        // If the user is a student and status is 'APPROVED', this click lets them view the classroom.
        // If the user is a teacher, this click might lead to a general classroom management/details page.
        // The 'onClick' prop is passed from the parent and defines this behavior.
        if (!isPending && onClick) {
            onClick();
        }
    };

    // Click handler for the teacher's "View Progress" button
    const handleViewProgressClick = (e) => {
        e.stopPropagation(); // Important: Prevents handleCardClick from being triggered
        // Navigate teacher to the classroom's student progress overview page
        // Ensure this path matches your route configuration for ClassroomStudentProgressOverviewPage
        navigate(`/teacher/classroom/${classroomId}/progress`);
    };

    return (
        <div className={cardClassName} onClick={handleCardClick}>
            {/* Classroom Name */}
            <Typography
                variant="subtitle1"
                component="div"
                sx={{
                    textAlign: 'center',
                    // Adjust bottom margin if pending chip or teacher progress button is shown
                    mb: isPending || (isTeacher && !isPending) ? 1 : 0,
                }}
            >
                {name}
            </Typography>

            {/* Status Chip - Shown if status is PENDING */}
            {isPending && (
                <Chip
                    label="Pending Approval"
                    color="warning"
                    size="small"
                    sx={{
                        height: 'auto',
                        fontSize: '0.7rem',
                        '& .MuiChip-label': { padding: '0 8px' },
                        // Centering the chip if it's the only element below the name
                        display: 'block', // Make it block to use auto margins for centering
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                />
            )}

            {/* "View Progress" Button - Shown only to Teachers for non-pending classrooms */}
            {isTeacher && !isPending && (
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="outlined" // Or "contained" or "text" based on your design preference
                        size="small"
                        onClick={handleViewProgressClick}
                        sx={{
                            fontSize: '0.75rem', // Adjust as needed
                            padding: '2px 8px',   // Adjust as needed
                        }}
                    >
                        View Progress
                    </Button>
                </Box>
            )}
        </div>
    );
};

ClassroomCard.propTypes = {
    classroomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string, // e.g., 'APPROVED', 'PENDING', 'REJECTED'
    onClick: PropTypes.func.isRequired, // Called when the card (not a specific button inside) is clicked
};

export default ClassroomCard;