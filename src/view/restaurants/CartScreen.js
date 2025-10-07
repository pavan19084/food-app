import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
  Image, SafeAreaView, Modal, TextInput, Switch, Platform
} from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { Order } from "../../models/order";
import { addOrder } from "../../api/order";
import { getAllAddresses } from "../../api/address";
import { useAlert } from "../../hooks/useAlert";
import CustomAlert from "../../components/CustomAlert";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CartScreen({ navigation, route }) {
  const { user } = useAuth();
  const { setOrderPlaced } = useOrder();
  const alert = useAlert();

  const { cartItems = [], restaurantName, restaurantData , restaurantId} = route?.params || {};
  const [items, setItems] = useState(cartItems);

  const [selectedPayment, setSelectedPayment] = useState("card");
  const [selectedDeliveryType, setSelectedDeliveryType] = useState("delivery");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get restaurant capabilities
  const capabilities = restaurantData;

  // Load user addresses on mount
  useEffect(() => {
    if (user?.id) {
      loadUserAddresses();
    }
  }, [user?.id]);

  const loadUserAddresses = async () => {
    try {
      setIsLoadingLocation(true);
      const result = await getAllAddresses();
      
      if (result.success && result.data && result.data.length > 0) {
        // Select the first address by default
        setSelectedLocation(result.data[0]);
      } else {
        alert.show({
          title: 'No Address Found',
          message: 'Please add an address before placing an order.',
          buttons: [
            { 
              text: 'Add Address', 
              onPress: () => navigation.navigate('AddAddressScreen') 
            },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      alert.show({
        title: 'Error',
        message: 'Failed to load addresses. Please try again.',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Set default delivery type based on what's available
  React.useEffect(() => {
    if (capabilities) {
      if (!capabilities.deliveryAvailable && capabilities.collectionAvailable) {
        setSelectedDeliveryType("takeaway");
      } else if (capabilities.deliveryAvailable && !capabilities.pickupAvailable) {
        setSelectedDeliveryType("delivery");
      }
    }
  }, [capabilities]);

  // Set default payment method based on what's available
  React.useEffect(() => {
    if (capabilities) {
      if (!capabilities.cardPaymentAvailable && capabilities.cashOnDeliveryAvailable) {
        setSelectedPayment("cod");
      } else if (capabilities.cardPaymentAvailable && !capabilities.cashOnDeliveryAvailable) {
        setSelectedPayment("card");
      }
    }
  }, [capabilities]);

  // ---------- Zomato-like Notes ----------
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
    // Just close; values already live in state
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
  

  const suggestions = [
    {
      id: 1,
      name: "Veggie Strips - 5 Pcs",
      price: 2.5,
      originalPrice: 2.99,
      image:
        "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?w=120&h=120&fit=crop&auto=format",
      isVeg: true,
    },
    {
      id: 2,
      name: "BK Veg Pizza Puff",
      price: 2.75,
      originalPrice: 3.25,
      image:
        "https://images.unsplash.com/photo-1585231536566-c095266c7e56?w=120&h=120&fit=crop&auto=format",
      isVeg: true,
    },
    {
      id: 3,
      name: "Masala Fries",
      price: 3.5,
      originalPrice: 4.0,
      image:
        "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=120&h=120&fit=crop&auto=format",
      isVeg: true,
    },
  ];

  const updateQuantity = (id, change) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change);
            if (newQuantity === 0) return null;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const addSuggestionToCart = (suggestion) => {
    const existing = items.find((i) => i.name === suggestion.name);
    if (existing) {
      updateQuantity(existing.id, 1);
    } else {
      setItems((prev) => [...prev, { ...suggestion, quantity: 1 }]);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = selectedDeliveryType === "delivery" ? 1.5 : 0;
  const taxes = subtotal * 0.05;
  const total = subtotal;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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
            <Text style={styles.restaurantName}>{restaurantName}</Text>
            <Text style={styles.restaurantSubtitle}>Your cart is empty</Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
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
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backToRestaurantText}>Back to Restaurant</Text>
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
    // Gate only here: if not logged in, open Login modal with redirect
    if (!user) {
      navigation.navigate("Login", {
        next: "Cart",
        nextParams: { cartItems: items, restaurantName, restaurantData },
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


      // Prepare order data for API
      const orderData = {
        user_id: user.id.toString(),
        restaurant_id: restaurantId,
        location_id: selectedLocation.id.toString(),
        items: Order.formatCartItemsForApi(items),
        total_price: total,
        payment_type: selectedPayment,
        order_type: selectedDeliveryType,
        special_instructions: specialInstructions
      };
      const result = await addOrder(orderData);
      console.log("result ",result);

      if (result.success) {
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
          // API response fields
          id: result.data.id,
          order_id: result.data.order_id,
          user_id: user.id,
          restaurant_id: orderData.restaurant_id,
          location_id: orderData.location_id,
          total_price: total.toString(),
          payment_type: selectedPayment,
          order_type: selectedDeliveryType,
          special_instructions: specialInstructions
        };

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
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
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
      <View style={[styles.restaurantInfo, { elevation: 2, shadowOpacity: 0.06 }]}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <Text style={styles.restaurantSubtitle}>
            45-50 mins to new • 18th Floor, Workspace
          </Text>
        </View>
      </View>

      {/* Location Info */}
      {selectedLocation && (
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={16} color={colors.textLight} />
          <Text style={styles.locationText}>
            {selectedLocation.addressline1}, {selectedLocation.area}, {selectedLocation.city}
          </Text>
        </View>
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          {items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              {renderVegIcon(item.isVeg)}
              <Image source={{ uri: item.image }} style={{ width: 56, height: 56, borderRadius: 6, marginRight: 10 }} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <TouchableOpacity>
                  <Text style={styles.editText}>Edit ▶</Text>
                </TouchableOpacity>
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

          {/* Add Note (Zomato-like) */}
          <TouchableOpacity
  style={styles.noteSection}
  onPress={() => setNoteModalVisible(true)}
>
  <Ionicons name="document-text-outline" size={20} color={colors.textLight} />
  <Text
    style={[
      styles.noteText,
      !hasAnyNote && !dontSendNote && { color: colors.textLight }, // faded placeholder
      hasAnyNote && { color: colors.text },                       // dark for real notes
      dontSendNote && { color: colors.error || "red" },           // red if "Don't send"
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
        {capabilities && (capabilities.deliveryAvailable || capabilities.collectionAvailable) && (
          <View style={styles.section}>
            <View style={styles.paymentHeader}>
              <Ionicons name="car-outline" size={20} color={colors.text} />
              <Text style={styles.paymentHeaderText}>Delivery or Collection</Text>
            </View>

            {capabilities && capabilities.deliveryAvailable && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedDeliveryType === "delivery" && { borderColor: colors.primary, backgroundColor: "rgba(76, 175, 80, 0.06)" },
                ]}
                onPress={() => setSelectedDeliveryType("delivery")}
              >
                <View style={styles.paymentLeft}>
                  <Ionicons
                    name="car-outline"
                    size={20}
                    color={selectedDeliveryType === "delivery" ? colors.primary : colors.textLight}
                  />
                  <View style={styles.deliveryOptionText}>
                    <Text style={styles.paymentTitle}>Delivery</Text>
                    <Text style={styles.deliverySubtitle}>{capabilities.deliveryTime} • £1.50 delivery fee</Text>
                  </View>
                </View>
                <View style={[styles.radioButton, selectedDeliveryType === "delivery" && { borderColor: colors.primary }]}>
                  {selectedDeliveryType === "delivery" && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>
            )}

            {capabilities && capabilities.collectionAvailable && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedDeliveryType === "collection" && { borderColor: colors.primary, backgroundColor: "rgba(76, 175, 80, 0.06)" },
                ]}
                onPress={() => setSelectedDeliveryType("takeaway")}
              >
                <View style={styles.paymentLeft}>
                  <Ionicons
                    name="storefront-outline"
                    size={20}
                    color={selectedDeliveryType === "collection" ? colors.primary : colors.textLight}
                  />
                  <View style={styles.deliveryOptionText}>
                    <Text style={styles.paymentTitle}>Collection</Text>
                    <Text style={styles.deliverySubtitle}>{capabilities.collectionTime} • No delivery fee</Text>
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
        <View className="payment" style={styles.section}>
          <View style={styles.paymentHeader}>
            <Ionicons name="card-outline" size={20} color={colors.text} />
            <Text style={styles.paymentHeaderText}>Payment Method</Text>
          </View>

          {capabilities && capabilities.cardPaymentAvailable && (
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
          )}

          {capabilities && capabilities.cashOnDeliveryAvailable && (
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === "cod" && { borderColor: colors.primary, backgroundColor: "rgba(76, 175, 80, 0.06)" },
              ]}
              onPress={() => setSelectedPayment("cod")}
            >
              <View style={styles.paymentLeft}>
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={selectedPayment === "cod" ? colors.primary : colors.textLight}
                />
                <Text style={styles.paymentTitle}>
                  {selectedDeliveryType === "collection"
                    ? "Cash on Collection"
                    : "Cash on Delivery"}
                </Text>
              </View>
              <View style={[styles.radioButton, selectedPayment === "cod" && { borderColor: colors.primary }]}>
                {selectedPayment === "cod" && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.billSummary}>
          <View className="row" style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>£{subtotal.toFixed(2)}</Text>
          </View>
          {selectedDeliveryType === "delivery" && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>£{deliveryFee.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes</Text>
            <Text style={styles.billValue}>£{taxes.toFixed(2)}</Text>
          </View>
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
          style={[styles.placeOrderBtn, { backgroundColor: isPlacingOrder ? "#666" : "#000" }]} 
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <LoadingSpinner size="small" color="#fff" />
          ) : (
            <Text style={[styles.placeOrderText, { color: "#fff" }]}>Place Order ▶</Text>
          )}
        </TouchableOpacity>
      </View>

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
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 50 },
  container: { flex: 1, paddingHorizontal: 15 },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  restaurantHeader: { flex: 1 },
  restaurantName: { fontSize: 18, fontWeight: "bold", color: colors.text },
  restaurantSubtitle: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  shareButton: { padding: 8 },

  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
  },
  locationText: { fontSize: 12, color: colors.textLight, marginLeft: 5 },

  section: { backgroundColor: colors.surface, marginVertical: 5, borderRadius: 8, padding: 15 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  vegIcon: { width: 16, height: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginRight: 10 },
  vegDot: { width: 6, height: 6, borderRadius: 3 },

  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "500", color: colors.text },
  editText: { fontSize: 12, color: colors.primary, marginTop: 2 },

  itemControls: { alignItems: "flex-end" },
  quantityContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 4, marginBottom: 5 },
  quantityBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  quantityBtnText: { fontSize: 16, fontWeight: "bold", color: colors.text },
  quantityText: { fontSize: 14, fontWeight: "500", minWidth: 30, textAlign: "center", color: colors.text },
  itemPrice: { fontSize: 12, color: colors.text },

  addMoreBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  addMoreText: { fontSize: 14, color: colors.primary, marginLeft: 8, fontWeight: "500" },

  // NOTE ROW
  noteSection: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  noteText: { 
    flex: 1, 
    fontSize: 14, 
    color: colors.primary, // was colors.text
    marginLeft: 10 
  },
  
  dontSendText: { fontSize: 12, color: colors.textLight },

  // Payments
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: "500", color: colors.text, marginLeft: 8 },

  suggestionsScroll: { marginHorizontal: -8, paddingHorizontal: 8 },
  suggestionCard: {
    width: 140,
    marginHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    minHeight: 200,
  },
  suggestionHeader: { width: "100%", alignItems: "flex-start", marginBottom: 8 },
  suggestionImage: { width: "100%", height: 70, borderRadius: 6, marginBottom: 8 },
  suggestionName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
    height: 32,
    lineHeight: 16,
  },
  suggestionPricing: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  suggestionPrice: { fontSize: 13, fontWeight: "bold", color: colors.text },
  suggestionOriginalPrice: { fontSize: 11, color: colors.textLight, textDecorationLine: "line-through", marginLeft: 6 },
  customizable: { fontSize: 10, color: colors.textLight, marginBottom: 10, textAlign: "center" },
  addBtn: { backgroundColor: colors.secondary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, alignItems: "center", minWidth: 60 },
  addBtnText: { fontSize: 11, fontWeight: "bold", color: colors.textWhite },

  paymentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  paymentHeaderText: { fontSize: 14, fontWeight: "500", color: colors.text, marginLeft: 10 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: colors.background,
  },
  paymentLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  paymentTitle: { fontSize: 14, fontWeight: "500", color: colors.text, marginLeft: 12 },
  deliveryOptionText: { flex: 1 },
  deliverySubtitle: { fontSize: 12, color: colors.textLight, marginLeft: 12, marginTop: 2 },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textLight, alignItems: "center", justifyContent: "center" },
  radioButtonSelected: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

  billSummary: { backgroundColor: colors.surface, marginVertical: 5, borderRadius: 8, padding: 15 },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5 },
  billLabel: { fontSize: 13, color: colors.text },
  billValue: { fontSize: 13, color: colors.text, fontWeight: "500" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#eee", marginTop: 5, paddingTop: 10 },
  totalLabel: { fontSize: 14, fontWeight: "bold", color: colors.text },
  totalValue: { fontSize: 14, fontWeight: "bold", color: colors.text },

  orderBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  orderTotal: { flex: 1 },
  orderTotalText: { fontSize: 12, color: colors.textWhite, fontWeight: "bold" },
  orderAmount: { fontSize: 16, color: colors.textWhite, fontWeight: "bold" },
  placeOrderBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 6 },
  placeOrderText: { fontSize: 14, fontWeight: "bold" },

  // Empty cart styles
  emptyCartContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 20 
  },
  emptyCartContent: { 
    alignItems: "center", 
    maxWidth: 300 
  },
  emptyCartTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: colors.text, 
    marginTop: 20, 
    marginBottom: 10 
  },
  emptyCartSubtitle: { 
    fontSize: 16, 
    color: colors.textLight, 
    textAlign: "center", 
    lineHeight: 24, 
    marginBottom: 30 
  },
  backToRestaurantBtn: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  backToRestaurantText: { 
    color: colors.textWhite, 
    fontSize: 16, 
    fontWeight: "bold" 
  },

  // ------- Notes Modal styles -------
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",       // force white modal
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 20 + (Platform.OS === "ios" ? 20 : 0),
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 8,
  },
  
  modalGrabber: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 10,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  modalSubtitle: { fontSize: 13, fontWeight: "600", color: colors.text, marginTop: 6, marginBottom: 8 },

  tagsWrap: { flexDirection: "row", flexWrap: "wrap" },
  tagChip: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  tagText: { fontSize: 12, color: colors.text },

  noteInput: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 10,
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: colors.background,
    textAlignVertical: "top",
  },
  charCount: { fontSize: 11, color: colors.textLight, alignSelf: "flex-end", marginTop: 4 },

  toggleRow: {
    marginTop: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: { fontSize: 14, color: colors.text },

  modalActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  clearBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  saveBtn: { backgroundColor: colors.primary },
  modalBtnText: { fontSize: 14, fontWeight: "600" },
  loadingContainer: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center" 
  },
});
