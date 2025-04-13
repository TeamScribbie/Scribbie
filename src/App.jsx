import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/teacher-login" replace />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-register" element={<TeacherRegistration />} />
      <Route path="/teacher-homepage" element={<TeacherHomepage />} />
    </Routes>
  );
};

export default App;