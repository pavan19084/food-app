import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, ScrollView, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../constants/colors';

export default function OrderDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params;

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.lightMode.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.lightMode.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': '#FF9800',
      'confirmed': '#2196F3',
      'preparing': '#9C27B0',
      'delivery': '#FF5722',
      'delivered': '#4CAF50',
      'cancelled': '#F44336'
    };
    return statusColors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'pending': 'time-outline',
      'confirmed': 'checkmark-circle-outline',
      'preparing': 'restaurant-outline',
      'delivery': 'bicycle-outline',
      'delivered': 'checkmark-done-outline',
      'cancelled': 'close-circle-outline'
    };
    return statusIcons[status] || 'help-circle-outline';
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleOpenMap = (latitude, longitude) => {
    if (latitude && longitude) {
      const scheme = Platform.select({ 
        ios: 'maps:', 
        android: 'geo:' 
      });
      const url = Platform.select({
        ios: `${scheme}${latitude},${longitude}`,
        android: `${scheme}${latitude},${longitude}`
      });
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.lightMode.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.lightMode.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Order Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Order #{order.orderId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Ionicons 
                name={getStatusIcon(order.status)} 
                size={16} 
                color={getStatusColor(order.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.getStatusDisplayText ? order.getStatusDisplayText() : order.status}
              </Text>
            </View>
          </View>
          <Text style={styles.restaurantName}>{order.restaurant?.name || order.restaurantName}</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.lightMode.textLight} />
            <Text style={styles.detailText}>{order.orderDate} at {order.orderTime}</Text>
          </View>
        </View>

        {/* Restaurant Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Restaurant Information</Text>
          <Text style={styles.infoText}>{order.restaurant?.name || order.restaurantName}</Text>
          
          {order.restaurant?.phone && (
            <View style={styles.actionRow}>
              <View style={styles.detailRowFlex}>
                <Ionicons name="call-outline" size={16} color={colors.lightMode.textLight} />
                <Text style={styles.detailText}>{order.restaurant.phone}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleCall(order.restaurant.phone)}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {order.restaurant?.latitude && order.restaurant?.longitude && (
            <View style={styles.actionRow}>
              <View style={styles.detailRowFlex}>
                <Ionicons name="location-outline" size={16} color={colors.lightMode.textLight} />
                <Text style={styles.detailText}>
                  {order.restaurant.latitude}, {order.restaurant.longitude}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleOpenMap(order.restaurant.latitude, order.restaurant.longitude)}
              >
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Map</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="navigate-outline" size={16} color={colors.lightMode.textLight} />
            <Text style={styles.detailText}>
              Order Type: {order.orderType}
            </Text>
          </View>
          
          {order.user_location && (
            <>
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={16} color={colors.lightMode.textLight} />
                <View style={styles.addressTextContainer}>
                  <Text style={styles.detailText}>
                    {order.user_location.addressline1}
                    {order.user_location.addressline2 ? `, ${order.user_location.addressline2}` : ''}
                  </Text>
                  {order.user_location.area && (
                    <Text style={styles.detailText}>{order.user_location.area}</Text>
                  )}
                  <Text style={styles.detailText}>
                    {order.user_location.city}, {order.user_location.state} - {order.user_location.pincode}
                  </Text>
                  <Text style={styles.detailText}>{order.user_location.country}</Text>
                </View>
              </View>
            
            </>
          )}
          
          {order.special_instructions && (
            <View style={styles.detailRow}>
              <Ionicons name="chatbox-outline" size={16} color={colors.lightMode.textLight} />
              <Text style={styles.detailText}>
                Special Instructions: {order.special_instructions}
              </Text>
            </View>
          )}
        </View>

        {/* Items Ordered */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>£{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.infoText}>No items found</Text>
          )}
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          {(() => {
            // Calculate subtotal from individual items
            const subtotal = order.items ? order.items.reduce((sum, item) => {
              return sum + ((item.price || 0) * (item.quantity || 0));
            }, 0) : 0;
            
            // Calculate delivery fee for delivery orders
            const deliveryFee = order.orderType === "delivery" ? 
              (parseFloat(order.total) - subtotal) : 0;
            
            return (
              <View style={styles.totalsContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>£{subtotal.toFixed(2)}</Text>
                </View>
                
                {order.orderType === "delivery" && deliveryFee > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>£{deliveryFee.toFixed(2)}</Text>
                  </View>
                )}
                
                {order.discount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Discount</Text>
                    <Text style={styles.summaryValue}>-£{order.discount.toFixed(2)}</Text>
                  </View>
                )}
                
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>£{parseFloat(order.total).toFixed(2)}</Text>
                </View>
              </View>
            );
          })()}
          
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color={colors.lightMode.textLight} />
            <Text style={styles.detailText}>{order.paymentMethod}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightMode.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.lightMode.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightMode.border,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightMode.text,
  },
  scrollViewContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.lightMode.border,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightMode.text,
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    color: colors.lightMode.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.lightMode.textDark,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRowFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: colors.lightMode.textLight,
    marginLeft: 8,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightMode.border,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.lightMode.textLight,
    marginRight: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: colors.lightMode.text,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.lightMode.text,
  },
  totalsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightMode.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.lightMode.textDark,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.lightMode.text,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    backgroundColor: colors.lightMode.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    marginHorizontal: -4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.lightMode.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.lightMode.error,
    textAlign: 'center',
  },
});