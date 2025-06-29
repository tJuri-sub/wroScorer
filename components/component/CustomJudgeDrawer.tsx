// CustomJudgeDrawer.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

export default function CustomJudgeDrawer({ navigation }: any) {
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
      <View style={styles.profileSection}>
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
        <Text style={styles.name}>Judge {username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menuSection}>
        {/* Example navigation item (optional) */}
        <Pressable
          style={styles.menuItem}
          onPress={() => {
            navigation.closeDrawer();
            navigation.navigate("AllLeaderboardScreen");
          }}
        >
          <Text style={styles.menuText}>View Rankings</Text>
        </Pressable>

        {/* Logout */}
        <Pressable
          style={styles.menuItem}
          onPress={() => {
            FIREBASE_AUTH.signOut();
            navigation.replace("LoginJudge");
          }}
        >
          <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#432344",
  },
  email: {
    fontSize: 14,
    color: "#555",
  },
  menuSection: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 20,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 16,
  },
});
