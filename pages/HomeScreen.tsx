import { Text, StyleSheet, View, Button } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../firebaseconfig";
import Login from "./LoginScreenAdmin";

export default function HomeScreen({ navigation }: any) {
  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.text}>Hello!</Text>
          <Button
            title="Logout"
            onPress={() => {
              FIREBASE_AUTH.signOut();
              navigation.navigate("Login"); // Navigate to Login after logout
            }}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensure SafeAreaView takes up the full screen
  },
  container: {
    flex: 1, // Ensure the container fills the SafeAreaView
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    marginHorizontal: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20, // Add spacing between the text and the button
  },
});