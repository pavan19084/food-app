import { useState, useCallback } from 'react';

export const useAlert = () => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const show = useCallback((options) => {
    setAlertState({
      visible: true,
      title: options.title || 'Alert',
      message: options.message || '',
      buttons: options.buttons || [{ text: 'OK', onPress: () => {} }]
    });
  }, []);

  const hide = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      visible: false
    }));
  }, []);

  return {
    show,
    hide,
    ...alertState
  };
};
