import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const TimerContext = createContext();

const DELIVERY_TIME_FLOOR = 2;

export const TimerProvider = ({ children }) => {
  const [timerData, setTimerData] = useState({
    isActive: false,
    totalTime: 0,
    preparationTime: 0,
    deliveryTime: 0,
    timeRemaining: 0,
    orderStatus: 'pending',
    orderId: null,
    startTime: null,
    phase: 'preparation',
  });

  const timerIntervalRef = useRef(null);
  const isStartingRef = useRef(false);

  const startTimer = (orderData) => {
    const { orderId, preparationTime, deliveryTime, status, startTime, orderType } = orderData;
    
    if (isStartingRef.current) {
      return;
    }
    
    if (timerData.isActive && timerData.orderId === orderId) {
      return;
    }
    
    isStartingRef.current = true;
    
    const prepTimeMinutes = convertTimeToMinutes(preparationTime);
    const deliveryTimeMinutes = typeof deliveryTime === 'string' ? 
      convertTimeToMinutes(deliveryTime) : 
      Number(deliveryTime) || 0;
    
    const orderStartTime = startTime ? new Date(startTime) : new Date();
    
    let phase = 'preparation';
    let timeRemaining = 0;
    let totalTime = 0;
    
    const now = new Date();
    const elapsedMinutes = startTime ? Math.floor((now - orderStartTime) / (1000 * 60)) : 0;
    
    // CASE 1: COLLECTION ORDER
    if (orderType === 'collection') {
      totalTime = prepTimeMinutes;
      phase = 'preparation';
      timeRemaining = Math.max(2, prepTimeMinutes - elapsedMinutes);
      
    } 

    // CASE 2: DELIVERY ORDER  
    else if (orderType === 'delivery') {
      // Combine prep time + delivery time
      totalTime = prepTimeMinutes + deliveryTimeMinutes;
      
      // Check if already in delivery phase
      if (status === 'out_for_delivery' || status === 'delivery') {
        phase = 'delivery';
        // Calculate remaining delivery time
        const prepElapsed = Math.min(elapsedMinutes, prepTimeMinutes);
        const deliveryElapsed = Math.max(0, elapsedMinutes - prepTimeMinutes);
        timeRemaining = Math.max(DELIVERY_TIME_FLOOR, deliveryTimeMinutes - deliveryElapsed);
        
      } else {
        phase = 'preparation';
        timeRemaining = Math.max(deliveryTimeMinutes, totalTime - elapsedMinutes);
        
        if (timeRemaining <= deliveryTimeMinutes) {
          phase = 'delivery';
          const deliveryElapsed = Math.max(0, elapsedMinutes - prepTimeMinutes);
          timeRemaining = Math.max(DELIVERY_TIME_FLOOR, deliveryTimeMinutes - deliveryElapsed);
        }
      }
    }
    
    setTimerData({
      isActive: true,
      totalTime,
      preparationTime: prepTimeMinutes,
      deliveryTime: deliveryTimeMinutes,
      timeRemaining,
      orderStatus: status,
      orderId,
      startTime: orderStartTime,
      phase,
    });

    startCountdown();
    isStartingRef.current = false;
  };

  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    if (typeof timeString === 'number') return timeString;
    
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes + (seconds / 60);
  };

  const startCountdown = () => {
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const interval = setInterval(() => {
      setTimerData(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
              
        // COLLECTION ORDER: Stop at 2 minutes (only prep time)
        if (prev.phase === 'preparation' && newTimeRemaining <= 2) {
          clearInterval(interval);
          timerIntervalRef.current = null;
          
          return {
            ...prev,
            timeRemaining: 2,
            isActive: false,
          };
        }
        
        // DELIVERY ORDER - PREP PHASE: Switch to delivery phase when prep time is done
        if (prev.phase === 'preparation' && newTimeRemaining <= prev.deliveryTime) {
          return {
            ...prev,
            phase: 'delivery',
            timeRemaining: prev.deliveryTime,
          };
        }
        
        // DELIVERY ORDER - DELIVERY PHASE: Stop at 2 minutes
        if (prev.phase === 'delivery' && newTimeRemaining <= DELIVERY_TIME_FLOOR) {

          clearInterval(interval);
          timerIntervalRef.current = null;
          
          return {
            ...prev,
            timeRemaining: DELIVERY_TIME_FLOOR,
            isActive: false,
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 60000); // Every minute

    timerIntervalRef.current = interval;
  };

  const stopTimer = () => {
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setTimerData({
      isActive: false,
      totalTime: 0,
      preparationTime: 0,
      deliveryTime: 0,
      timeRemaining: 0,
      orderStatus: 'pending',
      orderId: null,
      startTime: null,
      phase: 'preparation',
    });
    
    isStartingRef.current = false;
  };

  const updateOrderStatus = (status) => {
    
    setTimerData(prev => {
      const newData = { ...prev, orderStatus: status };
      
      // Resume timer when out_for_delivery
      if ((status === 'out_for_delivery' || status === 'delivery') && 
          prev.phase === 'preparation' && 
          !prev.isActive && 
          prev.timeRemaining === prev.deliveryTime) {
        
        newData.phase = 'delivery';
        newData.isActive = true;
        newData.startTime = new Date();
        
        setTimeout(() => startCountdown(), 0);
      }
      
      // Keep timer visible when delivered
      if (status === 'delivered') {
        newData.isActive = false;
      }
      
      return newData;
    });
  };

  const getFormattedTime = () => {
    const hours = Math.floor(timerData.timeRemaining / 60);
    const minutes = Math.round(timerData.timeRemaining % 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const shouldShowTimer = () => {
    return timerData.timeRemaining > 0 && timerData.orderStatus !== 'pending';
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  const value = {
    timerData,
    startTimer,
    stopTimer,
    updateOrderStatus,
    getFormattedTime,
    shouldShowTimer,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};