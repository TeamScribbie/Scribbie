<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import NotFound from "./page/NotFound";
import StudentHomepage from "./page/student/StudentHomepage";
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";
=======
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';
>>>>>>> teacher

const App = () => {
  return (
    <Routes>
<<<<<<< HEAD
      <Route path="/student-homepage" element={<StudentHomepage />} />
      <Route path="/" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegistration />} />
      <Route path="*" element={<NotFound />} />
=======
      <Route path="/" element={<Navigate to="/teacher-login" replace />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-register" element={<TeacherRegistration />} />
      <Route path="/teacher-homepage" element={<TeacherHomepage />} />
>>>>>>> teacher
    </Routes>
  );
};

export default App;