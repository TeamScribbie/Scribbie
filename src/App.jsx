import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentLogin from './student/StudentLogin';
import TeacherLogin from './teacher/TeacherLogin';
import StudentRegistration from './student/StudentRegistration';
import TeacherRegistration from './teacher/TeacherRegistration';
import StudentHomepage from './student/StudentHomepage';
import TeacherHomepage from './teacher/TeacherHomepage';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student-login" replace />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/student-register" element={<StudentRegistration />} />
      <Route path="/teacher-register" element={<TeacherRegistration />} />
      <Route path="/student-homepage" element={<StudentHomepage />} />
      <Route path="/teacher-homepage" element={<TeacherHomepage />} />
    </Routes>
  );
};

export default App;
