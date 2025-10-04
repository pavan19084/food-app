import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationService } from '../utils/locationService';
import { colors } from '../constants/colors';
import CustomAlert from '../components/CustomAlert'; // import your custom alert

export default function SavedAddressesScreen({ navigation }) {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    setIsLoading(true);
    try {
      const addresses = await LocationService.getSavedAddresses();
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
      showAlert('Error', 'Failed to load saved addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    showAlert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', onPress: () => setAlertVisible(false) },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await LocationService.deleteAddress(addressId);
              await loadSavedAddresses();
            } catch (error) {
              showAlert('Error', 'Failed to delete address.');
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
      showAlert('Error', 'Failed to set default address.');
    }
  };

  const handleEditAddress = (address) => {
    showAlert('Info', 'Edit functionality coming soon!');
  };

  const renderAddressItem = ({ item }) => {
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
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeIcon}>
            <Ionicons name="location" size={20} color="#666" />
          </View>
          <View style={styles.addressInfo}>
            <View style={styles.addressTopRow}>
              <Text style={styles.addressName}>
                {item.addressline1 || 'Floor/Street'}
              </Text>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText} numberOfLines={3}>
              {formatAddress(item)}
            </Text>
            {item.delivery_instructions && (
              <Text style={styles.deliveryInstructions}>
                Instructions: {item.delivery_instructions}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(item)}
          >
            <Ionicons name="create-outline" size={16} color="#666" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          {!item.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item.id)}
            >
              <Ionicons name="star-outline" size={16} color="#666" />
              <Text style={styles.actionButtonText}>Set Default</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteAddress(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#F44336" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('LocationModal')}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {savedAddresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color="#999" />
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptySubtitle}>
              Add your delivery addresses to make ordering faster
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => navigation.navigate('LocationModal')}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{savedAddresses.length}</Text>
                <Text style={styles.statLabel}>Total Addresses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {savedAddresses.filter(addr => addr.delivery_instructions).length}
                </Text>
                <Text style={styles.statLabel}>With Instructions</Text>
              </View>
            </View>

            <View style={styles.addressesList}>
              <Text style={styles.sectionTitle}>Your Addresses</Text>
              {savedAddresses.map((address, index) => (
                <View key={address.id}>
                  {renderAddressItem({ item: address })}
                  {index < savedAddresses.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => navigation.navigate('LocationModal')}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={[{ text: 'OK', onPress: () => setAlertVisible(false) }]}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textWhite,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  
  // Addresses List
  addressesList: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  defaultBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textWhite,
  },
  addressPhone: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  deliveryInstructions: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  deleteButton: {
    backgroundColor: '#FFE0E0',
  },
  deleteButtonText: {
    color: '#F44336',
  },
  
  // Separator
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  
  // Add More Button
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: 32,
    gap: 8,
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
