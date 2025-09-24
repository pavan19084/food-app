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
import { colors } from '../constants/colors';
import { updateAddress } from '../api/address';

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
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSavedAddresses();
    }
  }, [visible]);

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

  const handleEditAddress = (address) => {
    navigation.navigate('AddAddressScreen', { 
      editMode: true, 
      addressData: address 
    });
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

  const renderSavedAddressItem = ({ item }) => {
    // Format the address for display
    const formatAddress = (address) => {
      const parts = [];
      if (address.addressline1) parts.push(address.addressline1);
      if (address.addressline2) parts.push(address.addressline2);
      if (address.area) parts.push(address.area);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.pincode) parts.push(address.pincode);
      return parts.join(', ');
    };

    return (
      <View style={styles.savedAddressCard}>
      <TouchableOpacity
          style={styles.addressCardContent}
        onPress={() => handleAddressSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeIcon}>
            <Ionicons 
                name="home" 
                size={20} 
                color="#FF8C00" 
            />
          </View>
          <View style={styles.addressInfo}>
              <View style={styles.addressTitleRow}>
            <Text style={styles.addressName}>
                  {item.addressline1 || 'Home'}
            </Text>
                <Text style={styles.addressDistance}>8 m</Text>
              </View>
            <Text style={styles.addressText} numberOfLines={2}>
              {formatAddress(item)}
            </Text>
              <Text style={styles.addressPhone}>+91-9104562733</Text>
            {item.delivery_instructions && (
              <Text style={styles.deliveryInstructions}>
                Instructions: {item.delivery_instructions}
              </Text>
            )}
          </View>
        </View>
        </TouchableOpacity>
        
        <View style={styles.addressCardActions}>
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={() => handleEditAddress(item)}
          >
            <Ionicons name="create-outline" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={() => handleDeleteAddress(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

        {/* Location Options */}
        <View style={styles.locationOptions}>
        <TouchableOpacity
            style={styles.locationOption}
          onPress={handleUseCurrentLocation}
          disabled={isUpdatingLocation}
        >
            <View style={styles.optionIcon}>
          {isUpdatingLocation ? (
                <ActivityIndicator size="small" color="#FF8C00" />
              ) : (
                <Ionicons name="locate" size={20} color="#FF8C00" />
              )}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                {isUpdatingLocation ? 'Getting your location...' : 'Use current location'}
          </Text>
              {currentLocation && !isUpdatingLocation && (
                <Text style={styles.optionSubtitle}>
                  {currentLocation.street}, {currentLocation.city}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationOption}
            onPress={() => navigation.navigate('AddAddressScreen')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="add-circle" size={20} color="#FF8C00" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Add Address</Text>
              <Text style={styles.optionSubtitle}>Add a new delivery address</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Saved Addresses Section */}
        <View style={styles.savedAddressesSection}>
          <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>
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


      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '600',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8F0FF',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
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
    backgroundColor: '#FFF3E0',
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
  deliveryInstructions: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
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
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  required: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  autoFilled: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'normal',
  },
  errorInput: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
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
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  // Search and Location Options
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
    color: colors.text,
  },
  locationOptions: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 0,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  savedAddressesSection: {
    flex: 1,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  savedAddressCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000000',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  addressCardContent: {
    padding: 16,
  },
  addressTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressDistance: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  addressPhone: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  addressCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  cardActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFormOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFormContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  addFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addFormTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addFormContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  editFormOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editFormContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  editFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editFormTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  editFormContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  editFormActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  updateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textWhite,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
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
