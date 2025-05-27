// src/components/cards/LessonBox.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, CardActions, Button, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const LessonBox = ({ lesson, onManage, onEdit, onDelete, canModify }) => {
  return (
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #FFE8A3',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 2,
        }
      }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ color: '#451513', fontWeight: 'bold' }}>
            {lesson.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lesson.description}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid #eee' }}>
          <Button
              size="small"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() => onManage(lesson.lessonId)}
              sx={{ color: '#451513' }}
          >
            Manage Activities
          </Button>
          {/* ✨ ICONS FOR EDIT AND DELETE ✨ */}
          <Box>
            {canModify && (
                <>
                  <IconButton
                      size="small"
                      onClick={() => onEdit(lesson)}
                      aria-label={`edit lesson ${lesson.title}`}
                      sx={{ color: 'primary.main' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                      size="small"
                      onClick={() => onDelete(lesson.lessonId)}
                      aria-label={`delete lesson ${lesson.title}`}
                      sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
            )}
          </Box>
          {/* ✨ END OF ICONS ✨ */}
        </CardActions>
      </Card>
  );
};

LessonBox.propTypes = {
  lesson: PropTypes.object.isRequired,
  onManage: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canModify: PropTypes.bool.isRequired, // Prop to control edit/delete visibility
};

export default LessonBox;