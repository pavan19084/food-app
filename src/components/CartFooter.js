import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';

const CartFooter = () => {
  const navigation = useNavigation();
  const { cart, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [slideAnim] = React.useState(new Animated.Value(0));

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  React.useEffect(() => {
    if (totalItems > 0) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [totalItems]);

  if (totalItems === 0) return null;

  const handleCheckout = () => {
    navigation.navigate('Cart', {
      cartItems: cart.items,
      restaurantName: cart.restaurantName,
      restaurantData: cart.restaurantData,
      restaurantId: cart.restaurantId,
    });
  };

  const handleViewMenu = () => {
    navigation.navigate('Restaurant', {
      title: cart.restaurantName,
      restaurantId: cart.restaurantId,
      restaurantData: cart.restaurantData,
    });
  };

  const handleDeleteCart = () => {
    clearCart();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [150, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.cartContent}>
        {/* Restaurant Image */}
        <Image
          source={{ uri: cart.restaurantImage }}
          style={styles.restaurantImage}
        />

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {cart.restaurantName}
          </Text>
          <Text style={styles.itemCount}>
            {totalItems} item{totalItems > 1 ? 's' : ''} | ₹{totalPrice.toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles.viewMenuButton}
            onPress={handleViewMenu}
          >
            <Text style={styles.viewMenuText}>View Full Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteCart}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
          </TouchableOpacity>

          {/* Checkout Button */}
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 20,
  },
  cartContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  infoSection: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  itemCount: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  viewMenuButton: {
    paddingVertical: 2,
  },
  viewMenuText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  checkoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default CartFooter;