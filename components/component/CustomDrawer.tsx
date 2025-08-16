// CustomJudgeDrawer.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useLogoutModal } from "./LogoutModalContent"; // Adjust path if needed

import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { Feather } from "@expo/vector-icons";

export default function CustomDrawer({ navigation }: any) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  const [adminName, setAdminName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("Hello");
  const [lastLogin, setLastLogin] = useState<number | null>(null);

  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      navigation.replace("LoginAdmin"); // or navigation.navigate("LoginAdmin")
    } catch (e) {
      // Optionally show an error
      alert("Logout failed. Please try again.");
    }
  };

  const { open } = useLogoutModal(handleLogout);

  const user = FIREBASE_AUTH.currentUser;
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const ref = doc(FIREBASE_DB, "admin-users", user.uid);
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        if (user.email) {
          const userDoc = await getDoc(
            doc(FIREBASE_DB, "admin-users", user.email)
          );
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAdminName(data.name || user.email);
            setAvatarUrl(
              data.avatarUrl ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                  user.email
                )}`
            );
            setLastLogin(data.lastLogin || null);
            // Greeting logic
            if (
              data.lastLogin &&
              Date.now() - data.lastLogin < 24 * 60 * 60 * 1000
            ) {
              setGreeting("Welcome back");
            } else {
              const hour = new Date().getHours();
              if (hour < 12) setGreeting("Good morning");
              else if (hour < 18) setGreeting("Good afternoon");
              else setGreeting("Good evening");
            }
          } else {
            setAdminName(user.email);
            setAvatarUrl(
              `https://avatars.dicebear.com/api/identicon/${user.email}.svg`
            );
          }
        }
      }
    };
    fetchProfile();
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

        <View style={styles.header}>
          <Image
            source={{
              uri:
                avatarUrl ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                  user?.email || "default"
                )}`,
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>{greeting}!</Text>
            <Text style={styles.email}>{adminName}</Text>
          </View>
        </View>
        <View>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              navigation.navigate("AdminTabs", { screen: "HomeAdmin" });
              navigation.closeDrawer(); // <--- optional, for better UX
            }}
          >
            <Text style={styles.menuText}>Home</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              navigation.navigate("ProfileAdmin");
              navigation.closeDrawer(); // <--- optional, for better UX
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
            <Text style={styles.menuText}>Judges</Text>
          </Pressable>

          {/* Logout */}
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.buttonPressed,
            ]}
            onPress={async () => {
              await handleLogout();
              navigation.closeDrawer();
            }}
          >
            <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <Text style={styles.drawerFooter}>© 2025 Felta Multi-Media.</Text>
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

  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 15,
    width: "100%",
    paddingVertical: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#999999",
  },

  avatar: {
    height: "100%",
    aspectRatio: 1 / 1,
    borderRadius: "50%",
    borderWidth: 1,
  },

  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
    marginBottom: 3,
  },

  email: {
    fontSize: 16,
    color: "#852B88",
    fontFamily: "inter_400Regular",
    marginTop: 3,
  },
});
