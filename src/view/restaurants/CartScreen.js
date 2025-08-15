import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    Alert,
    SafeAreaView
} from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function CartScreen({ navigation, route }) {
    // Get cart data from route params or use default
    const { cartItems = [], restaurantName = "Eat Healthy" } = route?.params || {};

    // Sample data if no cart items passed
    const [items, setItems] = useState(cartItems.length > 0 ? cartItems : [
        {
            id: 1,
            name: "Plant Protein Bowl",
            price: 8.99,
            quantity: 1,
            isVeg: true,
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop&auto=format"
        }
    ]);

    const [selectedPayment, setSelectedPayment] = useState("card");
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // Meal completion suggestions
    const suggestions = [
        {
            id: 1,
            name: "Veggie Strips - 5 Pcs",
            price: 2.50,
            originalPrice: 2.99,
            image: "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?w=120&h=120&fit=crop&auto=format",
            isVeg: true
        },
        {
            id: 2,
            name: "BK Veg Pizza Puff",
            price: 2.75,
            originalPrice: 3.25,
            image: "data:image/jpeg;base64,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",
            isVeg: true
        },
        {
            id: 3,
            name: "Masala Fries",
            price: 3.50,
            originalPrice: 4.00,
            image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=120&h=120&fit=crop&auto=format",
            isVeg: true
        }
    ];

    const updateQuantity = (id, change) => {
        setItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === id) {
                    const newQuantity = Math.max(0, item.quantity + change);
                    if (newQuantity === 0) {
                        return null; // Remove item
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean); // Remove null items
        });
    };

    const addSuggestionToCart = (suggestion) => {
        const existingItem = items.find(item => item.name === suggestion.name);
        if (existingItem) {
            updateQuantity(existingItem.id, 1);
        } else {
            const newItem = {
                ...suggestion,
                quantity: 1
            };
            setItems(prev => [...prev, newItem]);
        }
    };

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedCoupon ? Math.min(subtotal * 0.3, 3.00) : 0;
    const deliveryFee = 1.50;
    const taxes = (subtotal - discount) * 0.05; // 5% tax
    const total = subtotal - discount + deliveryFee + taxes;

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const renderVegIcon = (isVeg) => (
        <View style={[styles.vegIcon, { borderColor: isVeg ? '#4CAF50' : '#F44336' }]}>
            <View style={[styles.vegDot, { backgroundColor: isVeg ? '#4CAF50' : '#F44336' }]} />
        </View>
    );

    const handlePlaceOrder = () => {
        const orderDetails = {
            orderId: 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            restaurantName: restaurantName,
            items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: total,
            deliveryAddress: 'Selected address is 825 m away from your location',
            estimatedDelivery: '45-50 mins',
            paymentMethod: selectedPayment === 'card' ? 'Card Payment' : 'Cash on Delivery',
            orderTime: new Date().toLocaleTimeString(),
            orderDate: new Date().toLocaleDateString(),
        };
        
        navigation.reset({
            index: 0,
            routes: [{ name: 'OrderConfirmation', params: { orderDetails } }],
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            {/* Restaurant Info Header */}
            <View style={styles.restaurantInfo}>
                <View style={styles.restaurantHeader}>
                    <Text style={styles.restaurantName}>{restaurantName}</Text>
                    <Text style={styles.restaurantSubtitle}>45-50 mins to new • 18 th Floor, Workspace</Text>
                </View>
                <TouchableOpacity style={styles.shareButton}>
                    <Ionicons name="share-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Location Info */}
            <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={16} color={colors.textLight} />
                <Text style={styles.locationText}>Selected address is 825 m away from your location</Text>
            </View>

            {/* Savings Banner */}
            {discount > 0 && (
                <View style={styles.savingsBanner}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.savingsText}>You saved £{discount.toFixed(2)} on this order</Text>
                </View>
            )}

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Cart Items */}
                <View style={styles.section}>
                    {items.map(item => (
                        <View key={item.id} style={styles.cartItem}>
                            {renderVegIcon(item.isVeg)}
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
                                <Text style={styles.itemPrice}>£{(item.price * item.quantity).toFixed(2)} £{((item.price * item.quantity) + 2).toFixed(2)}</Text>
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
                        {suggestions.map(suggestion => (
                            <View key={suggestion.id} style={styles.suggestionCard}>
                                <View style={styles.suggestionHeader}>
                                    {renderVegIcon(suggestion.isVeg)}
                                </View>
                                <Image source={{ uri: suggestion.image }} style={styles.suggestionImage} />
                                <Text style={styles.suggestionName} numberOfLines={2}>{suggestion.name}</Text>
                                <View style={styles.suggestionPricing}>
                                    <Text style={styles.suggestionPrice}>£{suggestion.price.toFixed(2)}</Text>
                                    <Text style={styles.suggestionOriginalPrice}>£{suggestion.originalPrice.toFixed(2)}</Text>
                                </View>
                                <Text style={styles.customizable}>customizable</Text>
                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={() => addSuggestionToCart(suggestion)}
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

                {/* Payment Method - Simplified */}
                <View style={styles.section}>
                    <View style={styles.paymentHeader}>
                        <Ionicons name="card-outline" size={20} color={colors.text} />
                        <Text style={styles.paymentHeaderText}>Payment Method</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.paymentOption, selectedPayment === 'card' && styles.paymentOptionSelected]}
                        onPress={() => setSelectedPayment('card')}
                    >
                        <View style={styles.paymentLeft}>
                            <Ionicons name="card-outline" size={20} color={selectedPayment === 'card' ? colors.primary : colors.textLight} />
                            <Text style={styles.paymentTitle}>Card Payment</Text>
                        </View>
                        <View style={[styles.radioButton, selectedPayment === 'card' && { borderColor: colors.primary }]}>
                            {selectedPayment === 'card' && <View style={styles.radioButtonSelected} />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, selectedPayment === 'cod' && styles.paymentOptionSelected]}
                        onPress={() => setSelectedPayment('cod')}
                    >
                        <View style={styles.paymentLeft}>
                            <Ionicons name="cash-outline" size={20} color={selectedPayment === 'cod' ? colors.primary : colors.textLight} />
                            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                        </View>
                        <View style={[styles.radioButton, selectedPayment === 'cod' && { borderColor: colors.primary }]}>
                            {selectedPayment === 'cod' && <View style={styles.radioButtonSelected} />}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Bill Summary */}
                <View style={styles.billSummary}>
                    <View style={styles.billRow}>
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
            <View style={styles.orderBar}>
                <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalText}>TOTAL</Text>
                    <Text style={styles.orderAmount}>£{total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
                    <Text style={styles.placeOrderText}>Place Order ▶</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 50
    },
    container: {
        flex: 1,
        paddingHorizontal: 15
    },
    restaurantInfo: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    restaurantHeader: {
        flex: 1
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text
    },
    restaurantSubtitle: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2
    },
    shareButton: {
        padding: 8
    },
    locationInfo: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: "#f5f5f5"
    },
    locationText: {
        fontSize: 12,
        color: colors.textLight,
        marginLeft: 5
    },
    savingsBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e8f5e8",
        paddingHorizontal: 15,
        paddingVertical: 8
    },
    savingsText: {
        fontSize: 12,
        color: colors.success,
        marginLeft: 5,
        fontWeight: "500"
    },
    section: {
        backgroundColor: colors.surface,
        marginVertical: 5,
        borderRadius: 8,
        padding: 15
    },
    cartItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    vegIcon: {
        width: 16,
        height: 16,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10
    },
    vegDot: {
        width: 6,
        height: 6,
        borderRadius: 3
    },
    itemInfo: {
        flex: 1
    },
    itemName: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text
    },
    editText: {
        fontSize: 12,
        color: colors.primary,
        marginTop: 2
    },
    itemControls: {
        alignItems: "flex-end"
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
        marginBottom: 5
    },
    quantityBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    quantityBtnText: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.text
    },
    quantityText: {
        fontSize: 14,
        fontWeight: "500",
        minWidth: 30,
        textAlign: "center",
        color: colors.text
    },
    itemPrice: {
        fontSize: 12,
        color: colors.text
    },
    addMoreBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0"
    },
    addMoreText: {
        fontSize: 14,
        color: colors.primary,
        marginLeft: 8,
        fontWeight: "500"
    },
    noteSection: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0"
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        marginLeft: 10
    },
    dontSendText: {
        fontSize: 12,
        color: colors.textLight
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
        marginLeft: 8
    },
    suggestionsScroll: {
        marginHorizontal: -8,
        paddingHorizontal: 8
    },
    suggestionCard: {
        width: 140,
        marginHorizontal: 8,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#eee",
        alignItems: "center",
        minHeight: 200
    },
    suggestionHeader: {
        width: '100%',
        alignItems: 'flex-start',
        marginBottom: 8
    },
    suggestionImage: {
        width: "100%",
        height: 70,
        borderRadius: 6,
        marginBottom: 8
    },
    suggestionName: {
        fontSize: 13,
        fontWeight: "500",
        color: colors.text,
        marginBottom: 8,
        textAlign: "center",
        height: 32,
        lineHeight: 16
    },
    suggestionPricing: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6
    },
    suggestionPrice: {
        fontSize: 13,
        fontWeight: "bold",
        color: colors.text
    },
    suggestionOriginalPrice: {
        fontSize: 11,
        color: colors.textLight,
        textDecorationLine: "line-through",
        marginLeft: 6
    },
    customizable: {
        fontSize: 10,
        color: colors.textLight,
        marginBottom: 10,
        textAlign: "center"
    },
    addBtn: {
        backgroundColor: colors.secondary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: "center",
        minWidth: 60
    },
    addBtnText: {
        fontSize: 11,
        fontWeight: "bold",
        color: colors.textWhite
    },
    couponHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10
    },
    couponLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    couponIcon: {
        width: 24,
        height: 24,
        backgroundColor: colors.success,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10
    },
    couponIconText: {
        fontSize: 14,
        fontWeight: "bold",
        color: colors.textWhite
    },
    couponTitle: {
        fontSize: 12,
        color: colors.text,
        flex: 1
    },
    couponDiscount: {
        fontSize: 12,
        color: colors.success,
        fontWeight: "bold"
    },
    viewCoupons: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0"
    },
    viewCouponsText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        marginLeft: 10
    },
    paymentHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    paymentHeaderText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
        marginLeft: 10
    },
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
        backgroundColor: colors.background
    },
    paymentOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: "rgba(76, 175, 80, 0.05)"
    },
    paymentLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    paymentTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
        marginLeft: 12
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.textLight,
        alignItems: "center",
        justifyContent: "center"
    },
    radioButtonSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary
    },
    billSummary: {
        backgroundColor: colors.surface,
        marginVertical: 5,
        borderRadius: 8,
        padding: 15
    },
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5
    },
    billLabel: {
        fontSize: 13,
        color: colors.text
    },
    billValue: {
        fontSize: 13,
        color: colors.text,
        fontWeight: "500"
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: "#eee",
        marginTop: 5,
        paddingTop: 10
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: colors.text
    },
    totalValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: colors.text
    },
    orderBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.success,
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    orderTotal: {
        flex: 1
    },
    orderTotalText: {
        fontSize: 12,
        color: colors.textWhite,
        fontWeight: "bold"
    },
    orderAmount: {
        fontSize: 16,
        color: colors.textWhite,
        fontWeight: "bold"
    },
    placeOrderBtn: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6
    },
    placeOrderText: {
        fontSize: 14,
        color: colors.textWhite,
        fontWeight: "bold"
    }
});