import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import LessonBox from "./LessonBox";
import "../css/LessonPage.css";

const lessonNodes = [
  { id: 1, status: "current" },
  { id: 2, status: "unlocked" },
  { id: 3, status: "chest" },
  { id: 4, status: "locked" },
];

const LessonPage = () => {
  const { id } = useParams(); // 👈 get dynamic lesson id
  const navigate = useNavigate();

  return (
    <div className="lesson-wrapper">
      <div className="lesson-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h2>Lesson {id}</h2>
      </div>

      <div className="lesson-path">
        {lessonNodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <LessonBox status={node.status} />
            {index < lessonNodes.length - 1 && <div className="line" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LessonPage;
