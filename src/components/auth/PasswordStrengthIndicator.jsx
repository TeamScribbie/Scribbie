// src/components/auth/PasswordStrengthIndicator.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import './PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#e0e0e0' };

    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    // Calculate score
    if (checks.length) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    // Determine label and color
    let label = '';
    let color = '';
    
    if (score === 0) {
      label = '';
      color = '#e0e0e0';
    } else if (score <= 40) {
      label = 'Weak';
      color = '#451513'; // Scribbie maroon
    } else if (score <= 60) {
      label = 'Fair';
      color = '#f9b121'; // Scribbie orange
    } else if (score <= 80) {
      label = 'Good';
      color = '#36B8E4'; // Scribbie blue
    } else {
      label = 'Strong';
      color = '#FDB10D'; // Scribbie primary orange
    }

    return { score, label, color, checks };
  };

  const strength = calculateStrength(password);

  return (
    <Box className="password-strength-container">
      {password && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={strength.score}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: strength.color,
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                },
              }}
            />
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: strength.color,
                minWidth: '60px',
                textAlign: 'right',
              }}
            >
              {strength.label}
            </Typography>
          </Box>

          <Box className="password-requirements">
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
              Password must contain:
            </Typography>
            <Box className="requirement-list">
              <RequirementItem
                met={strength.checks?.length}
                text="At least 8 characters"
              />
              <RequirementItem
                met={strength.checks?.uppercase}
                text="One uppercase letter (A-Z)"
              />
              <RequirementItem
                met={strength.checks?.lowercase}
                text="One lowercase letter (a-z)"
              />
              <RequirementItem
                met={strength.checks?.number}
                text="One number (0-9)"
              />
              <RequirementItem
                met={strength.checks?.special}
                text="One special character (!@#$...)"
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

const RequirementItem = ({ met, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
    {met ? (
      <CheckCircleIcon sx={{ fontSize: 16, color: '#FDB10D' }} />
    ) : (
      <CancelIcon sx={{ fontSize: 16, color: '#e0e0e0' }} />
    )}
    <Typography
      sx={{
        fontSize: '12px',
        color: met ? '#FDB10D' : '#999',
        fontWeight: met ? 500 : 400,
      }}
    >
      {text}
    </Typography>
  </Box>
);

PasswordStrengthIndicator.propTypes = {
  password: PropTypes.string.isRequired,
};

RequirementItem.propTypes = {
  met: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
};

export default PasswordStrengthIndicator;
