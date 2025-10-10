import AsyncStorage from '@react-native-async-storage/async-storage';

export class Order {
  constructor(orderData) {
    // API fields
    this.id = orderData.id;
    this.orderId = orderData.order_id || orderData.orderId;
    this.userId = orderData.user_id;
    this.restaurantId = orderData.restaurant_id;
    this.locationId = orderData.location_id;
    this.items = orderData.items || [];
    this.totalPrice = orderData.total_price || orderData.total;
    this.paymentType = orderData.payment_type;
    this.orderType = orderData.order_type;
    this.status = orderData.status || 'pending';
    this.deliveryTime = orderData.delivery_time;
    this.specialInstructions = orderData.special_instructions;
    this.cancellationReason = orderData.cancellation_reason;
    this.createdAt = orderData.created_at || orderData.createdAt;
    this.updatedAt = orderData.updated_at || orderData.updatedAt;
    this.restaurantName =
      orderData.restaurantName ||
      orderData.restaurant_name ||
      (orderData.restaurant && orderData.restaurant.name);
    this.restaurantContact = orderData.restaurantContact;
    this.total = parseFloat(this.totalPrice) || 0;
    this.deliveryType = this.orderType;
    this.deliveryAddress = orderData.deliveryAddress;
    this.estimatedDelivery = orderData.estimatedDelivery;
    this.paymentMethod = this.paymentType === 'card' ? 'Card Payment' : 'Cash on Delivery';
    this.orderTime = this.formatTime(this.createdAt);
    this.orderDate = this.formatDate(this.createdAt);
    
    // Calculated fields
    this.estimatedDeliveryTime = this.calculateEstimatedDeliveryTime();
    this.remainingTime = this.calculateRemainingTime();
  }

  // Helper methods for formatting
  formatTime(dateString) {
    if (!dateString) return new Date().toLocaleTimeString();
    return new Date(dateString).toLocaleTimeString();
  }

  formatDate(dateString) {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString();
  }

  // Calculate estimated delivery time in minutes
  calculateEstimatedDeliveryTime() {
    if (this.estimatedDelivery) {
      // Parse "45-50 mins" or "45 mins" format
      const match = this.estimatedDelivery.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
    return null;
  }

  // Calculate remaining time in minutes
  calculateRemainingTime() {
    if (!this.estimatedDeliveryTime) return null;
    const now = new Date();
    const orderTime = new Date(this.createdAt);
    const elapsedMinutes = Math.floor((now - orderTime) / (1000 * 60));
    const remaining = this.estimatedDeliveryTime - elapsedMinutes;
    return Math.max(0, remaining);
  }

  // Get formatted remaining time
  getFormattedRemainingTime() {
    const remaining = this.calculateRemainingTime();
    if (remaining === null) return 'Time not available';
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

  // Create order from API response
  static createFromApiResponse(apiData) {
    return new Order(apiData);
  }

  // Convert cart items to API format
  static formatCartItemsForApi(cartItems) {
    return cartItems.map(item => {
      
      return {
        item_id: item.itemId || item.id || item.item_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      };
    });
  }


  // Get order status display text (dynamic based on orderType)
  getStatusDisplayText() {
    const isCollection = this.orderType === 'collection';

    const statusMap = {
      pending: 'Order Pending',
      confirmed: 'Order Confirmed',
      preparing: 'Preparing',
      delivery: isCollection ? 'Ready for Collection' : 'Out for Delivery',
      delivered: isCollection ? 'Collected' : 'Delivered',
      cancelled: 'Cancelled'
    };

    return statusMap[this.status] || this.status;
  }


  // Check if order is active (not delivered or cancelled)
  isActive() {
    return this.status !== 'delivered' && this.status !== 'cancelled';
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
