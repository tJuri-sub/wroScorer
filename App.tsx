import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Leaderboard from "./pages/Leaderboard";
import HomeScreen from "./pages/HomeScreen";
import Login from "./pages/LoginScreen";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseconfig";

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const InsideStackNavigator = () => {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen 
        name="BottomTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <InsideStack.Screen name="Home" component={HomeScreen}/>
      <InsideStack.Screen name="Leaderboard" component={Leaderboard}/>
    </InsideStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        headerStyle: { height: 50 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Leaderboard" component={Leaderboard} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user);
    });
  }, [])

  return (
    <NavigationContainer>
      <StatusBar translucent={true} barStyle="light-content" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
        <Stack.Screen name="Inside" component={InsideStackNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
