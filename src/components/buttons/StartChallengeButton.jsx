import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const StartChallengeButton = ({ lesson }) => {
  const navigate = useNavigate();

  // This handler will navigate the user to the challenge page
  const handleStartChallenge = () => {
    if (lesson?.lessonDefinitionId && lesson?.challengeDefinitionId) {
      navigate(`/student/lesson/${lesson.lessonDefinitionId}/challenge`);
    } else {
      console.error("Cannot start challenge: Missing lessonDefinitionId or challengeDefinitionId");
    }
  };

  // The button will only render if a challengeDefinitionId exists
  if (!lesson?.challengeDefinitionId) {
    return null;
  }

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleStartChallenge}
      sx={{
        mt: 2,
        mb: 2,
        fontWeight: 'bold',
        backgroundColor: '#FFD700', // Example: Gold color
        '&:hover': {
          backgroundColor: '#FFC700',
        },
      }}
    >
      Start Challenge
    </Button>
  );
};

export default StartChallengeButton;