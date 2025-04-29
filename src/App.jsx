import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/TeacherNavbar";
import Sidebar from "./components/layout/TeacherSidebar";
import StudentNavbar from "./components/layout/StudentNavbar";
import StudentSidebar from "./components/layout/StudentSidebar";

// 🧑‍🎓 Student pages
import StudentHomepage from "./page/student/StudentHomepage";
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";
import StudentProfile from "./page/student/StudentProfile";
import LessonListPage from "./page/student/LessonListPage";
import LessonPage from "./page/student/LessonPage";
import ChallengeListPage from "./page/student/ChallengeListPage";
import ChallengePage from "./page/student/ChallengePage";
import LeaderboardBox from "./page/student/LeaderboardBox";
import StudentClass from "./page/student/StudentClass";

// 👨‍🏫 Teacher pages
import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';
import ClassroomCard from './page/teacher/ClassroomCard';
import RankingModal from './components/modals/RankingModal';
import TeacherChallenges from './page/teacher/TeacherChallenges';


const App = () => {
  return (
    <Routes>
      <Route path="/t-nav" element={<Navbar />} />
      <Route path="/t-sidebar" element={<Sidebar />} />
      <Route path="/s-nav" element={<StudentNavbar />} />
      <Route path="/s-sidebar" element={<StudentSidebar />} />

      {/* Student Side */}
      <Route path="/" element={<Navigate to="/student-login" replace />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegistration />} />
      <Route path="/student-homepage" element={<StudentHomepage />} />
      <Route path="/student-profile" element={<StudentProfile />} />
      <Route path="/student-lesson" element={<LessonListPage />} />
      <Route path="/lesson/:id" element={<LessonPage />} />
      <Route path="/challenge/:id" element={<ChallengePage />} />
      <Route path="/student-challenge" element={<ChallengeListPage />} />
      <Route path="/student-leaderboard" element={<LeaderboardBox />} />
      <Route path="/student-class/:className" element={<StudentClass />} />

      {/* Teacher Side */}
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
