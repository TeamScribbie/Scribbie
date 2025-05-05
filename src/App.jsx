// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Authentication Context Provider
import { AuthProvider } from './context/AuthContext';

// Import Page Components
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";
import StudentHomepage from "./page/student/StudentHomepage";
import StudentProfile from './page/student/StudentProfile'; // Assuming you have this
import LessonPage from './page/student/LessonPage';
import ActivityPage from './page/student/ActivityPage';
import ActivitySummaryPage from './page/student/ActivitySummaryPage'; // Import the summary page

import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';
// Assuming you might have a TeacherProfile page
// import TeacherProfile from './page/teacher/TeacherProfile';

// Note: Navbar is typically rendered within layout components (like Homepage)
// rather than having its own route, but keeping it separate if that's intended.
// import Navbar from "./components/layout/navbar";

const App = () => {
  return (
    // Wrap everything in AuthProvider to make auth state available
    <AuthProvider>
      <Routes>
        {/* --- Public Routes (Login/Register) --- */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegistration />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-register" element={<TeacherRegistration />} />

        {/* --- Student Routes (Should ideally be protected) --- */}
        {/* Consider wrapping these in a <ProtectedRoute role="Student"> component later */}
        <Route path="/student-homepage" element={<StudentHomepage />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student/classroom/:classroomId/lessons" element={<LessonPage />} />
        <Route path="/student/lesson/:lessonId/activity/:activityId" element={<ActivityPage />} />
        <Route path="/student/activity-summary" element={<ActivitySummaryPage />} />


        {/* --- Teacher Routes (Should ideally be protected) --- */}
        {/* Consider wrapping these in a <ProtectedRoute role="Teacher"> component later */}
        <Route path="/teacher-homepage" element={<TeacherHomepage />} />
        {/* <Route path="/teacher-profile" element={<TeacherProfile />} /> */}
        {/* Add other teacher-specific routes here */}


        {/* --- Default Route --- */}
        {/* Redirects the base URL ("/") to the student login page */}
        <Route path="/" element={<Navigate to="/student-login" replace />} />

        {/* --- Catch-all for undefined routes (Optional) --- */}
        {/* <Route path="*" element={<div>Page Not Found</div>} /> */}

      </Routes>
    </AuthProvider>
  );
};

export default App;