import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import styles from "../components/styles/AuthformStyle";
import Login from "./LoginScreenAdmin";

type RootStackParamList = {
  SignUp: undefined;
  JudgeScreen: undefined; // Add HomeAdmin to the route list
  LoginAdmin: undefined; // Add LoginAdmin to the route list
  // Add other screens here if needed
};

const LoginJudge = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  ``;
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
      try {
      const userCredential = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user document
      const userDocRef = doc(FIREBASE_DB, "judge-users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "judge") {
          // Proceed to judge home screen
          navigation.navigate("JudgeScreen");
        } else {
          // Not a judge, sign out and show error
          await FIREBASE_AUTH.signOut();
          alert("Access denied: Only judges can log in here.");
        }
      } else {
        // User doc not found
        await FIREBASE_AUTH.signOut();
        alert("User profile not found.");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert("Login failed: " + error.message);
      } else {
        alert("Login failed: An unknown error occurred.");
      }
    } finally {
    setLoading(false);
    }
  };

  const loginAdmin = () => {
    console.log("Navigating to SignUpScreenAdmin"); // Debugging line
    navigation.navigate("LoginAdmin"); // Ensure this matches the route name in App.tsx
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLeftBlob} />
      <View style={styles.bottomRightBlob} />

      <View style={styles.widthForm}>
        <View style={styles.innerContainer}>
          <View style={styles.titleBox}>
            <Text style={styles.headtitle}>
              Hello
            </Text>
            <Text style={styles.title}>
              Login your <Text style={styles.highlight}>Judge Account</Text>
            </Text>
            <Text style={styles.subtitle}>
              Sign in with your account details.
            </Text>
          </View>
          {/* Email */}
          <View style={styles.spacing}>
            <View style={styles.containerForm}>
              <TextInput
                style={styles.input}
                value={email}
                placeholder="Email"
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
              ></TextInput>
              {/* Password */}
              <TextInput
                style={styles.input}
                secureTextEntry={true}
                value={password}
                placeholder="Password"
                autoCapitalize="none"
                onChangeText={(text) => setPassword(text)}
              ></TextInput>
            </View>
          </View>
          {/* Login Button */}
          {loading ? (
            <ActivityIndicator size="large" color="#0000f" />
          ) : (
            <>
              <TouchableOpacity style={styles.signButton} onPress={signIn}>
                <Text style={styles.buttonText}>Sign in</Text>
              </TouchableOpacity>
            </>
          )}
          {/* Navigate to Admin */}
          <View style={styles.signUpbuttonContainer}>
            <TouchableOpacity onPress={loginAdmin} style={styles.backNav}>
              <Text style={styles.textlink}>Login as Admin</Text>
              <AntDesign name="arrowright" size={24} color="#852B88" />
            </TouchableOpacity>

            
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginJudge;
