import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';

// Import WordFeast assets
import wordFeastBackground from './AssetsLN/WordFeast/WordFeastBackground.png';
import wordFeastLogo from './AssetsLN/WordFeast/WordFeastLogo-Photoroom.png';
import prevArrowIcon from './AssetsLN/WordFeast/Prev Icon.png';
import nextArrowIcon from './AssetsLN/WordFeast/Next Icon.png';
import wordFeastLvlIcon from './AssetsLN/WordFeast/WordFeastLvlIcon-Photoroom.png';
// ✨ 1. Import the modular button component
import StartChallengeButton from '../buttons/StartChallengeButton';


// ✨ 2. Add challengeDetails to the component's props
const WordFeastLevelNavigator = ({ lesson, activityNodes, activityNodeProgress = [], onSelectNode, onPrevLesson, onNextLesson, currentLessonIdx, totalLessons}) => {
    
    // Helper function to check if a level is unlocked
    const isLevelUnlocked = (activityId, nodeIndex) => {
        // First activity node is always unlocked
        if (nodeIndex === 0) {
            return true;
        }
        
        // For subsequent nodes, check if the previous node is finished
        const previousNode = activityNodes[nodeIndex - 1];
        if (!previousNode) return false;
        
        const previousProgressData = activityNodeProgress.find(
            p => (p.activityNodeType?.activityNodeTypeId || p.activityNodeTypeId) === previousNode.activityId
        );
        
        return previousProgressData?.isFinished || previousProgressData?.finished || false;
    };
    
    // Just pass through to original handler
    const handleSelectNode = useCallback((node) => {
        onSelectNode(node);
    }, [onSelectNode]);
    
    const levels = useMemo(() => {
        return activityNodes.map((node, index) => {
            const progressData = activityNodeProgress.find(
                p => (p.activityNodeType?.activityNodeTypeId || p.activityNodeTypeId) === node.activityId
            );
            
            return {
                ...node,
                levelNumber: index + 1,
                isLocked: !isLevelUnlocked(node.activityId, index),
                isCompleted: progressData?.isFinished || progressData?.finished || false,
                hasProgress: !!progressData,
            };
        });
    }, [activityNodes, activityNodeProgress]);

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
                    <Grid item key={level.activityId} xs={4} sm={3} md={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        <Paper
                            elevation={0}
                            onClick={() => !level.isLocked && handleSelectNode(level)}
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
                                color: level.isLocked ? '#999' : '#451513',
                                textShadow: level.isLocked ? 'none' : '1px 1px 2px rgba(255, 255, 255, 0.5)',
                                cursor: level.isLocked ? 'not-allowed' : 'pointer',
                                opacity: level.isLocked ? 0.5 : 1,
                                filter: level.isLocked ? 'grayscale(1)' : 'none',
                                transition: 'transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease',
                                
                                '&:hover': level.isLocked ? {} : {
                                    transform: 'scale(1.15) translateY(-5px)',
                                    filter: 'brightness(1.2) drop-shadow(0 5px 10px rgba(0,0,0,0.5))',
                                },
                            }}
                        >
                            {level.isLocked ? '🔒' : level.levelNumber}
                        </Paper>
                        {/* Show checkmark for completed levels */}
                        {level.isCompleted && !level.isLocked && (
                            <Box sx={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                backgroundColor: '#4caf50',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                color: 'white',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            }}>
                                ✓
                            </Box>
                        )}
                    </Grid>
                ))}
            </Grid>

            {/* ✨ 3. Add the StartChallengeButton component ✨ */}
            <StartChallengeButton lesson={lesson} />
        </Box>
    );
};

WordFeastLevelNavigator.propTypes = {
    lesson: PropTypes.object.isRequired,
    activityNodes: PropTypes.array.isRequired,
    activityNodeProgress: PropTypes.array,
    onSelectNode: PropTypes.func.isRequired,
    onPrevLesson: PropTypes.func.isRequired,
    onNextLesson: PropTypes.func.isRequired,
    currentLessonIdx: PropTypes.number.isRequired,
    totalLessons: PropTypes.number.isRequired,
};

// Set a default value for the new prop
WordFeastLevelNavigator.defaultProps = {
    challengeDetails: null,
};

export default WordFeastLevelNavigator;