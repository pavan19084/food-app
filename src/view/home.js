import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { LocationService } from '../utils/locationService';
import { getAllRestaurants } from '../api/restaurant';
import { useAlert } from '../hooks/useAlert';
import CustomAlert from '../components/CustomAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import CartFooter from '../components/CartFooter';

const CATEGORY_ITEMS = [
  { id: 'healthy', label: 'Healthy', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=500&fit=crop&auto=format' },
  { id: 'biryani', label: 'Biryani', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxkIYXyQ8YvdloqFq9iZAAcL95GwCk30Kj3g&s' },
  { id: 'pizza', label: 'Pizza', img: 'https://i0.wp.com/olivesandlamb.com/wp-content/uploads/2024/05/Chicken-Parmesan-Pizza-10-4x5-1.jpg?resize=819%2C1024&ssl=1' },
  { id: 'haleem', label: 'Haleem', img: 'https://www.licious.in/blog/wp-content/uploads/2022/04/Chicken-Haleem-Cooked-min-compressed-scaled.jpg' },
  { id: 'chicken', label: 'Chicken', img: 'https://www.shutterstock.com/image-photo/crispy-fried-chicken-on-plate-600nw-2184383193.jpg' },
  { id: 'burger', label: 'Burger', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=120&h=120&fit=crop&auto=format' },
  { id: 'cake', label: 'Cake', img: 'https://assets.winni.in/product/primary/2023/3/83223.jpeg?dpr=1&w=500' },
  { id: 'shawarma', label: 'Shawarma', img: 'https://www.munatycooking.com/wp-content/uploads/2023/12/chicken-shawarma-image-feature-2023.jpg' },
];

const CategoryBubble = ({ item, selected, onPress }) => (
  <TouchableOpacity style={styles.catItem} onPress={onPress}>
    <Image
      source={{ uri: item.img }}
      style={[
        styles.catImage,
        { borderColor: selected ? '#FF6B6B' : '#E0E0E0' }
      ]}
    />
    <Text style={[
      styles.catLabel,
      { color: selected ? '#FF6B6B' : '#666' }
    ]} numberOfLines={1}>
      {item.label}
    </Text>
  </TouchableOpacity>
);

const HorizontalCategoryChip = ({ item, selected, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.chip,
      { 
        backgroundColor: selected ? '#FF6B6B' : '#FFFFFF',
        borderColor: selected ? '#FF6B6B' : '#E0E0E0',
      }
    ]} 
    onPress={onPress}
  >
    <Text style={[
      styles.chipText,
      { color: selected ? '#FFFFFF' : '#666' }
    ]}>
      {item.label}
    </Text>
  </TouchableOpacity>
);

const getStatusLabels = (orderType) => {
  if (orderType === 'collection') {
    return ['Pending', 'Confirmed', 'Prepared', 'Ready', 'Collected'];
  }
  return ['Pending', 'Confirmed', 'Prepared', 'Delivery', 'Delivered'];
};

const OrderRectangle = ({ order, onPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const statusLabels = getStatusLabels(order?.orderType);

  useEffect(() => {
    if (!order) return;
    const statusIndex = statusLabels.findIndex(
      (s) => s.toLowerCase().includes(order.status.toLowerCase())
    );
    setCurrentIndex(statusIndex >= 0 ? statusIndex : 0);
  }, [order.status, order.orderType]);

  if (!order) return null;

  const summary = order.getOrderSummary();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIconContainer}>
          <Ionicons name="receipt-outline" size={24} color="#FF6B6B" />
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle}>{summary?.restaurantName}</Text>
          <Text style={styles.orderSubtitle}>
            {summary?.totalItems} Item{summary?.totalItems > 1 ? 's' : ''} • {summary?.formattedPrice}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      <View style={styles.progressContainer}>
        {statusLabels.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={status}>
              <View style={styles.progressStep}>
                <View
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: isCompleted || isCurrent ? '#FF6B6B' : '#E0E0E0',
                      transform: [{ scale: isCurrent ? 1.2 : 1 }],
                    },
                  ]}
                >
                  {isCompleted && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[
                  styles.progressLabel,
                  (isCurrent || isCompleted) && styles.progressLabelActive
                ]}>
                  {status}
                </Text>
              </View>

              {index < statusLabels.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    { backgroundColor: isCompleted ? '#FF6B6B' : '#E0E0E0' },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

const RestaurantCard = ({ item }) => {
  const navigation = useNavigation();
  const metaIcons = [];
  if (item.deliveryAvailable) metaIcons.push({ name: 'bicycle', label: 'Delivery' });
  if (item.collectionAvailable) metaIcons.push({ name: 'storefront', label: 'Collection' });
  if (item.cardPaymentAvailable) metaIcons.push({ name: 'card', label: 'Card' });
  if (item.cashOnDeliveryAvailable) metaIcons.push({ name: 'cash', label: 'Cash' });
  if (!item.isOnline) metaIcons.push({ name: 'cloud-offline', label: 'Offline', color: '#FF6B6B' });

  const handlePress = () => {
    if (item.onTap) {
      navigation.navigate(item.onTap, {
        title: item.title,
        restaurantName: item.title,
        subtitle: item.subtitle,
        cover: item.cover,
        envNote: item.envNote,
        restaurantId: item.restaurantData?.restaurantId,
        restaurantData: item.restaurantData,
      });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.95}>
      <Image source={{ uri: item.cover }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <View style={styles.metaRow}>
          {metaIcons.map((icon, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <Ionicons name={icon.name + '-outline'} size={18} color={icon.color || '#666'} />
              <Text style={{ fontSize: 12, color: icon.color || '#666', marginLeft: 4 }}>{icon.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Home() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { activeOrder, showOrderNotification } = useOrder();
  const { getTotalItems } = useCart();
  const alert = useAlert();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;
  const [showHorizontalCategories, setShowHorizontalCategories] = useState(false);

  const initials = (user?.name || user?.username || 'U').trim().charAt(0).toUpperCase();
  const hasCartItems = getTotalItems() > 0;

  useEffect(() => {
    loadLocation();
    loadRestaurants();
  }, []);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      if (value > 100 && !showHorizontalCategories) {
        setShowHorizontalCategories(true);
      } else if (value <= 100 && showHorizontalCategories) {
        setShowHorizontalCategories(false);
      }
    });

    return () => scrollY.removeListener(listenerId);
  }, [showHorizontalCategories]);

  const loadLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await LocationService.getLocationWithFallback();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error loading location:', error);
      alert.show({
        title: 'Location Error',
        message: 'Unable to load location. Please check your location permissions.',
        buttons: [{ text: 'OK', onPress: () => { } }]
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadRestaurants = async () => {
    try {
      setIsLoadingRestaurants(true);
      const result = await getAllRestaurants();

      if (result.success) {
        const restaurantCards = result.data.map(restaurant => restaurant.toCardData());
        setRestaurants(restaurantCards);
      } else {
        alert.show({
          title: 'Error',
          message: result.message || 'Failed to load restaurants',
          buttons: [{ text: 'OK', onPress: () => { } }]
        });
        setRestaurants([]);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      alert.show({
        title: 'Error',
        message: 'Failed to load restaurants. Please try again.',
        buttons: [{ text: 'OK', onPress: () => { } }]
      });
      setRestaurants([]);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    LocationService.saveLocation(location);
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleOrderPress = () => {
    if (activeOrder) navigation.navigate('OrderConfirmation', { orderDetails: activeOrder });
  };

  const getFilteredRestaurants = () => {
    let filtered = restaurants;

    if (selectedCategory) {
      filtered = filtered.filter(restaurant => restaurant.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(restaurant =>
        restaurant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (restaurant.subtitle && restaurant.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />

      {/* Fixed Header Section */}
      <View>
        <View style={styles.locationRow}>
          <TouchableOpacity
            style={styles.locationInfoContainer}
            onPress={() => navigation.navigate('LocationModal', {
              onLocationSelect: handleLocationSelect,
              currentLocation: currentLocation
            })}
            disabled={isLoadingLocation}
          >
            <Text style={styles.locationPin}>📍</Text>
            <View style={{ flex: 1 }}>
              {isLoadingLocation ? (
                <>
                  <Text style={styles.locationCity}>Loading location...</Text>
                  <Text style={styles.locationSub}>Please wait</Text>
                </>
              ) : currentLocation ? (
                <>
                  <Text style={styles.locationCity}>
                    {currentLocation.street}, {currentLocation.city}
                  </Text>
                  <Text style={styles.locationSub}>
                    {currentLocation.state} {currentLocation.postalCode}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.locationCity}>Location unavailable</Text>
                  <Text style={styles.locationSub}>Tap to refresh</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LocationModal', {
              onLocationSelect: handleLocationSelect,
              currentLocation: currentLocation
            })}
            style={styles.changeButton}
          >
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            placeholder="Restaurant name, cuisine, or a dish..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.profileBtn}
            activeOpacity={0.8}
            onPress={() => user ? navigation.navigate('Profile') : navigation.navigate('Login', { next: 'Home', nextParams: {} })}
          >
            <Text style={styles.profileInitials}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Category Chips - Sticky */}
        {showHorizontalCategories && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalCategoriesContainer}
            contentContainerStyle={styles.horizontalCategoriesContent}
          >
            {CATEGORY_ITEMS.map(c => (
              <HorizontalCategoryChip
                key={c.id}
                item={c}
                selected={selectedCategory === c.id}
                onPress={() => handleCategoryPress(c.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* Order Rectangle - Fixed */}
        {showOrderNotification && activeOrder && (
          <OrderRectangle
            order={activeOrder}
            onPress={handleOrderPress}
          />
        )}
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={{ 
          paddingBottom: hasCartItems ? 140 : 40 
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.h2}>Eat what makes you happy</Text>
        
        {/* Category Bubbles Grid */}
        <View style={styles.categoriesGrid}>
          {CATEGORY_ITEMS.map(c => (
            <CategoryBubble
              key={c.id}
              item={c}
              selected={selectedCategory === c.id}
              onPress={() => handleCategoryPress(c.id)}
            />
          ))}
        </View>

        <Text style={styles.h2}>
          {isLoadingRestaurants ? 'Loading restaurants...' : `${filteredRestaurants.length} restaurants around you`}
          {selectedCategory && ` - ${CATEGORY_ITEMS.find(c => c.id === selectedCategory)?.label}`}
        </Text>

        {isLoadingRestaurants ? (
          <LoadingSpinner
            text="Loading restaurants..."
            containerStyle={styles.loadingContainer}
          />
        ) : (
          <FlatList
            data={filteredRestaurants}
            keyExtractor={it => it.id}
            renderItem={({ item }) => <RestaurantCard item={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        )}
      </Animated.ScrollView>

      {/* Cart Footer */}
      <CartFooter />

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={alert.hide}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  locationInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPin: {
    fontSize: 20,
    marginRight: 10,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  locationSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  horizontalCategoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  horizontalCategoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  orderSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  progressLine: {
    height: 2,
    flex: 1,
    marginHorizontal: -10,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  catItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  catImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F5F5',
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});