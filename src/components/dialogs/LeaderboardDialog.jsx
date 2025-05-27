import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LiveLeaderboard from '../student/LiveLeaderboard';

const LeaderboardDialog = ({ open, onClose, lessonDefinitionId }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Lesson Leaderboard
        <IconButton onClick={onClose} size="small" sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <LiveLeaderboard lessonDefinitionId={lessonDefinitionId} currentPlayerLocalScore={0} />
      </DialogContent>
    </Dialog>
  );
};

LeaderboardDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  lessonDefinitionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default LeaderboardDialog;
