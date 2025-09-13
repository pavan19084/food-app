import AsyncStorage from '@react-native-async-storage/async-storage';

export class Order {
  constructor(orderData) {
    this.id = orderData.orderId || orderData.id;
    this.restaurantName = orderData.restaurantName;
    this.restaurantContact = orderData.restaurantContact;
    this.items = orderData.items || [];
    this.total = orderData.total;
    this.deliveryType = orderData.deliveryType || 'delivery';
    this.deliveryAddress = orderData.deliveryAddress;
    this.estimatedDelivery = orderData.estimatedDelivery;
    this.paymentMethod = orderData.paymentMethod;
    this.orderTime = orderData.orderTime;
    this.orderDate = orderData.orderDate;
    this.specialInstructions = orderData.specialInstructions;
    
    // Order status and timing
    this.status = orderData.status || 'confirmed';
    this.createdAt = orderData.createdAt || new Date().toISOString();
    this.estimatedDeliveryTime = this.calculateEstimatedDeliveryTime();
    this.remainingTime = this.calculateRemainingTime();
  }

  // Calculate estimated delivery time in minutes
  calculateEstimatedDeliveryTime() {
    if (this.estimatedDelivery) {
      // Parse "45-50 mins" or "45 mins" format
      const match = this.estimatedDelivery.match(/(\d+)/);
      return match ? parseInt(match[1]) : 45;
    }
    return 45; // Default 45 minutes
  }

  // Calculate remaining time in minutes
  calculateRemainingTime() {
    const now = new Date();
    const orderTime = new Date(this.createdAt);
    const elapsedMinutes = Math.floor((now - orderTime) / (1000 * 60));
    const remaining = this.estimatedDeliveryTime - elapsedMinutes;
    return Math.max(0, remaining);
  }

  // Get formatted remaining time
  getFormattedRemainingTime() {
    const remaining = this.calculateRemainingTime();
    if (remaining <= 0) {
      return this.deliveryType === 'delivery' ? 'Delivered' : 'Ready for collection';
    }
    return `${remaining} min left`;
  }

  // Get total items count
  getTotalItems() {
    return this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  // Get formatted price
  getFormattedPrice() {
    return `£${this.total}`;
  }

  // Get order summary for display
  getOrderSummary() {
    return {
      id: this.id,
      restaurantName: this.restaurantName,
      totalItems: this.getTotalItems(),
      formattedPrice: this.getFormattedPrice(),
      remainingTime: this.getFormattedRemainingTime(),
      status: this.status,
      paymentMethod: this.paymentMethod,
    };
  }

  // Update order status
  updateStatus(newStatus) {
    this.status = newStatus;
    this.saveToStorage();
  }

  // Save order to AsyncStorage
  async saveToStorage() {
    try {
      const orders = await Order.getAllOrders();
      const existingIndex = orders.findIndex(order => order.id === this.id);
      
      if (existingIndex >= 0) {
        orders[existingIndex] = this;
      } else {
        orders.push(this);
      }
      
      await AsyncStorage.setItem('@orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving order:', error);
    }
  }

  // Get all orders from AsyncStorage
  static async getAllOrders() {
    try {
      const ordersData = await AsyncStorage.getItem('@orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        return orders.map(orderData => new Order(orderData));
      }
      return [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Get active order (most recent order that's not delivered)
  static async getActiveOrder() {
    try {
      const orders = await Order.getAllOrders();
      const activeOrders = orders.filter(order => 
        order.status !== 'delivered' && order.calculateRemainingTime() > 0
      );
      
      if (activeOrders.length > 0) {
        // Return the most recent active order
        return activeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      }
      return null;
    } catch (error) {
      console.error('Error getting active order:', error);
      return null;
    }
  }

  // Create new order from order details
  static createFromOrderDetails(orderDetails) {
    const order = new Order(orderDetails);
    order.saveToStorage();
    return order;
  }

  // Clear all orders (for testing)
  static async clearAllOrders() {
    try {
      await AsyncStorage.removeItem('@orders');
    } catch (error) {
      console.error('Error clearing orders:', error);
    }
  }
}

// Helper function to map order data
export const mapOrder = (orderData) => {
  return new Order(orderData);
};
