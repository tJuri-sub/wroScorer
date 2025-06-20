import React, { useState, useEffect } from "react";
import {
  Text,
  View,
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
import { useFocusEffect } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Dimensions } from "react-native";
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

const { height: screenHeight } = Dimensions.get("window");
const { width: screenWidth } = Dimensions.get("window");

async function updateJudgeAvatars() {
  const db = getFirestore();
  const querySnapshot = await getDocs(collection(db, "judge-users"));
  querySnapshot.forEach(async (judgeDoc) => {
    const data = judgeDoc.data();
    if (!data.avatarUrl && data.username) {
      const avatarUrl = getRandomAvatar(data.username);
      await updateDoc(doc(db, "judge-users", judgeDoc.id), { avatarUrl });
    }
  });
}

function getRandomAvatar(username: string): string {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
    username
  )}`;
}


export default function HomeScreenAdmin({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState(null);
  type CategoryType = typeof categorydata[number];
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [robomissionModalVisible, setRobomissionModalVisible] = useState(false);
    const [futureInnovatorsModalVisible, setFutureInnovatorsModalVisible] =
      useState(false);
  const [confirmpassword, setConfirmPassword] = useState("");
  interface JudgeUser {
    id: string;
    username: string;
    category: string;
    email: string;
    avatarUrl: string;
    createdAt?: any; // Add createdAt property, type can be improved if needed
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
      label: "Robomission",
      value: "robomission",
      image: require("../../assets/images/RoboMissionLogo.png"),
      categoryDesc:
        "Build and program a robot that solves tasks on playing field",
      subcategories: [
        { label: "Elementary", value: "robo-elem" },
        { label: "Junior", value: "robo-junior" },
        { label: "Senior", value: "robo-senior" },
      ],
    },
    {
      label: "Robosports",
      value: "robosports",
      image: require("../../assets/images/RoboSportsLogo.png"),
      categoryDesc: "Teams compete with 2 robots in an exciting game",
    },

    {
      label: "Future Innovators",
      value: "future-innovators",
      image: require("../../assets/images/FutureILogo.png"),
      categoryDesc: "Work on project and design and build a robot",
      subcategories: [
        { label: "Elementary", value: "fi-elem" },
        { label: "Junior", value: "fi-junior" },
        { label: "Senior", value: "fi-senior" },
      ],
    },
    {
      label: "Future Engineers",
      value: "future-eng",
      image: require("../../assets/images/FutureELogo.png"),
      categoryDesc: "Advanced robotics following current research trends",
    },
  ];

  function getCategoryDisplayLabel(categoryValue: string) {
  for (const mainCat of categorydata) {
    if (mainCat.value === categoryValue) {
      return mainCat.label;
    }
    if (mainCat.subcategories) {
      const sub = mainCat.subcategories.find(subcat => subcat.value === categoryValue);
      if (sub) {
        return `${mainCat.label} ${sub.label}`;
      }
    }
  }
  return categoryValue;
}

    useFocusEffect(
    React.useCallback(() => {
      const fetchAdminAvatar = async () => {
        const user = FIREBASE_AUTH.currentUser;
        if (user && user.email) {
          const userDoc = await getDoc(doc(FIREBASE_DB, "admin-users", user.email));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAvatarUrl(
              data.avatarUrl ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                  user.email
                )}`
            );
          }
        }
      };
      fetchAdminAvatar();
    }, [])
  );

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
          avatarUrl: doc.data().avatarUrl || getRandomAvatar(doc.data().username || ""),
          createdAt: doc.data().createdAt, // Add createdAt from Firestore
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
      if (
        !category ||
        (["Robomission", "Future Innovators"].includes(
          (categorydata.find((cat: any) => cat.value === category)?.label || "")
        ) && !subcategory)
      ) {
        Alert.alert("Error", "Please select a category and subcategory!");
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

      
      // Update the user's profile with the avatar URL
      const avatarUrl = getRandomAvatar(username);

      // Store username and category in Firestore
      const user = userCredential.user;
      await setDoc(doc(db, "judge-users", user.uid), {
        username,
        role: "judge", // Example: Assigning a 'judge' role
        category: subcategory || category, // Store the selected category
        email: email.toLowerCase(), // always store as lowercase
        avatarUrl,
        createdAt: new Date(),
      });

      await setDoc(doc(db, "users", user.uid), {
        role: "judge",
        email: email.toLowerCase(),
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
      setSubcategory(null); 
      setModalVisible(false);

      // Refresh the judge users list
      const querySnapshot = await getDocs(collection(db, "judge-users"));
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        username: doc.data().username || "",
        category: doc.data().category || "",
        email: doc.data().email || "",
        avatarUrl: doc.data().avatarUrl || getRandomAvatar(doc.data().username || ""),
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

  const cardWidth = screenWidth * 0.9;
  const cardGap = 16;
  const snapInterval = cardWidth + cardGap;

  const sortedJudges = [...judgeUsers].sort(
  (a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.()
  );
  const latestJudges = sortedJudges.slice(0, 5);

  return (
    <SafeAreaProvider>

      {/* Robomission Modal */}
      <Modal
        visible={robomissionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRobomissionModalVisible(false)}
      >
        <View style={styles.modalOverlayCat}>
          <View style={styles.modalContentCat}>
            {/* Top-right cancel icon */}
            <Pressable
              style={styles.modalCloseIcon}
              onPress={() => setRobomissionModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </Pressable>

            {/* Modal Title */}
            <Text style={styles.modalTitleCat}>Robomission Categories</Text>

            {/* Buttons */}
            {categorydata[0].subcategories?.map((sub) => (
              <Pressable
                key={sub.value}
                style={styles.modalButtonCat}
                onPress={() => {
                  setRobomissionModalVisible(false);
                  navigation.navigate("Category", {
                    category: sub.value,
                    label: `Robomission ${sub.label}`,
                    
                  });
                }}
              >
                <Text style={styles.modalButtonTextCat}>{sub.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Future Innovators Modal */}
      <Modal
        visible={futureInnovatorsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFutureInnovatorsModalVisible(false)}
      >
        <View style={styles.modalOverlayCat}>
          <View style={styles.modalContentCat}>
            {/* Top-right cancel icon */}
            <Pressable
              style={styles.modalCloseIcon}
              onPress={() => setFutureInnovatorsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </Pressable>

            {/* Modal Title */}
            <Text style={styles.modalTitleCat}>
              Future Innovators Categories
            </Text>

            {/* Buttons */}
            {categorydata[2].subcategories?.map((sub) => (
              <Pressable
                key={sub.value}
                style={[styles.modalButtonCat, { backgroundColor: "#B01956" }]}
                onPress={() => {
                  setFutureInnovatorsModalVisible(false);
                  navigation.navigate("Category", {
                    category: sub.value,
                    label: `Future Innovators ${sub.label}`,
                   
                  });
                }}
              >
                <Text style={styles.modalButtonTextCat}>{sub.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

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
              keyExtractor={(item) => item.label}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              renderItem={({ item }) => {
                const categoryColors: Record<string, string> = {
                    Robomission: "#E79300", // Orange
                    Robosports: "#35A22F", // Green
                    "Future Innovators": "#B01956", // Pink
                    "Future Engineers": "#0270AA", // Blue
                  };

                const cardColor = categoryColors[item.label] || "#333";
                const [firstWord, ...restWords] = item.label.split(" ");
                const rest = restWords.join(" ");

                return (
                  <Pressable
                    style={[styles.card, { backgroundColor: cardColor }]}
                    onPress={() =>{
                      if (item.label === "Robomission") {
                          setRobomissionModalVisible(true);
                        } else if (item.label === "Future Innovators") {
                          setFutureInnovatorsModalVisible(true);
                        } else {
                          navigation.navigate("Category", {
                            category: item.value,
                            label: item.label,
                          });
                        }
                    }}
                  >
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons
                          name="dots-vertical"
                          size={24}
                          color="white"
                        />
                    </View>
                    <Image source={item.image} style={styles.sideImage} />
                    <View style={styles.text}>
                      <Text>
                        <Text style={styles.cardTextThin}>{firstWord}</Text>
                        <Text
                          style={styles.cardText}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {rest}
                        </Text>
                      </Text>
                      <Text
                        style={styles.cardDesc}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.categoryDesc}
                      </Text>
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
            aria-hidden={false}
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
                    placeholder="Name"
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
                      setCategory(item.value);
                      // Reset subcategory if not Robomission or Future Innovators
                      if (!item.subcategories) setSubcategory(null);
                    }}
                  />
                  {["Robomission", "Future Innovators"].includes(
                    categorydata.find((cat: any) => cat.value === category)?.label || ""
                  ) && (
                    <Dropdown
                      style={styles.dropdown}
                      data={
                        categorydata.find((cat: any) => cat.value === category)?.subcategories || []
                      }
                      labelField="label"
                      valueField="value"
                      placeholder="Select Subcategory"
                      value={subcategory}
                      onChange={(item) => setSubcategory(item.value)}
                    />
                  )}
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

          {/* Manage Judge Users */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={styles.headerTexts}>Manage Judges</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Judges")}>
              <Text style={{ color: "#6c63ff" }}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: screenHeight * 1 }}>
            <FlatList
              data={latestJudges}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              // horizontal={true}
              // showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const categoryLabel = getCategoryDisplayLabel(item.category);

                return (
                  <View style={styles.judgesCard}>
                   <Image source={{ uri: item.avatarUrl || getRandomAvatar(item.username) }} style={styles.judgesImage} />
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
