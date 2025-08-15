import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Image,
  Animated,
  BackHandler,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';

export default function OrderConfirmationScreen({ navigation, route }) {
  const { orderDetails } = route?.params || {};
  
  // Enhanced animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // New animation values for staggered effects
  const [headerSlideAnim] = useState(new Animated.Value(-100));
  const [cardAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const [buttonScaleAnim] = useState(new Animated.Value(1));

  // Sample order data if none provided
  const order = orderDetails || {
    orderId: 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    restaurantName: 'Eat Healthy',
    items: [
      { name: 'Plant Protein Bowl', quantity: 1, price: 8.99 },
      { name: 'Veggie Strips', quantity: 1, price: 2.50 },
    ],
    total: 11.49,
    deliveryAddress: 'Madhapur, Hyderabad, Telangana 500081',
    estimatedDelivery: '45-50 mins',
    paymentMethod: 'Card Payment',
    orderTime: new Date().toLocaleTimeString(),
    orderDate: new Date().toLocaleDateString(),
  };

  // Handle back button press - more reliable approach
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Redirect to home when back button is pressed
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [navigation])
  );

  // Disable back button in navigation header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Remove back button from header
      gestureEnabled: false, // Disable swipe back gesture
    });
  }, [navigation]);

  useEffect(() => {
    // Enhanced entrance animation sequence
    const animationSequence = () => {
      // Header animation
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Main success header with bounce effect
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 200,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered card animations
      const cardAnimationsSequence = cardAnimations.map((anim, index) => {
        return Animated.sequence([
          Animated.delay(index * 150),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.parallel(cardAnimationsSequence).start();
    };

    // Start animation sequence after a brief delay
    const timer = setTimeout(animationSequence, 300);
    return () => clearTimeout(timer);
  }, []);

  // Interactive button animations
  const animateButtonPress = (callback) => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleTrackOrder = () => {
    animateButtonPress(() => {
      navigation.navigate('OrderTracking', { orderId: order.orderId });
    });
  };

  const handleViewOrders = () => {
    animateButtonPress(() => {
      navigation.navigate('OrderHistory');
    });
  };

  const handleBackToHome = () => {
    animateButtonPress(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  };

  const handleSupportPress = () => {
    animateButtonPress(() => {
      // Handle support contact
      console.log('Contact support');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <Animated.View 
          style={[
            styles.successHeader,
            { 
              opacity: fadeAnim, 
              transform: [
                { scale: scaleAnim },
                { translateX: headerSlideAnim }
              ] 
            }
          ]}
        >
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been confirmed and is being prepared
          </Text>
        </Animated.View>

        {/* Order Details Card */}
        <Animated.View 
          style={[
            styles.orderCard,
            { 
              opacity: cardAnimations[0],
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons name="receipt" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Order Details</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID:</Text>
              <Text style={styles.infoValue}>{order.orderId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Restaurant:</Text>
              <Text style={styles.infoValue}>{order.restaurantName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Time:</Text>
              <Text style={styles.infoValue}>{order.orderTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Date:</Text>
              <Text style={styles.infoValue}>{order.orderDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment:</Text>
              <Text style={styles.infoValue}>{order.paymentMethod}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Items Summary */}
        <Animated.View 
          style={[
            styles.itemsCard,
            { 
              opacity: cardAnimations[1],
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons name="restaurant-menu" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Items Ordered</Text>
          </View>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
            </View>
          ))}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>£{order.total.toFixed(2)}</Text>
          </View>
        </Animated.View>

        {/* Delivery Details */}
        <Animated.View 
          style={[
            styles.deliveryCard,
            { 
              opacity: cardAnimations[2],
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Delivery Details</Text>
          </View>
          
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
            <View style={styles.deliveryTime}>
              <Ionicons name="time-outline" size={16} color={colors.textLight} />
              <Text style={styles.deliveryTimeText}>
                Estimated delivery: {order.estimatedDelivery}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View 
          style={[
            styles.nextStepsCard,
            { 
              opacity: cardAnimations[3],
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>What's Next?</Text>
          </View>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Order Confirmed</Text>
                <Text style={styles.stepDescription}>
                  Your order has been received and confirmed
                </Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Preparing</Text>
                <Text style={styles.stepDescription}>
                  Restaurant is preparing your delicious food
                </Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>On the Way</Text>
                <Text style={styles.stepDescription}>
                  Your order is being delivered to you
                </Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Delivered</Text>
                <Text style={styles.stepDescription}>
                  Enjoy your meal!
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Support Info */}
        <Animated.View 
          style={[
            styles.supportCard,
            { 
              opacity: cardAnimations[4],
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Need Help?</Text>
          </View>
          
          <Text style={styles.supportText}>
            If you have any questions about your order, our customer support team is here to help.
          </Text>
          
          <TouchableOpacity style={styles.supportButton} onPress={handleSupportPress}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <Animated.View 
        style={[
          styles.bottomActions,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
            <Ionicons name="location-outline" size={20} color={colors.textWhite} />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
            <Ionicons name="home-outline" size={20} color={colors.primary} />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightMode.background,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Success Header
  successHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.lightMode.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.lightMode.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Cards - No borders or shadows, using spacing for separation
  orderCard: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  itemsCard: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  deliveryCard: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  nextStepsCard: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  supportCard: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  
  // Card Headers
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightMode.text,
    marginLeft: 12,
  },
  
  // Order Info
  orderInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.lightMode.text,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.lightMode.text,
    fontWeight: '600',
  },
  
  // Items - Using background color separation instead of borders
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: colors.lightMode.background,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.lightMode.text,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.lightMode.textLight,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.lightMode.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 20,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightMode.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  
  // Delivery Info
  deliveryInfo: {
    gap: 12,
  },
  deliveryAddress: {
    fontSize: 16,
    color: colors.lightMode.text,
    lineHeight: 22,
    backgroundColor: colors.lightMode.background,
    padding: 16,
    borderRadius: 8,
  },
  deliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightMode.background,
    padding: 12,
    borderRadius: 8,
  },
  deliveryTimeText: {
    fontSize: 14,
    color: colors.lightMode.textLight,
    marginLeft: 8,
  },
  
  // Next Steps
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lightMode.background,
    padding: 16,
    borderRadius: 12,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.lightMode.textWhite,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.lightMode.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.lightMode.textLight,
    lineHeight: 20,
  },
  
  // Support
  supportText: {
    fontSize: 14,
    color: colors.lightMode.textLight,
    lineHeight: 20,
    marginBottom: 16,
    backgroundColor: colors.lightMode.background,
    padding: 16,
    borderRadius: 8,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  
  // Bottom Actions - No border, using background separation
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.lightMode.surface,
    marginTop: 8,
    gap: 12,
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.lightMode.textWhite,
    marginLeft: 8,
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightMode.background,
    paddingVertical: 16,
    borderRadius: 12,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
});

