import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// AUTH SCREENS (now modals on top of the app)
import Login from "./src/view/auth/login";
import SignUp from "./src/view/auth/signup";
import VerifyOtp from "./src/view/auth/VerifyOtp";

// APP SCREENS (publicly browsable)
import Home from "./src/view/home";
import Profile from "./src/view/profile";
import EditProfile from "./src/view/EditProfile";
import RestaurantScreen from "./src/view/restaurants/RestaurantScreen";
import CartScreen from "./src/view/restaurants/CartScreen";
import OrderConfirmationScreen from "./src/view/OrderConfirmationScreen";
import SavedAddressesScreen from "./src/view/SavedAddressesScreen";
import LocationModal from "./src/components/LocationModal";


import { AuthProvider } from "./src/context/AuthContext";
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
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider onLoggedOut={() => {}}>
      <OrderProvider>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </OrderProvider>
    </AuthProvider>
  );
}
