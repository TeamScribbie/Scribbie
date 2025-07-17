// src/components/LevelNavigationRenderers/BalloonGameLevelNavigator.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';

import './BalloonGameLevelNavigator.css';

// Corrected import paths based on the new explicit folder structure provided
import rainingTacoBackground from './AssetsLN/BalloonGame/RainingTacoBBackround.png'; // Corrected from .png to .jpg in previous step
import rainingTacoLogo from './AssetsLN/BalloonGame/Raining Tacos Logo.png';
import prevArrowIcon from './AssetsLN/BalloonGame/Prev Icon.png'; // Corrected from .png to .jpg in previous step
import nextArrowIcon from './AssetsLN/BalloonGame/Next Icon.png'; // Corrected from .png to .jpg in previous step
import rainingLvlIcon from './AssetsLN/BalloonGame/RainingLvlIcon.png';


const StarRating = ({ score }) => {
    const numStars = score > 90 ? 3 : score > 50 ? 2 : score > 0 ? 1 : 0;
    if (numStars === 0) return <Box className="star-rating" />;
    return (
        <Box className="star-rating">
            {Array.from({ length: numStars }, (_, i) => (
                <StarIcon key={i} className="star" />
            ))}
        </Box>
    );
};

const BalloonGameLevelNavigator = ({ lesson, activityNodes, activityNodeProgress, onSelectNode, onPrevLesson, onNextLesson, currentLessonIdx, totalLessons }) => {
    
    const levels = useMemo(() => {
        const mergedLevels = activityNodes.map((node, index) => {
            const progress = activityNodeProgress?.find(p => p.activityNodeTypeId === node.activityId);
            const isCompleted = progress?.completed || false;
            
            // A level is locked if the previous one wasn't completed
            const isLocked = index > 0 && !activityNodeProgress?.find(p => p.activityNodeTypeId === activityNodes[index - 1].activityId)?.completed;

            return {
                ...node,
                levelNumber: index + 1,
                isCompleted,
                isLocked,
                score: progress?.totalScore || 0,
            };
        });
        return mergedLevels;

    }, [activityNodes, activityNodeProgress]);

    const isFirstLesson = currentLessonIdx === 0;
    const isLastLesson = currentLessonIdx === totalLessons - 1;

    return (
        <Box sx={{
            backgroundImage: `url(${rainingTacoBackground})`,
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
            {/* Navigation Arrows & Raining Tacos Logo */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1, sm: 2 },
                mb: 2, // Slightly reduced margin to bring title closer
                width: '100%',
                maxWidth: '400px',
            }}>
                {/* Previous Lesson Button */}
                {!isFirstLesson && (
                    <IconButton onClick={onPrevLesson} sx={{ p: 0, '&:hover img': { filter: 'brightness(1.1)' } }}>
                        <img src={prevArrowIcon} alt="Previous Lesson" style={{ width: '60px', height: '60px', display: 'block' }} />
                    </IconButton>
                )}
                {/* Placeholder for alignment if button is hidden */}
                {isFirstLesson && <Box sx={{ width: '60px', height: '60px' }} />} 

                {/* Raining Tacos Logo - Adjusted Size */}
                <Box sx={{
                    width: 'clamp(150px, 40vw, 300px)', // Made logo smaller (from 200-400px to 150-300px)
                    height: 'auto',
                    flexGrow: 1,
                    textAlign: 'center',
                }}>
                    <img src={rainingTacoLogo} alt="Raining Tacos Logo" style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
                </Box>

                {/* Next Lesson Button */}
                {!isLastLesson && (
                    <IconButton onClick={onNextLesson} sx={{ p: 0, '&:hover img': { filter: 'brightness(1.1)' } }}>
                        <img src={nextArrowIcon} alt="Next Lesson" style={{ width: '60px', height: '60px', display: 'block' }} />
                    </IconButton>
                )}
                {/* Placeholder for alignment if button is hidden */}
                {isLastLesson && <Box sx={{ width: '60px', height: '60px' }} />}
            </Box>

            {/* Lesson Title (still present but less prominent) */}
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

            {/* Level Grid */}
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
                            className={`level-button ${level.isLocked ? 'locked' : ''} ${level.isCompleted ? 'completed' : ''}`}
                            onClick={() => !level.isLocked && onSelectNode(level)}
                            sx={{
                                width: { xs: '80px', sm: '90px', md: '100px' },
                                height: { xs: '80px', sm: '90px', md: '100px' },
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.2rem',
                                fontWeight: 'bold',
                                // Make the card background transparent and only show the icon
                                background: 'transparent', // Explicitly set background to transparent
                                border: 'none', // Ensure no border
                                boxShadow: 'none', // Ensure no shadow from the Paper component itself
                                padding: 0,
                                // --- Level Icon specific styling ---
                                backgroundImage: `url(${rainingLvlIcon})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                color: '#451513',
                                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)',
                                cursor: level.isLocked ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease',
                                
                                // Interactive Hover Effects
                                '&:not(.locked):hover': {
                                    transform: 'scale(1.15) translateY(-5px)',
                                    filter: 'brightness(1.2) drop-shadow(0 5px 10px rgba(0,0,0,0.5))', // Still allowing drop-shadow on hover for game feel
                                    // animation: 'pulse 0.5s ease-in-out infinite alternate', // Keep this in your CSS for keyframes
                                },
                                
                                // Locked state
                                '&.locked': {
                                    filter: 'grayscale(100%) brightness(0.7) opacity(0.8)',
                                    color: '#757575',
                                    pointerEvents: 'none',
                                },
                                // Completed state
                                '&.completed': {
                                    // No default styles here, relying on the base icon
                                },
                            }}
                        >
                            {level.isLocked ? <LockIcon sx={{ fontSize: '2.5rem', color: '#757575' }} /> : level.levelNumber}
                        </Paper>
                        {!level.isLocked && <StarRating score={level.score} />}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

BalloonGameLevelNavigator.propTypes = {
    lesson: PropTypes.object.isRequired,
    activityNodes: PropTypes.array.isRequired,
    activityNodeProgress: PropTypes.array,
    onSelectNode: PropTypes.func.isRequired,
    onPrevLesson: PropTypes.func.isRequired,
    onNextLesson: PropTypes.func.isRequired,
    currentLessonIdx: PropTypes.number.isRequired,
    totalLessons: PropTypes.number.isRequired,
};

export default BalloonGameLevelNavigator;