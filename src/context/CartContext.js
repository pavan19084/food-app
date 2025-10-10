import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

const CART_STORAGE_KEY = '@food_app_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    restaurantId: null,
    restaurantName: null,
    restaurantImage: null,
    restaurantData: null,
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveCart();
    }
  }, [cart]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      setCart({
        restaurantId: null,
        restaurantName: null,
        restaurantImage: null,
        restaurantData: null,
        items: [],
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const addToCart = (item, restaurantInfo) => {
    // If adding from a different restaurant, clear the cart first
    if (cart.restaurantId && cart.restaurantId !== restaurantInfo.restaurantId) {
      setCart({
        restaurantId: restaurantInfo.restaurantId,
        restaurantName: restaurantInfo.restaurantName,
        restaurantImage: restaurantInfo.restaurantImage,
        restaurantData: restaurantInfo.restaurantData,
        items: [{ ...item, quantity: 1 }],
      });
      return;
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...cart.items];
      updatedItems[existingItemIndex].quantity += 1;
      setCart({
        ...cart,
        items: updatedItems,
      });
    } else {
      // Add new item
      setCart({
        restaurantId: restaurantInfo.restaurantId,
        restaurantName: restaurantInfo.restaurantName,
        restaurantImage: restaurantInfo.restaurantImage,
        restaurantData: restaurantInfo.restaurantData,
        items: [...cart.items, { ...item, quantity: 1 }],
      });
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.items.find((item) => item.id === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      // Decrease quantity
      const updatedItems = cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCart({
        ...cart,
        items: updatedItems,
      });
    } else {
      // Remove item completely
      const updatedItems = cart.items.filter((item) => item.id !== itemId);
      
      // If no items left, clear the cart completely
      if (updatedItems.length === 0) {
        clearCart();
      } else {
        setCart({
          ...cart,
          items: updatedItems,
        });
      }
    }
  };

  const getItemQuantity = (itemId) => {
    const item = cart.items.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItems = () => {
    return cart.items.map((item) => ({
      ...item,
    }));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        removeFromCart,
        clearCart,
        getItemQuantity,
        getTotalItems,
        getTotalPrice,
        getCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};