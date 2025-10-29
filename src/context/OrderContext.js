import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Order } from "../models/order";
import { trackOrder } from "../api/order";
import { useTimer } from "./TimerContext";
import { DistanceService } from "../utils/distanceService";
import NotificationService from "../utils/notificationService";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [showOrderNotification, setShowOrderNotification] = useState(false);
  const { startTimer, updateOrderStatus, stopTimer } = useTimer();

  const pollingRef = useRef(null);
  const previousStatusRef = useRef(null);

  useEffect(() => {
    loadActiveOrder();
    // Reset notification history on app start to prevent stale notifications
    NotificationService.resetAllNotifications();
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
        
        if (localOrder.status === 'confirmed' && 
            localOrder.preparationTime && 
            localOrder.deliveryTimeMinutes) {
          
          const timerData = {
            orderId: localOrder.orderId,
            preparationTime: localOrder.preparationTime,
            deliveryTime: localOrder.deliveryTimeMinutes,
            status: localOrder.status,
            startTime: localOrder.orderPlacedAt
          };
          
          startTimer(timerData);
        }
      } else {
        setActiveOrder(null);
        setShowOrderNotification(false);
      }
    } catch (error) {
      console.error("Error loading active order:", error);
    }
  };

// In OrderContext.js - Update the startPolling function

  const startPolling = useCallback((order) => {
    if (!order || !order.orderId) return;
    stopPolling();

    const poll = async () => {
      try {
        const result = await trackOrder(order.orderId);
        if (!result || !result.success || !result.data) return;
        
        const updated = Order.createFromApiResponse(result.data);
        
        // Preserve stored delivery time from original order
        if (!updated.deliveryTimeMinutes && order.deliveryTimeMinutes) {
          updated.deliveryTimeMinutes = order.deliveryTimeMinutes;
        }
        
        // Preserve delivery distance
        if (!updated.deliveryDistance && order.deliveryDistance) {
          updated.deliveryDistance = order.deliveryDistance;
        }
        
        // Preserve order placed time
        if (!updated.orderPlacedAt && order.orderPlacedAt) {
          updated.orderPlacedAt = order.orderPlacedAt;
        }
        
        const finalStatuses = ["delivered", "cancelled", "collected"];
        if (finalStatuses.includes((updated.status || "").toLowerCase())) {
          // Send final status notification before clearing
          if (previousStatusRef.current && previousStatusRef.current !== updated.status) {
            await NotificationService.sendOrderStatusNotification(updated, updated.status, previousStatusRef.current);
          }
          
          // Clear notification history for this order after final status
          setTimeout(() => {
            NotificationService.clearOrderNotifications(updated.orderId);
          }, 5000); // Clear after 5 seconds
          
          stopPolling();
          setShowOrderNotification(false);
          await Order.removeActiveOrder();
          setActiveOrder(null);
          stopTimer();
          return;
        }

        if (updated.saveToStorage) {
          await updated.saveToStorage();
        }


        updateOrderStatus(updated.status);

        // Send notification for status change (only once per status)
        if (previousStatusRef.current && previousStatusRef.current !== updated.status) {
          await NotificationService.sendOrderStatusNotification(updated, updated.status, previousStatusRef.current);
          
          // Log notification stats
          const stats = NotificationService.getNotificationStats(updated.orderId);
        }

        if (updated.status === 'confirmed' && 
            result.data.delivery_time && 
            !updated.totalTimeMinutes) {

          
          const preparationTime = result.data.delivery_time;
          const deliveryTime = updated.deliveryTimeMinutes;

          updated.setTimerData(preparationTime, deliveryTime);
          await updated.saveToStorage();
          
          // Start the timer
          const timerData = {
            orderId: updated.orderId,
            preparationTime: preparationTime,
            deliveryTime: deliveryTime,
            status: updated.status,
            orderType: updated.orderType,
            startTime: updated.orderPlacedAt,
          };
          
          startTimer(timerData);
        }

        if (updated.status === 'delivered' || updated.status === 'cancelled') {
          stopTimer();
        }

        // Update previous status for next comparison
        previousStatusRef.current = updated.status;
        setActiveOrder(updated);
        setShowOrderNotification(updated.isActive());
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 20000);
  }, [updateOrderStatus, startTimer, stopTimer]);

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

  const setOrderPlaced = useCallback(
    async (orderDetails) => {
      try {
        const order = Order.createFromOrderDetails(orderDetails);
        
        // Calculate delivery time ONCE when order is placed (if not already set)
        if (!order.deliveryTimeMinutes && order.user_location && order.restaurant) {
          try {
            const distanceResult = await DistanceService.getRoadDistance(
              parseFloat(order.user_location.longitude),
              parseFloat(order.user_location.latitude),
              parseFloat(order.restaurant.longitude),
              parseFloat(order.restaurant.latitude)
            );
            
            if (distanceResult.success && distanceResult.duration) {
              
              order.setDeliveryDistanceData(
                distanceResult.distance,
                distanceResult.duration
              );
              await order.saveToStorage();
            }
          } catch (error) {
            console.error("❌ Error calculating delivery distance:", error);
          }
        }
        
        setActiveOrder(order);
        setShowOrderNotification(true);
        
        // Set initial status for tracking changes
        previousStatusRef.current = order.status;

        startPolling(order);

        setTimeout(() => {
          setShowOrderNotification(false);
        }, 300000); // 5 minutes
      } catch (error) {
        console.error("Error setting order placed:", error);
      }
    },
    [startPolling]
  );

  const dismissNotification = useCallback(() => {
    setShowOrderNotification(false);
  }, []);

  const clearActiveOrder = useCallback(async () => {
    try {
      stopPolling();
      await Order.removeActiveOrder();
      setActiveOrder(null);
      setShowOrderNotification(false);
    } catch (error) {
      console.error("Error clearing active order:", error);
    }
  }, [stopPolling]);

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
      console.error("Error refreshing order status:", error);
    }
  }, []);

  // Clean up interval on unmount just in case
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling, activeOrder]);

  const value = {
    activeOrder,
    showOrderNotification,
    setActiveOrder,
    setOrderPlaced,
    dismissNotification,
    clearActiveOrder,
    refreshOrderStatus,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};