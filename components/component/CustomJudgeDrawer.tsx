// CustomJudgeDrawer.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import { DrawerContentScrollView } from "@react-navigation/drawer";

import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

export default function CustomJudgeDrawer({ navigation }: any) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  const user = FIREBASE_AUTH.currentUser;
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const ref = doc(FIREBASE_DB, "judge-users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUsername(data.username);
          setAvatarUrl(
            data.avatarUrl ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                user.email || "default"
              )}`
          );
        } else {
          setUsername(user.email || "Unknown");
        }
      }
    };
    fetchUser();
  }, [user]);

  return (
    <DrawerContentScrollView contentContainerStyle={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.profileSection}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.avatar}
          />
          <Text style={styles.name}>ScoreBotics</Text>
        </View>
        <View style={styles.menuSection}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              navigation.closeDrawer();
            }}
          >
            <Text style={styles.menuText}>Profile</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              navigation.closeDrawer();
            }}
          >
            <Text style={styles.menuText}>About Us</Text>
          </Pressable>
          {/* Logout */}
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              // Get the current route and call the openLogoutModal function if available
              const openLogoutModal = navigation
                .getParent()
                ?.getState()
                ?.routes?.find(
                  (r: { name: string; params?: any }) => r.name === "Tabs"
                )?.params?.openLogoutModal;
              if (typeof openLogoutModal === "function") {
                openLogoutModal();
                navigation.closeDrawer();
              } else {
                // fallback: direct sign out
                FIREBASE_AUTH.signOut();
                navigation.replace("LoginJudge");
              }
            }}
          >
            <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <Text>© 2025 Felta Multi-Media.</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 1,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    height: "100%",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#432344",
    fontFamily: "inter_400Regular",
  },
  email: {
    fontSize: 14,
    color: "#555",
  },
  menuSection: {
    paddingTop: 10,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "inter_400Regular",
  },

  buttonPressed: {
    backgroundColor: "#ddd",
  },
});
