import AsyncStorage from "@react-native-async-storage/async-storage";

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
    this.status = orderData.status || "pending";
    this.deliveryTime = orderData.delivery_time;
    this.specialInstructions = orderData.special_instructions;

    this.preparationTime = orderData.preparationTime || orderData.delivery_time;
    this.deliveryTimeMinutes = orderData.deliveryTimeMinutes || orderData.delivery_time_minutes;
    this.totalTimeMinutes = orderData.totalTimeMinutes || orderData.total_time_minutes;
    this.orderPlacedAt = orderData.orderPlacedAt || orderData.created_at || new Date().toISOString();
    this.deliveryDistance = orderData.deliveryDistance;
    
    this.cancellationReason = orderData.cancellation_reason;
    this.createdAt = orderData.created_at || orderData.createdAt;
    this.updatedAt = orderData.updated_at || orderData.updatedAt;
    this.restaurantName =
      orderData.restaurantName ||
      orderData.restaurant_name ||
      (orderData.restaurant && orderData.restaurant.name);

    this.restaurant = orderData.restaurant;
    this.user_location = orderData.user_location;

    // Extract restaurant coordinates
    this.restaurantLatitude = orderData.restaurant?.latitude;
    this.restaurantLongitude = orderData.restaurant?.longitude;

    // Extract restaurant contact info
    this.restaurantContact = orderData.restaurantContact || orderData.restaurant?.phone;
    this.restaurantEmail = orderData.restaurantEmail || orderData.restaurant?.email;
    this.total = parseFloat(this.totalPrice) || 0;
    this.subtotal = parseFloat(orderData.subtotal) || 0;
    this.deliveryFee = parseFloat(orderData.delivery_fee) || 0;
    this.discount = parseFloat(orderData.discount) || 0;
    this.deliveryType = this.orderType;
    this.deliveryAddress = orderData.deliveryAddress;
    this.estimatedDelivery = orderData.estimatedDelivery;
    this.paymentMethod =
      this.paymentType === "card" ? "Card Payment" : "Cash on Delivery";
    this.orderTime = this.formatTime(this.createdAt);
    this.orderDate = this.formatDate(this.createdAt);

    // Ensure items have numeric price and quantity
    this.items = (orderData.items || []).map((item) => ({
      ...item,
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 0,
    }));

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

  formatAddress(location) {
    if (!location) return 'Address not available';
    
    const parts = [
      location.addressline1,
      location.addressline2,
      location.area,
      location.city,
      location.state,
      location.pincode,
      location.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  // NEW METHOD: Set delivery distance data ONCE when order is placed
  setDeliveryDistanceData(distanceKm, durationMinutes) {
    this.deliveryDistance = distanceKm;
    this.deliveryTimeMinutes = durationMinutes;
    // Don't calculate total yet - wait for preparation time from API
  }

  // UPDATED METHOD: Set timer data for the order
  setTimerData(preparationTime, deliveryTimeMinutes) {
    this.preparationTime = preparationTime; // From API when confirmed
    
    // Use stored deliveryTimeMinutes if not provided
    if (deliveryTimeMinutes) {
      this.deliveryTimeMinutes = deliveryTimeMinutes;
    }
    
    this.totalTimeMinutes = this.calculateTotalTime();
    if (!this.orderPlacedAt) {
      this.orderPlacedAt = this.createdAt || new Date().toISOString();
    }
  }

  // UPDATED METHOD: Calculate total time from preparation and delivery
  calculateTotalTime() {
    if (!this.preparationTime) return this.deliveryTimeMinutes || 0;
    
    // Convert preparation time from "20:35" format to minutes
    const prepMinutes = this.convertTimeToMinutes(this.preparationTime);
    const total = prepMinutes + (this.deliveryTimeMinutes || 0);
    
    return total;
  }

  // Convert time string "20:35" to minutes
  convertTimeToMinutes(timeString) {
    if (!timeString || typeof timeString !== 'string') return 0;
    
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes + (seconds / 60);
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
    if (remaining === null) return "Time not available";
    if (remaining <= 0) {
      return this.deliveryType === "delivery"
        ? "Delivered"
        : "Ready for collection";
    }
    return `${remaining} left`;
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

  // NEW METHOD: Serialize for AsyncStorage
  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      userId: this.userId,
      restaurantId: this.restaurantId,
      locationId: this.locationId,
      items: this.items,
      totalPrice: this.totalPrice,
      paymentType: this.paymentType,
      orderType: this.orderType,
      status: this.status,
      deliveryTime: this.deliveryTime,
      specialInstructions: this.specialInstructions,
      preparationTime: this.preparationTime,
      deliveryTimeMinutes: this.deliveryTimeMinutes,
      totalTimeMinutes: this.totalTimeMinutes,
      orderPlacedAt: this.orderPlacedAt,
      deliveryDistance: this.deliveryDistance,
      cancellationReason: this.cancellationReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      restaurantName: this.restaurantName,
      restaurant: this.restaurant,
      user_location: this.user_location,
      restaurantLatitude: this.restaurantLatitude,
      restaurantLongitude: this.restaurantLongitude,
      restaurantContact: this.restaurantContact,
      restaurantEmail: this.restaurantEmail,
      total: this.total,
      subtotal: this.subtotal,
      deliveryFee: this.deliveryFee,
      discount: this.discount,
      deliveryType: this.deliveryType,
      deliveryAddress: this.deliveryAddress,
      estimatedDelivery: this.estimatedDelivery,
      paymentMethod: this.paymentMethod,
      orderTime: this.orderTime,
      orderDate: this.orderDate,
    };
  }

  // Save order to AsyncStorage
  async saveToStorage() {
    try {
      const orders = await Order.getAllOrders();
      const existingIndex = orders.findIndex((order) => order.id === this.id);

      if (existingIndex >= 0) {
        orders[existingIndex] = this.toJSON();
      } else {
        orders.push(this.toJSON());
      }

      await AsyncStorage.setItem("@orders", JSON.stringify(orders));
    } catch (error) {
      console.error("Error saving order:", error);
    }
  }

  // Get all orders from AsyncStorage
  static async getAllOrders() {
    try {
      const ordersData = await AsyncStorage.getItem("@orders");
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        return orders.map((orderData) => new Order(orderData));
      }
      return [];
    } catch (error) {
      console.error("Error getting orders:", error);
      return [];
    }
  }

  // Get active order (most recent order that's not delivered)
  static async getActiveOrder() {
    try {
      const orders = await Order.getAllOrders();
      const activeOrders = orders.find((o) => o.isActive());
      return activeOrders;
    } catch (error) {
      console.error(
        "Order.getActiveOrder: Error retrieving active order:",
        error
      );
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
    return cartItems.map((item) => {
      return {
        item_id: item.itemId || item.id || item.item_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      };
    });
  }

  // Get order status display text (dynamic based on orderType)
  getStatusDisplayText() {
    const isCollection = this.orderType === "collection";

    const statusMap = {
      pending: "Order Pending",
      confirmed: "Order Confirmed",
      preparing: "Preparing",
      delivery: isCollection ? "Ready for Collection" : "Out for Delivery",
      delivered: isCollection ? "Collected" : "Delivered",
      cancelled: "Cancelled",
    };

    return statusMap[this.status] || this.status;
  }

  // Check if order is active (not delivered or cancelled)
  isActive() {
    return this.status !== "delivered" && this.status !== "cancelled";
  }

  // Clear all orders (for testing)
  static async clearAllOrders() {
    try {
      await AsyncStorage.removeItem("@orders");
    } catch (error) {
      console.error("Error clearing orders:", error);
    }
  }
  
  static async removeActiveOrder() {
    try {
      const activeOrder = await Order.getActiveOrder();
      if (activeOrder) {
        const orders = await Order.getAllOrders();
        const updatedOrders = orders.filter(
          (order) => order.id !== activeOrder.id
        );
        await AsyncStorage.setItem("@orders", JSON.stringify(updatedOrders));
      }
    } catch (error) {
      console.error("Error removing active order:", error);
    }
  }
}

// Helper function to map order data
export const mapOrder = (orderData) => {
  return new Order(orderData);
};