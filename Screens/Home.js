import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import ListProfils from "./Home/ListProfils";
import Groups from "./Home/Groups";
import MyAccount from "./Home/MyAccount";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Tab = createMaterialBottomTabNavigator();

export default function Home(props) {
  const currentUserid = props.route.params.currentUserid;

  return (
    <Tab.Navigator
      barStyle={{
        backgroundColor: "#075E54",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
        borderTopWidth: 0,
        height: 65,
      }}
      activeColor="#FFFFFF"
      inactiveColor="#88E4FF"
      labeled={true}
      shifting={true}
    >
      <Tab.Screen
        name="ListProfils"
        component={ListProfils}
        initialParams={{ currentUserid }}
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat" color={color} size={24} />
          ),
          //when active different color
          tabBarColor: "#075E54",
        }}
      ></Tab.Screen>

      <Tab.Screen
        name="Groups"
        component={Groups}
        initialParams={{ currentUserid: currentUserid }}
        options={{
          tabBarLabel: "Groups",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-group"
              color={color}
              size={24}
            />
          ),

          tabBarColor: "#0E8A7C",
        }}
      ></Tab.Screen>

      <Tab.Screen
        name="MyAccount"
        component={MyAccount}
        initialParams={{ currentUserid }}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-circle"
              color={color}
              size={24}
            />
          ),
          tabBarColor: "#0A766B",
        }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
}
