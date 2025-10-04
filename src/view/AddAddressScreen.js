import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LocationService } from '../utils/locationService';
import { colors } from '../constants/colors';
import { updateAddress } from '../api/address';
import { useAlert } from '../hooks/useAlert';
import CustomAlert from '../components/CustomAlert';

export default function AddAddressScreen({ route }) {
  const navigation = useNavigation();
  const alert = useAlert();

  const { editMode = false, addressData = null } = route?.params || {};
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const [newAddress, setNewAddress] = useState({
    addressline1: editMode ? (addressData?.addressline1 || '') : '', 
    addressline2: editMode ? (addressData?.addressline2 || '') : '',
    area: editMode ? (addressData?.area || '') : '',
    state: editMode ? (addressData?.state || '') : '',
    country: 'india',
    city: editMode ? (addressData?.city || '') : '',
    latitude: editMode ? (addressData?.latitude || '') : '',
    longitude: editMode ? (addressData?.longitude || '') : '',
    deliveryInstructions: editMode ? (addressData?.delivery_instructions || '') : '',
    pincode: editMode ? (addressData?.pincode || '') : '',
  });
  
  const [formErrors, setFormErrors] = useState({});

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
        alert.show({
          title: 'Invalid Pincode',
          message: 'Please enter a valid 6-digit pincode.',
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
        setNewAddress(prev => ({ ...prev, city: '', state: '' }));
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  const autofillFromCurrentLocation = async () => {
    setIsUpdatingLocation(true);
    try {
      const location = await LocationService.updateLocation();
      setNewAddress(prev => ({
        ...prev,
        latitude: String(location.latitude ?? ''),
        longitude: String(location.longitude ?? ''),
        pincode: location.postalCode || prev.pincode,
        city: location.city || prev.city,
        state: location.state || prev.state,
        addressline1: prev.addressline1 || location.street || '',
      }));
      setFormErrors(prev => ({
        ...prev,
        pincode: null,
        city: null,
        state: null,
      }));
    } catch (error) {
      alert.show({
        title: 'Location Error',
        message: 'Unable to get current location. Please check permissions.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newAddress.addressline1.trim()) {
      errors.addressline1 = 'Floor/Street is required';
    }
    if (!newAddress.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    }
    if (!newAddress.city.trim()) {
      errors.city = 'City is required';
    }
    if (!newAddress.state.trim()) {
      errors.state = 'State is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = async () => {
    if (!validateForm()) {
      alert.show({
        title: 'Missing Information',
        message: 'Please fill in all required fields marked with *.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    setIsAddingAddress(true);
    try {
      const addressData = {
        addressline1: newAddress.addressline1,
        addressline2: newAddress.addressline2,
        area: newAddress.area,
        state: newAddress.state,
        country: newAddress.country,
        city: newAddress.city,
        latitude: newAddress.latitude || "0",
        longitude: newAddress.longitude || "0",
        deliveryInstructions: newAddress.deliveryInstructions,
        pincode: newAddress.pincode,
      };

      if (editMode) {
        await updateAddress(addressData.id, addressData);
        alert.show({
          title: 'Success',
          message: 'Address updated successfully!',
          buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
        });
      } else {
        await LocationService.saveAddress(addressData);
        alert.show({
          title: 'Success',
          message: 'Address added successfully!',
          buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
        });
      }

      setNewAddress({
        addressline1: '',
        addressline2: '',
        area: '',
        state: '',
        country: 'india',
        city: '',
        latitude: '',
        longitude: '',
        deliveryInstructions: '',
        pincode: '',
      });
      setFormErrors({});
    } catch (error) {
      alert.show({
        title: 'Error',
        message: 'Failed to save address. Please try again.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    } finally {
      setIsAddingAddress(false);
    }
  };

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
        <Text style={styles.headerTitle}>{editMode ? 'Edit Address' : 'Add New Address'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={autofillFromCurrentLocation}
          disabled={isUpdatingLocation}
        >
          {isUpdatingLocation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="navigate" size={20} color={colors.primary} />
          )}
          <Text style={styles.currentLocationText}>
            {isUpdatingLocation ? 'Detecting your location...' : '📍 Use my current location'}
          </Text>
        </TouchableOpacity>

        {/* Form Fields */}
        {/* ... all your form UI remains unchanged ... */}

      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={alert.hide}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    marginTop: 20,
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
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  required: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  autoFilled: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: 'normal',
  },
  errorInput: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: colors.primary,
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
    color: colors.text,
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: colors.textLight,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: 0.5,
  },
});
