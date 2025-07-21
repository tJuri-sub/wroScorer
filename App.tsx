import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  StatusBar,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import Leaderboard from "./pages/Leaderboard";
import HomeScreen from "./pages/HomeScreen";
import HomeScreenAdmin from "./pages/admin/HomeScreen";
import Login from "./pages/LoginScreenAdmin";
import SignUp from "./pages/SignUpScreenAdmin";
import VerifyEmailScreen from "./pages/accountManage/VerifyEmailScreen";
import ProfileAdmin from "./pages/admin/Profile";
import CategoryScreen from "./pages/admin/CategoryScreen";
import LoginJudge from "./pages/LoginScreenJudge";
import CategoryScreenJudge from "./pages/CategoryScreen";
import ScorerScreen from "./pages/ScorerScreen";
import AllScoresScreen from "./pages/AllScoresScreen";
import TeamScoresScreen from "./pages/TeamScoresScreen";
import AllLeaderboardScreen from "./pages/AllLeaderboardScreen";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "./firebaseconfig";
import AllJudgesScreen from "./pages/admin/AllJudgesScreen";
import { AntDesign } from "@expo/vector-icons";
import JudgeDrawerNavigator from "./components/component/JudgeDrawerNavigator";
import { LogoutModalProvider } from "./components/component/LogoutModalContent";
import Scores from "./pages/admin/Scores";
import AllLeaderboard from "./pages/admin/Leaderboard";

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AdminTab = createBottomTabNavigator();

// Judge Bottom Tab Navigator
// const TabNavigator = () => (
//   <Tab.Navigator
//     screenOptions={{
//       headerShown: false,
//       tabBarStyle: {
//         height: 60,
//         paddingVertical: 5,
//       },
//       tabBarActiveTintColor: "#432344",
//     }}
//   >
//     <Tab.Screen
//       name="Home"
//       component={HomeScreen}
//       options={{
//         headerShown: true,
//         headerTitle: "ScoreBotics",
//         headerTitleAlign: "center",
//         tabBarIcon: ({ color, size }) => (
//           <Entypo name="home" size={size} color={color} />
//         ),
//       }}
//     />
//     <Tab.Screen
//       name="Leaderboard"
//       component={Leaderboard}
//       options={{
//         headerShown: true,
//         headerTitle: "Leaderboard",
//         headerTitleAlign: "center",
//         tabBarIcon: ({ color, size }) => (
//           <MaterialIcons name="leaderboard" size={size} color={color} />
//         ),
//       }}
//     />
//     <Tab.Screen
//       name="Scorer"
//       component={ScorerScreen}
//       options={{
//         headerShown: true,
//         headerTitle: "Scoreboard",
//         headerTitleAlign: "center",
//         tabBarIcon: ({ color, size }) => (
//           <MaterialIcons name="scoreboard" size={size} color={color} />
//         ),
//       }}
//     />
//   </Tab.Navigator>
// );

const JudgeInsideStackNavigator = () => (
  <InsideStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <InsideStack.Screen
      name="JudgeDrawer"
      component={JudgeDrawerNavigator}
      options={{ headerShown: false }}
    />
    <InsideStack.Screen name="Home" component={HomeScreen} />
    <InsideStack.Screen name="Leaderboard" component={Leaderboard} />
    <InsideStack.Screen
      name="AllLeaderboardScreen"
      component={AllLeaderboardScreen}
      options={({ navigation }) => ({
        headerShown: true,
        headerTitle: "Rankings",
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <AntDesign name="arrowleft" size={24} color="#432344" />
          </TouchableOpacity>
        ),
      })}
    />
    <InsideStack.Screen
      name="CategoryScreen"
      component={CategoryScreenJudge}
      options={{ headerShown: true }}
    />
    <InsideStack.Screen name="Scorer" component={ScorerScreen} />
    <InsideStack.Screen
      name="AllScoresScreen"
      component={AllScoresScreen}
      options={({ navigation }) => ({
        headerShown: true,
        headerTitle: "Profile",
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <AntDesign name="arrowleft" size={24} color="#432344" />
          </TouchableOpacity>
        ),
      })}
    />
    <InsideStack.Screen
      name="TeamScoresScreen"
      component={TeamScoresScreen}
      options={({ navigation }) => ({
        headerShown: true,
        headerTitle: "Team Scores",
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <AntDesign name="arrowleft" size={24} color="#432344" />
          </TouchableOpacity>
        ),
      })}
    />
  </InsideStack.Navigator>
);

// Admin Bottom Tab Navigator
const AdminTabNavigator = () => (
  <AdminTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: 60,
        paddingVertical: 5,
      },
      tabBarActiveTintColor: "#432344",
    }}
  >
    <AdminTab.Screen
      name="Home"
      component={HomeScreenAdmin}
      options={{
        headerShown: true,
        headerTitle: "Home Admin",
        headerTitleAlign: "center",
        tabBarIcon: ({ color, size }) => (
          <Entypo name="home" size={size} color={color} />
        ),
      }}
    />
    <AdminTab.Screen
      name="Ranks"
      component={AllLeaderboard}
      options={{
        headerShown: true,
        headerTitle: "Leaderboard",
        headerTitleAlign: "center",
        tabBarIcon: ({ color, size }) => (
           <MaterialIcons name="leaderboard" size={size} color={color} />
        ),
      }}
    />
    <AdminTab.Screen
      name="Profile"
      component={ProfileAdmin}
      options={{
        headerShown: true,
        headerTitle: "Profile",
        headerTitleAlign: "center",
        tabBarIcon: ({ color, size }) => (
          <FontAwesome name="user" size={size} color={color} />
        ),
      }}
    />
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
    <InsideStack.Screen name="AllLeaderboard" component={AllLeaderboard} />
    <InsideStack.Screen name="Category" component={CategoryScreen} />
    <InsideStack.Screen name="Judges" component={AllJudgesScreen} />
    <InsideStack.Screen name="Scores" component={Scores} />
  </InsideStack.Navigator>
);

export default function App() {
  const navigationRef = useNavigationContainerRef();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      console.log("Auth state changed:", user);
      setUser(user);

      if (user) {
        // Check admin-users first
        const adminDoc = doc(FIREBASE_DB, "admin-users", user.uid);
        const adminSnapshot = await getDoc(adminDoc);

        if (adminSnapshot.exists()) {
          const userData = adminSnapshot.data();
          setRole(userData.role); // should be "admin"
          setLoading(false);
          return;
        }

        // If not admin, check judge-users
        const judgeDoc = doc(FIREBASE_DB, "judge-users", user.uid);
        const judgeSnapshot = await getDoc(judgeDoc);

        if (judgeSnapshot.exists()) {
          const userData = judgeSnapshot.data();
          setRole(userData.role); // should be "judge"
        } else {
          setRole(null);
          console.error(
            "User document does not exist in admin-users or judge-users!"
          );
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && user && role && navigationRef.isReady()) {
      if (role === "admin") {
        navigationRef.reset({
          index: 0,
          routes: [{ name: "AdminScreen" }],
        });
      } else if (role === "judge") {
        navigationRef.reset({
          index: 0,
          routes: [{ name: "JudgeScreen" }],
        });
      }
    }
  }, [user, role, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#852B88" />
      </View>
    );
  }

  // Decide which screen to show first
  let initialRouteName = "LoginJudge";
  if (user) {
    if (role === "admin") initialRouteName = "AdminScreen";
    else if (role === "judge") initialRouteName = "JudgeScreen";
  }

  return (
    <LogoutModalProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar translucent={true} barStyle="light-content" />
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={initialRouteName}
        >
          {/* Always register all screens */}
          <Stack.Screen name="LoginJudge" component={LoginJudge} />
          <Stack.Screen
            name="JudgeScreen"
            component={JudgeInsideStackNavigator}
          />
          <Stack.Screen name="LoginAdmin" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen
            name="AdminScreen"
            component={AdminInsideStackNavigator}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LogoutModalProvider>
  );
}
