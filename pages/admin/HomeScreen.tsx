import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Button,
  Alert,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import styles from "../../components/styles/adminStyles/HomescreenStyle";

import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseconfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function HomeScreenAdmin({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState(null);
  const [confirmpassword, setConfirmPassword] = useState("");
  interface JudgeUser {
    id: string;
    username: string;
    category: string;
    email: string;
  }

  const [judgeUsers, setJudgeUsers] = useState<JudgeUser[]>([]); // State to store judge users
  const [adminName, setAdminName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [lastLogin, setLastLogin] = useState<number | null>(null);

  // Initialize Firebase
  const auth = getAuth();
  const db = getFirestore();
  const user = FIREBASE_AUTH.currentUser;

  const categorydata = [
    {
      label: "Robo mission ",
      image: require("../../assets/images/RoboMissionLogo.png"),
      categoryDesc: "Autonomous robots solve challenges on competition field.",
      value: "robo-elem",
    },
    // { label: "Robomission Junior", value: "robo-junior" },
    // { label: "Robomission Senior", value: "robo-senior" },
    // { label: "Future Innovators", value: "future-innov" },
    // { label: "Future Engineers", value: "future-eng" },
  ];

  // Fetch admin profile info for header
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

  // Fetch judge users from Firestore
  useEffect(() => {
    const fetchJudgeUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "judge-users"));
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          username: doc.data().username || "",
          category: doc.data().category || "",
          email: doc.data().email || "",
        })) as JudgeUser[];
        setJudgeUsers(users);
      } catch (error) {
        console.error("Error fetching judge users:", error);
      }
    };

    fetchJudgeUsers();
  }, []);

  const createJudgeAccount = async () => {
    try {
      // Validate input fields
      if (!username.trim()) {
        Alert.alert("Error", "Username cannot be empty!");
        return;
      }
      if (!password.trim()) {
        Alert.alert("Error", "Password cannot be empty!");
        return;
      }
      if (password !== confirmpassword) {
        Alert.alert("Error", "Passwords do not match!");
        return;
      }
      if (!category) {
        Alert.alert("Error", "Please select a category!");
        return;
      }

      console.log("Selected category:", category);

      // Generate a email from username
      const email = `judge_${username}@felta.org`;

      // Save the currently logged-in admin user
      const currentAdmin = FIREBASE_AUTH.currentUser;

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Store username and category in Firestore
      const user = userCredential.user;
      await setDoc(doc(db, "judge-users", user.uid), {
        username,
        role: "judge", // Example: Assigning a 'judge' role
        category: category, // Store the selected category
        email,
      });

      // Sign out the newly created judge account
      await FIREBASE_AUTH.signOut();

      // Re-authenticate the admin user
      if (currentAdmin) {
        await FIREBASE_AUTH.updateCurrentUser(currentAdmin);
      }

      // Show success alert
      Alert.alert("Success", "Judge account created successfully!");

      // Reset form fields and close modal
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setCategory(null);
      setModalVisible(false);

      // Refresh the judge users list
      const querySnapshot = await getDocs(collection(db, "judge-users"));
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        username: doc.data().username || "",
        category: doc.data().category || "",
        email: doc.data().email || "",
      })) as JudgeUser[];
      setJudgeUsers(users);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
        console.error("Error creating judge account:", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred.");
        console.error("Error creating judge account:", error);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header with avatar, greeting, and name/email */}
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
              <Text style={styles.name}>{adminName}</Text>
            </View>
          </View>

          <Text style={styles.headerTexts}>Manage Team Categories</Text>

          {/* Manage Categories */}
          <View>
            <FlatList
              data={categorydata}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const [firstWord, ...restWords] = item.label.split(" ");
                const rest = restWords.join(" ");

                return (
                  <Pressable
                    style={styles.card}
                    onPress={() =>
                      navigation.navigate("CategoryScreen", {
                        category: item.value,
                        label: item.label,
                      })
                    }
                  >
                    <Image source={item.image} style={styles.sideImage} />
                    <View style={styles.text}>
                      <Text>
                        <Text style={styles.cardTextThin}>{firstWord}</Text>
                        <Text style={styles.cardText}>{rest}</Text>
                      </Text>
                      <Text style={styles.cardDesc}>{item.categoryDesc}</Text>
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={<Text>No categories found.</Text>}
            />
          </View>

          {/* Modal for Creating Judge Account */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.modal}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  {/* <Image
                    source={require("../../assets/images/user.png")}
                    style={styles.modalImage}
                  /> */}
                  <Text style={styles.headerTextModal}>
                    Create Judge Account
                  </Text>
                  <Text style={styles.headerSubTextModal}>
                    Create Judge's account and edit access
                  </Text>
                </View>

                <View style={styles.formContainer}>
                  <TextInput
                    placeholder="Username"
                    autoCapitalize="none"
                    onChangeText={(text) => setUsername(text)}
                    style={styles.textinput}
                  />

                  <TextInput
                    placeholder="Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    onChangeText={(text) => setPassword(text)}
                    style={styles.textinput}
                  />
                  <TextInput
                    placeholder="Confirm Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    onChangeText={(text) => setConfirmPassword(text)}
                    style={styles.textinput}
                  />
                  <Dropdown
                    style={styles.dropdown}
                    // placeholderStyle={styles.placeholderStyle}
                    // selectedTextStyle={styles.selectedTextStyle}
                    // inputSearchStyle={styles.inputSearchStyle}
                    data={categorydata}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Category"
                    searchPlaceholder="Search..."
                    value={category}
                    onChange={(item) => {
                      console.log("Dropdown selected:", item.value);
                      setCategory(item.value);
                    }}
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <Pressable
                    style={styles.modalCreateButton}
                    onPress={createJudgeAccount}
                  >
                    <Text style={styles.buttonText}>Create</Text>
                  </Pressable>

                  <Pressable
                    style={styles.modalCancelButton}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Text>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Text style={styles.headerTexts}>Manage Judges </Text>
          {/* Manage Judge Users */}
          <View>
            <FlatList
              data={judgeUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const categoryLabel =
                  categorydata.find((cat) => cat.value === item.category)
                    ?.label || item.category;

                return (
                  <View style={styles.judgesCard}>
                    <Image
                      source={{
                        uri:
                          avatarUrl ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                            user?.email || "default"
                          )}`,
                      }}
                      style={styles.judgesImage}
                    />
                    <View>
                      <Text style={styles.judgesName}>{item.username}</Text>
                      <Text style={styles.judgesEmail}>{item.email}</Text>
                      <Text style={styles.judgesCategory}>{categoryLabel}</Text>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={<Text>No judge users found.</Text>}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.addJudgeButton}
          onPress={() => setModalVisible(true)}
        >
          <AntDesign name="plus" size={25} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
