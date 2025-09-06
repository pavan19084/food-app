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
import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { setOrderPlaced } = useOrder();

  // Next-step routing (e.g., go to OrderConfirmation after login)
  const next = route?.params?.next;
  const nextParams = route?.params?.nextParams;

  const signInWithEmail = async () => {
    try {
      await signIn({ email: email.trim(), password });
      if (next) {
        // If we're going to OrderConfirmation, set the order in context for notification
        if (next === "OrderConfirmation" && nextParams?.orderDetails) {
          setOrderPlaced(nextParams.orderDetails);
        }
        navigation.replace(next, nextParams || {});
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    } catch (error) {
      console.log("Error in login: ", error?.message);
      Alert.alert(
        "Login Error",
        error?.response?.data?.msg || "Invalid credentials. Please try again."
      );
    }
  };

  const keyboardOffset = Platform.select({
    ios: insets.top + 16,
    android: 0, // 'height' handles it on Android
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
                    Delicious food, delivered fresh
                  </Text>
                </View>
                <View style={{ marginBottom: 24 }}>
                {/* Email Field */}
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
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                {/* Password Field with Eye Button */}
                <View>
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
                      paddingRight: 48, // leave space for eye button
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={signInWithEmail}
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
                </View>

                <TouchableOpacity
                  onPress={signInWithEmail}
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
                    Sign In
                  </Text>
                </TouchableOpacity>

                <View style={{ marginTop: 24, alignItems: "center" }}>
                  <Text
                    style={{ color: colors.textWhite, fontSize: 16, opacity: 0.9 }}
                  >
                    Don't have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("SignUp", { next, nextParams })}
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
                      Create New Account
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
