import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Font from "expo-font";
import SignUp from "./SignUpScreenAdmin";

type RootStackParamList = {
  SignUp: undefined;
  AdminScreen: undefined; // Add HomeAdmin to the route list
  // Add other screens here if needed
};

const LoginAdmin = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Inter: require("../assets/fonts/Inter-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);

      // 🧭 Navigate to Admin Home Screen after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: "AdminScreen" }], // this should match the route name in App.tsx
      });
    } catch (error: any) {
      console.log(error);
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = () => {
    console.log("Navigating to SignUpScreenAdmin"); // Debugging line
    navigation.navigate("SignUp");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLeftBlob} />
      <View style={styles.bottomRightBlob} />

      <View style={styles.innerContainer}>
        <TouchableOpacity style={styles.backNav}>
          <AntDesign name="arrowleft" size={24} color="#852B88" />
          <Text style={styles.backText}>Login as scorer</Text>
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={styles.title}>
            Log your <Text style={styles.highlight}>Admin Account</Text>
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
            <TouchableOpacity style={styles.signinButton} onPress={signIn}>
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
  );
};

export default LoginAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter",
  },

  topLeftBlob: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 250,
    height: 250,
    backgroundColor: "#852B88",
    borderBottomRightRadius: 250,
    zIndex: -1,
  },

  bottomRightBlob: {
    position: "absolute",
    bottom: -50,
    right: -60,
    width: 200,
    height: 200,
    backgroundColor: "#852B88",
    borderTopLeftRadius: 200,
    zIndex: -1,
  },

  innerContainer: {
    justifyContent: "flex-start",
  },

  spacing: {
    marginTop: 10,
    marginBottom: 10,
  },

  backNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    marginBottom: 20,
  },

  backText: {
    color: "#852B88",
    fontSize: 16,
  },

  titleBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 16,
  },

  highlight: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#740D77",
  },

  containerForm: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
  },

  input: {
    height: 46,
    width: "100%",
    margin: 12,
    padding: 10,
    backgroundColor: "#f7f7f7",
    fontSize: 16,
    borderRadius: 5,
    borderColor: "#f7f7f7",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignSelf: "center",
  },

  forgotPass: {
    alignSelf: "flex-end",
    textDecorationLine: "underline",
    textDecorationColor: "#852B88",
    color: "#852B88",
    fontSize: 16,
  },

  signinButton: {
    width: "100%",
    height: 47,
    backgroundColor: "#211022",
    borderRadius: 5,
    alignSelf: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
  },

  signUpbuttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  textlink: {
    color: "#852B88",
    fontSize: 16,
  },
});
