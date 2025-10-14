import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar
} from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getRestaurantMenu } from "../../api/restaurant";
import { useAlert } from "../../hooks/useAlert";
import { useCart } from "../../context/CartContext";
import CustomAlert from "../../components/CustomAlert";
import LoadingSpinner from "../../components/LoadingSpinner";

// MenuItem component
const MenuItem = ({ item, quantity, increment, decrement }) => {
  return (
    <View style={styles.item}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>
          {item.desc}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>£ {item.price.toFixed(2)}</Text>

          {quantity ? (
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => decrement(item.id)}
              >
                <Text style={styles.counterText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => increment(item.id)}
              >
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
      </View>
    </View>
  );
};

export default function RestaurantScreen({ navigation, route }) {
  const alert = useAlert();
  const { cart, addToCart, removeFromCart, getItemQuantity, getTotalItems, getTotalPrice } = useCart();
  
  const [menuCategories, setMenuCategories] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [restaurantData, setRestaurantData] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const restaurantTitle = route.params?.title;
  const restaurantId = route.params?.restaurantId;
  const restaurantInfo = route.params?.restaurantData;
  const restaurantCover = route.params?.cover;

  useEffect(() => {
    if (restaurantId) {
      loadMenuData();
    } else {
      setRestaurantData({
        ...restaurantInfo,
        title: restaurantTitle,
        subtitle: route.params?.subtitle,
        rating: "4.0",
        deliveryTime: "30 mins",
        collectionTime: "15 mins",
        deliveryAvailable: restaurantInfo?.deliveryEnabled,
        collectionAvailable: restaurantInfo?.takeawayEnabled,
        cardPaymentAvailable: restaurantInfo?.cardPaymentEnabled,
        cashOnDeliveryAvailable: restaurantInfo?.cashPaymentEnabled,
        contactNumber: restaurantInfo?.phone,
      });
      setMenuCategories([]);
      setIsLoadingMenu(false);
    }
  }, [restaurantId]);

  const loadMenuData = async () => {
    try {
      setIsLoadingMenu(true);
      const result = await getRestaurantMenu(restaurantId);

      if (result.success && result.data) {
        const menu = result.data;
        const categories = menu.getActiveCategories
          ? menu.getActiveCategories()
          : [];
        setMenuCategories(categories);
        setExpandedCategories(
          categories.reduce((acc, cat) => {
            acc[cat.categoryId] = true;
            return acc;
          }, {})
        );
        setRestaurantData({
          ...restaurantInfo,
          title: restaurantTitle,
          subtitle: route.params?.subtitle,
          rating: "4.0",
          deliveryTime: "30 mins",
          collectionTime: "15 mins",
          deliveryAvailable: restaurantInfo?.deliveryEnabled,
          collectionAvailable: restaurantInfo?.takeawayEnabled,
          cardPaymentAvailable: restaurantInfo?.cardPaymentEnabled,
          cashOnDeliveryAvailable: restaurantInfo?.cashPaymentEnabled,
          contactNumber: restaurantInfo?.phone,
        });
      } else {
        alert.show({
          title: "Error",
          message: result.message || "Failed to load menu",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        setMenuCategories([]);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
      alert.show({
        title: "Error",
        message: "Failed to load menu. Please try again.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
      setMenuCategories([]);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const allMenuItems = useMemo(
    () =>
      menuCategories.flatMap((cat) =>
        Array.isArray(cat.items) ? cat.items.map((item) => item.toItemData()) : []
      ),
    [menuCategories]
  );

  const increment = (itemId) => {
    const item = allMenuItems.find((i) => i.id === itemId);
    if (item) {
      const restaurantInfo = {
        restaurantId: restaurantId,
        restaurantName: restaurantTitle,
        restaurantImage: restaurantCover || 'https://via.placeholder.com/400',
        restaurantData: {
          deliveryAvailable: restaurantData?.deliveryAvailable,
          collectionAvailable: restaurantData?.collectionAvailable,
          cardPaymentAvailable: restaurantData?.cardPaymentAvailable,
          cashOnDeliveryAvailable: restaurantData?.cashOnDeliveryAvailable,
          deliveryTime: restaurantData?.deliveryTime,
          collectionTime: restaurantData?.collectionTime,
          contactNumber: restaurantData?.contactNumber,
        },
      };

      // Show alert if switching restaurants
      if (cart.restaurantId && cart.restaurantId !== restaurantId) {
        alert.show({
          title: "Replace cart items?",
          message: `Your cart contains items from ${cart.restaurantName}. Do you want to clear the cart and add items from ${restaurantTitle}?`,
          buttons: [
            {
              text: "Cancel",
              onPress: () => {},
            },
            {
              text: "Yes, Replace",
              onPress: () => {
                addToCart(item, restaurantInfo);
              },
            },
          ],
        });
      } else {
        addToCart(item, restaurantInfo);
      }
    }
  };

  const decrement = (itemId) => {
    removeFromCart(itemId);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const navigateToCart = () => {
    navigation.navigate("Cart", {
      cartItems: cart.items,
      restaurantName: cart.restaurantName,
      restaurantData: cart.restaurantData,
      restaurantId: cart.restaurantId,
    });
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (isLoadingMenu || !restaurantData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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

      {/* Header */}
      <View style={styles.header}>
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

      {/* Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: totalItems > 0 ? 90 : 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Row */}
        <View style={styles.infoRow}>
          {restaurantData.deliveryAvailable && (
            <View style={styles.infoItem}>
              <MaterialIcons
                name="delivery-dining"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.infoText}>Delivery</Text>
            </View>
          )}
          {restaurantData.collectionAvailable && (
            <View style={styles.infoItem}>
              <Ionicons
                name="storefront-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.infoText}>Collection</Text>
            </View>
          )}
          {restaurantData.cardPaymentAvailable && (
            <View style={styles.infoItem}>
              <Ionicons name="card-outline" size={22} color={colors.primary} />
              <Text style={styles.infoText}>Card</Text>
            </View>
          )}
          {restaurantData.cashOnDeliveryAvailable && (
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={22} color={colors.primary} />
              <Text style={styles.infoText}>Cash</Text>
            </View>
          )}
        </View>

        {/* Menu Categories */}
        <View style={styles.section}>
          {menuCategories
            .filter((cat) => Array.isArray(cat.items) && cat.items.length > 0)
            .map((cat) => (
              <View key={cat.categoryId} style={styles.categorySection}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(cat.categoryId)}
                >
                  <Text style={styles.categoryTitle}>{cat.name}</Text>
                  <Ionicons
                    name={
                      expandedCategories[cat.categoryId]
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                {expandedCategories[cat.categoryId] && (
                  <View style={styles.categoryItems}>
                    {cat.items.map((item, idx) => {
                      const itemData = item.toItemData();
                      return (
                        <View key={item.itemId}>
                          <MenuItem
                            item={itemData}
                            quantity={getItemQuantity(itemData.id)}
                            increment={increment}
                            decrement={decrement}
                          />
                          {idx < cat.items.length - 1 && (
                            <View style={styles.itemDivider} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
        </View>
      </ScrollView>

      {totalItems > 0 && cart.restaurantId === restaurantId && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartItemText}>{totalItems} ITEM</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.cartPrice, { fontSize: 16 }]}>
                £ {totalPrice.toFixed(2)}
              </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  ratingBox: {
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rating: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  ratingText: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    gap: 20,
  },
  infoItem: {
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    color: colors.textLight,
  },
  section: {
    marginTop: 8,
  },
  categorySection: {
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  categoryItems: {
    padding: 16,
  },
  item: {
    flexDirection: "row",
    marginBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  counterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  quantityText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addText: {
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: 13,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
  },
  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartItemText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cartPrice: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  cartTaxes: {
    color: "#fff",
    fontSize: 12,
  },
  cartAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
});