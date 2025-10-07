export class Address {
  constructor(addressData) {
    this.id = addressData.id;
    this.userId = addressData.user_id;
    this.addressLine1 = addressData.addressline1;
    this.addressLine2 = addressData.addressline2;
    this.city = addressData.city;
    this.country = addressData.country;
    this.state = addressData.state;
    this.longitude = addressData.longitude;
    this.latitude = addressData.latitude;
    this.area = addressData.area;
    this.deliveryInstructions = addressData.delivery_instructions;
    this.pincode = addressData.pincode;
    this.createdAt = addressData.created_at;
    this.updatedAt = addressData.updated_at;
    this.deletedAt = addressData.deleted_at;
  }

  // Get full address string
  getFullAddress() {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.area,
      this.city,
      this.state,
      this.pincode,
      this.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  }

  // Get short address for display
  getShortAddress() {
    const parts = [
      this.addressLine1,
      this.area,
      this.city
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  }

  // Get location coordinates
  getCoordinates() {
    return {
      latitude: parseFloat(this.latitude),
      longitude: parseFloat(this.longitude)
    };
  }

  // Check if address has delivery instructions
  hasDeliveryInstructions() {
    return this.deliveryInstructions && this.deliveryInstructions.trim() !== '';
  }

  // Convert to format expected by UI components
  toCardData() {
    return {
      id: this.id,
      title: this.getShortAddress(),
      subtitle: this.getFullAddress(),
      deliveryInstructions: this.deliveryInstructions,
      coordinates: this.getCoordinates(),
      pincode: this.pincode,
      area: this.area,
      city: this.city,
      state: this.state,
      country: this.country
    };
  }
}

// Helper function to map address data
export const mapAddress = (addressData) => {
  return new Address(addressData);
};
