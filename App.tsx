import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar, Text } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Leaderboard from "./pages/Leaderboard";
import HomeScreen from "./pages/HomeScreen";
import HomeScreenAdmin from "./pages/admin/HomeScreen";
import Login from "./pages/LoginScreenAdmin";
import SignUp from "./pages/SignUpScreenAdmin";
import VerifyEmailScreen from "./pages/accountManage/VerifyEmailScreen";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseconfig";
import ProfileAdmin from "./pages/admin/Profile";
import CategoryScreen from "./pages/admin/CategoryScreen";
import LoginJudge from "./pages/LoginScreenJudge";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "./firebaseconfig";
import CategoryScreenJudge from "./pages/CategoryScreen";
import ScorerScreen from "./pages/ScorerScreen";

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AdminTab = createBottomTabNavigator();

// Judge Bottom Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      headerStyle: { height: 50 },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Leaderboard" component={Leaderboard} />
    <InsideStack.Screen name="Scorer" component={ScorerScreen} />
  </Tab.Navigator>
);

const JudgeInsideStackNavigator = () => (
  <InsideStack.Navigator>
    <InsideStack.Screen
      name="BottomTabs"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <InsideStack.Screen name="Home" component={HomeScreen} />
    <InsideStack.Screen name="Leaderboard" component={Leaderboard} />
    <InsideStack.Screen name="CategoryScreen" component={CategoryScreenJudge} />
    <InsideStack.Screen name="Scorer" component={ScorerScreen} />
  </InsideStack.Navigator>
);

// Admin Bottom Tab Navigator
const AdminTabNavigator = () => (
  <AdminTab.Navigator screenOptions={{ headerShown: false }}>
    <AdminTab.Screen name="HomeAdmin" component={HomeScreenAdmin} />
    <AdminTab.Screen name="Profile" component={ProfileAdmin} />
    {/* <AdminTab.Screen name="Logs" component={LogsAdmin} /> */}
  </AdminTab.Navigator>
);

const AdminInsideStackNavigator = () => (
  <InsideStack.Navigator>
    <InsideStack.Screen
      name="BottomTabsAdmin"
      component={AdminTabNavigator}
      options={{ headerShown: false }}
    />
    <InsideStack.Screen name="HomeAdmin" component={HomeScreenAdmin} />
    <InsideStack.Screen name="ProfileAdmin" component={ProfileAdmin} />
    <InsideStack.Screen name="CategoryScreen" component={CategoryScreen} />
  </InsideStack.Navigator>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      setUser(user);

      if (user) {
        const userDoc = doc(FIREBASE_DB, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setRole(userData.role);
        } else {
          console.error("User document does not exist!");
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  // Decide which screen to show first
  let initialRouteName = "LoginJudge";
  if (user) {
    if (role === "admin") initialRouteName = "AdminScreen";
    else if (role === "judge") initialRouteName = "JudgeScreen";
  }

  return (
    <NavigationContainer>
      <StatusBar translucent={true} barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName}
      >
        {/* Always register all screens */}
        <Stack.Screen name="LoginJudge" component={LoginJudge} />
        <Stack.Screen name="JudgeScreen" component={JudgeInsideStackNavigator} />
        <Stack.Screen name="LoginAdmin" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        <Stack.Screen name="AdminScreen" component={AdminInsideStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}