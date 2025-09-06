import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Order } from '../models/order';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [showOrderNotification, setShowOrderNotification] = useState(false);

  // Load active order on mount
  useEffect(() => {
    loadActiveOrder();
  }, []);

  const loadActiveOrder = async () => {
    try {
      const order = await Order.getActiveOrder();
      setActiveOrder(order);
      setShowOrderNotification(!!order);
    } catch (error) {
      console.error('Error loading active order:', error);
    }
  };

  const setOrderPlaced = useCallback(async (orderDetails) => {
    try {
      const order = Order.createFromOrderDetails(orderDetails);
      setActiveOrder(order);
      setShowOrderNotification(true);
      
      // Auto-dismiss notification after 5 minutes (since it's a bottom bar)
      setTimeout(() => {
        setShowOrderNotification(false);
      }, 300000); // 5 minutes
    } catch (error) {
      console.error('Error setting order placed:', error);
    }
  }, []);

  const dismissNotification = useCallback(() => {
    setShowOrderNotification(false);
  }, []);

  const clearActiveOrder = useCallback(async () => {
    try {
      if (activeOrder) {
        activeOrder.updateStatus('delivered');
      }
      setActiveOrder(null);
      setShowOrderNotification(false);
    } catch (error) {
      console.error('Error clearing active order:', error);
    }
  }, [activeOrder]);

  const refreshOrderStatus = useCallback(async () => {
    try {
      const order = await Order.getActiveOrder();
      setActiveOrder(order);
      setShowOrderNotification(!!order);
    } catch (error) {
      console.error('Error refreshing order status:', error);
    }
  }, []);

  const value = {
    activeOrder,
    showOrderNotification,
    setOrderPlaced,
    dismissNotification,
    clearActiveOrder,
    refreshOrderStatus,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
