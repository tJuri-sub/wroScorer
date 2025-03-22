import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import Ranks from "./pages/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar translucent={true} barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Leaderboards" component={Ranks} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
