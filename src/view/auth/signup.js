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
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../constants/colors";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  const signUpWithEmail = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      await auth().createUserWithEmailAndPassword(email.trim(), password);
      const user = auth().currentUser;
      if (user) {
        await user.sendEmailVerification();
        setConfirm(true);
      }
      Alert.alert("Verification", "Verification email sent, please check your inbox.");
    } catch (error) {
      console.log("Error in signing up: ", error.message);
      Alert.alert("Sign Up Error", error.message);
    }
  };

  const verifyEmail = async () => {
    const user = auth().currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        Alert.alert("Email Not Verified", "Please check your inbox for the verification email.");
      }
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
                <Image
                  source={require("../../../assets/logo-small-removebg.png")}
                  style={{
                    width: 120,
                    height: 120,
                    marginBottom: 16,
                    resizeMode: "contain"
                  }}
                />
                <Text style={{ 
                  fontSize: 16, 
                  color: colors.textWhite, 
                  opacity: 0.9,
                  textAlign: "center"
                }}>
                  Join the food revolution
                </Text>
              </View>

              {!confirm ? (
                <>
                  {/* Sign Up Form */}
                  <View style={{ marginBottom: 32 }}>
                    <TextInput
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: "#fff",  // White background for the input
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: colors.text,
                        borderWidth: 1,
                        borderColor: "#ccc",  // Light border color
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor="#999"  // Light grey placeholder color
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
                        backgroundColor: "#fff",  // White background for the input
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: "#000",  
                        borderWidth: 1,
                        borderColor: "#ccc",  // Light border color
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"  // Light grey placeholder color
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                    <View style={{ height: 20 }} />
                    <TextInput
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: "#fff",  // White background for the input
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: "#000",  
                        borderWidth: 1,
                        borderColor: "#ccc",  // Light border color
                      }}
                      placeholder="Confirm your password"
                      placeholderTextColor="#999"  // Light grey placeholder color
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>

                  {/* Create Account Button */}
                  <TouchableOpacity
                    onPress={signUpWithEmail}
                    activeOpacity={0.8}
                    style={{
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: "#000",  // Black background for the button
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ 
                      color: "#fff",  // White text color for the button
                      fontSize: 18, 
                      fontWeight: "700",
                      letterSpacing: 0.5
                    }}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Email Verification Screen */}
                  <View style={{ alignItems: "center", marginBottom: 32 }}>
                    <Text style={{ 
                      textAlign: "center", 
                      color: colors.textWhite, 
                      fontSize: 18,
                      opacity: 0.9, 
                      marginBottom: 24,
                      lineHeight: 26
                    }}>
                      Please check your email and verify your account to continue
                    </Text>
                    
                    <TouchableOpacity
                      onPress={verifyEmail}
                      activeOpacity={0.8}
                      style={{
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: colors.buttonSecondary,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 32,
                      }}
                    >
                      <Text style={{ 
                        color: colors.buttonText, 
                        fontSize: 18, 
                        fontWeight: "700",
                        letterSpacing: 0.5
                      }}>
                        Verify Email
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Sign In Link */}
              <View style={{ marginTop: 32, alignItems: "center" }}>
                <Text style={{ 
                  color: colors.textWhite, 
                  fontSize: 16,
                  opacity: 0.9
                }}>
                  Already have an account?
                </Text>
                <TouchableOpacity 
                  onPress={
                    () => navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
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
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={{ paddingBottom: 32, paddingHorizontal: 32 }}>
              <Text style={{ 
                textAlign: "center", 
                color: colors.textWhite,
                opacity: 0.8,
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
                    fontWeight: "500"
                  }}>
                    Terms of Service
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginHorizontal: 8, marginVertical: 4 }}>
                  <Text style={{ 
                    color: colors.background, 
                    textDecorationLine: "underline",
                    fontSize: 14,
                    fontWeight: "500"
                  }}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginHorizontal: 8, marginVertical: 4 }}>
                  <Text style={{ 
                    color: colors.background, 
                    textDecorationLine: "underline",
                    fontSize: 14,
                    fontWeight: "500"
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
