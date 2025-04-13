import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherLogin from './teacher/TeacherLogin';
import TeacherRegistration from './teacher/TeacherRegistration';
import TeacherHomepage from './teacher/TeacherHomepage';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/teacher-login" replace />} />
      <Route path="/teacher-login" element={<TeacherLogin/>} />
      <Route path="/teacher-register" element={<TeacherRegistration />} />
      <Route path="/teacher-homepage" element={<TeacherHomepage />} />
    </Routes>
  );
};

export default App;
