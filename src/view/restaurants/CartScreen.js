import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
  Image, SafeAreaView, Modal, TextInput, Switch, Platform
} from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function CartScreen({ navigation, route }) {
  const { user } = useAuth();

  const { cartItems = [], restaurantName = "Eat Healthy" } = route?.params || {};
  const [items, setItems] = useState(
    cartItems.length > 0
      ? cartItems
      : [
          {
            id: 1,
            name: "Plant Protein Bowl",
            price: 8.99,
            quantity: 1,
            isVeg: true,
            image:
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&auto=format",
          },
        ]
  );

  const [selectedPayment, setSelectedPayment] = useState("card");

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
    if (!hasAnyNote) return "Add a note for the restaurant";
    const first = noteTags[0] || customNote.trim();
    const count =
      (noteTags.length + (customNote.trim().length ? 1 : 0));
    return count > 1 ? `${count} notes • "${first}"` : `"${first}"`;
  };
  // --------------------------------------

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
  const deliveryFee = 1.5;
  const taxes = subtotal * 0.05;
  const total = subtotal + deliveryFee + taxes;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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

  const handlePlaceOrder = () => {
    const notePayload = dontSendNote
      ? null
      : {
          tags: noteTags,
          text: customNote.trim(),
        };

    const orderDetails = {
      orderId:
        "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      restaurantName,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      deliveryAddress:
        "Selected address is 825 m away from your location",
      estimatedDelivery: "45-50 mins",
      paymentMethod:
        selectedPayment === "card" ? "Card Payment" : "Cash on Delivery",
      orderTime: new Date().toLocaleTimeString(),
      orderDate: new Date().toLocaleDateString(),
      specialInstructions: notePayload, // <-- included like Zomato
    };

    // Gate only here: if not logged in, open Login modal with redirect
    if (!user) {
      navigation.navigate("Login", {
        next: "OrderConfirmation",
        nextParams: { orderDetails },
      });
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "OrderConfirmation", params: { orderDetails } }],
    });
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
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      <View style={styles.locationInfo}>
        <Ionicons name="location-outline" size={16} color={colors.textLight} />
        <Text style={styles.locationText}>
          Selected address is 825 m away from your location
        </Text>
      </View>

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

        {/* Payment Method */}
        <View className="payment" style={styles.section}>
          <View style={styles.paymentHeader}>
            <Ionicons name="card-outline" size={20} color={colors.text} />
            <Text style={styles.paymentHeaderText}>Payment Method</Text>
          </View>

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
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
            </View>
            <View style={[styles.radioButton, selectedPayment === "cod" && { borderColor: colors.primary }]}>
              {selectedPayment === "cod" && <View style={styles.radioButtonSelected} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Bill Summary */}
        <View style={styles.billSummary}>
          <View className="row" style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>£{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>£{deliveryFee.toFixed(2)}</Text>
          </View>
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
        <TouchableOpacity style={[styles.placeOrderBtn, { backgroundColor: "#000" }]} onPress={handlePlaceOrder}>
          <Text style={[styles.placeOrderText, { color: "#fff" }]}>Place Order ▶</Text>
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
});
