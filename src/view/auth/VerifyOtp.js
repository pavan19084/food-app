import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { sendOtp } from '../../api/auth';
import { colors } from '../../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VerifyOtp() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const email = route?.params?.email || '';
  const next = route?.params?.next;
  const nextParams = route?.params?.nextParams;

  const { confirmOtp } = useAuth();
  const [otp, setOtp] = useState('');

  const onVerify = async () => {
    try {
      await confirmOtp({ email, otp });
      Alert.alert('Verified', 'Your account is verified. Please log in.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login', params: { next, nextParams } }],
      });
    } catch (e) {
      Alert.alert('OTP Error', e?.response?.data?.msg || 'Invalid OTP');
    }
  };

  const onResend = async () => {
    try {
      await sendOtp({ email, reason: 'resend' });
      Alert.alert('OTP Sent', 'Please check your inbox/SMS for the new code.');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.msg || 'Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 16 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              justifyContent: 'center',
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>
              Verify account for: {email}
            </Text>
            <TextInput
              style={{
                height: 56,
                borderRadius: 16,
                backgroundColor: '#fff',
                paddingHorizontal: 20,
                fontSize: 16,
              }}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              returnKeyType="done"
              onSubmitEditing={onVerify}
            />
            <View style={{ height: 16 }} />
            <TouchableOpacity
              onPress={onVerify}
              style={{
                height: 56,
                borderRadius: 16,
                backgroundColor: '#000',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                Verify OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onResend} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>Resend OTP</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
