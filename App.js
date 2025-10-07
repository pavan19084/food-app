import "react-native-gesture-handler";
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// AUTH SCREENS (now modals on top of the app)
import Login from "./src/view/auth/login";
import SignUp from "./src/view/auth/signup";
import VerifyOtp from "./src/view/auth/VerifyOtp";
import ForgotPassword from "./src/view/auth/ForgotPassword";
import ResetPassword from "./src/view/auth/ResetPassword";

// APP SCREENS (publicly browsable)
import Home from "./src/view/home";
import Profile from "./src/view/profile";
import EditProfile from "./src/view/EditProfile";
import RestaurantScreen from "./src/view/restaurants/RestaurantScreen";
import CartScreen from "./src/view/restaurants/CartScreen";
import OrderConfirmationScreen from "./src/view/OrderConfirmationScreen";
import SavedAddressesScreen from "./src/view/SavedAddressesScreen";
import AddAddressScreen from "./src/view/AddAddressScreen";
import OrderHistoryScreen from "./src/view/OrderHistoryScreen";
import LocationModal from "./src/components/LocationModal";
import SplashScreen from "./src/components/SplashScreen";


import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { OrderProvider } from "./src/context/OrderContext";

const Stack = createStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* App routes (no login required to browse) */}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Restaurant" component={RestaurantScreen} />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ presentation: "card" }}
      />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
      <Stack.Screen name="AddAddressScreen" component={AddAddressScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="LocationModal" component={LocationModal} />

      {/* Auth modals */}
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtp}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);
  const { loading } = useAuth();

  const handleSplashFinish = () => {
    setSplashAnimationComplete(true);
  };

  // Show splash screen until both animation is complete AND auth loading is done
  const shouldShowSplash = showSplash && (!splashAnimationComplete || loading);

  React.useEffect(() => {
    if (splashAnimationComplete && !loading) {
      // Add a small delay before hiding splash to ensure smooth transition
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [splashAnimationComplete, loading]);

  if (shouldShowSplash) {
    return <SplashScreen onAnimationFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider onLoggedOut={() => {}}>
      <OrderProvider>
        <AppContent />
      </OrderProvider>
    </AuthProvider>
  );
}
