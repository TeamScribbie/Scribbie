import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select, // ✨ New MUI component
  MenuItem, // ✨ New MUI component
  FormControl, // ✨ New MUI component
  InputLabel, // ✨ New MUI component
  CircularProgress, // ✨ For loading state
  FormHelperText // ✨ For errors
} from '@mui/material';
import { useAuth } from '../../context/AuthContext'; // To get the token
import { getAllCourses } from '../../services/courseService'; // ✨ Import the new service

const AddClassDialog = ({ open, onClose, onAddClass, isLoading: isSubmitting }) => {
  const { authState } = useAuth();
  const [classroomName, setClassroomName] = useState('');
  const [classroomCode, setClassroomCode] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(''); // ✨ State for selected course
  const [availableCourses, setAvailableCourses] = useState([]); // ✨ State for fetched courses
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState(null);

  // Fetch courses when the dialog opens and authState.token is available
  const fetchCourses = useCallback(async () => {
    if (open && authState.token) {
      setIsLoadingCourses(true);
      setCourseError(null);
      try {
        const courses = await getAllCourses(authState.token);
        setAvailableCourses(courses);
      } catch (err) {
        console.error("Failed to fetch courses for dialog:", err);
        setCourseError(err.message || "Could not load courses.");
        setAvailableCourses([]); // Clear courses on error
      } finally {
        setIsLoadingCourses(false);
      }
    }
  }, [open, authState.token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]); // fetchCourses is memoized by useCallback

  // Reset fields when dialog visibility changes
  useEffect(() => {
    if (!open) {
      setClassroomName('');
      setClassroomCode('');
      setSelectedCourseId('');
      setAvailableCourses([]); // Clear courses when dialog closes
      setCourseError(null);   // Clear error when dialog closes
    } else {
        // When dialog opens, if courses haven't been loaded yet (e.g. token just became available), fetch them.
        if(availableCourses.length === 0 && !isLoadingCourses && !courseError) {
            fetchCourses();
        }
    }
  }, [open, availableCourses.length, isLoadingCourses, courseError, fetchCourses]);

  const handleCreateClick = () => {
    if (classroomName.trim() && classroomCode.trim() && selectedCourseId) { // ✨ Ensure course is selected
      onAddClass({
        classroomName: classroomName.trim(),
        classroomCode: classroomCode.trim(),
        assignedCourseId: selectedCourseId, // ✨ Include selected course ID
      });
      // onClose(); // Keep dialog open until parent confirms success/failure via isLoading prop
    } else {
      alert('Please fill all fields, including selecting a course.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="dialog-title">Create a class</DialogTitle>
      <DialogContent className="dialog-content">
        <TextField
          autoFocus
          margin="dense"
          label="Class Name"
          fullWidth
          value={classroomName}
          onChange={(e) => setClassroomName(e.target.value)}
          variant="outlined"
          disabled={isSubmitting}
        />
        <TextField
          margin="dense"
          label="Class Code"
          fullWidth
          value={classroomCode}
          onChange={(e) => setClassroomCode(e.target.value)}
          variant="outlined"
          disabled={isSubmitting}
        />

        {/* ✨ Course Selection Dropdown ✨ */}
        <FormControl fullWidth margin="dense" disabled={isSubmitting || isLoadingCourses} error={!!courseError}>
          <InputLabel id="select-course-label">Assign Course</InputLabel>
          <Select
            labelId="select-course-label"
            id="select-course"
            value={selectedCourseId}
            label="Assign Course"
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {isLoadingCourses ? (
              <MenuItem value="" disabled>
                <CircularProgress size={20} sx={{mr: 1}} /> Loading Courses...
              </MenuItem>
            ) : availableCourses.length === 0 && !courseError ? (
                 <MenuItem value="" disabled>No courses available to assign.</MenuItem>
            ) : (
              availableCourses.map((course) => (
                <MenuItem key={course.courseId} value={course.courseId}>
                  {course.title} {/* Assuming course object has 'title' */}
                </MenuItem>
              ))
            )}
          </Select>
          {courseError && <FormHelperText>{courseError}</FormHelperText>}
           {availableCourses.length > 0 && !selectedCourseId && !isLoadingCourses && (
             <FormHelperText>Please select a course.</FormHelperText>
           )}
        </FormControl>
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          onClick={handleCreateClick}
          variant="contained"
          className="dialog-create-button"
          disabled={isSubmitting || isLoadingCourses || !classroomName.trim() || !classroomCode.trim() || !selectedCourseId}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddClassDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddClass: PropTypes.func.isRequired, // Expects func taking { classroomName, classroomCode, assignedCourseId }
  isLoading: PropTypes.bool, // Prop to indicate submission is in progress
};

export default AddClassDialog;