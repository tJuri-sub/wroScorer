// DrawerNavigator.tsx (admin)

import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawer from "./CustomDrawer"; // ✅ admin drawer
import AdminTabNavigator from "./AdminTabNavigator"; // ✅ admin tabs
import ProfileAdmin from "../../../pages/admin/Profile";

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ navigation }: any) => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Drawer.Screen
        name="ProfileAdmin"
        component={ProfileAdmin}
        options={{
          headerShown: true,
          headerTitle: "Profile",
          headerTitleAlign: "center",
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
