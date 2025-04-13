import { Routes, Route } from "react-router-dom";
import NotFound from "./page/NotFound";
import StudentHomepage from "./page/student/StudentHomepage";
import StudentLogin from "./page/student/StudentLogin";
import StudentRegistration from "./page/student/StudentRegistration";

function App() {
  return (
    <Routes>
      <Route path="/student-homepage" element={<StudentHomepage />} />
      <Route path="/" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegistration />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;