import React, { useState } from 'react';
import CustomAlert from '../components/CustomAlert';

// Global alert manager using context
let alertManager = null;

export const showCustomAlert = (options) => {
  if (alertManager) {
    alertManager.show(options);
  }
};

export const hideCustomAlert = () => {
  if (alertManager) {
    alertManager.hide();
  }
};

// Simple wrapper functions for common alert types
export const showSuccessAlert = (message, title = 'Success') => {
  showCustomAlert({
    title,
    message,
    buttons: [
      {
        text: 'OK',
        onPress: () => {},
        style: 'default'
      }
    ]
  });
};

export const showErrorAlert = (message, title = 'Error') => {
  showCustomAlert({
    title,
    message,
    buttons: [
      {
        text: 'OK',
        onPress: () => {},
        style: 'default'
      }
    ]
  });
};

export const showConfirmAlert = (message, onConfirm, title = 'Confirm', confirmText = 'Yes', cancelText = 'Cancel') => {
  showCustomAlert({
    title,
    message,
    buttons: [
      {
        text: cancelText,
        onPress: () => {},
        style: 'cancel'
      },
      {
        text: confirmText,
        onPress: onConfirm,
        style: 'default'
      }
    ]
  });
};

export const showOptionsAlert = (message, options, title = 'Options') => {
  showCustomAlert({
    title,
    message,
    buttons: options.map(option => ({
      text: option.text,
      onPress: option.onPress,
      style: option.style || 'default'
    }))
  });
};

// Export the setter for alert manager
export const setAlertManager = (manager) => {
  alertManager = manager;
};