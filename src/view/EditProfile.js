import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfile({ route, navigation }) {
  const { user: ctxUser, saveProfile } = useAuth();

  const initial = route?.params?.user || {
    name: ctxUser?.name || ctxUser?.username || "",
    email: ctxUser?.email || "",
    phone: ctxUser?.phone || "",
    dob: ctxUser?.dob || "",
    gender: ctxUser?.gender || "",
    avatar: ctxUser?.avatar || null,
  };

  const [formData, setFormData] = useState({ ...initial });
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Custom Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    if (!formData.name.trim()) {
      showAlert("Error", "Name is required");
      return;
    }
    if (!formData.email.trim()) {
      showAlert("Error", "Email is required");
      return;
    }

    try {
      await saveProfile({ ...formData });
      showAlert("Success", "Profile updated successfully!");
    } catch (e) {
      showAlert(
        "Update Failed",
        e?.response?.data?.msg || e?.message || "Could not update profile"
      );
    }
  };

  // Expo Image Picker
  const pickImage = async (type) => {
    let result;
    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showAlert(
          "Permission Denied",
          "Camera access is required to take a photo."
        );
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showAlert(
          "Permission Denied",
          "Gallery access is required to select an image."
        );
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
    }

    if (!result.canceled) {
      updateField("avatar", result.assets[0].uri);
      setShowImageModal(false);
    }
  };

  const GenderOption = ({ option }) => (
    <TouchableOpacity
      style={[
        styles.genderOption,
        {
          backgroundColor:
            formData.gender === option.value ? "#E64A19" : "#FFF",
          borderColor: "#E2E8F0",
        },
      ]}
      onPress={() => {
        updateField("gender", option.value);
        setShowGenderModal(false);
      }}
    >
      <Text
        style={[
          styles.genderOptionText,
          { color: formData.gender === option.value ? "#FFF" : "#333" },
        ]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Image */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => setShowImageModal(true)}
          >
            {formData.avatar ? (
              <>
                <Image
                  source={{ uri: formData.avatar }}
                  style={styles.profileImage}
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageOverlayText}>Change</Text>
                </View>
              </>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="person-circle" size={100} color="#E64A19" />
                <Text
                  style={{
                    position: "absolute",
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    color: "#FFF",
                    paddingHorizontal: 10,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                  }}
                >
                  Change
                </Text>
              </View>
            )}
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
              onChangeText={(value) => updateField("name", value)}
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
              onChangeText={(value) => updateField("email", value)}
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
              onChangeText={(value) => updateField("phone", value)}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity
              style={styles.genderInput}
              onPress={() => setShowGenderModal(true)}
            >
              <Text
                style={[
                  styles.genderInputText,
                  { color: formData.gender ? "#333" : "#999" },
                ]}
              >
                {formData.gender || "Select your gender"}
              </Text>
              <Text style={styles.genderInputIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Gender Modal */}
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
            <GenderOption option={{ value: "male", label: "Male" }} />
            <GenderOption option={{ value: "female", label: "Female" }} />
            <GenderOption option={{ value: "other", label: "Other" }} />
            <GenderOption
              option={{
                value: "prefer-not-to-say",
                label: "Prefer not to say",
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Modal */}
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
              onChangeText={(value) => updateField("dob", value)}
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

      {/* Image Picker Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Profile Picture</Text>
            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => pickImage("camera")}
            >
              <Text style={styles.genderOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => pickImage("library")}
            >
              <Text style={styles.genderOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowImageModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={[{ text: "OK", onPress: () => setAlertVisible(false) }]}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: { fontSize: 24, fontWeight: "600" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E64A19", // Terracotta color
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollView: { flex: 1, paddingHorizontal: 16 },

  // Image Section
  imageSection: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 50,
    overflow: "hidden",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    alignItems: "center",
  },
  imageOverlayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
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
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F7FAFC",
    borderColor: "#E2E8F0",
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7FAFC",
    borderColor: "#E2E8F0",
  },
  dateInputText: {
    fontSize: 16,
    color: "#333",
  },
  dateInputIcon: { fontSize: 20, color: "#E64A19" },
  genderInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7FAFC",
    borderColor: "#E2E8F0",
  },
  genderInputText: {
    fontSize: 16,
    color: "#333",
  },
  genderInputIcon: { fontSize: 16, fontWeight: "600", color: "#E64A19" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFF",
    borderColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },
  dateTextInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F7FAFC",
    borderColor: "#E2E8F0",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#E64A19",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },

  // Gender Options
  genderOption: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: "center",
  },
  genderOptionText: {
    fontSize: 16,
    color: "#333",
  },
});
