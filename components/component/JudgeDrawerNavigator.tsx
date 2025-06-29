import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import CustomJudgeDrawer from "./CustomJudgeDrawer"; // optional
import TabNavigator from "./TabNavigator"; // where you define the bottom tabs

const Drawer = createDrawerNavigator();

export default function JudgeDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomJudgeDrawer {...props} />}
    >
      <Drawer.Screen name="Tabs" component={TabNavigator} />
    </Drawer.Navigator>
  );
}
