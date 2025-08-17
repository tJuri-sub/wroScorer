// CustomJudgeDrawer.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useLogoutModal } from "../LogoutModalContent"; // Adjust path if needed
import logoutModalStyles from "../../styles/logoutModalStyles";

import { FIREBASE_AUTH, FIREBASE_DB } from "../../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { Feather } from "@expo/vector-icons";

import { LogoutModal } from "../logoutModal";

export default function CustomJudgeDrawer({ navigation }: any) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    // Implement your logout logic here, e.g. FIREBASE_AUTH.signOut()
  };
  const { open } = useLogoutModal(handleLogout);

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
        <View style={styles.headerRow}>
          <Pressable
            style={styles.closeButton}
            onPress={() => navigation.closeDrawer()}
            hitSlop={10}
          >
            <Feather name="x" size={28} color="#432344" />
          </Pressable>
        </View>
        <View style={styles.Header}>
          <Image
            source={require("../../../assets/icon.png")}
            style={styles.avatar}
          />
          <Text style={styles.name}>ScoreBotics</Text>
        </View>
        <View>
          {/* <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              navigation.closeDrawer();
            }}
          >
            <Text style={styles.menuText}>Profile</Text>
          </Pressable> */}

          {/* <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              navigation.closeDrawer();
            }}
          >
            <Text style={styles.menuText}>About Us</Text>
          </Pressable> */}

          {/* Logout */}
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <Text style={styles.drawerFooter}>© 2025 Felta Multi-Media.</Text>
      </View>

      <LogoutModal
        show={showLogoutModal}
        close={() => setShowLogoutModal(false)}
        navigation={navigation}
        FIREBASE_AUTH={FIREBASE_AUTH}
        styles={logoutModalStyles}
        loginScreen="LoginJudge"
      />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: -10, // Pull up to align with header
  },
  closeButton: {
    padding: 6,
  },
  Header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#bab8b8",
  },
  avatar: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#432344",
    fontFamily: "inter_400Regular",
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#999999",
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "inter_400Regular",
  },

  buttonPressed: {
    backgroundColor: "#ddd",
  },

  drawerFooter: {
    fontFamily: "inter_400Regular",
    fontSize: 12,
  },
});
