import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Modal } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Navbar from '../../components/layout/navbar';
import StudentSidebar from '../../components/layout/StudentSidebar';
import { useNavigate } from 'react-router-dom';

const challenges = [
  {
    image: '/src/assets/reading-bg.png',
    label: 'Reading',
    to: null,
    startImage: '/src/assets/start-reading.png',
  },
  {
    image: '/src/assets/stories-bg.png',
    to: '/student-story-game',
    label: 'Tell Me A Story',
    startImage: '/src/assets/start-story.png',
  },
  {
    image: '/src/assets/memory-bg.png',
    to: '/student-memory-game',
    label: '🧠 Match Game',
    startImage: '/src/assets/start-memory.png',
  },
];

const StudentChallenges = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const handleOpen = (challenge) => {
    setSelectedChallenge(challenge);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedChallenge(null);
  };

  const handleStart = () => {
    if (selectedChallenge?.to) {
      navigate(selectedChallenge.to);
      handleClose();
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <StudentSidebar />

      <Box sx={{ flex: 1, ml: '100px' }}>
        <Navbar />

        <Box
          sx={{
            overflow: 'auto',
            p: 10,
            backgroundImage: 'url(/src/assets/challengepage-bg.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            minHeight: 'calc(100vh - 64px)',
            width: '100%',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(270deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #FF6B6B)',
                backgroundSize: '1000% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 8s ease infinite',
                display: 'inline-block',
                '@keyframes gradientShift': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' },
                },
              }}
            >
              It's time for fun!
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#444' }}>
              Learn English through games and fun tasks!
            </Typography>
          </Box>

          <Grid container spacing={20} justifyContent="center">
            {challenges.map((challenge, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    height: '450px',
                    width: '155%',
                    backgroundImage: `url(${challenge.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 5,
                    boxShadow: 5,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 10,
                    },
                    p: 2,
                    m: 1,
                  }}
                >
                  <Box sx={{ zIndex: 100, display: 'flex', justifyContent: 'right', pb: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleOpen(challenge)}
                      sx={{
                        borderRadius: '50px',
                        backgroundColor: '#4CAF50',
                        color: '#fff',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          backgroundColor: '#43A047',
                        },
                      }}
                    >
                      PLAY
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Modal Popup */}
          <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropProps={{
              timeout: 300,
              sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 700,
                height: 500,
                outline: 'none',
                borderRadius: 4,
                overflow: 'hidden',
                animation: 'popupFade 0.4s ease-out forwards',
                '@keyframes popupFade': {
                  from: { opacity: 0, transform: 'scale(0.8) translate(-50%, -50%)' },
                  to: { opacity: 1, transform: 'scale(1) translate(-50%, -50%)' },
                },
              }}
            >
              {selectedChallenge && (
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img
                    src={selectedChallenge.startImage}
                    alt="Start Game"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: selectedChallenge.to ? 'none' : 'grayscale(70%)',
                      transition: 'filter 0.3s',
                    }}
                  />
                  <Button
                    onClick={handleStart}
                    disabled={!selectedChallenge.to}
                    sx={{
                      position: 'absolute',
                      bottom: 30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      px: 6,
                      py: 1.8,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      borderRadius: '30px',
                      backgroundColor: selectedChallenge.to ? '#ea5546' : '#ccc',
                      color: selectedChallenge.to ? '#fff' : '#666',
                      boxShadow: selectedChallenge.to ? '0px 4px 12px rgba(0,0,0,0.3)' : 'none',
                      transition: 'all 0.1s ease',
                      '&:hover': {
                        backgroundColor: selectedChallenge.to ? '#d4493c' : '#ccc',
                        transform: selectedChallenge.to
                          ? 'translateX(-50%) scale(1.05)'
                          : 'translateX(-50%)',
                      },
                    }}
                  >
                    {selectedChallenge.to ? 'Start' : 'Coming Soon'}
                  </Button>
                </Box>
              )}
            </Box>
          </Modal>
        </Box>
      </Box>
    </Box>
  );
};

export default StudentChallenges;