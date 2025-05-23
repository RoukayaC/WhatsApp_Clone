import React from "react";
import Auth from "./Screens/Auth";
import NewUser from "./Screens/NewUser";
import Home from "./Screens/Home";
import Chat from "./Screens/Chat";
import GroupChat from "./Screens/GroupChat";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen
          name="NewUser"
          component={NewUser}
          options={{ headerShown: true }}
        />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="GroupChat" component={GroupChat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
