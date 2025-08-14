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
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../constants/colors";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const signInWithEmail = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email.trim(),
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        Alert.alert(
          "Email Not Verified",
          "Please check your inbox for the verification email."
        );
      }
    } catch (error) {
      console.log("Error in login: ", error?.message);
      Alert.alert("Login Error", "Invalid credentials. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1, paddingTop: 50 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: "center" }}>
              {/* App Logo/Title */}
              <View style={{ alignItems: "center", marginBottom: 48 }}>
                <Text style={{ 
                  fontSize: 42, 
                  fontWeight: "800", 
                  color: colors.textWhite,
                  marginBottom: 8,
                  letterSpacing: 1
                }}>
                  92 eats
                </Text>
                <Text style={{ 
                  fontSize: 16, 
                  color: colors.textWhite, 
                  opacity: 0.9,
                  textAlign: "center"
                }}>
                  Delicious food, delivered fresh
                </Text>
              </View>

              {/* Login Form */}
              <View style={{ marginBottom: 32 }}>
                <TextInput
                  style={{
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    paddingHorizontal: 20,
                    fontSize: 16,
                    color: colors.text,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <View style={{ height: 20 }} />
                <TextInput
                  style={{
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    paddingHorizontal: 20,
                    fontSize: 16,
                    color: colors.text,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={signInWithEmail}
                activeOpacity={0.8}
                style={{
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.buttonPrimary,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text style={{ 
                  color: colors.buttonText, 
                  fontSize: 18, 
                  fontWeight: "700",
                  letterSpacing: 0.5
                }}>
                  Sign In
                </Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={{ marginTop: 32, alignItems: "center" }}>
                <Text style={{ 
                  color: colors.textWhite, 
                  fontSize: 16,
                  opacity: 0.9
                }}>
                  Don't have an account?
                </Text>
                <TouchableOpacity 
                  onPress={
                    () => navigation.reset({
                      index: 0,
                      routes: [{ name: 'SignUp' }],
                    })
                  }
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ 
                    color: colors.background, 
                    fontSize: 16,
                    fontWeight: "600",
                    textDecorationLine: "underline" 
                  }}>
                    Create New Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={{ paddingBottom: 32, paddingHorizontal: 32 }}>
              <Text style={{ 
                textAlign: "center", 
                color: colors.textWhite,
                opacity: 0.9,
                fontSize: 14
              }}>
                By continuing, you agree to our
              </Text>
              <View style={{ 
                marginTop: 8, 
                flexDirection: "row", 
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <TouchableOpacity style={{ marginHorizontal: 8, marginVertical: 4 }}>
                  <Text style={{ 
                    color: colors.background, 
                    textDecorationLine: "underline",
                    fontSize: 14,
                    fontWeight: "600"
                  }}>
                    Terms of Service
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginHorizontal: 8, marginVertical: 4 }}>
                  <Text style={{ 
                    color: colors.background, 
                    textDecorationLine: "underline",
                    fontSize: 14,
                    fontWeight: "600"
                  }}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginHorizontal: 8, marginVertical: 4 }}>
                  <Text style={{ 
                    color: colors.background, 
                    textDecorationLine: "underline",
                    fontSize: 14,
                    fontWeight: "600"
                  }}>
                    Content Policy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
