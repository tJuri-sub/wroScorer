import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import TabNavigator from "../../App";
import { View, Text } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";

function AboutUsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>About Us</Text>
    </View>
  );
}

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Profile"
        onPress={() => props.navigation.navigate("Home")}
      />
      <DrawerItem
        label="About Us"
        onPress={() => props.navigation.navigate("AboutUs")}
      />
      <DrawerItem
        label="Logout"
        onPress={async () => {
          await FIREBASE_AUTH.signOut();
          props.navigation.replace("LoginJudge");
        }}
      />
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Drawer.Screen name="AboutUs" component={AboutUsScreen} />
    </Drawer.Navigator>
  );
}
