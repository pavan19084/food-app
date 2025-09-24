import React, { useState, useEffect } from 'react';
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
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { LocationService } from '../utils/locationService';

const CATEGORY_ITEMS = [
  { id: 'healthy',  label: 'Healthy',  img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=500&fit=crop&auto=format' },
  { id: 'biryani',  label: 'Biryani',  img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxkIYXyQ8YvdloqFq9iZAAcL95GwCk30Kj3g&s' },
  { id: 'pizza',    label: 'Pizza',    img: 'https://i0.wp.com/olivesandlamb.com/wp-content/uploads/2024/05/Chicken-Parmesan-Pizza-10-4x5-1.jpg?resize=819%2C1024&ssl=1' },
  { id: 'haleem',   label: 'Haleem',   img: 'https://www.licious.in/blog/wp-content/uploads/2022/04/Chicken-Haleem-Cooked-min-compressed-scaled.jpg' },
  { id: 'chicken',  label: 'Chicken',  img: 'https://www.shutterstock.com/image-photo/crispy-fried-chicken-on-plate-600nw-2184383193.jpg' },
  { id: 'burger',   label: 'Burger',   img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=120&h=120&fit=crop&auto=format' },
  { id: 'cake',     label: 'Cake',     img: 'https://assets.winni.in/product/primary/2023/3/83223.jpeg?dpr=1&w=500' },
  { id: 'shawarma', label: 'Shawarma', img: 'https://www.munatycooking.com/wp-content/uploads/2023/12/chicken-shawarma-image-feature-2023.jpg' },
];

const RESTAURANTS = [
  {
    id: 'r1',
    cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=500&fit=crop&auto=format',
    title: 'Eat Healthy',
    subtitle: 'Healthy food',
    rating: '4.3',
    priceForTwo: '40 euro',
    badges: ['Healthy', 'DELIVERY'],
    envNote: 'Always eat healthy, be healthy',
    onTap: 'Restaurant',
    category: 'healthy',
    deliveryAvailable: true,
    collectionAvailable: true,
  },
  {
    id: 'r2',
    cover: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900&h=500&fit=crop&auto=format',
    title: 'Amul',
    subtitle: 'Desserts, Ice Cream, Beverages',
    rating: '4.2',
    priceForTwo: '15 euro',
    badges: ['Healthy', 'DELIVERY'],
    envNote: 'Amul, taste of India',
    onTap: 'Restaurant',
    category: 'cake',
    deliveryAvailable: false,
    collectionAvailable: true,
  },
  {
    id: 'r3',
    cover: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=900&h=500&fit=crop&auto=format',
    title: 'Pizza Palace',
    subtitle: 'Italian, Pizza, Pasta',
    rating: '4.5',
    priceForTwo: '25 euro',
    badges: ['Popular', 'DELIVERY'],
    envNote: 'Authentic Italian pizza made fresh daily',
    onTap: 'Restaurant',
    category: 'pizza',
    deliveryAvailable: true,
    collectionAvailable: true,
  },
  {
    id: 'r4',
    cover: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=900&h=500&fit=crop&auto=format',
    title: 'Burger House',
    subtitle: 'American, Burgers, Fast Food',
    rating: '4.1',
    priceForTwo: '20 euro',
    badges: ['Popular', 'DELIVERY'],
    envNote: 'Juicy burgers with fresh ingredients',
    onTap: 'Restaurant',
    category: 'burger',
    deliveryAvailable: true,
    collectionAvailable: true,
  },
  {
    id: 'r5',
    cover: 'https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=900&h=500&fit=crop&auto=format',
    title: 'Biryani Corner',
    subtitle: 'Indian, Biryani, Rice',
    rating: '4.4',
    priceForTwo: '18 euro',
    badges: ['Popular', 'DELIVERY'],
    envNote: 'Authentic Hyderabadi biryani',
    onTap: 'Restaurant',
    category: 'biryani',
    deliveryAvailable: true,
    collectionAvailable: false,
  },
  {
    id: 'r6',
    cover: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900&h=500&fit=crop&auto=format',
    title: 'Chicken Delight',
    subtitle: 'Chicken, Grill, BBQ',
    rating: '4.0',
    priceForTwo: '22 euro',
    badges: ['Popular', 'DELIVERY'],
    envNote: 'Grilled chicken with special marinades',
    onTap: 'Restaurant',
    category: 'chicken',
    deliveryAvailable: false,
    collectionAvailable: true,
  },
  {
    id: 'r7',
    cover: 'https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=900&h=500&fit=crop&auto=format',
    title: 'Haleem House',
    subtitle: 'Middle Eastern, Haleem, Traditional',
    rating: '4.6',
    priceForTwo: '16 euro',
    badges: ['Popular', 'DELIVERY'],
    envNote: 'Traditional haleem with authentic spices',
    onTap: 'Restaurant',
    category: 'haleem',
    deliveryAvailable: true,
    collectionAvailable: true,
  },
  {
    id: 'r8',
    cover: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=900&h=500&fit=crop&auto=format',
    title: 'Shawarma Express',
    subtitle: 'Middle Eastern, Shawarma, Wraps',
    rating: '4.3',
    priceForTwo: '12 euro',
    badges: ['Popular', 'DELIVERY'],
    envNote: 'Fresh shawarma wraps with homemade sauces',
    onTap: 'Restaurant',
    category: 'shawarma',
    deliveryAvailable: true,
    collectionAvailable: true,
  },
  {
    id: 'r9',
    cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=500&fit=crop&auto=format',
    title: 'Green Garden',
    subtitle: 'Vegetarian, Healthy, Organic',
    rating: '4.7',
    priceForTwo: '28 euro',
    badges: ['Healthy', 'DELIVERY'],
    envNote: '100% organic vegetarian cuisine',
    onTap: 'Restaurant',
    category: 'healthy',
    deliveryAvailable: true,
    collectionAvailable: true,
  },
  {
    id: 'r10',
    cover: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&h=500&fit=crop&auto=format',
    title: 'Sweet Treats',
    subtitle: 'Desserts, Cakes, Pastries',
    rating: '4.2',
    priceForTwo: '14 euro',
    badges: ['Popular', 'DELIVERY'],
    envNote: 'Homemade cakes and pastries',
    onTap: 'Restaurant',
    category: 'cake',
    deliveryAvailable: true,
    collectionAvailable: true,
  },
];

const FilterChip = ({ label, filled, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.chip, 
      { 
        backgroundColor: filled ? '#FF6B6B' : '#F0F0F0',
        borderColor: filled ? '#FF6B6B' : '#E0E0E0'
      }
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.chipText, 
      { color: filled ? '#FFFFFF' : '#333' }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

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

const OrderStatusBar = ({ order, onPress, onDismiss }) => {
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    if (!order) return;

    // Update remaining time immediately
    setRemainingTime(order.getFormattedRemainingTime());

    // Update every minute
    const timer = setInterval(() => {
      setRemainingTime(order.getFormattedRemainingTime());
    }, 60000);

    return () => clearInterval(timer);
  }, [order]);

  if (!order) return null;

  const orderSummary = order.getOrderSummary();

  return (
    <View style={styles.orderStatusBar}>
      <TouchableOpacity onPress={onPress} style={styles.orderStatusContent}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&auto=format' }} 
          style={styles.orderStatusImage} 
        />
        <View style={styles.orderStatusText}>
          <Text style={styles.orderStatusTitle}>{orderSummary.restaurantName}</Text>
          <Text style={styles.orderStatusSubtitle}>View Order Details</Text>
        </View>
        <View style={styles.orderStatusRight}>
          <Text style={styles.orderStatusCount}>
            {orderSummary.totalItems} Item{orderSummary.totalItems > 1 ? 's' : ''} • {orderSummary.formattedPrice}
          </Text>
          <View style={styles.orderStatusButton}>
            <Text style={styles.orderStatusButtonText}>
              {remainingTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss} style={styles.orderStatusDismiss}>
        <Text style={styles.orderStatusDismissText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const RestaurantCard = ({ item }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (item.onTap) {
      navigation.navigate(item.onTap, {
        title: item.title,
        subtitle: item.subtitle,
        cover: item.cover,
        envNote: item.envNote,
      });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <Image source={{ uri: item.cover }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>{item.rating} ★</Text>
          </View>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.priceText}>{item.priceForTwo}</Text>
        </View>

        <View style={styles.badgeRow}>
          {item.badges.map(b => (
            <View key={b} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Delivery/Collection Indicators */}
        <View style={styles.deliveryCollectionRow}>
          {item.deliveryAvailable && (
            <View style={styles.deliveryIndicator}>
              <Ionicons name="bicycle-outline" size={14} color="#4CAF50" />
              <Text style={styles.deliveryText}>Delivery</Text>
            </View>
          )}
          {item.collectionAvailable && (
            <View style={styles.collectionIndicator}>
              <Ionicons name="storefront-outline" size={14} color="#FF9800" />
              <Text style={styles.collectionText}>Collection</Text>
            </View>
          )}
        </View>

        <Text style={styles.envNote} numberOfLines={2}>{item.envNote}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function Home() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { activeOrder, showOrderNotification, dismissNotification } = useOrder();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Healthy');
  const initials = (user?.name || user?.username || 'U').trim().charAt(0).toUpperCase()

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await LocationService.getLocationWithFallback();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error loading location:', error);
      Alert.alert(
        'Location Error',
        'Unable to load location. Please check your location permissions.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    // Save the new location
    LocationService.saveLocation(location);
  };

  const handleRefreshLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await LocationService.updateLocation();
      setCurrentLocation(location);
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to refresh location. Please check your location permissions.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(selectedFilter === filter ? null : filter);
  };

  const handleNotificationPress = () => {
    if (activeOrder) {
      navigation.navigate('OrderConfirmation', { orderDetails: activeOrder });
    }
  };

  const handleDismissNotification = () => {
    dismissNotification();
  };

  const getFilteredRestaurants = () => {
    let filtered = RESTAURANTS;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(restaurant => restaurant.category === selectedCategory);
    }

    // Filter by filter chip
    if (selectedFilter) {
      if (selectedFilter === 'Healthy') {
        filtered = filtered.filter(restaurant => restaurant.badges.includes('Healthy'));
      } else if (selectedFilter === 'Popular') {
        filtered = filtered.filter(restaurant => restaurant.badges.includes('Popular'));
      }
      // Add more filter logic as needed
    }

    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />

      {/* Order Status Bar */}
      {showOrderNotification && (
        <OrderStatusBar
          order={activeOrder}
          onPress={handleNotificationPress}
          onDismiss={handleDismissNotification}
        />
      )}

      {/* Location row */}
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

      {/* Top search + profile avatar */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Restaurant name, cuisine, or a dish..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.profileBtn}
          activeOpacity={0.8}
          onPress={() => user ? navigation.navigate('Profile') : navigation.navigate('Login', { next: 'Home', nextParams: {} })}
        >
          <Text style={styles.profileInitials}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: showOrderNotification ? 80 : 40 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Filter chips in one row */}
        <View style={styles.chipsRow}>
          <FilterChip 
            label="Healthy" 
            filled={selectedFilter === 'Healthy'} 
            onPress={() => handleFilterPress('Healthy')}
          />
          <FilterChip 
            label="PRO" 
            filled={selectedFilter === 'PRO'} 
            onPress={() => handleFilterPress('PRO')}
          />
          <FilterChip 
            label="Cuisines" 
            filled={selectedFilter === 'Cuisines'} 
            onPress={() => handleFilterPress('Cuisines')}
          />
          <FilterChip 
            label="Rating" 
            filled={selectedFilter === 'Rating'} 
            onPress={() => handleFilterPress('Rating')}
          />
          <FilterChip 
            label="Popular" 
            filled={selectedFilter === 'Popular'} 
            onPress={() => handleFilterPress('Popular')}
          />
        </View>

        {/* Categories */}
        <Text style={styles.h2}>Eat what makes you happy</Text>
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

        {/* Restaurants */}
        <Text style={styles.h2}>
          {filteredRestaurants.length} restaurants around you
          {selectedCategory && ` - ${CATEGORY_ITEMS.find(c => c.id === selectedCategory)?.label}`}
          {selectedFilter && ` - ${selectedFilter}`}
        </Text>
        <FlatList
          data={filteredRestaurants}
          keyExtractor={it => it.id}
          renderItem={({ item }) => <RestaurantCard item={item} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      </ScrollView>

    </View>
  );
}

const RADIUS = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#FFF8F5',
  },

  /* LOCATION ROW */
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  locationInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationPin: {
    fontSize: 18,
  },
  locationCity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  locationSub: {
    fontSize: 12,
    marginTop: 2,
    color: '#666',
  },
  changeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B6B',
  },

  /* SEARCH + PROFILE */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    color: '#333',
  },

  /* Profile button */
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  profileInitials: {
    fontWeight: '800',
    fontSize: 16,
    color: '#FFFFFF',
  },

  /* CHIPS, LISTS, CARDS */
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  chipText: { 
    fontSize: 12,
    fontWeight: '600',
  },

  h2: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    color: '#333',
  },

  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  catItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  catImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  catLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },

  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ratingPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  ratingText: { 
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dot: { 
    marginHorizontal: 2,
    fontSize: 16,
    color: '#666',
  },
  priceText: { 
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFE0E0',
    borderColor: '#FF6B6B',
  },
  badgeText: { 
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },

  envNote: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: '#666',
  },

  /* Delivery/Collection Indicators */
  deliveryCollectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  deliveryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  deliveryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  collectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  collectionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 4,
  },

  /* ORDER STATUS BAR */
  orderStatusBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },
  orderStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderStatusImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  orderStatusText: {
    flex: 1,
  },
  orderStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  orderStatusSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  orderStatusRight: {
    alignItems: 'flex-end',
  },
  orderStatusCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderStatusButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orderStatusButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderStatusDismiss: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderStatusDismissText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});
