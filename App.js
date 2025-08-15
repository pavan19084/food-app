import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./src/view/auth/login";
import Home from "./src/view/home";
import SignUp from "./src/view/auth/signup";
import Profile from "./src/view/profile";
import EditProfile from './src/view/EditProfile';
import RestaurantScreen from "./src/view/restaurants/RestaurantScreen";
import CartScreen from "./src/view/restaurants/CartScreen";
import OrderConfirmationScreen from "./src/view/OrderConfirmationScreen";
import SavedAddressesScreen from "./src/view/SavedAddressesScreen";
import LocationModal from "./src/components/LocationModal";
import "./global.css"


const Stack = createStackNavigator();

export default function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{headerShown: false}}
        />
        <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{headerShown: false}}
        />
        <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
        />
        <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
        />
        <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{headerShown: false}}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' }
          }}
        />
        <Stack.Screen
          name="Restaurant"
          component={RestaurantScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SavedAddresses"
          component={SavedAddressesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LocationModal"
          component={LocationModal}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}