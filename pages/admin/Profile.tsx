import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Button, TouchableOpacity, Image, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileAdmin({ navigation }: any) {
  const user = FIREBASE_AUTH.currentUser;
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState<string>("");

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setUserEmail(user.email);
        const userDoc = await getDoc(doc(FIREBASE_DB, "admin-users", user.email!));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.name || "");
          setAvatarUrl(
            data.avatarUrl ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || "default")}`
          );
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Pick image from gallery or camera
  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
      // Save to Firestore
      if (user) {
        await updateDoc(doc(FIREBASE_DB, "admin-users", user.email!), {
          avatarUrl: result.assets[0].uri,
        });
      }
    }
  };

  // Edit profile (username)
  const handleSaveProfile = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Username cannot be empty.");
      return;
    }
    if (user) {
      await updateDoc(doc(FIREBASE_DB, "admin-users", user.email!), {
        name: newUsername,
      });
      setUsername(newUsername);
      setEditModalVisible(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>Profile</Text>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  avatarUrl ||
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userEmail || "default")}`,
              }}
              style={styles.avatar}
            />
            {/* Edit Avatar Button */}
            <TouchableOpacity style={styles.editAvatarBtn} onPress={pickAvatar}>
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.username}>{username}</Text>
          <View style={styles.emailPill}>
            <Text style={styles.emailText}>{userEmail}</Text>
          </View>

          {/* Profile Options */}
          <View style={styles.optionsCard}>
            {/* Edit Profile */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setNewUsername(username);
                setEditModalVisible(true);
              }}
            >
              <Ionicons name="pencil-outline" size={20} color="#6c63ff" />
              <Text style={styles.optionText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
            {/* Change Password */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => navigation.navigate("ChangePassword")}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#6c63ff" />
              <Text style={styles.optionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
            {/* Logout */}
            <TouchableOpacity
              style={[styles.optionRow, { borderBottomWidth: 0 }]}
              onPress={() => {
                FIREBASE_AUTH.signOut();
                navigation.navigate("LoginAdmin");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#d9534f" />
              <Text style={[styles.optionText, { color: "#d9534f" }]}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#d9534f" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>Edit Profile</Text>
              <TextInput
                placeholder="Username"
                value={newUsername}
                onChangeText={setNewUsername}
                style={styles.input}
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
                <View style={{ width: 10 }} />
                <Button title="Save" onPress={handleSaveProfile} />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f4f4" },
  profileCard: {
    margin: 16,
    marginTop: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6c63ff",
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8e44ad",
    marginBottom: 6,
  },
  emailPill: {
    backgroundColor: "#e0d7fa",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  emailText: {
    color: "#6c63ff",
    fontWeight: "bold",
    fontSize: 14,
  },
  optionsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    marginTop: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 300,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
});