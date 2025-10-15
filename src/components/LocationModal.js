import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { LocationService } from '../utils/locationService';
import { useFocusEffect } from '@react-navigation/native'; // <-- import this

const LocationModal = ({ navigation, route }) => {
  const { onLocationSelect } = route?.params || {};
  const visible = true;
  const onClose = () => navigation.goBack();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Reload addresses whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSavedAddresses();
    }, [])
  );

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
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
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
    ]);
  };

  const handleEditAddress = (address) => {
    navigation.navigate('AddAddressScreen', {
      editMode: true,
      addressData: address,
    });
  };

  const renderSavedAddressItem = ({ item }) => {
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
              <Ionicons name="home" size={20} color="#FF8C00" />
            </View>
            <View style={styles.addressInfo}>
              <View style={styles.addressTitleRow}>
                <Text style={styles.addressName}>{item.addressline1 || 'Home'}</Text>
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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Addresses</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationOptions}>
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
  container: { flex: 1, backgroundColor: colors.background },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { fontSize: 16, color: colors.textLight, fontWeight: '600' },
  locationOptions: { marginHorizontal: 20, marginBottom: 20 },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
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
  optionContent: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
  optionSubtitle: { fontSize: 14, color: colors.textLight },
  savedAddressesSection: { flex: 1, marginHorizontal: 20 },
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
    borderColor: '#000',
  },
  addressCardContent: { padding: 16 },
  addressHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  addressTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressInfo: { flex: 1 },
  addressTitleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  addressName: { fontSize: 16, fontWeight: '600', color: '#333' },
  addressDistance: { fontSize: 12, color: colors.textLight },
  addressText: { fontSize: 14, color: '#333', lineHeight: 20 },
  addressPhone: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  deliveryInstructions: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 4 },
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
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtext: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  separator: { height: 8 },
});

export default LocationModal;
