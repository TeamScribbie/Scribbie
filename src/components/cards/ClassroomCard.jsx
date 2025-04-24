// src/components/cards/ClassroomCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Chip } from '@mui/material';

// Import the associated CSS file if styles are defined there
// import '../../styles/ClassroomCard.css';

const ClassroomCard = ({ classroomId, name, status, onClick }) => {
  const isPending = status === 'PENDING';
  const cardClassName = `classroom-card ${isPending ? 'classroom-card-pending' : ''}`;

  // Removed inline styles for pending, relying on CSS class now
  // const cardStyle = { ... };

  const handleClick = () => {
    if (!isPending && onClick) {
      onClick();
    }
  };

  return (
    // Apply the combined class name
    <div className={cardClassName} onClick={handleClick}> {/* Removed inline style */}
      {/* Classroom Name */}
      <Typography variant="subtitle1" component="div" sx={{ textAlign: 'center', mb: isPending ? 1 : 0 }}> {/* Add bottom margin only if chip is present */}
        {name}
      </Typography>

      {/* Status Chip - Placed AFTER the name */}
      {/* highlight-start */}
      {isPending && (
          <Chip
            label="Pending Approval" // Slightly more descriptive label
            color="warning"
            size="small"
            sx={{
                // Removed absolute positioning
                // Removed top/right positioning
                height: 'auto',
                fontSize: '0.7rem', // Slightly larger maybe?
                // No margin-top needed if parent is flex-column with gap, or add mt:1 if needed
                // mt: 1, // Add margin-top if needed for spacing
                '& .MuiChip-label': { padding: '0 8px' } // Adjust padding
            }}
          />
       )}
       {/* highlight-end */}
    </div>
  );
};

ClassroomCard.propTypes = {
  classroomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  status: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default ClassroomCard;