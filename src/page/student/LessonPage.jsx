// src/page/student/LessonPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/navbar';
import LessonBox from '../../components/cards/LessonBox'; // Correct path
import ActivityNode from '../../components/ActivityNode'; // Correct path
import '../../styles/LessonPage.css';
import { CircularProgress, Alert, Typography } from '@mui/material';

// --- Dummy Data ---
const dummyLessonsData = [
    { lessonId: 1, lessonTitle: 'Lesson 1: Introduction', activityNodes: [ { activityId: 101, gameType: 1, isFinished: true, totalScore: 100 }, { activityId: 102, gameType: 2, isFinished: false, totalScore: 0 }, ] },
    { lessonId: 2, lessonTitle: 'Lesson 2: Basic Concepts', activityNodes: [ { activityId: 201, gameType: 1, isFinished: false, totalScore: 0 }, { activityId: 202, gameType: 3, isFinished: false, totalScore: 0 }, { activityId: 203, gameType: 1, isFinished: false, totalScore: 0 }, ] },
    { lessonId: 3, lessonTitle: 'Lesson 3: Advanced Topics', activityNodes: [ { activityId: 301, gameType: 2, isFinished: false, totalScore: 0 }, ] },
    { lessonId: 4, lessonTitle: 'Lesson 4: Wrap Up', activityNodes: [ { activityId: 401, gameType: 1, isFinished: false, totalScore: 0 }, { activityId: 402, gameType: 2, isFinished: false, totalScore: 0 }, ] },
    { lessonId: 5, lessonTitle: 'Lesson 5: Review', activityNodes: [ { activityId: 501, gameType: 3, isFinished: false, totalScore: 0 }, ] },
    { lessonId: 6, lessonTitle: 'Lesson 6: Assessment', activityNodes: [ { activityId: 601, gameType: 1, isFinished: false, totalScore: 0 }, ] },
];
// --- End Dummy Data ---

const LessonPage = () => {
  const { classroomId } = useParams();
  const [lessonsData, setLessonsData] = React.useState(dummyLessonsData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleNodeClick = (activity) => {
    console.log(`Clicked Activity Node: ID=${activity.activityId}, Type=${activity.gameType}, Finished=${activity.isFinished}`);
  };

  return (
    <div className="lesson-page-container">
      <Navbar />
      <div className="lesson-page-content">
        <Typography variant="h4" className="lesson-page-title">
          Lessons for Classroom {classroomId}
        </Typography>

        {isLoading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {!isLoading && !error && lessonsData.length > 0 && (
          <div className="lesson-path">
            {lessonsData.map((lesson, lessonIndex) => ( // Get lessonIndex here
              <React.Fragment key={lesson.lessonId}>
                <LessonBox
                  lessonNumber={lessonIndex + 1}
                  title={lesson.lessonTitle}
                />
                <div className="activity-node-group">
                  {lesson.activityNodes.map((activity) => (
                    <ActivityNode
                      key={activity.activityId}
                      activityData={activity}
                      onClick={() => handleNodeClick(activity)}
                      // highlight-start
                      // Pass the lessonIndex down
                      lessonIndex={lessonIndex}
                      // highlight-end
                    />
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
        {/* ... rest of component ... */}
      </div>
    </div>
  );
};

export default LessonPage;