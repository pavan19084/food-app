import * as Notifications from 'expo-notifications';

// Configure notification handler for background notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  static notificationHistory = new Map(); // Track sent notifications to prevent duplicates
  static notificationCounters = new Map(); // Track notification counts per order
  static async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission not granted for notifications!');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async sendOrderStatusNotification(order, status, previousStatus) {
    try {
      // Create unique key for this notification
      const notificationKey = `${order.orderId}-${status}`;

      const notificationContent = this.getNotificationContent(order, status, previousStatus);

      // Increment counter for this order
      const currentCount = this.notificationCounters.get(order.orderId) || 0;
      this.notificationCounters.set(order.orderId, currentCount + 1);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationContent.title,
          body: notificationContent.body,
          data: {
            orderId: order.orderId,
            status: status,
            restaurantName: order.restaurantName || 'Restaurant',
            type: 'order_status_update',
            notificationCount: currentCount + 1,
          },
          sound: 'notification.wav', // Custom sound from assets
        },
        trigger: { seconds: 1 }, // Show immediately
      });

      // Mark this notification as sent
      this.notificationHistory.set(notificationKey, Date.now());
      
      // Clean up old notifications (keep only last 10 per order)
      this.cleanupOldNotifications(order.orderId);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  static getNotificationContent(order, status, previousStatus) {
    const restaurantName = order.restaurantName || 'Restaurant';
    const orderId = order.orderId || 'Order';
    
    // Don't send notification if status hasn't changed
    if (status === previousStatus) {
      return null;
    }

    switch (status.toLowerCase()) {
      case 'pending':
        return {
          title: '🕐 Order Received',
          body: `${restaurantName} has received your order #${orderId.slice(-6)}`
        };

      case 'confirmed':
        return {
          title: '✅ Order Confirmed',
          body: `${restaurantName} has confirmed your order and started preparing it!`
        };

      case 'prepared':
        return {
          title: '🍽️ Order Ready',
          body: `Your order from ${restaurantName} is ready! ${order.deliveryType === 'delivery' ? 'It will be delivered soon.' : 'Ready for collection.'}`
        };

      case 'out_for_delivery':
        return {
          title: '🚚 Out for Delivery',
          body: `Your order from ${restaurantName} is on the way! Track your delivery.`
        };

      case 'delivered':
        return {
          title: '🎉 Order Delivered',
          body: `Your order from ${restaurantName} has been delivered! Enjoy your meal!`
        };

      case 'ready':
        return {
          title: '📦 Ready for Collection',
          body: `Your order from ${restaurantName} is ready for collection!`
        };

      case 'collected':
        return {
          title: '✅ Order Collected',
          body: `Thank you for collecting your order from ${restaurantName}!`
        };

      case 'cancelled':
        return {
          title: '❌ Order Cancelled',
          body: `Your order from ${restaurantName} has been cancelled. ${previousStatus === 'pending' ? 'The restaurant was unable to accept your order.' : 'The order has been cancelled.'}`
        };

      default:
        return {
          title: '📱 Order Update',
          body: `Your order from ${restaurantName} status has been updated to ${status}`
        };
    }
  }

  static async sendDeliveryTimerNotification(order, timeRemaining) {
    try {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      
      if (minutes <= 5 && minutes > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Delivery Update',
            body: `Your order from ${order.restaurantName} will arrive in approximately ${minutes} minute${minutes > 1 ? 's' : ''}`,
            data: {
              orderId: order.orderId,
              type: 'delivery_timer',
              timeRemaining: timeRemaining
            },
            sound: 'notification.wav',
          },
          trigger: { seconds: 1 },
        });
      }
    } catch (error) {
      console.error('Error sending delivery timer notification:', error);
    }
  }

  static async sendPreparationCompleteNotification(order) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🍽️ Food is Ready!',
          body: `Your order from ${order.restaurantName} is ready! ${order.deliveryType === 'delivery' ? 'It will be delivered soon.' : 'Ready for collection.'}`,
          data: {
            orderId: order.orderId,
            type: 'preparation_complete'
          },
          sound: 'notification.wav',
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error sending preparation complete notification:', error);
    }
  }

  static cleanupOldNotifications(orderId) {
    // Keep only the last 10 notifications per order
    const orderNotifications = Array.from(this.notificationHistory.entries())
      .filter(([key]) => key.startsWith(`${orderId}-`))
      .sort(([, timeA], [, timeB]) => timeB - timeA)
      .slice(10); // Keep only last 10
    
    // Remove old notifications
    orderNotifications.forEach(([key]) => {
      this.notificationHistory.delete(key);
    });
  }

  static clearOrderNotifications(orderId) {
    // Clear all notifications for a specific order
    const keysToDelete = Array.from(this.notificationHistory.keys())
      .filter(key => key.startsWith(`${orderId}-`));
    
    keysToDelete.forEach(key => {
      this.notificationHistory.delete(key);
    });
    
    // Clear counter for this order
    this.notificationCounters.delete(orderId);
  }

  static getNotificationStats(orderId) {
    const count = this.notificationCounters.get(orderId) || 0;
    const history = Array.from(this.notificationHistory.keys())
      .filter(key => key.startsWith(`${orderId}-`))
      .map(key => key.split('-').slice(1).join('-'));
    
    return {
      count,
      sentNotifications: history,
      totalNotifications: this.notificationHistory.size
    };
  }

  static resetAllNotifications() {
    this.notificationHistory.clear();
    this.notificationCounters.clear();
  }

  static async clearAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationHistory.clear();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  static async sendOrderPlacedNotification(order) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Order Placed Successfully!',
          body: `Your order from ${order.restaurantName} has been placed and is being processed.`,
          data: {
            orderId: order.orderId,
            type: 'order_placed'
          },
          sound: 'notification.wav',
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error sending order placed notification:', error);
    }
  }

  static async sendDeliveryReminderNotification(order, timeRemaining) {
    try {
      const minutes = Math.floor(timeRemaining / 60);
      
      if (minutes === 5 || minutes === 1) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚚 Delivery Reminder',
            body: `Your order from ${order.restaurantName} will arrive in ${minutes} minute${minutes > 1 ? 's' : ''}`,
            data: {
              orderId: order.orderId,
              type: 'delivery_reminder',
              timeRemaining: timeRemaining
            },
            sound: 'notification.wav',
          },
          trigger: { seconds: 1 },
        });
      }
    } catch (error) {
      console.error('Error sending delivery reminder notification:', error);
    }
  }
}

export default NotificationService;
