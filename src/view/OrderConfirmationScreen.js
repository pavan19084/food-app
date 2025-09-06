import React, { useState, useEffect, useRef, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useOrder } from '../context/OrderContext';
import { Order } from '../models/order';

const STAGES = [
  { key: 'confirmed', title: 'Order Confirmed', desc: 'We’ve received your order.', icon: 'checkmark-circle' },
  { key: 'preparing', title: 'Preparing', desc: 'Restaurant is preparing your food.', icon: 'restaurant' },
  { key: 'delivery', title: 'Out for Delivery', desc: 'Your order is on the way.', icon: 'bicycle' },
];

const STAGE_SECONDS = 10; // exactly 10s per stage

export default function OrderConfirmationScreen({ navigation, route }) {
  const { orderDetails } = route?.params || {};
  const { clearActiveOrder } = useOrder();

  // Create Order instance from orderDetails
  const order = useMemo(() => {
    if (orderDetails) {
      return new Order(orderDetails);
    }
    // Fallback order for testing
    return new Order({
      orderId: 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      restaurantName: 'Eat Healthy',
      items: [
        { name: 'Plant Protein Bowl', quantity: 1, price: 8.99 },
        { name: 'Veggie Strips', quantity: 1, price: 2.5 },
      ],
      total: 11.49,
      deliveryAddress: 'Madhapur, Hyderabad, Telangana 500081',
      estimatedDelivery: '45–50 mins',
      paymentMethod: 'Card Payment',
      orderTime: new Date().toLocaleTimeString(),
      orderDate: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
    });
  }, [orderDetails]);

  // ---------- Stage / Timer ----------
  const [stageIndex, setStageIndex] = useState(0); // 0..2 for three timed stages
  const [secondsLeft, setSecondsLeft] = useState(STAGE_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  const [delivered, setDelivered] = useState(false);
  const timerRef = useRef(null);

  // ---------- Subtle entrance animations ----------
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current; // 0..1 across all stages

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [fadeIn, slideUp, headerScale]);

  // Animate progress bar width smoothly
  useEffect(() => {
    const totalSteps = STAGES.length; // 3
    const progress = delivered ? 1 : stageIndex / (totalSteps - 1); // 0, 0.5, 1.0
    Animated.timing(progressAnim, { toValue: progress, duration: 400, useNativeDriver: false }).start();
  }, [stageIndex, delivered, progressAnim]);

  // 10s per stage timer
  useEffect(() => {
    if (!isRunning || delivered) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // move to next stage or finish
          if (stageIndex < STAGES.length - 1) {
            setStageIndex((i) => i + 1);
            return STAGE_SECONDS;
          } else {
            // finished all 3 stages
            setDelivered(true);
            setIsRunning(false);
            return 0;
          }
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, delivered, stageIndex]);

  // Back → Home
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [navigation])
  );

  // Disable header back & gestures
  useEffect(() => {
    navigation.setOptions({ headerLeft: () => null, gestureEnabled: false });
  }, [navigation]);

  const currentStage = delivered ? { title: 'Delivered', desc: 'Enjoy your meal!', icon: 'checkmark-done' } : STAGES[stageIndex];

  const format = (sec) => `0:${String(sec).padStart(2, '0')}`;

  // visual widths for progress
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.lightMode.background} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.headerWrap, { opacity: fadeIn, transform: [{ translateY: slideUp }, { scale: headerScale }] }]}>
          <View style={styles.badge}>
            <Ionicons name={currentStage.icon} size={56} color={colors.success} />
          </View>
          <Text style={styles.titleText}>
            {delivered ? 'Order Delivered 🎉' : 'Order Placed Successfully!'}
          </Text>
          <Text style={styles.subText}>
            {delivered ? 'Your order has reached your location.' : 'Your order is confirmed and being handled.'}
          </Text>

          <View style={styles.stagePill}>
            <View style={[styles.dot, { backgroundColor: delivered ? colors.success : colors.primary }]} />
            <Text style={styles.stagePillText}>
              {currentStage.title}
              {!delivered && ` • ${format(secondsLeft)} left`}
            </Text>
          </View>
        </Animated.View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressLabel}>
            {delivered ? '100% • Delivered' : `Step ${stageIndex + 1} of ${STAGES.length}`}
          </Text>

          <View style={styles.stagesRow}>
            {STAGES.map((s, i) => {
              const isDone = delivered ? true : i < stageIndex;
              const isNow = !delivered && i === stageIndex;
              return (
                <View key={s.key} style={styles.stageChip}>
                  <View
                    style={[
                      styles.stageIconCircle,
                      { backgroundColor: isDone ? colors.success : isNow ? colors.primary : colors.lightMode.background },
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={16} color={colors.lightMode.textWhite} />
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

        {/* Order Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="receipt" size={22} color={colors.primary} />
            <Text style={styles.cardTitle}>Order Details</Text>
          </View>
          <Row label="Order ID" value={order.orderId} />
          <Row label="Restaurant" value={order.restaurantName} />
          <Row label="Order Time" value={order.orderTime} />
          <Row label="Order Date" value={order.orderDate} />
          <Row label="Type" value={order.deliveryType === "delivery" ? "Delivery" : "Pickup"} />
          <Row label="Payment" value={order.paymentMethod} />
        </View>

        {/* Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="restaurant-menu" size={22} color={colors.primary} />
            <Text style={styles.cardTitle}>Items</Text>
          </View>
          {order.items.map((it, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{it.name}</Text>
                <Text style={styles.itemMeta}>Qty: {it.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>£{it.price.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>£{order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery/Pickup */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name={order.deliveryType === "delivery" ? "location" : "storefront"} size={22} color={colors.primary} />
            <Text style={styles.cardTitle}>{order.deliveryType === "delivery" ? "Delivery" : "Pickup"}</Text>
          </View>
          <Text style={styles.address}>{order.deliveryAddress}</Text>
          <View style={styles.inline}>
            <Ionicons name="time-outline" size={16} color={colors.lightMode.textLight} />
            <Text style={styles.inlineText}>
              {delivered ? (order.deliveryType === "delivery" ? 'Delivered' : 'Ready for pickup') : `ETA: ${order.estimatedDelivery}`}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={22} color={colors.primary} />
            <Text style={styles.cardTitle}>Status</Text>
          </View>
          <Text style={styles.statusTitle}>{currentStage.title}</Text>
          <Text style={styles.statusDesc}>{currentStage.desc}</Text>
          {!delivered && <Text style={styles.timerText}>⏱ {format(secondsLeft)} remaining</Text>}
        </View>
      </ScrollView>
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
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { fontSize: 14, color: colors.lightMode.text, fontWeight: '500' },
  value: { fontSize: 14, color: colors.lightMode.text, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightMode.background },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  headerWrap: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16 },
  badge: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.success + '10',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  titleText: { fontSize: 22, fontWeight: '800', color: colors.lightMode.text, textAlign: 'center' },
  subText: { marginTop: 6, fontSize: 14, color: colors.lightMode.textLight, textAlign: 'center' },

  stagePill: {
    marginTop: 14, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.lightMode.surface, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderWidth: 1, borderColor: colors.lightMode.background,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  stagePillText: { fontSize: 13, fontWeight: '700', color: colors.lightMode.text },

  progressCard: {
    backgroundColor: colors.lightMode.surface, borderRadius: 16, padding: 16, marginBottom: 16,
  },
  progressBar: {
    height: 10, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.lightMode.background,
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressLabel: { marginTop: 8, textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.primary },

  stagesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  stageChip: { flex: 1, alignItems: 'center' },
  stageIconCircle: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  stageNumber: { fontSize: 12, fontWeight: '800', color: colors.lightMode.textWhite },
  stageChipText: { fontSize: 11, marginTop: 6, color: colors.lightMode.textLight, textAlign: 'center' },

  card: { backgroundColor: colors.lightMode.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { marginLeft: 8, fontSize: 16, fontWeight: '800', color: colors.lightMode.text },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: colors.lightMode.background, borderRadius: 10, marginBottom: 8,
  },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.lightMode.text },
  itemMeta: { fontSize: 12, color: colors.lightMode.textLight, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: colors.lightMode.text },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lightMode.background,
  },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.lightMode.text },
  totalAmount: { fontSize: 18, fontWeight: '900', color: colors.primary },

  address: {
    fontSize: 14, color: colors.lightMode.text, lineHeight: 20,
    backgroundColor: colors.lightMode.background, padding: 12, borderRadius: 10, marginBottom: 10,
  },
  inline: { flexDirection: 'row', alignItems: 'center' },
  inlineText: { marginLeft: 6, color: colors.lightMode.textLight, fontSize: 13 },

  statusTitle: { fontSize: 16, fontWeight: '800', color: colors.lightMode.text, marginBottom: 4 },
  statusDesc: { fontSize: 13, color: colors.lightMode.textLight, lineHeight: 20, marginBottom: 6 },
  timerText: { fontSize: 14, fontWeight: '800', color: colors.primary },
});
