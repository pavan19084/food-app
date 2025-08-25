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
  Alert,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/colors";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 eye toggle
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const next = route?.params?.next;
  const nextParams = route?.params?.nextParams;

  const validateEmail = (val) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(val);

  const signUpWithEmail = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!username?.trim() || !phone?.trim() || !password) {
      Alert.alert("Missing Fields", "Username, phone and password are required.");
      return;
    }

    try {
      await signUp({
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      // OTP sent; go to Verify OTP screen (preserve next)
      navigation.navigate("VerifyOtp", { email: email.trim(), next, nextParams });
    } catch (error) {
      console.log("Error in signing up: ", error?.message);
      Alert.alert("Sign Up Error", error?.response?.data?.msg || error.message);
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
                      fontSize: 16,
                      color: colors.textWhite,
                      opacity: 0.9,
                      textAlign: "center",
                    }}
                  >
                    Join the food revolution
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
                      borderWidth: 1,
                      borderColor: "#ccc",
                      marginBottom: 16,
                    }}
                    placeholder="Username"
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                    returnKeyType="next"
                  />
                  <TextInput
                    style={{
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: "#fff",
                      paddingHorizontal: 20,
                      fontSize: 16,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      marginBottom: 16,
                    }}
                    placeholder="Phone"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    returnKeyType="next"
                  />
                  <TextInput
                    style={{
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: "#fff",
                      paddingHorizontal: 20,
                      fontSize: 16,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      marginBottom: 16,
                    }}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                  />

                  {/* Password with eye toggle */}
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
                        paddingRight: 48, // space for eye
                      }}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      returnKeyType="done"
                      onSubmitEditing={signUpWithEmail}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((p) => !p)}
                      style={{ position: "absolute", right: 16, top: 14 }}
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={signUpWithEmail}
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
                    Create Account
                  </Text>
                </TouchableOpacity>

                <View style={{ marginTop: 24, alignItems: "center" }}>
                  <Text style={{ color: colors.textWhite, fontSize: 16, opacity: 0.9 }}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Login", { next, nextParams })}
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
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
