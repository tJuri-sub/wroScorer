import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Button } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../../firebaseconfig";

export default function ProfileAdmin({ navigation }: any) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch the current user's email
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      setUserEmail(user.email); // Set the user's email
    }
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.text}> User: {userEmail || "Guest"}!</Text>
          <Button
            title="Logout"
            onPress={() => {
              FIREBASE_AUTH.signOut();
              navigation.navigate("LoginAdmin"); // Navigate to Login after logout
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