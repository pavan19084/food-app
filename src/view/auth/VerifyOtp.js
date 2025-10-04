import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { sendOtp } from '../../api/auth';
import { colors } from '../../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useAlert } from '../../hooks/useAlert';
import CustomAlert from '../../components/CustomAlert';

export default function VerifyOtp() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const alert = useAlert();

  const email = route?.params?.email || '';
  const next = route?.params?.next;
  const nextParams = route?.params?.nextParams;

  const { confirmOtp } = useAuth();
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (otpRefs.current[0]) otpRefs.current[0].focus();
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (key, index) => {
    if (key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (text) => {
    const pastedOtp = text.replace(/\D/g, "").slice(0, 6);
    const newOtpValues = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedOtp.length; i++) {
      newOtpValues[i] = pastedOtp[i];
    }
    setOtpValues(newOtpValues);
    const nextIndex = Math.min(pastedOtp.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  const getOtpString = () => otpValues.join('');

  const onVerify = async () => {
    const otpString = getOtpString();

    if (!otpString || otpString.length !== 6) {
      alert.show({
        title: "Invalid OTP",
        message: "Please enter the complete 6-digit verification code.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      return;
    }

    try {
      await confirmOtp({ email, otp: otpString });
      alert.show({
        title: "Verified",
        message: "Your account is verified. Please log in.",
        buttons: [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login", params: { next, nextParams } }],
              });
            },
          },
        ],
      });
    } catch (e) {
      alert.show({
        title: "OTP Error",
        message: e?.response?.data?.msg || "Invalid OTP",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    }
  };

  const onResend = async () => {
    try {
      await sendOtp({ email, reason: "resend" });
      alert.show({
        title: "OTP Sent",
        message: "Please check your inbox/SMS for the new code.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } catch (e) {
      alert.show({
        title: "Error",
        message: e?.response?.data?.msg || "Failed to resend OTP",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 16 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingHorizontal: 32,
                  paddingTop: 40,
                  paddingBottom: insets.bottom + 24,
                  justifyContent: "center",
                }}
                keyboardShouldPersistTaps="handled"
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
                    Verify Account
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
                        onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                        onTextInput={(e) => {
                          if (e.nativeEvent.text.length > 1) handleOtpPaste(e.nativeEvent.text);
                        }}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onVerify}
                  activeOpacity={0.8}
                  style={{
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: "#000",
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
                    Verify OTP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onResend}
                  style={{ marginTop: 24, alignItems: "center" }}
                >
                  <Text
                    style={{
                      color: colors.textWhite,
                      fontSize: 16,
                      fontWeight: "500",
                      textDecorationLine: "underline",
                    }}
                  >
                    Resend OTP
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      {/* ✅ Custom Alert at bottom */}
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
