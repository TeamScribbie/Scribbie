import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🧑‍🎓 Student pages
import StudentHomepage from "./page/student/StudentHomepage";
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";
import StudentProfile from "./page/student/StudentProfile";
import LessonListPage from "./page/student/LessonListPage";
import LessonPage from "./page/student/LessonPage";

// 👨‍🏫 Teacher pages
import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';

const App = () => {
  return (
    <Routes>
      {/* Student Side */}
      <Route path="/" element={<Navigate to="/student-login" replace />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegistration />} />
      <Route path="/student-homepage" element={<StudentHomepage />} />
      <Route path="/student-profile" element={<StudentProfile />} />
      <Route path="/student-lesson" element={<LessonListPage />} />
      <Route path="/lesson/:id" element={<LessonPage />} />

      {/* Teacher Side */}
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-register" element={<TeacherRegistration />} />
      <Route path="/teacher-homepage" element={<TeacherHomepage />} />
    </Routes>
  );
};

export default App;
