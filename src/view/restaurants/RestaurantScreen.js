import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar
} from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Restaurant-specific menu data
const RESTAURANT_MENUS = {
  'Eat Healthy': {
    title: 'Eat Healthy',
    subtitle: 'Healthy food, South Indian',
    rating: '4.3',
    deliveryTime: '40 mins',
    menuItems: [
      { id: 1, name: "Plant Protein Bowl", price: 8.99, desc: "[Veg] Spring mix, plant based, organic...", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 2, name: "Spring Veg Platter", price: 6.49, desc: "[Veg] Fresh veggies with dip...", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 3, name: "Paneer Butter Masala", price: 7.50, desc: "[Veg] Rich creamy tomato gravy with paneer", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 4, name: "Quinoa Salad", price: 5.99, desc: "[Veg] Fresh quinoa with vegetables", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 5, name: "Grilled Chicken Breast", price: 9.99, desc: "[Non-Veg] Lean grilled chicken with herbs", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 6, name: "Grilled Sandwich", price: 4.25, desc: "[Veg] Cheese & veggies toasted to perfection", image: "https://images.unsplash.com/photo-1528735602781-4fb364c6421e?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Mushroom Soup", price: 3.99, desc: "[Veg] Creamy mushroom soup with herbs", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Vesali", rating: 4.5, text: "Absolutely loved the food! Fresh, tasty, and perfectly cooked. Delivery was quick too!", date: "27 days ago" },
      { id: 2, name: "Preeti", rating: 4.0, text: "Great experience overall. The food was delicious and well-packed. Will definitely order again!", date: "2 days ago" },
    ]
  },
  'Pizza Palace': {
    title: 'Pizza Palace',
    subtitle: 'Italian, Pizza, Pasta',
    rating: '4.5',
    deliveryTime: '35 mins',
    menuItems: [
      { id: 1, name: "Margherita Pizza", price: 12.99, desc: "[Veg] Classic tomato sauce with mozzarella", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 2, name: "Pepperoni Pizza", price: 14.99, desc: "[Non-Veg] Spicy pepperoni with cheese", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 3, name: "BBQ Chicken Pizza", price: 16.99, desc: "[Non-Veg] BBQ sauce with grilled chicken", image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 4, name: "Veggie Supreme", price: 13.99, desc: "[Veg] Loaded with fresh vegetables", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 5, name: "Spaghetti Carbonara", price: 11.99, desc: "[Non-Veg] Creamy pasta with bacon", image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 6, name: "Garlic Bread", price: 4.99, desc: "[Veg] Toasted bread with garlic butter", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Tiramisu", price: 6.99, desc: "[Veg] Classic Italian dessert", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Marco", rating: 4.8, text: "Best pizza in town! Authentic Italian taste and crispy crust.", date: "1 day ago" },
      { id: 2, name: "Sophia", rating: 4.6, text: "Amazing pasta and the garlic bread is to die for!", date: "3 days ago" },
    ]
  },
  'Burger House': {
    title: 'Burger House',
    subtitle: 'American, Burgers, Fast Food',
    rating: '4.1',
    deliveryTime: '25 mins',
    menuItems: [
      { id: 1, name: "Classic Cheeseburger", price: 8.99, desc: "[Non-Veg] Beef patty with cheese and veggies", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 2, name: "Chicken Burger", price: 7.99, desc: "[Non-Veg] Grilled chicken with lettuce", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 3, name: "Veggie Burger", price: 6.99, desc: "[Veg] Plant-based patty with fresh vegetables", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 4, name: "Bacon Deluxe", price: 10.99, desc: "[Non-Veg] Double patty with bacon strips", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 5, name: "French Fries", price: 3.99, desc: "[Veg] Crispy golden fries", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 6, name: "Onion Rings", price: 4.49, desc: "[Veg] Crispy battered onion rings", image: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Chocolate Shake", price: 4.99, desc: "[Veg] Rich chocolate milkshake", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Jake", rating: 4.2, text: "Juicy burgers and crispy fries! Perfect for a quick meal.", date: "5 hours ago" },
      { id: 2, name: "Emma", rating: 4.0, text: "Great value for money. The veggie burger is surprisingly good!", date: "1 day ago" },
    ]
  },
  'Biryani Corner': {
    title: 'Biryani Corner',
    subtitle: 'Indian, Biryani, Rice',
    rating: '4.4',
    deliveryTime: '45 mins',
    menuItems: [
      { id: 1, name: "Chicken Biryani", price: 10.99, desc: "[Non-Veg] Hyderabadi dum biryani with raita", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 2, name: "Veg Biryani", price: 8.99, desc: "[Veg] Mixed vegetable biryani", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 3, name: "Mutton Biryani", price: 12.99, desc: "[Non-Veg] Spicy mutton biryani", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 4, name: "Paneer Biryani", price: 9.99, desc: "[Veg] Cottage cheese biryani", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 5, name: "Raita", price: 2.99, desc: "[Veg] Fresh yogurt with vegetables", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 6, name: "Mirchi Ka Salan", price: 3.99, desc: "[Veg] Spicy chili curry", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Gulab Jamun", price: 4.99, desc: "[Veg] Sweet dessert balls", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Rajesh", rating: 4.6, text: "Authentic Hyderabadi biryani! The spices are perfectly balanced.", date: "2 days ago" },
      { id: 2, name: "Priya", rating: 4.3, text: "Delicious biryani and the raita is perfect with it.", date: "1 week ago" },
    ]
  },
  'Chicken Delight': {
    title: 'Chicken Delight',
    subtitle: 'Chicken, Grill, BBQ',
    rating: '4.0',
    deliveryTime: '30 mins',
    menuItems: [
      { id: 1, name: "Grilled Chicken Breast", price: 9.99, desc: "[Non-Veg] Marinated chicken with herbs", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 2, name: "BBQ Chicken Wings", price: 8.99, desc: "[Non-Veg] Smoky BBQ wings", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 3, name: "Chicken Tikka", price: 7.99, desc: "[Non-Veg] Spicy Indian chicken tikka", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 4, name: "Chicken Curry", price: 8.99, desc: "[Non-Veg] Rich tomato-based curry", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 5, name: "Chicken Fried Rice", price: 6.99, desc: "[Non-Veg] Chinese-style fried rice", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 6, name: "Coleslaw", price: 3.99, desc: "[Veg] Fresh cabbage salad", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Chocolate Cake", price: 5.99, desc: "[Veg] Rich chocolate dessert", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Mike", rating: 4.1, text: "Great grilled chicken! Tender and flavorful.", date: "1 day ago" },
      { id: 2, name: "Sarah", rating: 3.9, text: "Good BBQ wings, but could be spicier.", date: "3 days ago" },
    ]
  },
  'Haleem House': {
    title: 'Haleem House',
    subtitle: 'Middle Eastern, Haleem, Traditional',
    rating: '4.6',
    deliveryTime: '50 mins',
    menuItems: [
      { id: 1, name: "Chicken Haleem", price: 7.99, desc: "[Non-Veg] Traditional slow-cooked haleem", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 2, name: "Mutton Haleem", price: 8.99, desc: "[Non-Veg] Rich mutton haleem", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 3, name: "Veg Haleem", price: 6.99, desc: "[Veg] Lentil-based vegetarian haleem", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 4, name: "Beef Haleem", price: 9.99, desc: "[Non-Veg] Premium beef haleem", image: "https://images.unsplash.com/photo-1563379091339-03246963d6a9?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 5, name: "Naan Bread", price: 2.99, desc: "[Veg] Fresh baked naan", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 6, name: "Pickled Onions", price: 1.99, desc: "[Veg] Spicy pickled onions", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Firni", price: 4.99, desc: "[Veg] Traditional rice pudding", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Ahmed", rating: 4.8, text: "Authentic haleem! Just like my grandmother used to make.", date: "1 day ago" },
      { id: 2, name: "Fatima", rating: 4.5, text: "Delicious and hearty meal. Perfect for cold weather.", date: "2 days ago" },
    ]
  },
  'Shawarma Express': {
    title: 'Shawarma Express',
    subtitle: 'Middle Eastern, Shawarma, Wraps',
    rating: '4.3',
    deliveryTime: '20 mins',
    menuItems: [
      { id: 1, name: "Chicken Shawarma", price: 6.99, desc: "[Non-Veg] Grilled chicken with tahini", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 2, name: "Beef Shawarma", price: 7.99, desc: "[Non-Veg] Spiced beef with garlic sauce", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 3, name: "Falafel Wrap", price: 5.99, desc: "[Veg] Chickpea patties with hummus", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 4, name: "Mixed Shawarma", price: 8.99, desc: "[Non-Veg] Chicken and beef combo", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&h=500&fit=crop&auto=format", isVeg: false },
      { id: 5, name: "Hummus", price: 3.99, desc: "[Veg] Creamy chickpea dip", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 6, name: "Baba Ganoush", price: 4.49, desc: "[Veg] Roasted eggplant dip", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Baklava", price: 5.99, desc: "[Veg] Sweet pastry with nuts", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Omar", rating: 4.4, text: "Fresh and delicious shawarma! The garlic sauce is amazing.", date: "4 hours ago" },
      { id: 2, name: "Layla", rating: 4.2, text: "Great falafel wrap and the hummus is perfect.", date: "1 day ago" },
    ]
  },
  'Green Garden': {
    title: 'Green Garden',
    subtitle: 'Vegetarian, Healthy, Organic',
    rating: '4.7',
    deliveryTime: '35 mins',
    menuItems: [
      { id: 1, name: "Quinoa Buddha Bowl", price: 11.99, desc: "[Veg] Quinoa with roasted vegetables", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 2, name: "Avocado Toast", price: 8.99, desc: "[Veg] Sourdough with avocado and seeds", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 3, name: "Kale Caesar Salad", price: 9.99, desc: "[Veg] Fresh kale with vegan dressing", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 4, name: "Sweet Potato Fries", price: 6.99, desc: "[Veg] Baked sweet potato fries", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 5, name: "Green Smoothie", price: 5.99, desc: "[Veg] Spinach, banana, and almond milk", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 6, name: "Acai Bowl", price: 7.99, desc: "[Veg] Acai with granola and fruits", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Chia Pudding", price: 4.99, desc: "[Veg] Coconut chia pudding", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Emma", rating: 4.8, text: "Amazing healthy food! The quinoa bowl is my favorite.", date: "6 hours ago" },
      { id: 2, name: "David", rating: 4.6, text: "Fresh ingredients and great taste. Perfect for health-conscious people.", date: "1 day ago" },
    ]
  },
  'Sweet Treats': {
    title: 'Sweet Treats',
    subtitle: 'Desserts, Cakes, Pastries',
    rating: '4.2',
    deliveryTime: '25 mins',
    menuItems: [
      { id: 1, name: "Chocolate Cake", price: 8.99, desc: "[Veg] Rich chocolate layer cake", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 2, name: "Red Velvet Cake", price: 9.99, desc: "[Veg] Classic red velvet with cream cheese", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 3, name: "Tiramisu", price: 7.99, desc: "[Veg] Italian coffee-flavored dessert", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 4, name: "Cheesecake", price: 6.99, desc: "[Veg] New York style cheesecake", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 5, name: "Apple Pie", price: 5.99, desc: "[Veg] Traditional apple pie", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 6, name: "Ice Cream Sundae", price: 4.99, desc: "[Veg] Vanilla ice cream with toppings", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Brownie", price: 3.99, desc: "[Veg] Fudgy chocolate brownie", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Sophie", rating: 4.3, text: "Delicious cakes! The chocolate cake is heavenly.", date: "3 hours ago" },
      { id: 2, name: "Tom", rating: 4.1, text: "Great desserts and quick delivery. Perfect for parties.", date: "1 day ago" },
    ]
  },
  'Amul': {
    title: 'Amul',
    subtitle: 'Desserts, Ice Cream, Beverages',
    rating: '4.2',
    deliveryTime: '20 mins',
    menuItems: [
      { id: 1, name: "Vanilla Ice Cream", price: 3.99, desc: "[Veg] Classic vanilla ice cream", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 2, name: "Chocolate Ice Cream", price: 4.49, desc: "[Veg] Rich chocolate ice cream", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 3, name: "Strawberry Ice Cream", price: 4.29, desc: "[Veg] Fresh strawberry ice cream", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 4, name: "Butterscotch Ice Cream", price: 4.79, desc: "[Veg] Creamy butterscotch flavor", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 5, name: "Chocolate Milkshake", price: 5.99, desc: "[Veg] Thick chocolate milkshake", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 6, name: "Vanilla Milkshake", price: 5.49, desc: "[Veg] Smooth vanilla milkshake", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop&auto=format", isVeg: true },
      { id: 7, name: "Chocolate Cake", price: 6.99, desc: "[Veg] Rich chocolate cake slice", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop&auto=format", isVeg: true }
    ],
    reviews: [
      { id: 1, name: "Priya", rating: 4.3, text: "Best ice cream in town! The chocolate flavor is amazing.", date: "2 hours ago" },
      { id: 2, name: "Rahul", rating: 4.1, text: "Creamy and delicious milkshakes. Perfect for hot days!", date: "1 day ago" },
    ]
  }
};

export default function RestaurantScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState("DELIVERY");
  const [quantities, setQuantities] = useState({});

  // Get restaurant data from route params or use default
  const restaurantTitle = route.params?.title || 'Eat Healthy';
  const restaurantData = RESTAURANT_MENUS[restaurantTitle] || RESTAURANT_MENUS['Eat Healthy'];
  const { menuItems, reviews, deliveryTime } = restaurantData;

  // Reset cart quantities when screen comes into focus (when returning from cart)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset quantities when returning to restaurant screen
      setQuantities({});
    });

    return unsubscribe;
  }, [navigation]);

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

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = menuItems.reduce(
    (sum, item) => sum + (quantities[item.id] || 0) * item.price,
    0
  );

  const getCartItems = () =>
    menuItems
      .filter((item) => quantities[item.id] > 0)
      .map((item) => ({ ...item, quantity: quantities[item.id] }));

  const navigateToCart = () => {
    const cartItems = getCartItems();
    navigation.navigate("Cart", {
      cartItems,
      restaurantName: restaurantData.title,
    });
  };

  const renderStars = (count) => (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Ionicons
          key={index}
          name={index < Math.round(count) ? "star" : "star-outline"}
          size={14}
          color={colors.warning}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Sticky Header */}
      <View style={[styles.header, { elevation: 3, shadowOpacity: 0.08 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, { fontSize: 22 }]}>{restaurantData.title}</Text>
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
                <Text style={styles.infoText}>{deliveryTime}</Text>
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
        <View style={[styles.cartBar, { elevation: 8, shadowOpacity: 0.15 }]}>
          <View>
            <Text style={styles.cartItemText}>{totalItems} ITEM</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.cartPrice, { fontSize: 16 }]}>£ {totalPrice.toFixed(2)}</Text>
              <Text style={styles.cartTaxes}> plus taxes</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.cartAction, { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }]}
            onPress={navigateToCart}
          >
            <Text style={[styles.cartActionText, { color: colors.primary, marginRight: 6 }]}>View Cart</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  ratingBox: { backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
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
    borderRadius: 6,
    marginBottom: 10,
    padding: 8,
    alignItems: "center",
  },
  itemImage: { width: 80, height: 80, borderRadius: 6, marginRight: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontWeight: "bold", fontSize: 14 },
  itemPrice: { color: colors.primary, fontWeight: "bold", marginVertical: 4 },
  itemDesc: { fontSize: 12, color: colors.textLight },

  addButton: { backgroundColor: colors.secondary, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4 },
  addText: { color: colors.textWhite, fontWeight: "bold" },

  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 4,
    paddingHorizontal: 5,
  },
  counterText: { color: colors.textWhite, fontWeight: "bold", fontSize: 18, paddingHorizontal: 6 },
  quantityText: { color: colors.textWhite, fontWeight: "bold", fontSize: 14, minWidth: 20, textAlign: "center" },

  cartBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
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
  reviewBox: { backgroundColor: colors.surface, padding: 10, borderRadius: 6, marginBottom: 10 },
  reviewName: { fontWeight: "bold", fontSize: 14, marginBottom: 4 },
  reviewText: { fontSize: 13, color: colors.textLight, marginVertical: 4 },
  reviewDate: { fontSize: 11, color: colors.textLight },
});
