import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Navbar from '../../components/layout/navbar';
import StudentSidebar from '../../components/layout/StudentSidebar';

const challenges = [
  {
    image: '/src/assets/reading-bg.png',
  },
  {
    image: '/src/assets/stories-bg.png',
  },
  {
    image: '/src/assets/grammar-bg.png',
  },
];

const StudentChallenges = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, ml: '100px' }}>
        {/* Navbar */}
        <Navbar />

{/* Page Content */}
<Box
  sx={{
    overflow: 'auto',
    p: 10,
    backgroundImage: 'url(/src/assets/challengepage-bg.png)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    minHeight: 'calc(100vh - 64px)', // ✅ wrap in string
    width: '100%',
  }}
>
          {/* Header */}
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

          {/* Challenge Cards */}
<Grid container spacing={20} justifyContent="center">
  {challenges.map((challenge, index) => (
    <Grid item xs={12} sm={6} md={4} key={index}>
      <Box
        sx={{
          height: '450px',
          width: '155%', // make it fit inside the grid item
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
{/* Play Button */}
<Box
  sx={{
    zIndex: 100,
    display: 'flex',
    justifyContent: 'right',
    pb: 1, // padding bottom for spacing
  }}
>
  <Button
    variant="contained"
    startIcon={<PlayArrowIcon />}
    sx={{
      borderRadius: '50px',
      backgroundColor: '#4CAF50', // bright green
      color: '#fff', // white text for contrast
      fontWeight: 'bold',
      px: 4,
      py: 1.5,
      fontSize: '1.1rem',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#43A047', // darker green on hover
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
        </Box>
      </Box>
    </Box>
  );
};

export default StudentChallenges;
