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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { LocationService } from '../utils/locationService';
import { getAllRestaurants } from '../api/restaurant';
import { useAlert } from '../hooks/useAlert';
import CustomAlert from '../components/CustomAlert';
import LoadingSpinner from '../components/LoadingSpinner';

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

    setRemainingTime(order.getFormattedRemainingTime());

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
        restaurantId: item.restaurantData?.restaurantId,
        restaurantData: item.restaurantData,
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
  const alert = useAlert();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const initials = (user?.name || user?.username || 'U').trim().charAt(0).toUpperCase()

  useEffect(() => {
    loadLocation();
    loadRestaurants();
  }, []);

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
        buttons: [{ text: 'OK', onPress: () => {} }]
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
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
        setRestaurants([]);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      alert.show({
        title: 'Error',
        message: 'Failed to load restaurants. Please try again.',
        buttons: [{ text: 'OK', onPress: () => {} }]
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

  const handleRefreshLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await LocationService.updateLocation();
      setCurrentLocation(location);
    } catch (error) {
      alert.show({
        title: 'Location Error',
        message: 'Unable to refresh location. Please check your location permissions.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
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

      {showOrderNotification && (
        <OrderStatusBar
          order={activeOrder}
          onPress={handleNotificationPress}
          onDismiss={handleDismissNotification}
        />
      )}

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

      <ScrollView 
        contentContainerStyle={{ paddingBottom: showOrderNotification ? 80 : 40 }} 
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>

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

const RADIUS = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#FFF8F5',
  },
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
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  ratingPill: {
    backgroundColor: '#E0FFE0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4CAF50',
  },
  dot: {
    fontSize: 12,
    marginHorizontal: 6,
    color: '#999',
  },
  priceText: {
    fontSize: 12,
    color: '#999',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  badge: {
    backgroundColor: '#FFEB3B',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#333',
  },
  deliveryCollectionRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 10,
    alignItems: 'center',
  },
  deliveryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: { fontSize: 10, color: '#4CAF50' },
  collectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collectionText: { fontSize: 10, color: '#FF9800' },
  envNote: {
    marginTop: 6,
    fontSize: 10,
    color: '#999',
  },
  loadingContainer: {
    marginTop: 20,
  }
});
