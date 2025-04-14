import React from 'react';
import StudentHomepage from "./page/student/StudentHomepage";
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";
import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherChallenges from './teacher/TeacherChallenges';
import ClassroomCard from './teacher/Classroomcard';
import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';


const App = () => {
  return (
    <Routes>
      <Route path="/student-homepage" element={<StudentHomepage />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegistration />} />
      <Route path="/" element={<Navigate to="/teacher-login" replace />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-register" element={<TeacherRegistration />} />
      <Route path="/teacher-homepage" element={<TeacherHomepage />} />
      <Route path="/teacher-challenges" element={<TeacherChallenges />} />
      <Route path="/classroomcard" element={<ClassroomCard />} />
    </Routes>
  );
};

export default App;