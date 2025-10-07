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
    this.cuisine = Array.isArray(data.cuisine) ? data.cuisine : JSON.parse(data.cuisine || '[]');
    this.status = data.status;
    this.createdBy = data.created_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Helper methods
  isActive() {
    return this.status === 'active';
  }

  getCuisineString() {
    return this.cuisine.join(', ');
  }

  getImageUrl() {
    if (!this.profileImage) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=500&fit=crop&auto=format';
    }
    return `http://31.97.56.234:3000/${this.profileImage}`;
  }

  
  toCardData() {
    return {
      id: this.restaurantId,
      cover: this.getImageUrl(),
      title: this.name,
      subtitle: this.getCuisineString(),
      rating: '4.0',
      badges: this.cuisine.length > 0 ? this.cuisine.slice(0, 2) : ['Restaurant'],
      envNote: `Delicious ${this.getCuisineString().toLowerCase()} cuisine`,
      onTap: 'Restaurant',
      category: this.cuisine[0]?.toLowerCase() || 'restaurant',
      deliveryAvailable: true, // Default to true
      collectionAvailable: true, // Default to true
      restaurantData: this
    };
  }
}

export class MenuCategory {
  constructor(data) {
    this.categoryId = data.category_id;
    this.name = data.name;
    this.displayOrder = data.display_order;
    this.isActive = data.is_active === 1;
    this.items = data.items ? data.items.map(item => new MenuItem(item)) : [];
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
    if (!this.photo || this.photo === 'https://example.com/paneer-tikka.jpg') {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop&auto=format';
    }
    return this.photo;
  }

  // Convert to format expected by UI components
  toItemData() {
    return {
      id: this.itemId,
      name: this.name,
      price: this.price,
      desc: this.description,
      image: this.getImageUrl(),
      isVeg: true
    };
  }
}

export class RestaurantMenu {
  constructor(data) {
    this.restaurantId = data.restaurant_id;
    this.categories = data.categories ? data.categories.map(cat => new MenuCategory(cat)) : [];
  }

  getActiveCategories() {
    return this.categories.filter(cat => cat.isActive);
  }

  getAllItems() {
    return this.categories
      .filter(cat => cat.isActive)
      .flatMap(cat => cat.items)
      .map(item => item.toItemData());
  }
}
