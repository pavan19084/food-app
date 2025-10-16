import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  BackHandler,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../constants/colors";
import { useOrder } from "../context/OrderContext";
import { Order } from "../models/order";
import { trackOrder } from "../api/order";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "../components/CustomAlert";

const STAGES = [
  {
    key: "pending",
    title: "Pending",
    desc: "Waiting for restaurant confirmation.",
    icon: "time-outline",
  },
  {
    key: "confirmed",
    title: "Confirmed",
    desc: "Restaurant confirmed your order.",
    icon: "checkmark-circle",
  },
  {
    key: "prepared",
    title: "Prepared",
    desc: "Your food is ready to go.",
    icon: "restaurant",
  },
  {
    key: "out_for_delivery",
    title: "Out for Delivery",
    desc: "Your order is on the way.",
    icon: "bicycle",
  },
  {
    key: "delivered",
    title: "Delivered",
    desc: "Enjoy your meal!",
    icon: "checkmark-done",
  },
];

export default function OrderConfirmationScreen({ navigation, route }) {
  const { orderDetails } = route?.params || {};
  const { setOrderPlaced } = useOrder();
  const alert = useAlert();

  const order = useMemo(() => {
    if (orderDetails) {
      const newOrder = new Order(orderDetails);
      return newOrder;
    }
    return null;
  }, [orderDetails]);

  const [currentOrder, setCurrentOrder] = useState(order);
  const [isTracking, setIsTracking] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, []);

  // track order status
  const trackOrderStatus = async () => {
    if (!currentOrder?.orderId || isTracking) return;
    setIsTracking(true);
    try {
      const result = await trackOrder(currentOrder.orderId);
      if (result.success && result.data) {
        const updatedOrder = Order.createFromApiResponse(result.data);
        setCurrentOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error tracking order:", error);
    } finally {
      setIsTracking(false);
    }
  };

  // periodic polling every 10s
  useEffect(() => {
    if (!order?.orderId) return;
    trackOrderStatus();
    const interval = setInterval(trackOrderStatus, 500);
    return () => clearInterval(interval);
  }, [order?.orderId]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentOrder) {
          setOrderPlaced(currentOrder);
        }
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        return true;
      };
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
    }, [navigation, currentOrder])
  );

  useEffect(() => {
    navigation.setOptions({ headerLeft: () => null, gestureEnabled: false });
  }, [navigation]);

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.lightMode.background}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Order Data</Text>
          <Text style={styles.emptySubtitle}>Order details not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safety check for order data
  const orderItems = currentOrder?.items || [];
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    console.warn("Order items are missing or invalid:", orderItems);
  } else {
  }

  const stageIndex = STAGES.findIndex((s) => s.key === currentOrder.status);
  const delivered = currentOrder.status === "delivered";
  const currentStage = STAGES[stageIndex] || STAGES[0];

  // progress animation
  useEffect(() => {
    const progress = (stageIndex + 1) / STAGES.length;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [stageIndex]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.lightMode.background}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.headerWrap,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }, { scale: headerScale }],
            },
          ]}
        >
          <View style={styles.badge}>
            <Ionicons
              name={currentStage.icon}
              size={56}
              color={colors.success}
            />
          </View>
          <Text style={styles.titleText}>
            {delivered ? "Order Delivered 🎉" : "Order In Progress"}
          </Text>
          <Text style={styles.subText}>{currentStage.desc}</Text>

          <View style={styles.stagePill}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: delivered ? colors.success : colors.primary,
                },
              ]}
            />
            <Text style={styles.stagePillText}>{currentStage.title}</Text>
          </View>
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {delivered
              ? "Delivered"
              : `Step ${stageIndex + 1} of ${STAGES.length}`}
          </Text>
          <View style={styles.stagesRow}>
            {STAGES.map((s, i) => {
              const isDone = i < stageIndex || delivered;
              const isNow = i === stageIndex && !delivered;
              return (
                <View key={s.key} style={styles.stageChip}>
                  <View
                    style={[
                      styles.stageIconCircle,
                      {
                        backgroundColor: isDone
                          ? colors.success
                          : isNow
                          ? colors.primary
                          : colors.lightMode.background,
                      },
                    ]}
                  >
                    {isDone ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.lightMode.textWhite}
                      />
                    ) : (
                      <Text style={styles.stageNumber}>{i + 1}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stageChipText,
                      isDone && { color: colors.success },
                      isNow && { color: colors.primary },
                    ]}
                    numberOfLines={1}
                  >
                    {s.title}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="receipt" size={22} color={colors.primary} />
            <Text style={styles.cardTitle}>Order Details</Text>
          </View>
          <Row label="Order ID" value={currentOrder.orderId} />
          <Row label="Restaurant" value={currentOrder.restaurantName} />
          <Row
            label="Type"
            value={
              currentOrder.deliveryType === "delivery"
                ? "Delivery"
                : "Collection"
            }
          />
          <Row label="Payment" value={currentOrder.paymentMethod} />
          <Row label="Status" value={currentOrder.status} />
        </View>

        {/* Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons
              name="restaurant-menu"
              size={22}
              color={colors.primary}
            />
            <Text style={styles.cardTitle}>Items</Text>
          </View>
          {orderItems.length > 0 ? (
            orderItems.map((it, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {it.name || "Unknown Item"}
                  </Text>
                  <Text style={styles.itemMeta}>Qty: {it.quantity || 0}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  £{(it.price || 0).toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>No items found</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              £{(currentOrder.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Delivery / Collection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={
                currentOrder.deliveryType === "delivery"
                  ? "location"
                  : "storefront"
              }
              size={22}
              color={colors.primary}
            />
            <Text style={styles.cardTitle}>
              {currentOrder.deliveryType === "delivery"
                ? "Delivery"
                : "Collection"}
            </Text>
          </View>
          <Text style={styles.address}>{currentOrder.deliveryAddress}</Text>
        </View>

        {/* Restaurant Contact */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="call-outline" size={22} color={colors.primary} />
            <Text style={styles.cardTitle}>Restaurant Contact</Text>
          </View>
          {currentOrder.deliveryType === "delivery" ? (
            <View>
              <Text style={styles.contactText}>
                For any order-related issues, contact the restaurant directly:
              </Text>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() =>
                  Linking.openURL(`tel:${currentOrder.restaurantContact}`)
                }
              >
                <Ionicons name="call" size={16} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>
                  {currentOrder.restaurantContact}
                </Text>
              </TouchableOpacity>
              {currentOrder.restaurantEmail && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() =>
                    Linking.openURL(`mailto:${currentOrder.restaurantEmail}`)
                  }
                >
                  <MaterialIcons name="email" size={16} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>
                    {currentOrder.restaurantEmail}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.contactText}>
                Your order is ready for collection at:
              </Text>
              <Text style={styles.address}>
                {currentOrder.restaurantAddress}
              </Text>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      currentOrder.restaurantAddress
                    )}`
                  )
                }
              >
                <Ionicons name="map" size={16} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() =>
                  Linking.openURL(`tel:${currentOrder.restaurantContact}`)
                }
              >
                <Ionicons name="call" size={16} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>
                  {currentOrder.restaurantContact}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

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

function Row({ label, value }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: { fontSize: 14, color: colors.lightMode.text, fontWeight: "500" },
  value: { fontSize: 14, color: colors.lightMode.text, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightMode.background },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  headerWrap: { alignItems: "center", paddingVertical: 28 },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.success + "10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  titleText: { fontSize: 22, fontWeight: "800", color: colors.lightMode.text },
  subText: { marginTop: 6, fontSize: 14, color: colors.lightMode.textLight },
  stagePill: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightMode.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.lightMode.background,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  stagePillText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.lightMode.text,
  },
  progressCard: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.lightMode.background,
  },
  progressFill: { height: "100%", backgroundColor: colors.primary },
  progressLabel: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  stagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  stageChip: { flex: 1, alignItems: "center" },
  stageIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stageNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.lightMode.textWhite,
  },
  stageChipText: {
    fontSize: 11,
    marginTop: 6,
    color: colors.lightMode.textLight,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.lightMode.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "800",
    color: colors.lightMode.text,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: colors.lightMode.background,
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.lightMode.text },
  itemMeta: { fontSize: 12, color: colors.lightMode.textLight, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: "800", color: colors.lightMode.text },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  totalLabel: { fontSize: 16, fontWeight: "800", color: colors.lightMode.text },
  totalAmount: { fontSize: 18, fontWeight: "900", color: colors.primary },
  address: {
    fontSize: 14,
    color: colors.lightMode.text,
    backgroundColor: colors.lightMode.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: colors.lightMode.textLight,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
