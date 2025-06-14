import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation, NavigationProp } from "@react-navigation/native";
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
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);

      // 🧭 Navigate to Admin Home Screen after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: "JudgeScreen" }], // this should match the route name in App.tsx
      });
    } catch (error: any) {
      console.log(error);
      alert("Login failed: " + error.message);
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
            <TouchableOpacity onPress={loginAdmin}>
              <Text style={styles.textlink}>Login as Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginJudge;
