import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
  Image, SafeAreaView
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
              "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop&auto=format",
          },
        ]
  );

  const [selectedPayment, setSelectedPayment] = useState("card");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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
  const discount = appliedCoupon ? Math.min(subtotal * 0.3, 3.0) : 0;
  const deliveryFee = 1.5;
  const taxes = (subtotal - discount) * 0.05;
  const total = subtotal - discount + deliveryFee + taxes;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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

      {/* Savings Banner */}
      {discount > 0 && (
        <View style={styles.savingsBanner}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.savingsText}>
            You saved £{discount.toFixed(2)} on this order
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

          {/* Add Note */}
          <TouchableOpacity style={styles.noteSection}>
            <Ionicons name="document-text-outline" size={20} color={colors.textLight} />
            <Text style={styles.noteText}>Add a note for the restaurant</Text>
            <Text style={styles.dontSendText}>Don't send</Text>
          </TouchableOpacity>
        </View>

        {/* Complete Your Meal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="restaurant" size={20} color={colors.text} />
            <Text style={styles.sectionTitle}>Complete your meal with</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
            {suggestions.map((s) => (
              <View key={s.id} style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>{renderVegIcon(s.isVeg)}</View>
                <Image source={{ uri: s.image }} style={styles.suggestionImage} />
                <Text style={styles.suggestionName} numberOfLines={2}>
                  {s.name}
                </Text>
                <View style={styles.suggestionPricing}>
                  <Text style={styles.suggestionPrice}>£{s.price.toFixed(2)}</Text>
                  <Text style={styles.suggestionOriginalPrice}>£{s.originalPrice.toFixed(2)}</Text>
                </View>
                <Text style={styles.customizable}>customizable</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addSuggestionToCart(s)}
                >
                  <Text style={styles.addBtnText}>ADD</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Coupons Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.couponHeader}>
            <View style={styles.couponLeft}>
              <View style={styles.couponIcon}>
                <Text style={styles.couponIconText}>%</Text>
              </View>
              <Text style={styles.couponTitle}>Items starting @ £2.50 only applied!</Text>
            </View>
            <Text style={styles.couponDiscount}>- £{discount.toFixed(2)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewCoupons}>
            <Ionicons name="pricetag-outline" size={20} color={colors.text} />
            <Text style={styles.viewCouponsText}>View all coupons</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
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
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.billValue, { color: colors.success }]}>-£{discount.toFixed(2)}</Text>
            </View>
          )}
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

  savingsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  savingsText: { fontSize: 12, color: colors.success, marginLeft: 5, fontWeight: "500" },

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

  noteSection: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  noteText: { flex: 1, fontSize: 14, color: colors.text, marginLeft: 10 },
  dontSendText: { fontSize: 12, color: colors.textLight },

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

  couponHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  couponLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  couponIcon: { width: 24, height: 24, backgroundColor: colors.success, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 10 },
  couponIconText: { fontSize: 14, fontWeight: "bold", color: colors.textWhite },
  couponTitle: { fontSize: 12, color: colors.text, flex: 1 },
  couponDiscount: { fontSize: 12, color: colors.success, fontWeight: "bold" },
  viewCoupons: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  viewCouponsText: { flex: 1, fontSize: 14, color: colors.text, marginLeft: 10 },

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
});
