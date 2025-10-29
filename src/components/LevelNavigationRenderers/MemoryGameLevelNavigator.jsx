import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';

// Import MemoryGame assets
import memoryGameBackground from './AssetsLN/MemoryGame/MemoryPuzzleBackground.png';
import memoryGameLogo from './AssetsLN/MemoryGame/MemoryPuzzleLogo-Photoroom.png';
import prevArrowIcon from './AssetsLN/MemoryGame/Prev Icon.png';
import nextArrowIcon from './AssetsLN/MemoryGame/Next Icon.png';
import memoryGameLvlIcon from './AssetsLN/MemoryGame/MemoryPuzzleLvlIcon-Photoroom.png';
import StartChallengeButton from '../buttons/StartChallengeButton'; // Import the button

const MemoryGameLevelNavigator = ({ lesson, activityNodes, activityNodeProgress = [], onSelectNode, onPrevLesson, onNextLesson, currentLessonIdx, totalLessons }) => {

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
    const handleSelectNode = React.useCallback((node) => {
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
            backgroundImage: `url(${memoryGameBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: '60px',
            pb: '40px',
            boxSizing: 'border-box',
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
                    <IconButton onClick={onPrevLesson} sx={{ p: 0 }}>
                        <img src={prevArrowIcon} alt="Previous" style={{ width: '60px', height: '60px' }} />
                    </IconButton>
                )}
                 {isFirstLesson && <Box sx={{ width: '60px', height: '60px' }} />}

                <Box sx={{ width: 'clamp(150px, 40vw, 300px)', flexGrow: 1, textAlign: 'center' }}>
                    <img src={memoryGameLogo} alt="Memory Puzzle Logo" style={{ width: '100%', height: 'auto' }} />
                </Box>

                {!isLastLesson && (
                    <IconButton onClick={onNextLesson} sx={{ p: 0 }}>
                        <img src={nextArrowIcon} alt="Next" style={{ width: '60px', height: '60px' }} />
                    </IconButton>
                )}
                 {isLastLesson && <Box sx={{ width: '60px', height: '60px' }} />}
            </Box>

            <Typography variant="h5" component="span" sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                mb: 4,
                textAlign: 'center',
                fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            }}>
                {lesson.lessonTitle}
            </Typography>

            <Grid container spacing={2} sx={{ width: '90%', maxWidth: '800px', mx: 'auto', justifyContent: 'center' }}>
                {levels.map(level => (
                    <Grid item key={level.activityId} xs={4} sm={3} md={2.4} sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <Paper
                            onClick={() => !level.isLocked && handleSelectNode(level)}
                            sx={{
                                width: { xs: '80px', sm: '100px' },
                                height: { xs: '80px', sm: '100px' },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.2rem',
                                fontWeight: 'bold',
                                backgroundImage: `url(${memoryGameLvlIcon})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundColor: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                                color: level.isLocked ? '#999' : '#4a2c5a',
                                cursor: level.isLocked ? 'not-allowed' : 'pointer',
                                opacity: level.isLocked ? 0.5 : 1,
                                filter: level.isLocked ? 'grayscale(1)' : 'none',
                                transition: 'transform 0.2s ease, filter 0.2s ease',
                                '&:hover': level.isLocked ? {} : {
                                    transform: 'scale(1.1)',
                                    filter: 'brightness(1.2)',
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
            
            {/* ✨ FIXED: Passing the 'lesson' prop correctly to the button ✨ */}
            <StartChallengeButton lesson={lesson} />

        </Box>
    );
};

MemoryGameLevelNavigator.propTypes = {
    lesson: PropTypes.object.isRequired,
    activityNodes: PropTypes.array.isRequired,
    activityNodeProgress: PropTypes.array,
    onSelectNode: PropTypes.func.isRequired,
    onPrevLesson: PropTypes.func.isRequired,
    onNextLesson: PropTypes.func.isRequired,
    currentLessonIdx: PropTypes.number.isRequired,
    totalLessons: PropTypes.number.isRequired,
};

export default MemoryGameLevelNavigator;