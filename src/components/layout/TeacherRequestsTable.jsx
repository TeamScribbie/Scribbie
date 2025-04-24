// src/components/layout/TeacherRequestsTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Box
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const TeacherRequestsTable = ({ requests, onAccept, onReject, processingRequestId }) => {

  // Removed console log for received props

  if (!requests || requests.length === 0) {
    return <Typography sx={{ mt: 2 }}>No pending requests.</Typography>;
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="pending requests table">
        <TableHead sx={{ backgroundColor: '#FFE8A3' }}>
          <TableRow>
            {/* Column Headers */}
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Classroom Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Student ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Name</TableCell>
            {/* highlight-removed */ }
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Date Requested</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#451513' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((req) => {
            // Removed console log for mapping item

            const uniqueProcessingId = `${req.classroomId}-${req.studentId}`;
            const isBeingProcessed = processingRequestId === uniqueProcessingId;

            return (
              <TableRow key={uniqueProcessingId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                 {/* Data Cells */}
                 <TableCell>{req.classroomName ?? 'N/A'}</TableCell>
                 <TableCell component="th" scope="row">{req.studentId}</TableCell>
                 <TableCell>{req.studentName}</TableCell>
                 {/* highlight-removed */ }
                 <TableCell>{req.enrollmentDate ? new Date(req.enrollmentDate).toLocaleDateString() : 'N/A'}</TableCell>
                 <TableCell align="center">
                  {isBeingProcessed ? (
                      <HourglassEmptyIcon color="action" />
                  ) : (
                      <Box>
                          <IconButton
                              color="success"
                              aria-label="accept request"
                              onClick={() => onAccept(req.classroomId, req.studentId)}
                              disabled={isBeingProcessed || !req.classroomId}
                          >
                              <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                              color="error"
                              aria-label="reject request"
                              onClick={() => onReject(req.classroomId, req.studentId)}
                              disabled={isBeingProcessed || !req.classroomId}
                              sx={{ ml: 1 }}
                          >
                              <CancelIcon />
                          </IconButton>
                      </Box>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Update PropTypes
TeacherRequestsTable.propTypes = {
  requests: PropTypes.arrayOf(PropTypes.shape({
    studentId: PropTypes.string.isRequired,
    studentName: PropTypes.string,
    // highlight-removed */
    enrollmentDate: PropTypes.string, // Or Date object? Check API response
    classroomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    classroomName: PropTypes.string,
  })).isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  processingRequestId: PropTypes.string,
};

export default TeacherRequestsTable;