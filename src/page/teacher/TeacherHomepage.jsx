// src/page/teacher/TeacherHomepage.jsx
import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Corrected import paths:
import Navbar from '../../components/layout/navbar';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import ClassroomCard from '../../components/cards/ClassroomCard'; // Or classroom/ClassroomCard
import AddClassCard from '../../components/cards/AddClassCard';   // Or classroom/AddClassCard
import AddClassDialog from '../../components/dialogs/AddClassDialog';// Or classroom/AddClassDialog

import '../../styles/TeacherHomepage.css'; // Import the new CSS

const TeacherHomepage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAddClassToList = (newClassData) => {
    console.log('Adding class:', newClassData);
    setClasses([...classes, { name: newClassData.name }]);
  };

  const handleClassCardClick = (className) => {
    console.log(`Navigate to classroom: ${className}`);
    // navigate(`/teacher/classroom/${className}`);
  };

  return (
    <div className="teacher-homepage-container">
      <div className={`teacher-sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <TeacherSidebar isOpen={sidebarOpen} activeItem="Classes"/>
      </div>

      <div className={`teacher-content-area ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
        />

        <div className="teacher-main-content">
          <Typography variant="h5" className="main-content-heading">
            Active Classes
          </Typography>

          <div className="card-container">
            {classes.map((cls, index) => (
              <ClassroomCard
                key={index}
                name={cls.name}
                onClick={() => handleClassCardClick(cls.name)}
              />
            ))}
            <AddClassCard onClick={() => setIsAddClassDialogOpen(true)} />
          </div>
        </div>
      </div>

      <AddClassDialog
        open={isAddClassDialogOpen}
        onClose={() => setIsAddClassDialogOpen(false)}
        onAddClass={handleAddClassToList}
      />
    </div>
  );
};

export default TeacherHomepage;