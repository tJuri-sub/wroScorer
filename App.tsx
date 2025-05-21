import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar, TouchableOpacity, Text } from "react-native";
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
import CategoryScreen from "./pages/admin/CategoryScreen";
import LoginJudge from "./pages/LoginScreenJudge";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { FIREBASE_DB } from "./firebaseconfig"; // Import your Firestore configuration


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
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
    </InsideStack.Navigator>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // State to store the user's role
  const [loading, setLoading] = useState(true); // State to handle loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      console.log("Auth state changed, user:", user);
      setUser(user);

      if (user) {
        // Fetch the user's role from Firestore
        const userDoc = doc(FIREBASE_DB, "users", user.uid); // Adjust the path to your Firestore collection
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setRole(userData.role); // Assuming the role is stored as "role" in Firestore
        } else {
          console.error("User document does not exist!");
        }
      } else {
        setRole(null);
      }

      setLoading(false); // Stop loading once the role is fetched
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  if (loading) {
    return <Text>Loading...</Text>; // Show a loading indicator while fetching the role
  }

  return (
    <NavigationContainer>
      <StatusBar translucent={true} barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
          role === "admin" ? (
            <Stack.Screen name="AdminScreen" component={AdminInsideStackNavigator} />
          ) : role === "judge" ? (
            <Stack.Screen name="JudgeScreen" component={JudgeInsideStackNavigator} />
          ) : (
            <Stack.Screen name="LoginJudge" component={LoginJudge} /> // Fallback if role is undefined
          )
        ) : (
          <>
            <Stack.Screen name="LoginJudge" component={LoginJudge} />
            <Stack.Screen name="JudgeScreen" component={JudgeInsideStackNavigator} />
            <Stack.Screen name="LoginAdmin" component={LoginAdmin} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
