import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../context/TimerContext';
import { colors } from '../constants/colors';

const DeliveryTimer = ({ 
  orderStatus, 
  orderType = 'delivery', 
  baseMinutes = 0, // No default time
  style = {},
  showIcon = true,
  variant = 'default' // 'default', 'compact', 'minimal', 'hero'
}) => {
  const { timerData, shouldShowTimer, getFormattedTime } = useTimer();

  
  // Use global timer data if available, otherwise don't show timer
  const timeRemaining = timerData.isActive ? timerData.timeRemaining * 60 : 0;
  const isDelivered = orderStatus === 'delivered' || orderStatus === 'collected';

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pulse animation for urgent delivery
  useEffect(() => {
    if (timerData.isActive) {
      const minutes = formatTime(timeRemaining);
      if (minutes <= 5 && !isDelivered) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
      }
    }
  }, [timerData.isActive, timeRemaining, isDelivered]);

  const formatTime = (seconds) => {
    // Use global timer's formatted time if available
    if (timerData.isActive) {
      const formatted = getFormattedTime();
      return formatted;
    }
    
    // If no timer active, don't show time
    if (seconds <= 0) {
      return 0;
    }
    
    const minutes = Math.ceil(seconds / 60);

    return minutes;
  };

  const getStatusText = () => {
    
    if (isDelivered) {
      const status = orderType === 'delivery' ? 'Delivered!' : 'Ready!';
      return status;
    }
    
    const minutes = formatTime(timeRemaining);
    
    if (minutes <= 0) {
      return 'Arriving now';
    }
    
    const statusText = `${minutes}`;
    return statusText;
  };

  const getStatusColor = () => {
    if (isDelivered) return '#00C851';
    
    const minutes = formatTime(timeRemaining);
    if (minutes <= 5) return '#FF4444'; // Red for urgent
    if (minutes <= 15) return '#FF8800'; // Orange for soon
    return '#FF6B35'; // Default orange-red
  };

  const getBackgroundColor = () => {
    if (isDelivered) return '#E8F5E8';
    
    const minutes = formatTime(timeRemaining);
    if (minutes <= 5) return '#FFE8E8';
    if (minutes <= 15) return '#FFF4E8';
    return '#FFF0E8';
  };

  const getIconName = () => {
    if (isDelivered) return "checkmark-circle";
    const minutes = formatTime(timeRemaining);
    if (minutes <= 5) return "flash";
    if (minutes <= 15) return "bicycle";
    return "time";
  };

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  // Don't show timer if not active and no time remaining
  if (!timerData.isActive && timeRemaining <= 0) {
    return null;
  }
  
  if (variant === 'minimal') {
    return (
      <Animated.View style={[styles.minimalContainer, style, { transform: [{ translateY: slideTransform }] }]}>
        <Text style={[styles.minimalText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </Animated.View>
    );
  }

  if (variant === 'compact') {
    return (
      <Animated.View style={[
        styles.compactContainer, 
        style, 
        { 
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: slideTransform }, { scale: scaleAnim }] 
        }
      ]}>
        <View style={[styles.compactIconContainer, { backgroundColor: getStatusColor() }]}>
          <Ionicons 
            name={getIconName()} 
            size={14} 
            color="#FFFFFF" 
          />
        </View>
        <Text style={[styles.compactText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </Animated.View>
    );
  }

  if (variant === 'hero') {
    return (
      <Animated.View style={[
        styles.heroContainer, 
        style, 
        { 
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: slideTransform }, { scale: scaleAnim }] 
        }
      ]}>
        <View style={styles.heroContent}>
          <Animated.View style={[styles.heroIconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons 
              name={getIconName()} 
              size={32} 
              color={getStatusColor()} 
            />
          </Animated.View>
          <View style={styles.heroTextContainer}>
            <Text style={[styles.heroTimeText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            <Text style={styles.heroSubText}>
              {isDelivered 
                ? (orderType === 'delivery' ? 'Your order has been delivered!' : 'Your order is ready for collection!')
                : (orderType === 'delivery' ? 'Estimated delivery time' : 'Estimated ready time')
              }
            </Text>
          </View>
        </View>
        {!isDelivered && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: getStatusColor() + '20' }]}>
              <Animated.View style={[
                styles.progressFill, 
                { 
                  backgroundColor: getStatusColor(),
                  opacity: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  })
                }
              ]} />
            </View>
          </View>
        )}
      </Animated.View>
    );
  }

  // Default variant - Enhanced
  return (
    <Animated.View style={[
      styles.container, 
      style, 
      { 
        backgroundColor: getBackgroundColor(),
        transform: [{ translateY: slideTransform }, { scale: scaleAnim }] 
      }
    ]}>
      <View style={styles.timerContent}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons 
            name={getIconName()} 
            size={24} 
            color={getStatusColor()} 
          />
        </Animated.View>
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          <Text style={styles.subText}>
            {isDelivered 
              ? (orderType === 'delivery' ? 'Order delivered successfully' : 'Order collected successfully')
              : (orderType === 'delivery' ? 'Estimated delivery time' : 'Estimated ready time')
            }
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Default variant - Enhanced
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },

  // Compact variant - Enhanced
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  compactText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Hero variant - New
  heroContainer: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTimeText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroSubText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 3,
  },

  // Minimal variant
  minimalContainer: {
    // No background, just text
  },
  minimalText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default DeliveryTimer;
