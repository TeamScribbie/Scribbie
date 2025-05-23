// AI Context/Frontend/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import Authentication Context Provider
// Ensure useAuth is also exported from AuthContext if ProtectedRoute is in the same file or imported separately
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Page Components
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";
import StudentHomepage from "./page/student/StudentHomepage";
import StudentProfile from './page/student/StudentProfile';
import LessonPage from './page/student/LessonPage';
import ActivityPage from './page/student/ActivityPage';
import ActivitySummaryPage from './page/student/ActivitySummaryPage';
import ChallengePage from './page/student/ChallengePage';
import ChallengeSummaryPage from './page/student/ChallengeSummaryPage';

import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';
import ClassroomStudentProgressOverviewPage from "./page/teacher/ClassroomStudentProgressOverviewPage.jsx";
import StudentCourseDetailPage from "./page/teacher/StudentCourseDetailPage.jsx";
// import TeacherProfile from './page/teacher/TeacherProfile'; // Placeholder

// --- CORRECT IMPORT ---
// Make sure this path points to your actual ManageCoursesPage file
import ManageCoursesPage from './page/teacher/ManageCoursesPage.jsx'; 
import ManageAdminsPage from './page/teacher/ManageAdminsPage.jsx'; 
import ActivityNodeEditorPage from './page/teacher/ActivityNodeEditorPage.jsx'; // New import for the new page
import ChallengeQuestionsEditorPage from './page/teacher/ChallengeQuestionsEditorPage.jsx';
import LessonManagementPage from "./page/teacher/LessonManagementPage.jsx"; // New Page


// ProtectedRoute component (ensure this is defined as you had it)
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { authState } = useAuth();

    if (!authState.isAuthenticated) {
        // If not authenticated, redirect to a relevant login page
        // For teacher routes, teacher-login; for student, student-login
        // This might need adjustment based on which login to prefer for generic protected routes
        return <Navigate to="/teacher-login" replace />;
    }

    const userHasRequiredRole = authState.user?.roles?.some(role => allowedRoles.includes(role));

    if (!userHasRequiredRole) {
        console.warn(
            "Access Denied: User with roles", authState.user?.roles,
            "tried to access a route requiring one of:", allowedRoles
        );
        // Redirect to a safe default page if role access is denied
        return <Navigate to="/teacher-homepage" replace />; // Or a generic access-denied page
    }
    return children ? children : <Outlet />;
};


const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* ... (Public Routes and Student Protected Routes remain the same) ... */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegistration />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-register" element={<TeacherRegistration />} />

        <Route path="/student-homepage" element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <StudentHomepage />
            </ProtectedRoute>
        } />
        <Route path="/student-profile" element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <StudentProfile />
            </ProtectedRoute>
        } />
        <Route path="/student/classroom/:classroomId/lessons" element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <LessonPage />
            </ProtectedRoute>
        } />
        <Route path="/student/lesson/:lessonId/activity/:activityId" element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <ActivityPage />
            </ProtectedRoute>
        } />
        <Route path="/student/activity-summary" element={
             <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <ActivitySummaryPage />
            </ProtectedRoute>
        } />
        <Route path="/student/lesson/:lessonDefinitionId/challenge" element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <ChallengePage />
            </ProtectedRoute>
        } />
        <Route path="/student/challenge-summary" element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <ChallengeSummaryPage />
            </ProtectedRoute>
        } />

        {/* Teacher Protected Routes */}
        <Route path="/teacher-homepage" element={
          <ProtectedRoute allowedRoles={["ROLE_TEACHER", "ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <TeacherHomepage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/manage-courses" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <ManageCoursesPage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/manage-admins" element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERADMIN"]}>
            <ManageAdminsPage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/course/:courseId/lessons" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <LessonManagementPage />
          </ProtectedRoute>
        } />
        {/* highlight-start */}
        {/* New Route for ActivityNodeEditorPage */}
        <Route
          path="/teacher/course/:courseId/lesson/:lessonDefinitionId/node/:activityNodeTypeId/edit"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
              <ActivityNodeEditorPage />
            </ProtectedRoute>
          }
        />
        {/* highlight-end */}

        <Route
          path="/teacher/course/:courseId/lesson/:lessonDefinitionId/challenge/:challengeDefinitionId/edit-questions"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
              <ChallengeQuestionsEditorPage />
            </ProtectedRoute>
          }
        />

          {/* --- NEW TEACHER PROGRESS ROUTES START --- */}
          <Route
              path="/teacher/classroom/:classroomId/progress"
              element={<ClassroomStudentProgressOverviewPage />}
          />
          <Route
              path="/teacher/classroom/:classroomId/student/:studentId/progress"
              element={<StudentCourseDetailPage />}
          />

        <Route path="/" element={<Navigate to="/student-login" replace />} />
        <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>404 - Page Not Found</h2>
                <p>Sorry, the page you are looking for does not exist.</p>
            </div>
        } />
      </Routes>
    </AuthProvider>
  );
};

export default App;