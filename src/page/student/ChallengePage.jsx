import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Navbar from '../../components/layout/navbar';
import StudentSidebar from '../../components/layout/StudentSidebar';


const challenges = [
  {
    title: 'Reading for fun',
    image: '/images/reading-bg.jpg',
    bgColor: '#D6F8FF',
  },
  {
    title: 'Story Telling',
    image: '/images/story-bg.jpg',
    bgColor: '#D0FFD6',
  },
  {
    title: 'Grammar Quest',
    image: '/images/grammar-bg.jpg',
    bgColor: '#FFE5EC',
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
        <Box sx={{ p: 10 }}>
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

          <Grid container spacing={4} justifyContent="center">
            {challenges.map((challenge, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    backgroundColor: challenge.bgColor,
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: 3,
                    position: 'relative',
                    textAlign: 'center',
                    padding: 5,
                    minHeight: '280px',
                  }}
                >
                  <img
                    src={challenge.image}
                    alt={challenge.title}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2,
                      fontWeight: 'bold',
                      color: '#333',
                    }}
                  >
                    {challenge.title}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: '50px',
                      backgroundColor: '#2d2d2d',
                      '&:hover': {
                        backgroundColor: '#000',
                      },
                    }}
                  >
                    Play
                  </Button>
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
