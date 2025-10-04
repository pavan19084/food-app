import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/colors";
import { useAlert } from "../../hooks/useAlert";
import CustomAlert from "../../components/CustomAlert";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { sendForgotPasswordOtp } = useAuth();

  // use custom alert
  const { show, hide, visible, title, message, buttons } = useAlert();

  const validateEmail = (val) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(val);

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      show({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    setLoading(true);
    try {
      await sendForgotPasswordOtp({ email: email.trim() });
      show({
        title: "OTP Sent",
        message: "Please check your email for the verification code.",
        buttons: [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("ResetPassword", { email: email.trim() }),
          },
        ],
      });
    } catch (error) {
      console.log("Error sending OTP: ", error?.message);
      show({
        title: "Error",
        message:
          error?.response?.data?.msg || "Failed to send OTP. Please try again.",
        buttons: [{ text: "OK" }],
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
                    Forgot Password?
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.textWhite,
                      opacity: 0.9,
                      textAlign: "center",
                    }}
                  >
                    Enter your email to receive a reset code
                  </Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                  <TextInput
                    style={{
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: "#fff",
                      paddingHorizontal: 20,
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: "#ccc",
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={email}
                    onChangeText={setEmail}
                    onSubmitEditing={handleSendOtp}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSendOtp}
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
                    {loading ? "Sending..." : "Send Reset Code"}
                  </Text>
                </TouchableOpacity>

                <View style={{ marginTop: 24, alignItems: "center" }}>
                  <Text style={{ color: colors.textWhite, fontSize: 16, opacity: 0.9 }}>
                    Remember your password?
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
                      Back to Sign In
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
        visible={visible}
        title={title}
        message={message}
        buttons={buttons}
        onClose={hide}
      />
    </View>
  );
}
