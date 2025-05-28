import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

const FillBlanksGameComponent = ({ activityData }) => {
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAnswerChange = (blankId, value) => {
        setAnswers(prev => ({
            ...prev,
            [blankId]: value
        }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        // Add submission logic here
    };

    return (
        <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="h4" gutterBottom>
                    {activityData?.title || 'Fill in the Blanks'}
                </Typography>
                
                <Box sx={{ my: 3 }}>
                    {activityData?.blanks?.map((blank, index) => (
                        <Box key={blank.id} sx={{ mb: 2 }}>
                            <Typography variant="body1" gutterBottom>
                                {blank.question}
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type your answer here"
                                value={answers[blank.id] || ''}
                                onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                                disabled={isSubmitted}
                                sx={{ backgroundColor: 'white' }}
                            />
                            {isSubmitted && (
                                <Typography 
                                    color={answers[blank.id] === blank.correctAnswer ? 'success.main' : 'error.main'}
                                    sx={{ mt: 1 }}
                                >
                                    {answers[blank.id] === blank.correctAnswer 
                                        ? 'Correct!' 
                                        : `Incorrect. The correct answer is: ${blank.correctAnswer}`}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitted}
                    fullWidth
                >
                    Submit Answers
                </Button>
            </Paper>
        </Box>
    );
};

FillBlanksGameComponent.propTypes = {
    activityData: PropTypes.shape({
        title: PropTypes.string,
        blanks: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            question: PropTypes.string.isRequired,
            correctAnswer: PropTypes.string.isRequired,
        })).isRequired,
    }).isRequired,
};

export default FillBlanksGameComponent;
