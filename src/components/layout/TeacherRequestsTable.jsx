// src/components/TeacherRequestsTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Renamed component to TeacherRequestsTable
const TeacherRequestsTable = ({ requests, onAccept, onReject }) => {
  if (!requests || requests.length === 0) {
    return <Typography>No pending requests.</Typography>;
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="pending requests table">
        <TableHead sx={{ backgroundColor: '#FFE8A3' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Student ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Grade</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Requested Class</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#451513' }}>Date</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#451513' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((req) => (
            <TableRow
              key={req.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{req.studentId}</TableCell>
              <TableCell>{req.name}</TableCell>
              <TableCell>{req.grade}</TableCell>
              <TableCell>{req.classroomName}</TableCell>
              <TableCell>{req.date}</TableCell>
              <TableCell align="center">
                <IconButton
                    color="success"
                    aria-label="accept request"
                    onClick={() => onAccept(req.id)}
                >
                  <CheckCircleIcon />
                </IconButton>
                <IconButton
                    color="error"
                    aria-label="reject request"
                    onClick={() => onReject(req.id)}
                    sx={{ ml: 1 }}
                >
                  <CancelIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Updated PropTypes to match component name
TeacherRequestsTable.propTypes = {
  requests: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    studentId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    classroomName: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })).isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

// Updated default export
export default TeacherRequestsTable;