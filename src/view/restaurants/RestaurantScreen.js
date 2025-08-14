
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar
} from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function RestaurantScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState("DELIVERY");

    const menuItems = [
        { id: 1, name: "Plant Protein Bowl", price: 8.99, desc: "[Veg] Spring mix, plant based, organic...", image: "https://www.eatingwell.com/thmb/ZrLL0M2E7J_XILp5DMxTcYL3MJ4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/vegetarian-protein-bowl-51d0dcb83a084b3da7e5bd29e0beae37.jpg", isVeg: true },
        { id: 2, name: "Spring Veg Platter", price: 6.49, desc: "[Veg] Fresh veggies with dip...", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9Ka0-4qmm14toftFpgIFyjMnsofb-m0xr3g&s", isVeg: true },
        { id: 3, name: "Paneer Butter Masala", price: 7.50, desc: "[Veg] Rich creamy tomato gravy with paneer", image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/07/paneer-butter-masala-recipe.jpg", isVeg: true },
        { id: 4, name: "Chicken Biryani", price: 10.99, desc: "[Non-Veg] Hyderabadi dum biryani with raita", image: "https://ministryofcurry.com/wp-content/uploads/2024/06/chicken-biryani-5-500x500.jpg", isVeg: false },
        { id: 5, name: "Egg Curry", price: 5.75, desc: "[Egg] Spicy curry with boiled eggs", image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/04/egg-curry-recipe.jpg", isVeg: false },
        { id: 6, name: "Grilled Sandwich", price: 4.25, desc: "[Veg] Cheese & veggies toasted to perfection", image: "https://www.vegrecipesofindia.com/wp-content/uploads/2014/01/grilled-sandwich-4.jpg", isVeg: true },
        { id: 7, name: "Mushroom Soup", price: 3.99, desc: "[Veg] Creamy mushroom soup with herbs", image: "https://www.allrecipes.com/thmb/PKh_MtthZMtG1flNmud0MNgRK7w=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/13096-Cream-of-Mushroom-Soup-ddmfs-4x3-293-b505e37374d74e81807e8a93bcdd7bab.jpg", isVeg: true }
    ];

    const [quantities, setQuantities] = useState({});

    const increment = (id) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
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

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
    const totalPrice = menuItems.reduce(
        (sum, item) => sum + (quantities[item.id] || 0) * item.price,
        0
    );

    // Convert quantities to cart items for navigation
    const getCartItems = () => {
        return menuItems
            .filter(item => quantities[item.id] > 0)
            .map(item => ({
                ...item,
                quantity: quantities[item.id]
            }));
    };

    const navigateToCart = () => {
        const cartItems = getCartItems();
        navigation.navigate('Cart', {
            cartItems,
            restaurantName: "Eat Healthy"
        });
    };

    const reviews = [
        {
            id: 1,
            name: "Vesali",
            rating: 4.5,
            text: "Absolutely loved the food! Fresh, tasty, and perfectly cooked. Delivery was quick too!",
            date: "27 days ago"
        },
        {
            id: 2,
            name: "Preeti",
            rating: 4,
            text: "Great experience overall. The food was delicious and well-packed. Will definitely order again!",
            date: "2 days ago"
        }
    ];

    const renderStars = (count) => {
        return (
            <View style={{ flexDirection: "row" }}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <Ionicons
                        key={index}
                        name={index < count ? "star" : "star-outline"}
                        size={14}
                        color={colors.warning}
                        style={{ marginRight: 2 }}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Sticky Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.title}>Eat Healthy</Text>
                    <Text style={styles.subtitle}>Healthy food, South Indian</Text>
                    <Text style={styles.location}>Kukatpally, Hyderabad</Text>
                </View>
                <View style={styles.ratingBox}>
                    <Text style={styles.rating}>4.2 ★</Text>
                    <Text style={styles.ratingText}>DELIVERY</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "DELIVERY" && styles.tabActive]}
                    onPress={() => setActiveTab("DELIVERY")}
                >
                    <Text style={activeTab === "DELIVERY" ? styles.tabActiveText : styles.tabText}>
                        DELIVERY
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "REVIEWS" && styles.tabActive]}
                    onPress={() => setActiveTab("REVIEWS")}
                >
                    <Text style={activeTab === "REVIEWS" ? styles.tabActiveText : styles.tabText}>
                        REVIEWS
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
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
                                <Text style={styles.infoText}>40 mins</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Ionicons name="pricetag-outline" size={20} color={colors.text} />
                                <Text style={styles.infoText}>offers</Text>
                            </View>
                        </View>

                        {/* Recommended Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recommended</Text>
                            {menuItems.map((item) => (
                                <View key={item.id} style={styles.item}>
                                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemPrice}>£ {item.price.toFixed(2)}</Text>
                                        <Text style={styles.itemDesc}>{item.desc}</Text>
                                    </View>

                                    {quantities[item.id] ? (
                                        <View style={styles.counter}>
                                            <TouchableOpacity onPress={() => decrement(item.id)}>
                                                <Text style={styles.counterText}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.quantityText}>{quantities[item.id]}</Text>
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
                            ))}
                        </View>

                        {/* Offer Box */}
                        <View style={styles.offerBox}>
                            <Text style={styles.offerText}>30% OFF up to £3.00</Text>
                            <Text style={styles.offerSub}>
                                Use code HEALTHY30 on orders worth £10 or more
                            </Text>
                        </View>
                    </>
                )}

                {activeTab === "REVIEWS" && (
                    <View style={styles.section}>
                        {reviews.map((review) => (
                            <View key={review.id} style={styles.reviewBox}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={styles.reviewName}>{review.name}</Text>
                                    {renderStars(review.rating)}
                                </View>
                                <Text style={styles.reviewText}>{review.text}</Text>
                                <Text style={styles.reviewDate}>{review.date}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Fixed Checkout Bar */}
            {totalItems > 0 && activeTab === "DELIVERY" && (
                <View style={styles.cartBar}>
                    <View>
                        <Text style={styles.cartItemText}>{totalItems} ITEM</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.cartPrice}>£ {totalPrice.toFixed(2)}</Text>
                            <Text style={styles.cartTaxes}> plus taxes</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.cartAction} onPress={navigateToCart}>
                        <Text style={styles.cartActionText}>View Cart</Text>
                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    title: { fontSize: 20, fontWeight: "bold", color: colors.text },
    subtitle: { fontSize: 14, color: colors.textLight },
    location: { fontSize: 12, color: colors.textLight },
    ratingBox: {
        backgroundColor: colors.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
    },
    rating: { color: colors.textWhite, fontWeight: "bold" },
    ratingText: { fontSize: 10, color: colors.textWhite },
    tabs: { flexDirection: "row", marginVertical: 15 },
    tab: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: colors.surface,
        alignItems: "center",
        borderRadius: 6
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
        borderRadius: 6,
        marginBottom: 10,
        padding: 8,
        alignItems: "center"
    },
    itemImage: { width: 80, height: 80, borderRadius: 6, marginRight: 10 },
    itemDetails: { flex: 1 },
    itemName: { fontWeight: "bold", fontSize: 14 },
    itemPrice: { color: colors.primary, fontWeight: "bold", marginVertical: 4 },
    itemDesc: { fontSize: 12, color: colors.textLight },
    addButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 4
    },
    addText: { color: colors.textWhite, fontWeight: "bold" },
    counter: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.secondary,
        borderRadius: 4,
        paddingHorizontal: 5
    },
    counterText: { color: colors.textWhite, fontWeight: "bold", fontSize: 18, paddingHorizontal: 6 },
    quantityText: {
        color: colors.textWhite,
        fontWeight: "bold",
        fontSize: 14,
        minWidth: 20,
        textAlign: "center"
    },
    offerBox: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 4,
        marginTop: 10
    },
    offerText: { color: colors.textWhite, fontWeight: "bold", fontSize: 14 },
    offerSub: { color: colors.textWhite, fontSize: 12 },
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
        elevation: 5
    },
    cartItemText: { color: colors.textWhite, fontWeight: "bold", fontSize: 12 },
    cartPrice: { color: colors.textWhite, fontWeight: "bold", fontSize: 14 },
    cartTaxes: { color: colors.textWhite, fontSize: 12, marginLeft: 4 },
    cartAction: { flexDirection: "row", alignItems: "center" },
    cartActionText: { color: colors.textWhite, fontWeight: "bold", fontSize: 14, marginRight: 4 },
    reviewBox: {
        backgroundColor: colors.surface,
        padding: 10,
        borderRadius: 6,
        marginBottom: 10
    },
    reviewName: { fontWeight: "bold", fontSize: 14, marginBottom: 4 },
    reviewText: { fontSize: 13, color: colors.textLight, marginVertical: 4 },
    reviewDate: { fontSize: 11, color: colors.textLight }
});