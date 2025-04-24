import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/navbar";
import Sidebar from "./components/layout/TeacherSidebar";
import StudentHomepage from "./page/student/StudentHomepage";
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";
import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';
import ClassroomCard from './page/teacher/ClassroomCard';
import RankingModal from './components/modals/RankingModal';
import TeacherChallenges from './page/teacher/TeacherChallenges';


const App = () => {
  return (
    <Routes>
      <Route path="/nav" element={<Navbar />} />
      <Route path="/t-sidebar" element={<Sidebar />} />
      <Route path="/student-homepage" element={<StudentHomepage />} />
      <Route path="/student-homepage" element={<StudentHomepage />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegistration />} />
      <Route path="/" element={<Navigate to="/teacher-login" replace />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/teacher-register" element={<TeacherRegistration />} />
      <Route path="/teacher-homepage" element={<TeacherHomepage />} />
      <Route path="/teacher-challenges" element={<TeacherChallenges />} />
      <Route path="/classroom/:id" element={<ClassroomCard />} />
      <Route path="/ranking" element={<RankingModal />} />
    </Routes>
  );
};

export default App;