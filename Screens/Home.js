import { View, Text } from "react-native";
import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import ListProfils from "./Home/ListProfils";
import Groups from "./Home/Groups";
import MyAccount from "./Home/MyAccount";

const Tab = createMaterialBottomTabNavigator();
export default function Home(props) {
  const currentUserid = props.route.params.currentUserid;

  return (
    <Tab.Navigator>
      <Tab.Screen name="ListProfils" component={ListProfils} initialParams = {{currentUserid}}></Tab.Screen>
      <Tab.Screen name="Groups" component={Groups}></Tab.Screen>
      <Tab.Screen name="MyAccount" component={MyAccount} initialParams = {{currentUserid}}></Tab.Screen>
    </Tab.Navigator>
    
  );
}
