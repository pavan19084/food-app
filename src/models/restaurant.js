// Restaurant model for API data structure

export class Restaurant {
  constructor(data) {
    this.id = data.id;
    this.restaurantId = data.restaurant_id;
    this.name = data.name;
    this.profileImage = data.profile_image;
    this.email = data.email;
    this.phone = data.phone;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.cuisine = Array.isArray(data.cuisine)
      ? data.cuisine
      : JSON.parse(data.cuisine || "[]");
    this.status = data.status;
    this.createdBy = data.created_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;

    const settings = data.settings || {};
    this.cardPaymentEnabled = settings.card_payment_enabled ?? false;
    this.cashPaymentEnabled = settings.cash_payment_enabled ?? false;
    this.deliveryEnabled = settings.delivery_enabled ?? false;
    this.takeawayEnabled = settings.takeaway_enabled ?? false;
    this.isOnline = settings.is_online ?? false;

    this.deliveryRanges = Array.isArray(data.delivery?.ranges)
      ? data.delivery.ranges.map((r) => ({
          id: r.delivery_id,
          minKm: r.min_km,
          maxKm: r.max_km,
          charge: r.charge,
        }))
      : [];

    this.categories = data.categories || [];
    
    this.distance = null;
    this.duration = null;
  }

  getCuisineString() {
    return this.cuisine.join(", ");
  }

  setDistance(distance, duration) {
    this.distance = distance;
    this.duration = duration;
  }

  getImageUrl() {
    const { Upload_URL } = require("../api/client");
    return `${Upload_URL}${this.profileImage.startsWith("/") ? "" : "/"}${
      this.profileImage
    }`;
  }

  getDeliveryCharge() {
    if (!this.distance || !this.deliveryRanges.length) return null;
    
    const distance = parseFloat(this.distance);
    
    // Find the appropriate delivery range for this distance
    const range = this.deliveryRanges.find(
      (r) => distance >= r.minKm && distance <= r.maxKm
    );
    
    if (range) {
      return range.charge;
    }
    
    // If no range found, check if distance exceeds all ranges
    const maxRange = this.deliveryRanges.reduce((max, current) => 
      current.maxKm > max.maxKm ? current : max
    );
    
    if (distance > maxRange.maxKm) {
      return maxRange.charge;
    }
    
    return null;
  }

  toCardData() {
    return {
      id: this.restaurantId,
      cover: this.getImageUrl(),
      title: this.name,
      subtitle: this.getCuisineString(),
      rating: "4.0",
      badges: this.cuisine.length > 0 ? this.cuisine.slice(0, 2) : ["Restaurant"],
      envNote: `Delicious ${this.getCuisineString().toLowerCase()} cuisine`,
      onTap: "Restaurant",
      category: this.cuisine[0]?.toLowerCase() || "restaurant",
      deliveryAvailable: this.deliveryEnabled,
      collectionAvailable: this.takeawayEnabled,
      cardPaymentAvailable: this.cardPaymentEnabled,
      cashOnDeliveryAvailable: this.cashPaymentEnabled,
      isOnline: this.isOnline,
      distance: this.distance,
      duration: this.duration,
      deliveryCharge: this.getDeliveryCharge(),
      restaurantData: this,
    };
  }
}

export class MenuCategory {
  constructor(data) {
    this.categoryId = data.category_id;
    this.name = data.name;
    this.displayOrder = data.display_order;
    this.isActive = data.is_active === 1;
    this.items = data.items ? data.items.map((item) => new MenuItem(item)) : [];
  }
}

export class MenuItem {
  constructor(data) {
    this.itemId = data.item_id;
    this.name = data.name;
    this.photo = data.photo;
    this.price = data.price;
    this.description = data.description;
    this.availability = data.availability;
    this.createdAt = data.created_at;
  }

  getImageUrl() {
    return this.photo;
  }

  toItemData() {
    return {
      id: this.itemId,
      name: this.name,
      price: this.price,
      desc: this.description,
      image: this.getImageUrl(),
      isVeg: true,
    };
  }
}

export class RestaurantMenu {
  constructor(data) {
    this.restaurantId = data.restaurant_id;
    this.categories = data.categories
      ? data.categories.map((cat) => new MenuCategory(cat))
      : [];
  }

  getActiveCategories() {
    return this.categories.filter((cat) => cat.isActive);
  }

  getAllItems() {
    return this.categories
      .filter((cat) => cat.isActive)
      .flatMap((cat) => cat.items)
      .map((item) => item.toItemData());
  }
}
