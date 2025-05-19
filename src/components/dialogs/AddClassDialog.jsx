import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  FormHelperText,
  Box
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getAvailableCoursesForAssignment } from '../../services/courseService';

const AddClassDialog = ({ open, onClose, onAddClass, isLoading: isSubmittingClass }) => {
  const { authState } = useAuth();
  const [classroomName, setClassroomName] = useState('');
  const [classroomCode, setClassroomCode] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(''); // Initial state is an empty string
  const [availableCourses, setAvailableCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchCourses = useCallback(async () => {
    // Fetch only if dialog is open, user is authenticated, AND availableCourses is currently empty.
    if (open && authState.token && availableCourses.length === 0) {
      setIsLoadingCourses(true);
      setCourseError(null);
      try {
        console.log("AddClassDialog: [FETCHING] Starting to fetch available courses...");
        const courses = await getAvailableCoursesForAssignment(authState.token);
        // +++ LOGGING POINT 1: What did getAvailableCoursesForAssignment return? +++
        console.log("AddClassDialog: [FETCHED] Raw courses data from service:", JSON.stringify(courses, null, 2));

        setAvailableCourses(courses || []); // Ensure it's an array
        if (!courses || courses.length === 0) {
            console.warn("AddClassDialog: [FETCHED] No courses returned or courses array is empty.");
            setCourseError("No courses are available to assign. Please create a course first or contact an administrator.");
        } else {
            // +++ LOGGING POINT 2: Sanity check the structure of the first course if available +++
            console.log("AddClassDialog: [FETCHED] First course details (if any):", JSON.stringify(courses[0], null, 2));
        }
      } catch (err) {
        console.error("AddClassDialog: [FETCH ERROR] Failed to fetch courses:", err);
        setCourseError(err.message || "Could not load courses. Please try again.");
        setAvailableCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    }
  }, [open, authState.token, availableCourses.length]);

  useEffect(() => {
    if (open) {
        fetchCourses();
    }
  }, [open, fetchCourses]);

  // Reset form state when dialog is closed
  useEffect(() => {
    if (!open) {
      console.log("AddClassDialog: [CLOSING DIALOG] Resetting form state.");
      setClassroomName('');
      setClassroomCode('');
      setSelectedCourseId(''); // Crucially resets selectedCourseId
      setAvailableCourses([]); // Clears courses to allow re-fetch next time
      setCourseError(null);
      setFormError('');
    }
  }, [open]);

  const handleCreateClick = () => {
    setFormError('');
    // +++ LOGGING POINT 4: Value of selectedCourseId AT THE START of handleCreateClick +++
    console.log("AddClassDialog: [CREATE CLICK] Initial selectedCourseId:", `"${selectedCourseId}"`, "Type:", typeof selectedCourseId);

    if (!classroomName.trim()) {
      setFormError('Class Name is required.');
      return;
    }
    // Classroom code can be empty as backend can generate it.
    // Client-side validation for length is optional.
    // if (classroomCode.trim().length > 10) {
    //   setFormError('Class Code cannot exceed 10 characters.');
    //   return;
    // }

    // This condition (!selectedCourseId) will be true if selectedCourseId is "" (empty string)
    if (!selectedCourseId) {
      setFormError('Please select a course to assign.');
      // +++ LOGGING POINT 5: Validation for selectedCourseId failed +++
      console.error("AddClassDialog: [VALIDATION FAIL] selectedCourseId is empty or falsy. Value:", `"${selectedCourseId}"`);
      return; // Exit if no course is selected
    }

    // This part is only reached if selectedCourseId is NOT an empty string (and not null/undefined)
    const dataToSend = {
      classroomName: classroomName.trim(),
      classroomCode: classroomCode.trim(),
      assignedCourseId: selectedCourseId, // Value from state
    };
    // +++ LOGGING POINT 6: Data being passed to onAddClass +++
    console.log("AddClassDialog: [SENDING] Calling onAddClass with data:", JSON.stringify(dataToSend, null, 2));
    onAddClass(dataToSend);
  };

  return (
    <Dialog open={open} onClose={() => !isSubmittingClass && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle className="dialog-title">Create a class</DialogTitle>
      <DialogContent className="dialog-content" sx={{ paddingTop: '20px !important' }}>
        <TextField
          autoFocus
          margin="dense"
          id="classroomName"
          label="Class Name"
          type="text"
          fullWidth
          variant="outlined"
          value={classroomName}
          onChange={(e) => setClassroomName(e.target.value)}
          disabled={isSubmittingClass}
          required // HTML5 required
        />
        <TextField
          margin="dense"
          id="classroomCode"
          label="Class Code"
          type="text"
          fullWidth
          variant="outlined"
          value={classroomCode}
          onChange={(e) => setClassroomCode(e.target.value)}
          disabled={isSubmittingClass}
          helperText="Max 10 characters. If left empty, a code will be generated."
        />
        <FormControl fullWidth margin="dense" disabled={isSubmittingClass || isLoadingCourses} error={!!courseError || (!selectedCourseId && formError.includes('course'))}>
          <InputLabel id="assign-course-label">Assign Course *</InputLabel>
          <Select
            labelId="assign-course-label"
            id="assign-course-select"
            value={selectedCourseId} // Controlled by state
            label="Assign Course *" // MUI uses this for the floating label
            onChange={(e) => {
              const newValue = e.target.value;
              // +++ LOGGING POINT 3: Value selected from dropdown +++
              console.log("AddClassDialog: [SELECTION CHANGE] Course selected. e.target.value:", `"${newValue}"`, "Type:", typeof newValue);
              setSelectedCourseId(newValue);
            }}
            required // HTML5 required
          >
            {/* Default/Placeholder MenuItem. Its value is an empty string. */}
            <MenuItem value="" disabled>
              <em>{isLoadingCourses ? "Loading..." : "Select a Course"}</em>
            </MenuItem>

            {isLoadingCourses && (
              <MenuItem value="" disabled style={{ justifyContent: 'center' }}>
                <CircularProgress size={20} />
              </MenuItem>
            )}

            {!isLoadingCourses && availableCourses.map((course) => {
              // console.log(`AddClassDialog: [RENDERING MENUITEM] Title: "${course.title}", ID (for value): ${course.courseId}, Type of ID: ${typeof course.courseId}`);
              return (
                <MenuItem key={course.courseId} value={course.courseId}> {/* course.courseId is likely a number */}
                  {course.title} {course.description ? `(${course.description.substring(0,30)}...)` : ''}
                </MenuItem>
              );
            })}

            {!isLoadingCourses && availableCourses.length === 0 && !courseError && (
                 <MenuItem value="" disabled>No courses available.</MenuItem>
             )}
          </Select>
          {courseError && <FormHelperText error>{courseError}</FormHelperText>}
          {/* This error shows if validation fails for course selection in handleCreateClick */}
          {!selectedCourseId && formError.includes('course') && <FormHelperText error>{formError}</FormHelperText>}
        </FormControl>

        {/* This shows general form errors like "Class Name is required" */}
        {formError && !formError.includes('course') && <FormHelperText error sx={{mt: 1, textAlign: 'center'}}>{formError}</FormHelperText>}

      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose} disabled={isSubmittingClass}>Cancel</Button>
        <Button
          onClick={handleCreateClick}
          variant="contained"
          className="dialog-create-button"
          disabled={isSubmittingClass || isLoadingCourses}
        >
          {isSubmittingClass ? <CircularProgress size={24} color="inherit" /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddClassDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddClass: PropTypes.func.isRequired,
  isLoading: PropTypes.bool, // Prop from parent indicating submission is in progress
};

export default AddClassDialog;