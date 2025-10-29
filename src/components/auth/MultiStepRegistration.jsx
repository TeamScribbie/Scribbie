// src/components/auth/MultiStepRegistration.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField, IconButton, InputAdornment, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import './MultiStepRegistration.css';

const MultiStepRegistration = ({ formData, onChange, onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  
  const steps = [
    {
      id: 1,
      title: "WHAT'S YOUR STUDENT ID?",
      field: 'studentId',
      placeholder: 'Enter your student ID'
    },
    {
      id: 2,
      title: "WHAT IS YOUR FIRST NAME?",
      field: 'firstName',
      placeholder: 'Enter your first name'
    },
    {
      id: 3,
      title: "WHAT IS YOUR LAST NAME?",
      field: 'lastName',
      placeholder: 'Enter your last name'
    },
    {
      id: 4,
      title: "WHAT WILL BE YOUR MAGIC WORD?",
      subtitle: "THIS MAGIC WORD WILL BE YOUR PASSWORD :D",
      field: 'password',
      placeholder: 'Enter your magic word',
      isPassword: true
    },
    {
      id: 5,
      title: "REVIEW",
      isReview: true
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const totalSteps = steps.length;

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStepData && formData[currentStepData.field] && formData[currentStepData.field].trim() !== '') {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFieldChange = (e) => {
    onChange(e);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Show confirmation dialog instead of submitting directly
    setOpenConfirmDialog(true);
  };

  const handleConfirmRegistration = () => {
    setOpenConfirmDialog(false);
    // Create a synthetic event for the onSubmit handler
    const syntheticEvent = {
      preventDefault: () => {},
      target: {}
    };
    onSubmit(syntheticEvent);
  };

  const handleCancelRegistration = () => {
    setOpenConfirmDialog(false);
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderProgressBar = () => {
    return (
      <div className="progress-container">
        <div className="progress-bars">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`progress-bar ${currentStep >= step.id ? 'active' : ''} ${
                currentStep > step.id ? 'completed' : ''
              }`}
            />
          ))}
        </div>
        <div className="progress-text">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    return (
      <div className="review-card">
        <h3 className="review-title">REVIEW</h3>
        <div className="review-fields">
          <div className="review-field">
            <label>ID NUMBER:</label>
            <div className="review-value">{formData.studentId || '00-0000-000'}</div>
          </div>
          <div className="review-field">
            <label>FIRSTNAME:</label>
            <div className="review-value">{formData.firstName || '00-0000-000'}</div>
          </div>
          <div className="review-field">
            <label>LASTNAME:</label>
            <div className="review-value">{formData.lastName || '00-0000-000'}</div>
          </div>
          <div className="review-field">
            <label>PASSWORD:</label>
            <div className="review-value password-field">
              {showPassword ? formData.password : '************'}
              <IconButton
                onClick={handlePasswordVisibility}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                size="small"
                className="password-toggle"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInputStep = () => {
    if (currentStepData.isReview) {
      return renderReviewStep();
    }

    return (
      <div className="step-content">
        <h2 className="step-title">{currentStepData.title}</h2>
        {currentStepData.subtitle && (
          <p className="step-subtitle">{currentStepData.subtitle}</p>
        )}
        <TextField
          name={currentStepData.field}
          type={currentStepData.isPassword ? (showPassword ? 'text' : 'password') : 'text'}
          value={formData[currentStepData.field] || ''}
          onChange={handleFieldChange}
          placeholder={currentStepData.placeholder}
          fullWidth
          className="step-input"
          InputProps={
            currentStepData.isPassword
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handlePasswordVisibility}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              : undefined
          }
        />
        {currentStepData.isPassword && (
          <PasswordStrengthIndicator password={formData.password || ''} />
        )}
      </div>
    );
  };

  const getButtonText = () => {
    if (currentStep === totalSteps) {
      return isLoading ? 'REGISTERING...' : 'REGISTER';
    }
    return 'NEXT';
  };

  const getButtonColor = () => {
    if (currentStep === totalSteps) {
      return 'orange';
    }
    return 'orange';
  };

  const isButtonDisabled = () => {
    // Loading state
    if (isLoading) return true;

    // Review step validation
    if (currentStepData?.isReview) {
      return !formData.studentId || !formData.firstName || !formData.lastName || !formData.password;
    }

    // Input step validation
    const fieldValue = formData[currentStepData?.field];
    return !fieldValue || fieldValue.trim() === '';
  };

  return (
    <div className="multi-step-registration">
      {renderProgressBar()}
      
      <form onSubmit={handleSubmit} className="step-form">
        {renderInputStep()}
        
        <div className="step-navigation">
          {currentStep > 1 && (
            <Button
              onClick={handlePrev}
              className="prev-button"
              variant="contained"
            >
              PREV
            </Button>
          )}
          
          <Button
            type={currentStep === totalSteps ? 'submit' : 'button'}
            onClick={currentStep === totalSteps ? undefined : handleNext}
            className={`next-button ${getButtonColor()}`}
            variant="contained"
            disabled={isButtonDisabled()}
          >
            {getButtonText()}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelRegistration}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '8px'
          }
        }}
      >
        <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 'bold', fontSize: '20px' }}>
          Are you sure you want to register?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description" sx={{ fontSize: '16px', color: '#666' }}>
            Please confirm that all your information is correct. Once you register, you'll be able to log in with your Student ID and password.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: '12px' }}>
          <Button 
            onClick={handleCancelRegistration} 
            variant="outlined"
            sx={{ 
              color: '#451513',
              borderColor: '#451513',
              '&:hover': {
                borderColor: '#451513',
                backgroundColor: 'rgba(69, 21, 19, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmRegistration} 
            variant="contained"
            autoFocus
            disabled={isLoading}
            sx={{ 
              backgroundColor: '#FDB10D',
              '&:hover': {
                backgroundColor: '#f9b121'
              }
            }}
          >
            {isLoading ? 'Registering...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

MultiStepRegistration.propTypes = {
  formData: PropTypes.shape({
    studentId: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default MultiStepRegistration;
