import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./src/view/auth/login";
import Home from "./src/view/home";
import SignUp from "./src/view/auth/signup";
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}