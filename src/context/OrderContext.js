import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Order } from '../models/order';
import { trackOrder } from '../api/order';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [showOrderNotification, setShowOrderNotification] = useState(false);

  const pollingRef = useRef(null);

  useEffect(() => {
    loadActiveOrder();
    return () => {
      stopPolling();
    };
  }, []);

  const loadActiveOrder = async () => {
    try {
      const localOrder = await Order.getActiveOrder();
      if (localOrder) {
        setActiveOrder(localOrder);
        setShowOrderNotification(true);
      }
    } catch (error) {
      console.error('Error loading active order:', error);
    }
  };
  const startPolling = useCallback((order) => {
    if (!order || !order.orderId) return;
    stopPolling();

    const poll = async () => {
      try {
        const result = await trackOrder(order.orderId);
        if (!result || !result.success || !result.data) return;
        const updated = Order.createFromApiResponse(result.data);
        if (updated.saveToStorage) {
          await updated.saveToStorage();
        }

        setActiveOrder(updated);
        setShowOrderNotification(updated.isActive());
        const finalStatuses = ['delivered', 'cancelled', 'collected'];
        if (finalStatuses.includes((updated.status || '').toLowerCase())) {
          stopPolling();
          setShowOrderNotification(false);
          setActiveOrder(updated); 
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 20000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (activeOrder && activeOrder.orderId) {
      startPolling(activeOrder);
    } else {
      stopPolling();
    }
  }, [activeOrder, startPolling, stopPolling]);

  const setOrderPlaced = useCallback(async (orderDetails) => {
    try {
      const order = Order.createFromOrderDetails(orderDetails);
      setActiveOrder(order);
      setShowOrderNotification(true);

      startPolling(order);

      setTimeout(() => {
        setShowOrderNotification(false);
      }, 300000); // 5 minutes
    } catch (error) {
      console.error('Error setting order placed:', error);
    }
  }, [startPolling]);

  const dismissNotification = useCallback(() => {
    setShowOrderNotification(false);
  }, []);

  const clearActiveOrder = useCallback(async () => {
    try {
      if (activeOrder) {
        // mark delivered locally and persist
        if (typeof activeOrder.updateStatus === 'function') {
          activeOrder.updateStatus('delivered');
        } else {
          // fallback: set property + save
          activeOrder.status = 'delivered';
          if (typeof activeOrder.saveToStorage === 'function') {
            await activeOrder.saveToStorage();
          }
        }
      }
      stopPolling();
      setActiveOrder(null);
      setShowOrderNotification(false);
    } catch (error) {
      console.error('Error clearing active order:', error);
    }
  }, [activeOrder, stopPolling]);

  // Force refresh (one-off). Useful for pull-to-refresh or manual triggers.
  const refreshOrderStatus = useCallback(async () => {
    try {
      const local = await Order.getActiveOrder();
      if (local) {
        setActiveOrder(local);
        setShowOrderNotification(true);
      } else {
        setActiveOrder(null);
        setShowOrderNotification(false);
      }
    } catch (error) {
      console.error('Error refreshing order status:', error);
    }
  }, []);

  // Clean up interval on unmount just in case
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const value = {
    activeOrder,
    showOrderNotification,
    setOrderPlaced,
    dismissNotification,
    clearActiveOrder,
    refreshOrderStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
