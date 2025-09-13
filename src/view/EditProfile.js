import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function EditProfile({ route, navigation }) {
  const { user: ctxUser, saveProfile } = useAuth();

  const initial = route?.params?.user || {
    name: ctxUser?.name || ctxUser?.username || '',
    email: ctxUser?.email || '',
    phone: ctxUser?.phone || '',
    dob: ctxUser?.dob || '',
    gender: ctxUser?.gender || '',
    avatar: ctxUser?.avatar || 'https://i.pravatar.cc/150?img=12',
  };

  const [formData, setFormData] = useState({
    name: initial.name,
    email: initial.email,
    phone: initial.phone,
    dob: initial.dob,
    gender: initial.gender,
    avatar: initial.avatar
  });

  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    Alert.alert('Success', 'Profile updated successfully!');
    navigation.goBack();

      try {
           await saveProfile({
             name: formData.name.trim(),
             email: formData.email.trim(),
             phone: formData.phone.trim(),
             dob: formData.dob,
           gender: formData.gender,
             avatar: formData.avatar,
         });
           Alert.alert('Success', 'Profile updated successfully!');
           navigation.goBack();
         } catch (e) {
           Alert.alert('Update Failed', e?.response?.data?.msg || e?.message || 'Could not update profile');
        }
  };

  const GenderOption = ({ option, onSelect }) => (
    <TouchableOpacity
      style={[
        styles.genderOption,
        { 
          backgroundColor: formData.gender === option.value ? '#E64A19' : '#FFF',
          borderColor: '#E2E8F0'
        }
      ]}
      onPress={() => {
        updateField('gender', option.value);
        setShowGenderModal(false);
      }}
    >
      <Text style={[
        styles.genderOptionText,
        { color: formData.gender === option.value ? '#FFF' : '#333' }
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Image */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <TouchableOpacity style={styles.imageContainer}>
            <Image source={{ uri: formData.avatar }} style={styles.profileImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Change</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDateModal(true)}
            >
              <Text style={[styles.dateInputText, { color: formData.dob ? '#333' : '#999' }]}>
                {formData.dob || 'Select your date of birth'}
              </Text>
              <Text style={styles.dateInputIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity
              style={styles.genderInput}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={[styles.genderInputText, { color: formData.gender ? '#333' : '#999' }]}>
                {formData.gender || 'Select your gender'}
              </Text>
              <Text style={styles.genderInputIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <GenderOption option={{ value: 'male', label: 'Male' }} />
            <GenderOption option={{ value: 'female', label: 'Female' }} />
            <GenderOption option={{ value: 'other', label: 'Other' }} />
            <GenderOption option={{ value: 'prefer-not-to-say', label: 'Prefer not to say' }} />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Selection Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDateModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            <Text style={styles.modalSubtitle}>
              For now, you can manually enter your date of birth
            </Text>
            <TextInput
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              style={styles.dateTextInput}
              value={formData.dob}
              onChangeText={(value) => updateField('dob', value)}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: { fontSize: 24, fontWeight: '600' },
  headerTitle: { 
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E64A19', // Terracotta color
  },
  saveButtonText: { 
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: { flex: 1, paddingHorizontal: 16 },

  // Image Section
  imageSection: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: { 
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16, 
    alignSelf: 'flex-start' 
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    alignItems: 'center',
  },
  imageOverlayText: { 
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Section
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },

  // Input Groups
  inputGroup: { marginBottom: 20 },
  label: { 
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8 
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
  },
  dateInputText: { 
    fontSize: 16,
    color: '#333',
  },
  dateInputIcon: { fontSize: 20, color: '#E64A19' },
  genderInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
  },
  genderInputText: { 
    fontSize: 16,
    color: '#333',
  },
  genderInputIcon: { fontSize: 16, fontWeight: '600', color: '#E64A19' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFF',
    borderColor: '#E2E8F0',
  },
  modalTitle: { 
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16, 
    textAlign: 'center' 
  },
  modalSubtitle: { 
    fontSize: 14,
    color: '#999',
    marginBottom: 20, 
    textAlign: 'center' 
  },
  dateTextInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#E64A19',
  },
  modalButtonText: { 
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Gender Options
  genderOption: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  genderOptionText: { 
    fontSize: 16,
    color: '#333',
  },
});
