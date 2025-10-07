import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../api/order';
import { Order } from '../models/order';
import { useAlert } from '../hooks/useAlert';
import CustomAlert from '../components/CustomAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors } from '../constants/colors';

export default function OrderHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const alert = useAlert();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const result = await getUserOrders(user.id);
      
      if (result.success && result.data) {
        const orderObjects = result.data.map(orderData => Order.createFromApiResponse(orderData));
        setOrders(orderObjects);
      } else {
        alert.show({
          title: 'Error',
          message: result.message || 'Failed to load order history',
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      alert.show({
        title: 'Error',
        message: 'Failed to load order history. Please try again.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderConfirmation', { 
      orderDetails: order,
      isHistoryView: true 
    });
  };

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

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard} 
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>#{item.orderId}</Text>
          <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.getStatusDisplayText()}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.lightMode.textLight} />
          <Text style={styles.detailText}>{item.orderDate}</Text>
          <Text style={styles.detailText}>•</Text>
          <Text style={styles.detailText}>{item.orderTime}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="restaurant-outline" size={16} color={colors.lightMode.textLight} />
          <Text style={styles.detailText}>
            {item.getTotalItems()} item{item.getTotalItems() > 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color={colors.lightMode.textLight} />
          <Text style={styles.detailText}>{item.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>£{item.total.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.lightMode.textLight} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color={colors.lightMode.textLight} />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your order history will appear here once you place your first order.
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.browseButtonText}>Browse Restaurants</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.lightMode.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.lightMode.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 24 }} />
        </View>
        <LoadingSpinner 
          text="Loading order history..." 
          containerStyle={styles.loadingContainer}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.lightMode.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.lightMode.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        renderItem={renderOrderItem}
        contentContainerStyle={[
          styles.listContainer,
          orders.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={alert.hide}
      />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightMode.text,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  orderCard: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lightMode.border,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.lightMode.text,
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: colors.lightMode.textLight,
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
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: colors.lightMode.textLight,
    marginLeft: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightMode.border,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.lightMode.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.lightMode.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: colors.lightMode.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
