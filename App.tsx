import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Leaderboard from "./pages/Leaderboard";
import HomeScreen from "./pages/HomeScreen";
import HomeScreenAdmin from "./pages/admin/HomeScreen";
import LoginAdmin from "./pages/LoginScreenAdmin";
import SignUp from "./pages/SignUpScreenAdmin";
import VerifyEmailScreen from "./pages/accountManage/VerifyEmailScreen";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseconfig";
import ProfileAdmin from "./pages/admin/Profile";


const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AdminTab = createBottomTabNavigator();


//Judge Bottom Tab Navigator
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

const JudgeInsideStackNavigator = () => {
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

//Admin Bottom Tab Navigator
const AdminTabNavigator = () => {
  return (
    <AdminTab.Navigator screenOptions={{ headerShown: false }}>
      <AdminTab.Screen name="HomeAdmin" component={HomeScreenAdmin} />
      <AdminTab.Screen name="Profile" component={ProfileAdmin} />
      {/* <AdminTab.Screen name="Logs" component={LogsAdmin} /> */}
    </AdminTab.Navigator>
  );
};

const AdminInsideStackNavigator = () => {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen 
        name="BottomTabsAdmin"
        component={AdminTabNavigator}
        options={{ headerShown: false }}
      />
      <InsideStack.Screen name="HomeAdmin" component={HomeScreenAdmin}/>
      <InsideStack.Screen name="ProfileAdmin" component={ProfileAdmin}/>
    </InsideStack.Navigator>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('Auth state changed, user:', user);
      setUser(user);
    });
  }, [])

  return (
    <NavigationContainer>
      <StatusBar translucent={true} barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="AdminScreen" component={AdminInsideStackNavigator} />
        ) : (
          <>
            <Stack.Screen name="LoginAdmin" component={LoginAdmin} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
