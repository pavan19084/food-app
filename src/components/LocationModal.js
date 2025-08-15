import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LocationService } from '../utils/locationService';

const NEARBY_AREAS = [
  { id: '1', name: 'Madhapur', city: 'Hyderabad', state: 'Telangana', pincode: '500081' },
  { id: '2', name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', pincode: '500032' },
  { id: '3', name: 'Hitech City', city: 'Hyderabad', state: 'Telangana', pincode: '500081' },
  { id: '4', name: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
  { id: '5', name: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
  { id: '6', name: 'Secunderabad', city: 'Hyderabad', state: 'Telangana', pincode: '500003' },
  { id: '7', name: 'Kukatpally', city: 'Hyderabad', state: 'Telangana', pincode: '500072' },
  { id: '8', name: 'Ameerpet', city: 'Hyderabad', state: 'Telangana', pincode: '500016' },
];

const LocationModal = ({ navigation, route }) => {
  const { onLocationSelect, currentLocation } = route?.params || {};
  const visible = true; // Always visible when used as screen
  const onClose = () => navigation.goBack();
  const [activeTab, setActiveTab] = useState('saved'); // 'saved', 'add', 'popular'
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAreas, setFilteredAreas] = useState(NEARBY_AREAS);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Add new address form state
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    city: '',
    state: '',
    landmark: '',
    floor: '',
    street: '',
    addressType: 'home', // home, work, other
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSavedAddresses();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAreas(NEARBY_AREAS);
    } else {
      const filtered = NEARBY_AREAS.filter(area =>
        area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.pincode.includes(searchQuery)
      );
      setFilteredAreas(filtered);
    }
  }, [searchQuery]);

  const loadSavedAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const addresses = await LocationService.getSavedAddresses();
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsUpdatingLocation(true);
    try {
      const location = await LocationService.updateLocation();
      onLocationSelect(location);
      onClose();
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your location permissions or try selecting from the list below.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleAreaSelect = (area) => {
    const locationData = {
      city: area.city,
      state: area.state,
      country: 'India',
      postalCode: area.pincode,
      street: area.name,
      fullAddress: `${area.name}, ${area.city}, ${area.state} ${area.pincode}`,
      lastUpdated: new Date().toISOString(),
    };
    onLocationSelect(locationData);
    onClose();
  };

  const handlePincodeChange = async (pincode) => {
    setNewAddress(prev => ({ ...prev, pincode }));
    
    if (pincode.length === 6) {
      setIsPincodeLoading(true);
      try {
        const cityState = await LocationService.getCityStateFromPincode(pincode);
        setNewAddress(prev => ({
          ...prev,
          city: cityState.city,
          state: cityState.state,
        }));
      } catch (error) {
        Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
        setNewAddress(prev => ({ ...prev, city: '', state: '' }));
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.pincode || !newAddress.street) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsAddingAddress(true);
    try {
      const addressData = {
        name: newAddress.name,
        phone: newAddress.phone,
        pincode: newAddress.pincode,
        city: newAddress.city,
        state: newAddress.state,
        landmark: newAddress.landmark,
        floor: newAddress.floor,
        street: newAddress.street,
        addressType: newAddress.addressType,
        fullAddress: `${newAddress.street}${newAddress.floor ? `, Floor ${newAddress.floor}` : ''}${newAddress.landmark ? `, ${newAddress.landmark}` : ''}, ${newAddress.city}, ${newAddress.state} ${newAddress.pincode}`,
      };

      await LocationService.saveAddress(addressData);
      await loadSavedAddresses();
      
      // Reset form
      setNewAddress({
        name: '',
        phone: '',
        pincode: '',
        city: '',
        state: '',
        landmark: '',
        floor: '',
        street: '',
        addressType: 'home',
      });
      
      setActiveTab('saved');
      Alert.alert('Success', 'Address added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add address. Please try again.');
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleAddressSelect = (address) => {
    const locationData = {
      city: address.city,
      state: address.state,
      country: 'India',
      postalCode: address.pincode,
      street: address.street,
      fullAddress: address.fullAddress,
      lastUpdated: new Date().toISOString(),
    };
    onLocationSelect(locationData);
    onClose();
  };

  const handleDeleteAddress = async (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocationService.deleteAddress(addressId);
              await loadSavedAddresses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    try {
      await LocationService.setDefaultAddress(addressId);
      await loadSavedAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address.');
    }
  };

  const renderAreaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.areaItem}
      onPress={() => handleAreaSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.areaInfo}>
        <Text style={styles.areaName}>{item.name}</Text>
        <Text style={styles.areaDetails}>
          {item.city}, {item.state} {item.pincode}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const renderSavedAddressItem = ({ item }) => (
    <TouchableOpacity
      style={styles.savedAddressItem}
      onPress={() => handleAddressSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeIcon}>
          <Ionicons 
            name={item.addressType === 'home' ? 'home' : item.addressType === 'work' ? 'briefcase' : 'location'} 
            size={16} 
            color="#666" 
          />
        </View>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{item.name}</Text>
          <Text style={styles.addressPhone}>{item.phone}</Text>
          <Text style={styles.addressText} numberOfLines={2}>{item.fullAddress}</Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAddress(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Addresses</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          disabled={isUpdatingLocation}
        >
          {isUpdatingLocation ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <Ionicons name="location" size={20} color="#FF6B6B" />
          )}
          <Text style={styles.currentLocationText}>
            {isUpdatingLocation ? 'Getting your location...' : 'Use my current location'}
          </Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
              Saved ({savedAddresses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'add' && styles.activeTab]}
            onPress={() => setActiveTab('add')}
          >
            <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
              Add New
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'popular' && styles.activeTab]}
            onPress={() => setActiveTab('popular')}
          >
            <Text style={[styles.tabText, activeTab === 'popular' && styles.activeTabText]}>
              Popular
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'saved' && (
          <View style={styles.tabContent}>
            {isLoadingAddresses ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Loading addresses...</Text>
              </View>
            ) : savedAddresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No saved addresses</Text>
                <Text style={styles.emptySubtext}>Add your first address to get started</Text>
              </View>
            ) : (
              <FlatList
                data={savedAddresses}
                renderItem={renderSavedAddressItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        )}

        {activeTab === 'add' && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.addAddressForm}>
              <Text style={styles.formTitle}>Add New Address</Text>
              
              {/* Address Type Selection */}
              <View style={styles.addressTypeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, newAddress.addressType === 'home' && styles.typeButtonActive]}
                  onPress={() => setNewAddress(prev => ({ ...prev, addressType: 'home' }))}
                >
                  <Ionicons name="home" size={20} color={newAddress.addressType === 'home' ? '#FFF' : '#666'} />
                  <Text style={[styles.typeButtonText, newAddress.addressType === 'home' && styles.typeButtonTextActive]}>
                    Home
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, newAddress.addressType === 'work' && styles.typeButtonActive]}
                  onPress={() => setNewAddress(prev => ({ ...prev, addressType: 'work' }))}
                >
                  <Ionicons name="briefcase" size={20} color={newAddress.addressType === 'work' ? '#FFF' : '#666'} />
                  <Text style={[styles.typeButtonText, newAddress.addressType === 'work' && styles.typeButtonTextActive]}>
                    Work
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, newAddress.addressType === 'other' && styles.typeButtonActive]}
                  onPress={() => setNewAddress(prev => ({ ...prev, addressType: 'other' }))}
                >
                  <Ionicons name="location" size={20} color={newAddress.addressType === 'other' ? '#FFF' : '#666'} />
                  <Text style={[styles.typeButtonText, newAddress.addressType === 'other' && styles.typeButtonTextActive]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  value={newAddress.name}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={newAddress.phone}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, phone: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pincode *</Text>
                <View style={styles.pincodeContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter 6-digit pincode"
                    keyboardType="numeric"
                    maxLength={6}
                    value={newAddress.pincode}
                    onChangeText={handlePincodeChange}
                  />
                  {isPincodeLoading && (
                    <ActivityIndicator size="small" color="#FF6B6B" style={styles.pincodeLoader} />
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={[styles.textInput, styles.disabledInput]}
                  placeholder="Auto-filled from pincode"
                  value={newAddress.city}
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={[styles.textInput, styles.disabledInput]}
                  placeholder="Auto-filled from pincode"
                  value={newAddress.state}
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Street Address *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="House/Flat number, Street name"
                  value={newAddress.street}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, street: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Floor/Unit (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Floor number, Unit number, etc."
                  value={newAddress.floor}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, floor: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Near hospital, school, mall, etc."
                  value={newAddress.landmark}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, landmark: text }))}
                />
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAddress}
                disabled={isAddingAddress}
              >
                {isAddingAddress ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.addButtonText}>Add Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {activeTab === 'popular' && (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for area, city, or pincode..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <FlatList
              data={filteredAreas}
              renderItem={renderAreaItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  
  // Tab Content
  tabContent: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  
  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // Saved Addresses
  savedAddressItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FFE0E0',
  },
  deleteButtonText: {
    color: '#F44336',
  },
  
  // Add Address Form
  addAddressForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  addressTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#666',
  },
  pincodeContainer: {
    position: 'relative',
  },
  pincodeLoader: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Search and Popular Areas
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  areaDetails: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
  },
  separator: {
    height: 8,
  },
});

export default LocationModal;
