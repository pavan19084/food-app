import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';

export default function LoadingSpinner({ 
  size = 'large', 
  color = colors.primary, 
  text = 'Loading...', 
  showText = true,
  containerStyle = {} 
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {showText && (
        <Text style={styles.text}>{text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
});
