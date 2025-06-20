import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";

import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import styles from "../components/styles/AuthformStyle";
import SignUp from "./SignUpScreenAdmin";

type RootStackParamList = {
  SignUp: undefined;
  AdminScreen: undefined; // Add HomeAdmin to the route list
  LoginJudge: undefined; // Add LoginJudge to the route list
  // Add other screens here if needed
};

const LoginAdmin = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [email, setEmail] = useState("");
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
      const userDocRef = doc(FIREBASE_DB, "admin-users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          // Proceed to admin home screen
          navigation.navigate("AdminScreen");
        } else {
          // Not an admin, sign out and show error
          await FIREBASE_AUTH.signOut();
          alert("Access denied: Only admins can log in here.");
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
    }
    finally {
    setLoading(false);
    }
  };

  const signUp = () => {
    console.log("Navigating to SignUpScreenAdmin"); // Debugging line
    navigation.navigate("SignUp");
  };

  const loginJudge = () => {
    console.log("Navigating to LoginScreenJudge"); // Debugging line
    navigation.navigate("LoginJudge"); // Ensure this matches the route name in App.tsx
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLeftBlob} />
      <View style={styles.bottomRightBlob} />

      <View style={styles.widthForm}>
        <View style={styles.innerContainer}>
          <TouchableOpacity onPress={loginJudge} style={styles.backNav}>
            <AntDesign name="arrowleft" size={24} color="#852B88" />
            <Text style={styles.backText}>Login as scorer</Text>
          </TouchableOpacity>
          <View style={styles.titleBox}>
            <Text style={styles.title}>
              Login your <Text style={styles.highlight}>Admin Account</Text>
            </Text>
            <Text style={styles.subtitle}>
              Sign in with your account details.
            </Text>
          </View>
          <View style={styles.spacing}>
            <View style={styles.containerForm}>
              {/* Email */}
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
              <View>
                <TouchableOpacity>
                  <Text style={styles.forgotPass}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* Login Button */}
          {loading ? (
            <ActivityIndicator size="large" color="#00000" />
          ) : (
            <>
              <TouchableOpacity style={styles.signButton} onPress={signIn}>
                <Text style={styles.buttonText}>Sign in</Text>
              </TouchableOpacity>
            </>
          )}
          {/* Sign In Link */}
          <View style={styles.signUpbuttonContainer}>
            <Text style={{ fontSize: 16 }}>Don't you have an account? </Text>
            <TouchableOpacity onPress={signUp}>
              <Text style={styles.textlink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginAdmin;
