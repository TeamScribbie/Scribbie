// src/page/student/StudentHomepage.jsx
import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import necessary components
import Navbar from '../../components/layout/navbar';
import StudentSidebar from '../../components/layout/StudentSidebar';
import ClassroomCard from '../../components/cards/ClassroomCard'; // Reused
import JoinClassCard from '../../components/cards/JoinClassCard';
import JoinClassDialog from '../../components/dialogs/JoinClassDialog';

import '../../styles/StudentHomepage.css'; // Import the new CSS

const StudentHomepage = () => {
  const navigate = useNavigate();
  // Example state - replace with actual joined classes later
  const [joinedClasses, setJoinedClasses] = useState([{ name: 'Class 1' }]);
  const [isJoinClassDialogOpen, setIsJoinClassDialogOpen] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = useState(true); // Add later if needed

  const handleJoinClassAttempt = (classCode) => {
    console.log(`Attempting to join class with code: ${classCode}`);
    // --- API Call to join class would go here ---
    // If successful, update joinedClasses state
    // Example: setJoinedClasses([...joinedClasses, { name: `New Class (Code: ${classCode})` }]);
  };

  const handleClassCardClick = (className) => {
    console.log(`Navigate to student view for class: ${className}`);
    // navigate(`/student/class/${className}`); // Example route
  };

  return (
    <div className="student-homepage-container">
      {/* Add sidebarOpen state/prop later if making it collapsible */}
      <div className="student-sidebar">
        <StudentSidebar />
      </div>

      <div className="student-content-area">
        {/* Integrate Navbar */}
        <Navbar
          userType="Student"
          // Pass sidebar props if implementing toggle:
          // sidebarOpen={sidebarOpen}
          // setSidebarOpen={setSidebarOpen}
        />

        <div className="student-main-content">
          <Typography variant="h5" className="student-main-content-heading">
            Active Classes
          </Typography>

          <div className="card-container">
            {/* Map over joined classes */}
            {joinedClasses.map((cls, index) => (
              <ClassroomCard
                key={index} // Use unique ID later
                name={cls.name}
                onClick={() => handleClassCardClick(cls.name)}
              />
            ))}

            {/* Add the Join Class card */}
            <JoinClassCard onClick={() => setIsJoinClassDialogOpen(true)} />
          </div>
        </div>
      </div>

      {/* Render the Join Class Dialog */}
      <JoinClassDialog
        open={isJoinClassDialogOpen}
        onClose={() => setIsJoinClassDialogOpen(false)}
        onJoinClass={handleJoinClassAttempt}
      />
    </div>
  );
};

export default StudentHomepage;