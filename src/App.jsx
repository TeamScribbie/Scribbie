// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Added Outlet

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
// Assuming ChallengePage and ChallengeSummaryPage are created as per Module 4 plan
import ChallengePage from './page/student/ChallengePage'; // You'll need to create this
import ChallengeSummaryPage from './page/student/ChallengeSummaryPage'; // You'll need to create this

import TeacherLogin from './page/teacher/TeacherLogin';
import TeacherRegistration from './page/teacher/TeacherRegistration';
import TeacherHomepage from './page/teacher/TeacherHomepage';
import ClassroomStudentProgressOverviewPage from "./page/teacher/ClassroomStudentProgressOverviewPage.jsx";
import StudentCourseDetailPage from "./page/teacher/StudentCourseDetailPage.jsx";
// import TeacherProfile from './page/teacher/TeacherProfile'; // Placeholder

// Placeholder pages for Admin and Superadmin (you'll create these later)
const ManageCoursesPage = () => (
    <div>
        <h1>Manage Courses Page (Admin/Superadmin)</h1>
        <p>Teachers with Admin or Superadmin roles can create, edit, and manage course content here.</p>
        {/* Actual content will go here */}
    </div>
);

const AppointAdminPage = () => (
    <div>
        <h1>Appoint Admin Page (Superadmin)</h1>
        <p>Only Superadmins can access this page to assign or revoke Admin roles for existing teachers.</p>
        {/* Actual content will go here */}
    </div>
);

// --- ✨ Protected Route Component (Basic Example) ---
// You can move this to its own file (e.g., ./components/auth/ProtectedRoute.jsx) and import it
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { authState } = useAuth();

    if (!authState.isAuthenticated) {
        // Not logged in, redirect to a relevant login page
        // For teacher-area routes, redirect to teacher login
        return <Navigate to="/teacher-login" replace />;
    }

    // Check if user has at least one of the allowed roles
    const userHasRequiredRole = authState.user?.roles?.some(role => allowedRoles.includes(role));

    if (!userHasRequiredRole) {
        // Logged in, but does not have the required role(s)
        console.warn(
            "Access Denied: User with roles", authState.user?.roles,
            "tried to access a route requiring one of:", allowedRoles
        );
        // Redirect to a "Forbidden" page or back to their main dashboard
        return <Navigate to="/teacher-homepage" replace />; // Or a dedicated 'Access Denied' page
    }

    // If all checks pass, render the children or Outlet (for nested routes)
    return children ? children : <Outlet />;
};


const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* --- Public Routes (Login/Register) --- */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegistration />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-register" element={<TeacherRegistration />} />

        {/* --- Student Routes --- */}
        {/* These could also be wrapped in a ProtectedRoute checking for ROLE_STUDENT if needed */}
        <Route path="/student-homepage" element={<StudentHomepage />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student/classroom/:classroomId/lessons" element={<LessonPage />} />
        <Route path="/student/lesson/:lessonId/activity/:activityId" element={<ActivityPage />} />
        <Route path="/student/activity-summary" element={<ActivitySummaryPage />} />
        <Route path="/student/lesson/:lessonDefinitionId/challenge" element={<ChallengePage />} />
        <Route path="/student/challenge-summary" element={<ChallengeSummaryPage />} />


        {/* --- Teacher, Admin, Superadmin Routes --- */}
        {/* Teacher Homepage (Dashboard) - accessible by all teacher-like roles */}
        <Route path="/teacher-homepage" element={
          <ProtectedRoute allowedRoles={["ROLE_TEACHER", "ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <TeacherHomepage />
          </ProtectedRoute>
        } />
        
        {/* Placeholder for a generic teacher profile page */}
        {/*
        <Route path="/teacher-profile" element={
          <ProtectedRoute allowedRoles={["ROLE_TEACHER", "ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <TeacherProfile />
          </ProtectedRoute>
        } />
        */}

        {/* Admin & Superadmin: Manage Courses Route */}
        <Route path="/teacher/manage-courses" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <ManageCoursesPage />
          </ProtectedRoute>
        } />

        {/* Superadmin Only: Appoint Admin Route */}
        <Route path="/teacher/appoint-admin" element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERADMIN"]}>
            <AppointAdminPage />
          </ProtectedRoute>
        } />
        
        {/* You can add more specific routes using nested <Route> and <Outlet /> with ProtectedRoute */}
        {/* For example:
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]} />}>
            <Route path="/admin/courses/new" element={<CreateCoursePage />} />
            <Route path="/admin/courses/:courseId/edit" element={<EditCoursePage />} />
        </Route>
        */}

        {/* --- Default Route --- */}
        <Route path="/" element={<Navigate to="/student-login" replace />} />

          {/* --- NEW TEACHER PROGRESS ROUTES START --- */}
          <Route
              path="/teacher/classroom/:classroomId/progress"
              element={<ClassroomStudentProgressOverviewPage />}
          />
          <Route
              path="/teacher/classroom/:classroomId/student/:studentId/progress"
              element={<StudentCourseDetailPage />}
          />
          {/* --- NEW TEACHER PROGRESS ROUTES END --- */}

        {/* --- Catch-all for undefined routes (Optional but recommended) --- */}
        <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>404 - Page Not Found</h2>
                <p>Sorry, the page you are looking for does not exist.</p>
                {/* You could add a button to go home */}
            </div>
        } />

      </Routes>
    </AuthProvider>
  );
};

export default App;