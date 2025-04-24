import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/LessonListPage.css"; // Optional styling

const lessons = [
  { id: 1, title: "Lesson 1", progress: 40, status: "Continue" },
  { id: 2, title: "Lesson 2", status: "Review" },
  { id: 3, title: "Lesson 3", status: "Review" },
];

const LessonListPage = () => {
  const navigate = useNavigate();

  return (
    <div className="lesson-list-container">
      <h2 className="lesson-title">Lessons</h2>
      {lessons.map((lesson) => (
        <div className="lesson-card" key={lesson.id}>
          <div className="lesson-label">{lesson.title}</div>
          {lesson.progress && (
            <div className="lesson-progress">
              <div
                className="lesson-progress-bar"
                style={{ width: `${lesson.progress}%` }}
              />
            </div>
          )}
          <button
            className="lesson-btn"
            onClick={() => navigate(`/lesson/${lesson.id}`)}
          >
            {lesson.status}
          </button>
        </div>
      ))}
    </div>
  );
};

export default LessonListPage;
