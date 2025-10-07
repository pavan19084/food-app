import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar
} from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getRestaurantMenu } from "../../api/restaurant";
import { useAlert } from "../../hooks/useAlert";
import CustomAlert from "../../components/CustomAlert";
import LoadingSpinner from "../../components/LoadingSpinner";

// Extracted MenuItem component
const MenuItem = ({ item, quantity, increment, decrement }) => {
  return (
    <View style={styles.item}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>£ {item.price.toFixed(2)}</Text>
        <Text style={styles.itemDesc}>{item.desc}</Text>
      </View>

      {quantity ? (
        <View style={styles.counter}>
          <TouchableOpacity onPress={() => decrement(item.id)}>
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => increment(item.id)}>
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => increment(item.id)}
        >
          <Text style={styles.addText}>ADD</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function RestaurantScreen({ navigation, route }) {
  const alert = useAlert();
  const [activeTab, setActiveTab] = useState("DELIVERY");
  const [quantities, setQuantities] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [restaurantData, setRestaurantData] = useState(null);

  const restaurantTitle = route.params?.title;
  const restaurantId = route.params?.restaurantId;
  const restaurantInfo = route.params?.restaurantData;

  useEffect(() => {
    if (restaurantId) {
      loadMenuData();
    } else {
      setRestaurantData({
        title: restaurantTitle,
        subtitle: route.params?.subtitle,
        rating: "4.0",
        deliveryTime: "30 mins",
        collectionTime: "15 mins",
        deliveryAvailable: true,
        collectionAvailable: true,
        cardPaymentAvailable: true,
        cashOnDeliveryAvailable: true,
        contactNumber: restaurantInfo?.phone,
      });
      setMenuItems([]);
      setIsLoadingMenu(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setQuantities({});
    });
    return unsubscribe;
  }, [navigation]);

  const loadMenuData = async () => {
    try {
      setIsLoadingMenu(true);
      const result = await getRestaurantMenu(restaurantId);

      if (result.success && result.data) {
        const menu = result.data;
        const items = (menu.getAllItems && menu.getAllItems()) || [];
        setMenuItems(items);

        setRestaurantData({
          title: restaurantTitle,
          subtitle: route.params?.subtitle,
          rating: "4.0",
          deliveryTime: "30 mins",
          collectionTime: "15 mins",
          deliveryAvailable: true,
          collectionAvailable: true,
          cardPaymentAvailable: true,
          cashOnDeliveryAvailable: true,
          contactNumber: restaurantInfo?.phone,
        });
      } else {
        alert.show({
          title: "Error",
          message: result.message || "Failed to load menu",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
      alert.show({
        title: "Error",
        message: "Failed to load menu. Please try again.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      setMenuItems([]);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const increment = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id) => {
    setQuantities((prev) => {
      const newQty = (prev[id] || 0) - 1;
      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: newQty };
    });
  };

  // Memoized totals
  const totalItems = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities]
  );

  const totalPrice = useMemo(
    () =>
      menuItems.reduce(
        (sum, item) => sum + (quantities[item.id] || 0) * item.price,
        0
      ),
    [quantities, menuItems]
  );

  const getCartItems = () =>
    menuItems
      .filter((item) => quantities[item.id] > 0)
      .map((item) => ({ ...item, quantity: quantities[item.id] }));

  const navigateToCart = () => {
    const cartItems = getCartItems();
    navigation.navigate("Cart", {
      cartItems,
      restaurantName: restaurantData?.title,
      restaurantData: restaurantData,
      restaurantId: restaurantId,
    });
  };

  if (isLoadingMenu || !restaurantData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <LoadingSpinner
          text="Loading menu..."
          containerStyle={styles.loadingContainer}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Sticky Header */}
      <View style={[styles.header, { elevation: 3, shadowOpacity: 0.08 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, { fontSize: 22 }]}>
            {restaurantData.title}
          </Text>
          <Text style={styles.subtitle}>{restaurantData.subtitle}</Text>
          <Text style={styles.location}>Kukatpally, Hyderabad</Text>
        </View>
        <View style={styles.ratingBox}>
          <Text style={styles.rating}>{restaurantData.rating} ★</Text>
          <Text style={styles.ratingText}>DELIVERY</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "DELIVERY" && styles.tabActive]}
          onPress={() => setActiveTab("DELIVERY")}
        >
          <Text
            style={activeTab === "DELIVERY" ? styles.tabActiveText : styles.tabText}
          >
            DELIVERY
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "REVIEWS" && styles.tabActive]}
          onPress={() => setActiveTab("REVIEWS")}
        >
          <Text
            style={activeTab === "REVIEWS" ? styles.tabActiveText : styles.tabText}
          >
            REVIEWS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: totalItems > 0 ? 90 : 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "DELIVERY" && (
          <>
            {/* Info Row */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="delivery-dining" size={20} color={colors.text} />
                <Text style={styles.infoText}>delivery</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color={colors.text} />
                <Text style={styles.infoText}>{restaurantData.deliveryTime}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="pricetag-outline" size={20} color={colors.text} />
                <Text style={styles.infoText}>delivery</Text>
              </View>
            </View>

            {/* Recommended */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended</Text>
              {menuItems.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  quantity={quantities[item.id]}
                  increment={increment}
                  decrement={decrement}
                />
              ))}
            </View>
          </>
        )}

        {activeTab === "REVIEWS" && (
          <View style={styles.section}>
            <Text style={styles.noReviewsText}>No reviews available</Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Checkout Bar */}
      {totalItems > 0 && activeTab === "DELIVERY" && (
        <View style={[styles.cartBar, { elevation: 8, shadowOpacity: 0.15 }]}>
          <View>
            <Text style={styles.cartItemText}>{totalItems} ITEM</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.cartPrice, { fontSize: 16 }]}>
                £ {totalPrice.toFixed(2)}
              </Text>
              <Text style={styles.cartTaxes}> plus taxes</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.cartAction,
              {
                backgroundColor: "#fff",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
              },
            ]}
            onPress={navigateToCart}
          >
            <Text
              style={[
                styles.cartActionText,
                { color: colors.primary, marginRight: 6 },
              ]}
            >
              View Cart
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

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

// Styles remain the same as your original
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 50 },
  container: { flex: 1, paddingHorizontal: 15 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: "bold", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textLight },
  location: { fontSize: 12, color: colors.textLight },
  ratingBox: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rating: { color: colors.textWhite, fontWeight: "bold" },
  ratingText: { fontSize: 10, color: colors.textWhite },

  tabs: { flexDirection: "row", marginVertical: 15 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    borderRadius: 6,
  },
  tabActive: { backgroundColor: colors.buttonPrimary },
  tabText: { color: colors.text },
  tabActiveText: { color: colors.textWhite, fontWeight: "bold" },

  infoRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  infoItem: { alignItems: "center" },
  infoText: { fontSize: 12, color: colors.textLight },

  section: { marginVertical: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },

  item: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemImage: { width: 80, height: 80, borderRadius: 10, marginRight: 12 },
  itemDetails: { flex: 1 },
  itemName: { fontWeight: "bold", fontSize: 14 },
  itemPrice: { color: colors.primary, fontWeight: "bold", marginVertical: 4 },
  itemDesc: { fontSize: 12, color: colors.textLight },

  addButton: { backgroundColor: colors.secondary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  addText: { color: colors.textWhite, fontWeight: "bold", fontSize: 12 },

  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterText: { color: colors.textWhite, fontWeight: "bold", fontSize: 18, paddingHorizontal: 6 },
  quantityText: { color: colors.textWhite, fontWeight: "bold", fontSize: 14, minWidth: 20, textAlign: "center" },

  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartItemText: { color: colors.textWhite, fontWeight: "bold", fontSize: 12 },
  cartPrice: { color: colors.textWhite, fontWeight: "bold", fontSize: 14 },
  cartTaxes: { color: colors.textWhite, fontSize: 12, marginLeft: 4 },
  cartAction: { flexDirection: "row", alignItems: "center" },
  cartActionText: { color: colors.textWhite, fontWeight: "bold", fontSize: 14 },
  noReviewsText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.textLight,
    marginTop: 20,
  },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
});
