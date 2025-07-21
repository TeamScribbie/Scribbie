// src/components/LevelNavigationRenderers/WordFeastLevelNavigator.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';

// Import WordFeast assets
import wordFeastBackground from './AssetsLN/WordFeast/WordFeastBackground.png';
import wordFeastLogo from './AssetsLN/WordFeast/WordFeastLogo-Photoroom.png';
import prevArrowIcon from './AssetsLN/WordFeast/Prev Icon.png';
import nextArrowIcon from './AssetsLN/WordFeast/Next Icon.png';
import wordFeastLvlIcon from './AssetsLN/WordFeast/WordFeastLvlIcon-Photoroom.png';


const WordFeastLevelNavigator = ({ lesson, activityNodes, onSelectNode, onPrevLesson, onNextLesson, currentLessonIdx, totalLessons }) => {
    
    const levels = useMemo(() => {
        return activityNodes.map((node, index) => {
            return {
                ...node,
                levelNumber: index + 1,
            };
        });
    }, [activityNodes]);

    const isFirstLesson = currentLessonIdx === 0;
    const isLastLesson = currentLessonIdx === totalLessons - 1;

    return (
        <Box sx={{
            backgroundImage: `url(${wordFeastBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            pt: '60px',
            pb: '40px',
            boxSizing: 'border-box',
            zIndex: 1,
            overflowY: 'auto',
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1, sm: 2 },
                mb: 2,
                width: '100%',
                maxWidth: '400px',
            }}>
                {!isFirstLesson && (
                    <IconButton onClick={onPrevLesson} sx={{ p: 0, '&:hover img': { filter: 'brightness(1.1)' } }}>
                        <img src={prevArrowIcon} alt="Previous Lesson" style={{ width: '60px', height: '60px', display: 'block' }} />
                    </IconButton>
                )}
                {isFirstLesson && <Box sx={{ width: '60px', height: '60px' }} />} 

                <Box sx={{
                    width: 'clamp(150px, 40vw, 300px)',
                    height: 'auto',
                    flexGrow: 1,
                    textAlign: 'center',
                }}>
                    <img src={wordFeastLogo} alt="WordFeast Logo" style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
                </Box>

                {!isLastLesson && (
                    <IconButton onClick={onNextLesson} sx={{ p: 0, '&:hover img': { filter: 'brightness(1.1)' } }}>
                        <img src={nextArrowIcon} alt="Next Lesson" style={{ width: '60px', height: '60px', display: 'block' }} />
                    </IconButton>
                )}
                {isLastLesson && <Box sx={{ width: '60px', height: '60px' }} />}
            </Box>

            <Typography variant="h5" component="span" sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                mb: 4,
                textAlign: 'center',
                fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            }}>
                {lesson.lessonTitle}
            </Typography>

            <Grid container spacing={2} sx={{
                width: '90%',
                maxWidth: '800px',
                mx: 'auto',
                justifyContent: 'center',
                flexGrow: 1,
            }}>
                {levels.map(level => (
                    <Grid item key={level.activityId} xs={4} sm={3} md={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Paper
                            elevation={0}
                            onClick={() => onSelectNode(level)}
                            sx={{
                                width: { xs: '80px', sm: '90px', md: '100px' },
                                height: { xs: '80px', sm: '90px', md: '100px' },
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.2rem',
                                fontWeight: 'bold',
                                background: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                                padding: 0,
                                backgroundImage: `url(${wordFeastLvlIcon})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                color: '#451513',
                                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease',
                                
                                '&:hover': {
                                    transform: 'scale(1.15) translateY(-5px)',
                                    filter: 'brightness(1.2) drop-shadow(0 5px 10px rgba(0,0,0,0.5))',
                                },
                            }}
                        >
                            {level.levelNumber}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

WordFeastLevelNavigator.propTypes = {
    lesson: PropTypes.object.isRequired,
    activityNodes: PropTypes.array.isRequired,
    onSelectNode: PropTypes.func.isRequired,
    onPrevLesson: PropTypes.func.isRequired,
    onNextLesson: PropTypes.func.isRequired,
    currentLessonIdx: PropTypes.number.isRequired,
    totalLessons: PropTypes.number.isRequired,
};

export default WordFeastLevelNavigator;