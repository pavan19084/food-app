import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

const LOCATION_STORAGE_KEY = 'user_location';
const SAVED_ADDRESSES_KEY = 'user_saved_addresses';

export class LocationService {
  static async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  static async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  static async reverseGeocode(latitude, longitude) {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        return {
          city: result.city || result.subregion || 'Unknown City',
          state: result.region || 'Unknown State',
          country: result.country || 'Unknown Country',
          postalCode: result.postalCode || '',
          street: result.street || '',
          name: result.name || '',
          fullAddress: this.formatAddress(result),
        };
      }
      throw new Error('No geocoding results found');
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      throw error;
    }
  }

  static formatAddress(result) {
    const parts = [];
    if (result.street) parts.push(result.street);
    if (result.city) parts.push(result.city);
    if (result.region) parts.push(result.region);
    if (result.postalCode) parts.push(result.postalCode);
    if (result.country) parts.push(result.country);
    
    return parts.join(', ');
  }

  static async saveLocation(locationData) {
    try {
      await SecureStore.setItemAsync(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
    } catch (error) {
      console.error('Error saving location:', error);
    }
  }

  static async getSavedLocation() {
    try {
      const savedLocation = await SecureStore.getItemAsync(LOCATION_STORAGE_KEY);
      return savedLocation ? JSON.parse(savedLocation) : null;
    } catch (error) {
      console.error('Error getting saved location:', error);
      return null;
    }
  }

  static async updateLocation() {
    try {
      const currentLocation = await this.getCurrentLocation();
      const address = await this.reverseGeocode(currentLocation.latitude, currentLocation.longitude);
      
      const locationData = {
        ...currentLocation,
        ...address,
        lastUpdated: new Date().toISOString(),
      };

      await this.saveLocation(locationData);
      return locationData;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  static async getLocationWithFallback() {
    try {
      // Try to get current location first
      const currentLocation = await this.updateLocation();
      return currentLocation;
    } catch (error) {
      // Fallback to saved location
      const savedLocation = await this.getSavedLocation();
      if (savedLocation) {
        return savedLocation;
      }
      
      // Default fallback location
      return {
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500081',
        street: 'Madhapur',
        fullAddress: 'Madhapur, Hyderabad, Telangana 500081',
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // New methods for address management
  static async getCityStateFromPincode(pincode) {
    try {
      // Using India Post API for pincode lookup
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        return {
          city: postOffice.District || postOffice.City || 'Unknown City',
          state: postOffice.State || 'Unknown State',
          country: 'India',
          pincode: pincode,
        };
      }
      throw new Error('Invalid pincode');
    } catch (error) {
      console.error('Error fetching city/state from pincode:', error);
      throw error;
    }
  }

  static async saveAddress(addressData) {
    try {
      const savedAddresses = await this.getSavedAddresses();
      const newAddress = {
        id: Date.now().toString(),
        ...addressData,
        createdAt: new Date().toISOString(),
        isDefault: savedAddresses.length === 0, // First address becomes default
      };
      
      const updatedAddresses = [...savedAddresses, newAddress];
      await SecureStore.setItemAsync(SAVED_ADDRESSES_KEY, JSON.stringify(updatedAddresses));
      return newAddress;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }

  static async getSavedAddresses() {
    try {
      const savedAddresses = await SecureStore.getItemAsync(SAVED_ADDRESSES_KEY);
      return savedAddresses ? JSON.parse(savedAddresses) : [];
    } catch (error) {
      console.error('Error getting saved addresses:', error);
      return [];
    }
  }

  static async updateAddress(addressId, updatedData) {
    try {
      const savedAddresses = await this.getSavedAddresses();
      const updatedAddresses = savedAddresses.map(address => 
        address.id === addressId ? { ...address, ...updatedData, updatedAt: new Date().toISOString() } : address
      );
      
      await SecureStore.setItemAsync(SAVED_ADDRESSES_KEY, JSON.stringify(updatedAddresses));
      return updatedAddresses.find(addr => addr.id === addressId);
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  static async deleteAddress(addressId) {
    try {
      const savedAddresses = await this.getSavedAddresses();
      const updatedAddresses = savedAddresses.filter(address => address.id !== addressId);
      
      await SecureStore.setItemAsync(SAVED_ADDRESSES_KEY, JSON.stringify(updatedAddresses));
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  static async setDefaultAddress(addressId) {
    try {
      const savedAddresses = await this.getSavedAddresses();
      const updatedAddresses = savedAddresses.map(address => ({
        ...address,
        isDefault: address.id === addressId
      }));
      
      await SecureStore.setItemAsync(SAVED_ADDRESSES_KEY, JSON.stringify(updatedAddresses));
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  static async getDefaultAddress() {
    try {
      const savedAddresses = await this.getSavedAddresses();
      return savedAddresses.find(address => address.isDefault) || null;
    } catch (error) {
      console.error('Error getting default address:', error);
      return null;
    }
  }
}
