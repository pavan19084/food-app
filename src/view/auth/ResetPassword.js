import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAlert } from "../../hooks/useAlert";
import CustomAlert from "../../components/CustomAlert";

export default function ResetPassword() {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();
  const otpRefs = useRef([]);
  const alert = useAlert();

  const email = route?.params?.email;

  useEffect(() => {
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key, index) => {
    if (key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (text) => {
    const pastedOtp = text.replace(/\D/g, "").slice(0, 6);
    const newOtpValues = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedOtp.length; i++) {
      newOtpValues[i] = pastedOtp[i];
    }
    setOtpValues(newOtpValues);
    const nextIndex = Math.min(pastedOtp.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  const getOtpString = () => otpValues.join("");

  const handleResetPassword = async () => {
    const otpString = getOtpString();

    if (!otpString || otpString.length !== 6) {
      alert.show({
        title: "Missing OTP",
        message: "Please enter the complete 6-digit verification code.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    if (!newPassword) {
      alert.show({
        title: "Missing Password",
        message: "Please enter a new password.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    if (newPassword.length < 6) {
      alert.show({
        title: "Weak Password",
        message: "Password must be at least 6 characters long.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      alert.show({
        title: "Password Mismatch",
        message: "New password and confirm password do not match.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: email.trim(),
        otp: otpString,
        newPassword,
      });

      alert.show({
        title: "Password Reset Successful",
        message: "Your password has been updated successfully.",
        buttons: [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ],
      });
    } catch (error) {
      console.log("Error resetting password: ", error?.message);
      alert.show({
        title: "Reset Failed",
        message:
          error?.response?.data?.msg ||
          "Failed to reset password. Please try again.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } finally {
      setLoading(false);
    }
  };

  const keyboardOffset = Platform.select({
    ios: insets.top + 16,
    android: 0,
    default: 0,
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={keyboardOffset}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingHorizontal: 32,
                  paddingTop: 40,
                  paddingBottom: insets.bottom + 24,
                  justifyContent: "center",
                }}
              >
                <View style={{ alignItems: "center", marginBottom: 48 }}>
                  <View
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      backgroundColor: "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.25,
                      shadowRadius: 16,
                      elevation: 12,
                    }}
                  >
                    <Image
                      source={require("../../../assets/bg-remove-logo.png")}
                      style={{ width: 120, height: 120, resizeMode: "contain" }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      color: colors.textWhite,
                      fontWeight: "700",
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    Reset Password
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.textWhite,
                      opacity: 0.9,
                      textAlign: "center",
                    }}
                  >
                    Enter the code sent to {email}
                  </Text>
                </View>

                {/* OTP Boxes */}
                <View style={{ marginBottom: 24 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    {otpValues.map((value, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpRefs.current[index] = ref)}
                        style={{
                          width: 45,
                          height: 56,
                          borderRadius: 12,
                          backgroundColor: "#fff",
                          borderWidth: 2,
                          borderColor: value ? "#000" : "#ccc",
                          textAlign: "center",
                          fontSize: 20,
                          fontWeight: "600",
                          color: colors.text,
                        }}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={value}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={({ nativeEvent }) =>
                          handleOtpKeyPress(nativeEvent.key, index)
                        }
                        onTextInput={(e) => {
                          if (e.nativeEvent.text.length > 1) {
                            handleOtpPaste(e.nativeEvent.text);
                          }
                        }}
                        selectTextOnFocus
                      />
                    ))}
                  </View>

                  {/* New Password Field */}
                  <View style={{ position: "relative" }}>
                    <TextInput
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: "#fff",
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: "#000",
                        borderWidth: 1,
                        borderColor: "#ccc",
                        marginBottom: 16,
                        paddingRight: 48,
                      }}
                      placeholder="New password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      returnKeyType="next"
                    />
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        right: 16,
                        top: 14,
                      }}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Confirm Password Field */}
                  <View style={{ position: "relative" }}>
                    <TextInput
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: "#fff",
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: "#000",
                        borderWidth: 1,
                        borderColor: "#ccc",
                        paddingRight: 48,
                      }}
                      placeholder="Confirm new password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleResetPassword}
                    />
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        right: 16,
                        top: 14,
                      }}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleResetPassword}
                  activeOpacity={0.8}
                  disabled={loading}
                  style={{
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: loading ? "#666" : "#000",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "700",
                      letterSpacing: 0.5,
                    }}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Text>
                </TouchableOpacity>

                <View style={{ marginTop: 24, alignItems: "center" }}>
                  <Text
                    style={{
                      color: colors.textWhite,
                      fontSize: 16,
                      opacity: 0.9,
                    }}
                  >
                    Didn't receive the code?
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: 8 }}
                  >
                    <Text
                      style={{
                        color: colors.background,
                        fontSize: 16,
                        fontWeight: "600",
                        textDecorationLine: "underline",
                      }}
                    >
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={alert.hide}
      />
    </View>
  );
}
