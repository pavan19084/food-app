import React, { useState, useEffect ,useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
  Image, SafeAreaView, Modal, TextInput, Switch, Platform , Animated
} from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { useCart } from "../../context/CartContext";
import { Order } from "../../models/order";
import { Restaurant } from "../../models/restaurant";
import { addOrder } from "../../api/order";
import { getAllAddresses } from "../../api/address";
import { useAlert } from "../../hooks/useAlert";
import CustomAlert from "../../components/CustomAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getFullImageUrl } from "../../utils/imageUrl";
import { DistanceService } from "../../utils/distanceService";

export default function CartScreen({ navigation, route }) {
  const { user } = useAuth();
  const { setOrderPlaced, activeOrder } = useOrder();
  const { cart, removeFromCart, addToCart, clearCart, getTotalItems, getTotalPrice } = useCart();
  const alert = useAlert();
  const { currentLocation: passedLocation } = route?.params || {};

  const [selectedPayment, setSelectedPayment] = useState("card");
  const [selectedDeliveryType, setSelectedDeliveryType] = useState("delivery");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [userHasSelectedAddress, setUserHasSelectedAddress] = useState(false);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [calculatedDeliveryTime, setCalculatedDeliveryTime] = useState(null);
  const [calculatedDistance, setCalculatedDistance] = useState(null);

  const restaurantName = cart.restaurantName;
  const restaurantData = cart.restaurantData;
  const restaurantId = cart.restaurantId;
  const items = cart.items;

  const deliveryCheckInProgress = useRef(false);
  const lastCheckedLocationId = useRef(null);
  const isInitialLoad = useRef(true);

  const capabilities = restaurantData;
  useEffect(() => {
    if (passedLocation) {
      setSelectedLocation(passedLocation);
      checkDeliveryAvailability(passedLocation);
    }
  }, [passedLocation]);

  // Additional effect to ensure passed location takes priority over saved addresses
  useEffect(() => {
    if (passedLocation && selectedLocation && selectedLocation.id !== passedLocation.id) {
      setSelectedLocation(passedLocation);
      checkDeliveryAvailability(passedLocation);
    }
  }, [passedLocation, selectedLocation]);

  // Load user addresses on mount
  useEffect(() => {
    if (user?.id) {
      loadUserAddresses(false); // Allow default selection only on initial load
    }
  }, [user?.id]);

  const loadUserAddresses = async (skipDefaultSelection = false) => {
    try {
      const result = await getAllAddresses();
      
      if (result.success && result.data && result.data.length > 0) {
        setAddresses(result.data);
      } else {
        setAddresses([]);
      }
      
      // Only set default location if no location is selected, we're not skipping default selection, and user hasn't manually selected an address
      if (!selectedLocation && !skipDefaultSelection && !userHasSelectedAddress) {
        const defaultLocation = passedLocation || (result.data && result.data[0]);
        if (defaultLocation) {
          setSelectedLocation(defaultLocation);
          checkDeliveryAvailability(defaultLocation);
        }
      }
    } catch (err) {
      console.error('📍 Error loading addresses:', err);
      setAddresses([]);
      if (passedLocation && !selectedLocation && !skipDefaultSelection) {
        setSelectedLocation(passedLocation);
        checkDeliveryAvailability(passedLocation);
      }
    }
  };

  const checkDeliveryAvailability = async (location) => {
    setIsCheckingAvailability(true);
    setIsCalculatingDelivery(true);
    
    try {
      const distanceResult = await DistanceService.getRoadDistance(
        parseFloat(location.longitude),
        parseFloat(location.latitude),
        parseFloat(restaurantData.longitude || 0),
        parseFloat(restaurantData.latitude || 0)
      );

      if (distanceResult.success) {

        if (restaurantData.setDistance) {
          restaurantData.setDistance(distanceResult.distance, distanceResult.duration);
        }
        
        const distanceNum = parseFloat(distanceResult.distance);
        
        // Check if distance is within delivery ranges
        const deliveryAvailable = restaurantData.deliveryRanges?.length > 0 && 
          restaurantData.deliveryRanges.some(range => 
            distanceNum >= range.minKm && distanceNum <= range.maxKm
          );
      
        // Calculate delivery charge based on distance
        let deliveryCharge = 0;
        if (deliveryAvailable && restaurantData.deliveryRanges?.length > 0) {
          const matchingRange = restaurantData.deliveryRanges.find(range => 
            distanceNum >= range.minKm && distanceNum <= range.maxKm
          );
          deliveryCharge = matchingRange ? matchingRange.charge : 0;
        }
        
        setDeliveryAvailable(deliveryAvailable);
        setDeliveryCharge(deliveryCharge);
        setCalculatedDistance(distanceResult.distance);
        
        // Calculate delivery time based on distance and restaurant preparation time
        const basePreparationTime = capabilities?.deliveryTime ? 
          parseInt(capabilities.deliveryTime.split('-')[0]) : 30; // Get minimum prep time
        const travelTime = Math.ceil(distanceResult.duration / 60); // Convert seconds to minutes
        const totalDeliveryTime = basePreparationTime + travelTime;
        
        setCalculatedDeliveryTime(totalDeliveryTime);

        // Show appropriate messages based on delivery availability
        if (!deliveryAvailable && selectedDeliveryType === "delivery") {
          setSelectedDeliveryType("collection");
          alert.show({
            title: 'Delivery Not Available',
            message: `Delivery is not available to this location (${distanceResult.distance}km away). Distance exceeds delivery range. Switched to collection.`,
            buttons: [{ text: 'OK', onPress: () => {} }]
          });
        } else if (deliveryAvailable && selectedDeliveryType === "collection") {
          alert.show({
            title: 'Delivery Available',
            message: `Delivery is now available to this location (${distanceResult.distance}km away). Delivery charge: £${deliveryCharge.toFixed(2)}.`,
            buttons: [{ text: 'OK', onPress: () => {} }]
          });
        }
      }
    } catch (error) {
      console.error('❌ Error checking delivery availability:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        location: location?.addressline1,
        restaurant: restaurantData?.name
      });
      setDeliveryAvailable(false);
      setDeliveryCharge(0);
      setCalculatedDeliveryTime(null);
      setCalculatedDistance(null);
    } finally {
      setIsCheckingAvailability(false);
      setIsCalculatingDelivery(false);
    }
  };

  // Set default delivery type based on what's available
  React.useEffect(() => {
    if (capabilities) {
      if (!capabilities.deliveryEnabled && capabilities.takeawayEnabled) {
        setSelectedDeliveryType("collection");
      } else if (capabilities.deliveryEnabled && !capabilities.takeawayEnabled) {
        setSelectedDeliveryType("delivery");
      }
    }
  }, [capabilities]);

  // Set default payment method based on what's available
  React.useEffect(() => {
    if (capabilities) {
      if (!capabilities.cardPaymentEnabled && capabilities.cashPaymentEnabled) {
        setSelectedPayment("cash");
      } else if (capabilities.cardPaymentEnabled && !capabilities.cashPaymentEnabled) {
        setSelectedPayment("card");
      }
    }
  }, [capabilities]);

  const QUICK_NOTE_TAGS = [
    "No onions",
    "Less spicy",
    "Extra spicy",
    "Extra cheese",
    "Extra sauce",
    "Cutlery",
    "Napkins",
    "No garlic",
  ];

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteTags, setNoteTags] = useState([]);
  const [customNote, setCustomNote] = useState("");
  const [dontSendNote, setDontSendNote] = useState(false);

  const toggleTag = (tag) => {
    setNoteTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearNotes = () => {
    setNoteTags([]);
    setCustomNote("");
  };

  const saveNotes = () => {
    setNoteModalVisible(false);
  };

  const hasAnyNote = (!dontSendNote) && (noteTags.length > 0 || customNote.trim().length > 0);

  const notePreview = () => {
    if (dontSendNote) return "Don't send";
  
    const count = noteTags.length + (customNote.trim() ? 1 : 0);
    if (count === 0) return "Add a note for the restaurant";
  
    const first = noteTags[0] || customNote.trim();
    return count > 1 ? `"${first}" +${count - 1} more` : `"${first}"`;
  };

  const openAddressModal = async () => {
    try {
      await loadUserAddresses(true);
      setAddressModalVisible(true);
    } catch (error) {
      console.error('Error opening address modal:', error);
      setAddressModalVisible(true);
    }
  };

  const updateQuantity = (id, change) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (change > 0) {
      addToCart(item, {
        restaurantId,
        restaurantName,
        restaurantImage: cart.restaurantImage,
        restaurantData
      });
    } else {
      removeFromCart(id);
    }
  };

  const subtotal = getTotalPrice();
  
  const deliveryFee = selectedDeliveryType === "delivery" ? deliveryCharge : 0;
  const total = subtotal + deliveryFee;

  const totalItems = getTotalItems();

  // Show loading state while loading addresses
  if (isLoadingLocation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <LoadingSpinner 
          text="Loading delivery address..." 
          containerStyle={styles.loadingContainer}
        />
      </SafeAreaView>
    );
  }

  // If cart is empty, show empty cart state
  if (totalItems === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        {/* Restaurant Header */}
        <View style={[styles.restaurantInfo, { elevation: 2, shadowOpacity: 0.06 }]}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName}>Your Cart</Text>
            <Text style={styles.restaurantSubtitle}>Your cart is empty</Text>
          </View>
        </View>

        {/* Empty Cart Content */}
        <View style={styles.emptyCartContainer}>
          <View style={styles.emptyCartContent}>
            <Ionicons name="cart-outline" size={80} color={colors.textLight} />
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtitle}>
              Looks like you haven't added anything to your cart yet
            </Text>
            <TouchableOpacity 
              style={styles.backToRestaurantBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.backToRestaurantText}>Browse Restaurants</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderVegIcon = (isVeg) => (
    <View
      style={[
        styles.vegIcon,
        { borderColor: isVeg ? "#4CAF50" : "#F44336" },
      ]}
    >
      <View
        style={[
          styles.vegDot,
          { backgroundColor: isVeg ? "#4CAF50" : "#F44336" },
        ]}
      />
    </View>
  );

  const handlePlaceOrder = async () => {
    // Check for active order
    if (activeOrder) {

      alert.show({
        title: 'Order in Progress',
        message: 'You already have an active order. Please wait for it to complete before placing a new one.',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
      return;
    }

    // Gate only here: if not logged in, open Login modal with redirect
    if (!user) {
      navigation.navigate("Login", {
        next: "Cart",
        nextParams: { },
      });
      return;
    }

    // Check if location is selected
    if (!selectedLocation) {
      alert.show({
        title: 'No Address Selected',
        message: 'Please select a delivery address before placing the order.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    if (!restaurantData || !restaurantData.isOnline) {
      alert.show({
        title: 'Restaurant Unavailable',
        message: 'This restaurant is currently offline. Please try again later.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    if (selectedDeliveryType === "delivery" && !deliveryAvailable) {
      alert.show({
        title: 'Delivery Not Available',
        message: 'Delivery is not available to your selected location. Distance exceeds restaurant delivery range. Please choose collection or select a different address.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Prepare special instructions
      const specialInstructions = dontSendNote
        ? null
        : (() => {
            const parts = [];
            if (noteTags.length > 0) {
              parts.push(...noteTags);
            }
            if (customNote.trim()) {
              parts.push(customNote.trim());
            }
            return parts.length > 0 ? parts.join(', ') : null;
          })();

      const apiOrderType = selectedDeliveryType === "collection" ? "takeaway" : selectedDeliveryType;
      
      // Prepare order data for API
      const orderData = {
        user_id: user?.id?.toString() || '',
        restaurant_id: restaurantId || '',
        location_id: selectedLocation?.id?.toString() || '',
        items: Order.formatCartItemsForApi(items),
        total_price: total,
        payment_type: selectedPayment,
        order_type: apiOrderType,
        special_instructions: specialInstructions,
        restaurant_name: restaurantName || ''
      };
      const result = await addOrder(orderData);

      if (result.success) {
        // Calculate delivery time for timer
        const calculatedDeliveryTime = selectedDeliveryType === "delivery" ? 
          (restaurantData?.duration || 30) : 0;
        
        // Create order details for the confirmation screen
        const orderDetails = {
          orderId: result.data.order_id,
          restaurantName,
          restaurantContact: restaurantData?.contactNumber,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
          deliveryType: selectedDeliveryType,
          deliveryAddress: selectedDeliveryType === "delivery" 
            ? `${selectedLocation.addressline1}, ${selectedLocation.area}, ${selectedLocation.city}` 
            : "Collection at restaurant",
          estimatedDelivery: selectedDeliveryType === "delivery" ? capabilities?.deliveryTime : capabilities?.collectionTime,
          paymentMethod: selectedPayment === "card" ? "Card Payment" : "Cash on Delivery",
          orderTime: new Date().toLocaleTimeString(),
          orderDate: new Date().toLocaleDateString(),
          specialInstructions: specialInstructions,
          createdAt: new Date().toISOString(),
          status: result.data.status,
          id: result.data.id,
          order_id: result.data.order_id,
          user_id: user?.id || '',
          restaurant_id: orderData.restaurant_id || '',
          location_id: orderData.location_id || '',
          total_price: total?.toString() || '0',
          payment_type: selectedPayment,
          order_type: selectedDeliveryType,
          special_instructions: specialInstructions,
          // Add delivery time for timer calculation
          deliveryTime: calculatedDeliveryTime,
          // Add timer data for storage
          deliveryTimeMinutes: calculatedDeliveryTime,
          preparationTime: null, // Will be set when order is confirmed
          totalTimeMinutes: calculatedDeliveryTime // Will be updated when preparation time is known
        };
        

        // Clear cart after successful order
        clearCart();

        // Set order in context and navigate to confirmation
        setOrderPlaced(orderDetails);

        navigation.reset({
          index: 0,
          routes: [{ name: "OrderConfirmation", params: { orderDetails } }],
        });
      } else {
        alert.show({
          title: "Order Failed",
          message: result.message || "Failed to place order. Please try again.",
          buttons: [{ text: "OK", onPress: () => {} }]
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "An unexpected error occurred. Please try again.";
      
      alert.show({
        title: "Order Error",
        message: errorMessage,
        buttons: [{ text: "OK", onPress: () => {} }]
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Restaurant Header */}
      <View style={styles.restaurantInfo}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <Text style={styles.restaurantSubtitle}>{totalItems} item{totalItems > 1 ? "s" : ""} in cart</Text>
        </View>
      </View>

        {/* Delivery Address Bar */}
        {selectedLocation && (
          <TouchableOpacity 
            style={styles.deliveryAddressBar}
            onPress={openAddressModal}
            activeOpacity={0.7}
          >
            <View style={styles.addressBarLeft}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="location" size={18} color={colors.primary} />
              </View>
              <View style={styles.addressBarText}>
                <Text style={styles.addressBarLabel}>
                  Deliver to {passedLocation && selectedLocation === passedLocation ? '' : ''}
                </Text>
                <Text style={styles.addressBarAddress} numberOfLines={1}>
                  {selectedLocation.addressline1}, {selectedLocation.area}
                </Text>
                {calculatedDistance && (
                  <Text style={styles.addressBarDistance}>
                    📍 {calculatedDistance} km from restaurant
                  </Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Delivery Not Available Warning */}
        {selectedLocation && selectedDeliveryType === "delivery" && !deliveryAvailable && (
          <View style={styles.deliveryWarningBar}>
            <View style={styles.warningLeft}>
              <Ionicons name="warning" size={18} color="#FF6B35" />
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>Delivery not available</Text>
                <Text style={styles.warningSubtitle}>
                  This location is {calculatedDistance ? `${calculatedDistance} km` : ''} away and outside our delivery range
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.changeLocationBtn}
              onPress={openAddressModal}
            >
              <Text style={styles.changeLocationText}>Change Location</Text>
            </TouchableOpacity>
          </View>
        )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          {items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              {renderVegIcon(item.isVeg)}
              <Image source={{ uri: getFullImageUrl(item.image) }} style={{ width: 56, height: 56, borderRadius: 6, marginRight: 10 }} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <View style={styles.itemControls}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Text style={styles.quantityBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Text style={styles.quantityBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemPrice}>
                  £{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          {/* Add More Items */}
          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.addMoreText}>Add more items</Text>
          </TouchableOpacity>

          {/* Add Note */}
          <TouchableOpacity
            style={styles.noteSection}
            onPress={() => setNoteModalVisible(true)}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.textLight} />
            <Text
              style={[
                styles.noteText,
                !hasAnyNote && !dontSendNote && { color: colors.textLight },
                hasAnyNote && { color: colors.text },
                dontSendNote && { color: colors.error || "red" },
              ]}
              numberOfLines={1}
            >
              {notePreview()}
            </Text>
            <Text
              style={[
                styles.dontSendText,
                dontSendNote && { color: colors.primary, fontWeight: "600" },
              ]}
            >
              {dontSendNote ? "Don't send" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delivery/Collection Selection */}
        {capabilities && (capabilities.deliveryEnabled || capabilities.takeawayEnabled) && (
          <View style={styles.section}>
            <View style={styles.paymentHeader}>
              <Ionicons name="car-outline" size={20} color={colors.text} />
              <Text style={styles.paymentHeaderText}>Delivery or Collection</Text>
            </View>

            {capabilities && capabilities.deliveryEnabled && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedDeliveryType === "delivery" && { borderColor: colors.primary, backgroundColor: "rgba(76, 175, 80, 0.06)" },
                  !deliveryAvailable && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (deliveryAvailable) {
                    setSelectedDeliveryType("delivery");
                  } else {
                    openAddressModal();
                  }
                }}
              >
<View style={styles.paymentLeft}>
  {isCalculatingDelivery ? (
    <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
      <LoadingSpinner size="small" color={colors.primary} style={{ transform: [{ scale: 0.5 }] }} />
    </View>
  ) : (
    <Ionicons
      name="car-outline"
      size={20}
      color={selectedDeliveryType === "delivery" ? colors.primary : colors.textLight}
    />
  )}
  <View style={styles.deliveryOptionText}>
    <Text style={styles.paymentTitle}>Delivery</Text>
    <Text style={styles.deliverySubtitle}>
      {!deliveryAvailable 
        ? 'Delivery not available to this location • Tap to change address' 
        : isCalculatingDelivery 
          ? 'Calculating delivery time...' 
          : `${calculatedDeliveryTime ? `${calculatedDeliveryTime} mins` : (capabilities.deliveryTime || '30-40 mins')} • ${deliveryCharge > 0 ? `£${deliveryCharge.toFixed(2)} delivery fee` : 'Free delivery'}`
      }
    </Text>
  </View>
</View>
                <View style={[styles.radioButton, selectedDeliveryType === "delivery" && { borderColor: colors.primary }]}>
                  {selectedDeliveryType === "delivery" && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>
            )}

            {capabilities && capabilities.takeawayEnabled && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedDeliveryType === "collection" && { borderColor: colors.primary, backgroundColor: "rgba(76, 175, 80, 0.06)" },
                ]}
                onPress={() => setSelectedDeliveryType("collection")}
              >
                <View style={styles.paymentLeft}>
                  <Ionicons
                    name="storefront-outline"
                    size={20}
                    color={selectedDeliveryType === "collection" ? colors.primary : colors.textLight}
                  />
                  <View style={styles.deliveryOptionText}>
                    <Text style={styles.paymentTitle}>Collection</Text>
                    <Text style={styles.deliverySubtitle}>{capabilities.collectionTime || '15-20 mins'} • No delivery fee</Text>
                  </View>
                </View>
                <View style={[styles.radioButton, selectedDeliveryType === "collection" && { borderColor: colors.primary }]}>
                  {selectedDeliveryType === "collection" && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.paymentHeader}>
            <Ionicons name="card-outline" size={20} color={colors.text} />
            <Text style={styles.paymentHeaderText}>Payment Method</Text>
          </View>

          {/* Always show Card Payment option */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "card" && { borderColor: colors.primary, backgroundColor: "rgba(76, 175, 80, 0.06)" },
            ]}
            onPress={() => setSelectedPayment("card")}
          >
            <View style={styles.paymentLeft}>
              <Ionicons
                name="card-outline"
                size={20}
                color={selectedPayment === "card" ? colors.primary : colors.textLight}
              />
              <Text style={styles.paymentTitle}>Card Payment</Text>
            </View>
            <View style={[styles.radioButton, selectedPayment === "card" && { borderColor: colors.primary }]}>
              {selectedPayment === "card" && <View style={styles.radioButtonSelected} />}
            </View>
          </TouchableOpacity>

          {/* Always show Cash Payment option */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "cash" && { borderColor: colors.primary, backgroundColor: "rgba(76, 175, 80, 0.06)" },
            ]}
            onPress={() => setSelectedPayment("cash")}
          >
            <View style={styles.paymentLeft}>
              <Ionicons
                name="cash-outline"
                size={20}
                color={selectedPayment === "cash" ? colors.primary : colors.textLight}
              />
              <Text style={styles.paymentTitle}>
                {selectedDeliveryType === "collection"
                  ? "Cash on Collection"
                  : "Cash on Delivery"}
              </Text>
            </View>
            <View style={[styles.radioButton, selectedPayment === "cash" && { borderColor: colors.primary }]}>
              {selectedPayment === "cash" && <View style={styles.radioButtonSelected} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Bill Summary */}
        <View style={styles.billSummary}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>£{subtotal.toFixed(2)}</Text>
          </View>
          {selectedDeliveryType === "delivery" && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>
                {deliveryCharge > 0 ? `£${deliveryCharge.toFixed(2)}` : 'Free'}
              </Text>
            </View>
          )}
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>£{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.orderBar, { elevation: 8, shadowOpacity: 0.15 }]}>
        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalText}>TOTAL</Text>
          <Text style={[styles.orderAmount, { fontSize: 18 }]}>£{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.placeOrderBtn, 
            { 
              backgroundColor: (isPlacingOrder || isCalculatingDelivery) ? "#666" : "#000",
              opacity: (isPlacingOrder || isCalculatingDelivery) ? 0.7 : 1
            }
          ]} 
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || isCalculatingDelivery}
        >
          {isPlacingOrder ? (
            <LoadingSpinner size="small" color="#fff" />
          ) : isCalculatingDelivery ? (
            <Text style={[styles.placeOrderText, { color: "#fff" }]}>Calculating... ⏳</Text>
          ) : (
            <Text style={[styles.placeOrderText, { color: "#fff" }]}>Place Order ▶</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Selection Modal */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalBackdropTouchable} 
            activeOpacity={1} 
            onPress={() => setAddressModalVisible(false)}
          />
          <View style={styles.addressModalSheet}>
            <View style={styles.modalGrabber} />
            
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Delivery Warning in Modal */}
            {selectedDeliveryType === "delivery" && !deliveryAvailable && (
              <View style={styles.modalWarningBar}>
                <Ionicons name="warning" size={16} color="#FF6B35" />
                <Text style={styles.modalWarningText}>
                  Current location is {calculatedDistance ? `${calculatedDistance} km` : ''} away and outside delivery range. Please select a different address.
                </Text>
              </View>
            )}

            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.addressModalScroll}
            >
              {/* Add New Address Button */}
              <TouchableOpacity 
                style={styles.addNewAddressCard}
                onPress={() => {
                  setAddressModalVisible(false);
                  navigation.navigate("AddAddressScreen");
                }}
              >
                <View style={styles.addIconCircle}>
                  <Ionicons name="add" size={24} color={colors.primary} />
                </View>
                <Text style={styles.addNewAddressText}>Add New Address</Text>
              </TouchableOpacity>

              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <Text style={styles.savedAddressesLabel}>SAVED ADDRESSES</Text>
              )}
              
              {addresses.length === 0 && (
                <View style={styles.noAddressesContainer}>
                  <Ionicons name="location-outline" size={48} color={colors.textLight} />
                  <Text style={styles.noAddressesTitle}>No Saved Addresses</Text>
                  <Text style={styles.noAddressesSubtitle}>
                    Add your first address to get started
                  </Text>
                </View>
              )}
              
              {addresses.map((addr) => {
                const isSelected = selectedLocation?.id === addr.id;
                const isPassedLocation = passedLocation && addr.id === passedLocation.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.addressCard,
                      isSelected && styles.addressCardSelected
                    ]}
                    onPress={() => {
                      setSelectedLocation(addr);
                      setUserHasSelectedAddress(true); // Mark that user has manually selected an address
                      setAddressModalVisible(false);
                      checkDeliveryAvailability(addr);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressCardLeft}>
                      <View style={[
                        styles.addressIconCircle,
                        isSelected && styles.addressIconCircleSelected
                      ]}>
                        <Ionicons 
                          name={isSelected ? "checkmark-circle" : "location"} 
                          size={20} 
                          color={isSelected ? colors.primary : colors.textLight} 
                        />
                      </View>
                    <View style={styles.addressCardText}>
                      <Text style={styles.addressCardTitle}>
                        {addr.addressline1}
                      </Text>
                      <Text style={styles.addressCardSubtitle}>
                        {addr.area}, {addr.city}
                      </Text>
                    </View>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notes Modal */}
      <Modal
        visible={noteModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalGrabber} />

            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Special instructions</Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Quick notes</Text>
            <View style={styles.tagsWrap}>
              {QUICK_NOTE_TAGS.map((tag) => {
                const active = noteTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagChip,
                      active && { borderColor: colors.primary, backgroundColor: "rgba(76,175,80,0.08)" },
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagText, active && { color: colors.primary, fontWeight: "600" }]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.modalSubtitle, { marginTop: 14 }]}>Add a note</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g., Ring the doorbell once. Pack sauces separately."
              placeholderTextColor={colors.textLight}
              value={customNote}
              onChangeText={setCustomNote}
              maxLength={180}
              multiline
            />
            <Text style={styles.charCount}>{customNote.length}/180</Text>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Don't send</Text>
              <Switch
                value={dontSendNote}
                onValueChange={setDontSendNote}
                trackColor={{ true: colors.primary, false: "#ddd" }}
                thumbColor={Platform.OS === "android" ? "#fff" : undefined}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.clearBtn]} onPress={clearNotes}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveNotes}>
                <Text style={[styles.modalBtnText, { color: colors.textWhite }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
  },
  restaurantHeader: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  restaurantSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },
  deliveryAddressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressBarText: {
    flex: 1,
  },
  addressBarLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  addressBarAddress: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  addressBarDistance: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: colors.textLight,
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vegIcon: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  itemControls: {
    alignItems: 'flex-end',
    gap: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  quantityBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quantityBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  quantityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addMoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
  },
  dontSendText: {
    fontSize: 13,
    color: colors.textLight,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  paymentHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  deliveryOptionText: {
    flex: 1,
  },
  deliverySubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  billSummary: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  orderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  orderTotal: {
    flex: 1,
  },
  orderTotalText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  placeOrderBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
  },
  placeOrderText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  backToRestaurantBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backToRestaurantText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalGrabber: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: colors.textLight,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: '#f5f5f5',
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  addressModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '75%',
  },
  addressModalScroll: {
    marginTop: 12,
  },
  addNewAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.06)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addNewAddressText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  savedAddressesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addressCardSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.06)',
    borderColor: colors.primary,
  },
  addressCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressIconCircleSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  addressCardText: {
    flex: 1,
  },
  addressCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  addressCardSubtitle: {
    fontSize: 13,
    color: colors.textLight,
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryWarningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  warningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 2,
  },
  warningSubtitle: {
    fontSize: 12,
    color: '#E65100',
  },
  changeLocationBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeLocationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modalWarningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modalWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  passedLocationIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  noAddressesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noAddressesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noAddressesSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
