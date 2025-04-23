// src/App.jsx (Corrected Code)
import React from 'react';
import Navbar from "./components/layout/navbar"; // Assuming Navbar might also use auth context later
import StudentHomepage from "./page/student/StudentHomepage";
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";
import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';

// 1. Import AuthProvider
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    // 2. Wrap Routes with AuthProvider
    <AuthProvider>
      <Routes>
        {/* Navbar might eventually be inside specific layouts or routes needing auth */}
        {/* <Route path="/nav" element={<Navbar />} /> */}

        {/* Define routes that DO NOT need auth first (like login/register) */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegistration />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-register" element={<TeacherRegistration />} />

        {/* Define routes that DO need auth */}
        {/* You might want to wrap these in a ProtectedRoute component later */}
        <Route path="/student-homepage" element={<StudentHomepage />} />
        <Route path="/teacher-homepage" element={<TeacherHomepage />} />


        {/* Default route redirects */}
        {/* Consider redirecting based on auth status later */}
        <Route path="/" element={<Navigate to="/student-login" replace />} />

        {/* Add other routes as needed */}

      </Routes>
    </AuthProvider>
  );
};

export default App;