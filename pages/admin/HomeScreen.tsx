import React, { useState, useEffect, useLayoutEffect } from "react";
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
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Dimensions } from "react-native";
import styles from "../../components/styles/adminStyles/HomescreenStyle";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";

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
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Feather } from "@expo/vector-icons";

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
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  type CategoryType = (typeof categorydata)[number];
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
    disabled?: boolean; // Add disabled property
  }

  const [judgeUsers, setJudgeUsers] = useState<JudgeUser[]>([]); // State to store judge users
  const [adminName, setAdminName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [lastLogin, setLastLogin] = useState<number | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editJudge, setEditJudge] = useState<JudgeUser | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editSubcategory, setEditSubcategory] = useState<string | null>(null);

  const [disableModalVisible, setDisableModalVisible] = useState(false);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);

  const [editUsernameError, setEditUsernameError] = useState<string | null>(
    null
  );
  const [editCategoryError, setEditCategoryError] = useState<string | null>(
    null
  );
  const [editSubcategoryError, setEditSubcategoryError] = useState<
    string | null
  >(null);

  // Initialize Firebase
  const auth = getAuth();
  const db = getFirestore();
  const user = FIREBASE_AUTH.currentUser;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{ marginLeft: 15 }}
        >
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
        const sub = mainCat.subcategories.find(
          (subcat) => subcat.value === categoryValue
        );
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
          const userDoc = await getDoc(
            doc(FIREBASE_DB, "admin-users", user.email)
          );
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
    const unsubscribe = onSnapshot(
      collection(db, "judge-users"),
      (querySnapshot) => {
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          username: doc.data().username || "",
          category: doc.data().category || "",
          email: doc.data().email || "",
          avatarUrl:
            doc.data().avatarUrl || getRandomAvatar(doc.data().username || ""),
          createdAt: doc.data().createdAt,
          disabled: doc.data().disabled ?? false,
        })) as JudgeUser[];
        setJudgeUsers(users);
      },
      (error) => {
        console.error("Error fetching judge users:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const createJudgeAccount = async () => {
    try {
      // Validate input fields
      if (!username.trim()) {
        setUsernameError("Name cannot be empty!");
        return;
      }
      if (!password.trim()) {
        setPasswordError("Password cannot be empty!");
        return;
      }
      if (password !== confirmpassword) {
        setConfirmPasswordError("Passwords do not match!");
        return;
      }
      if (!category) {
        setCategoryError("Please select a category!");
        return;
      }
      if (
        ["Robomission", "Future Innovators"].includes(
          categorydata.find((cat: any) => cat.value === category)?.label || ""
        ) &&
        !subcategory
      ) {
        setSubcategoryError("Please select a subcategory!");
        return;
      }

      console.log("Selected category:", category);

      // Generate a email from username
      const email = `judge_${username}@felta.org`;

      // Check for duplicate username or email
      const q = query(
        collection(db, "judge-users"),
        where("username", "==", username)
      );
      const qEmail = query(
        collection(db, "judge-users"),
        where("email", "==", email)
      );
      const [usernameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(qEmail),
      ]);
      if (!usernameSnapshot.empty) {
        Alert.alert("A judge with this username already exists.");
        return;
      }
      if (!emailSnapshot.empty) {
        Alert.alert("A judge with this email already exists.");
        return;
      }

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
        disabled: false, // Default to not disabled
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
        avatarUrl:
          doc.data().avatarUrl || getRandomAvatar(doc.data().username || ""),
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

  const updateJudgeAccount = async () => {
    // Validation
    let hasError = false;
    if (!editUsername.trim()) {
      setEditUsernameError("Name cannot be empty!");
      hasError = true;
    } else {
      setEditUsernameError(null);
    }
    if (!editCategory) {
      setEditCategoryError("Please select a category!");
      hasError = true;
    } else {
      setEditCategoryError(null);
    }
    if (
      ["Robomission", "Future Innovators"].includes(
        categorydata.find((cat: any) => cat.value === editCategory)?.label || ""
      ) &&
      !editSubcategory
    ) {
      setEditSubcategoryError("Please select a subcategory!");
      hasError = true;
    } else {
      setEditSubcategoryError(null);
    }
    if (hasError) return;

    if (!editJudge) return;
    try {
      await updateDoc(doc(db, "judge-users", editJudge.id), {
        username: editUsername,
        category: editSubcategory || editCategory || "",
      });
      setEditModalVisible(false);
      setEditUsernameError(null);
      setEditCategoryError(null);
      setEditSubcategoryError(null);
    } catch (e) {
      Alert.alert("Error", "Failed to update judge.");
    }
  };

  const cardWidth = screenWidth * 0.9;
  const cardGap = 16;
  const snapInterval = cardWidth + cardGap;

  const sortedJudges = [...judgeUsers].sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  const latestJudges = sortedJudges.slice(0, 5);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
          <View style={styles.container}>
            {/* Header with avatar, greeting, and name/email */}

            <Text style={styles.headerTexts}>Manage Team Categories</Text>

            {/* Manage Categories */}
            <View>
              <FlatList
                data={categorydata}
                keyExtractor={(item) => item.label}
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
                      style={({ pressed }) => [
                        styles.card,
                        { backgroundColor: cardColor },
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => {
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

            {/* Manage Judge Users */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={styles.headerTexts}>Manage Judges</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Judges")}>
                <Text style={{ color: "#6c63ff" }}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.judgesContainer}>
              <FlatList
                data={latestJudges}
                keyExtractor={(item) => item.id}
                scrollEnabled={true}
                // horizontal={true}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => {
                  const categoryLabel = getCategoryDisplayLabel(item.category);
                  const isDisabled = item.disabled;
                  return (
                    <View
                      style={[
                        styles.judgesCard,
                        isDisabled && { backgroundColor: "#f0f0f0" },
                      ]}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              item.avatarUrl || getRandomAvatar(item.username),
                          }}
                          style={styles.judgesImage}
                        />
                        <View style={{ flex: 1, justifyContent: "center" }}>
                          <Text style={styles.judgesName}>{item.username}</Text>
                          <Text style={styles.judgesEmail}>{item.email}</Text>
                          <Text style={styles.judgesCategory}>
                            {categoryLabel}
                          </Text>
                        </View>
                      </View>
                      {/* Restore or Edit button and Disabled text */}
                      <View
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                          minWidth: 70,
                          marginLeft: 8,
                          height: "100%",
                        }}
                      >
                        {isDisabled ? (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.editButton,
                                { backgroundColor: "#35A22F", opacity: 1 },
                              ]}
                              onPress={async () => {
                                try {
                                  await updateDoc(
                                    doc(db, "judge-users", item.id),
                                    { disabled: false }
                                  );
                                  setJudgeUsers((prev) =>
                                    prev.map((j) =>
                                      j.id === item.id
                                        ? { ...j, disabled: false }
                                        : j
                                    )
                                  );
                                  Alert.alert(
                                    "Restored!",
                                    "Judge account has been restored."
                                  );
                                } catch (e) {
                                  Alert.alert(
                                    "Error",
                                    "Failed to restore judge."
                                  );
                                }
                              }}
                            >
                              <MaterialCommunityIcons
                                name="restore"
                                size={20}
                                color="#fff"
                              />
                            </TouchableOpacity>
                            <Text
                              style={{
                                color: "#AA0003",
                                fontWeight: "bold",
                                marginTop: 8,
                                opacity: 1,
                                alignSelf: "center",
                              }}
                            >
                              Account Disabled
                            </Text>
                          </>
                        ) : (
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => {
                              setEditJudge(item);
                              // Find if the category is a subcategory
                              let foundMainCat = null;
                              let foundSubCat = null;
                              for (const mainCat of categorydata) {
                                if (mainCat.value === item.category) {
                                  foundMainCat = mainCat;
                                  break;
                                }
                                if (mainCat.subcategories) {
                                  const sub = mainCat.subcategories.find(
                                    (subcat) => subcat.value === item.category
                                  );
                                  if (sub) {
                                    foundMainCat = mainCat;
                                    foundSubCat = sub;
                                    break;
                                  }
                                }
                              }
                              setEditCategory(
                                foundMainCat
                                  ? foundMainCat.value
                                  : item.category
                              );
                              setEditSubcategory(
                                foundSubCat ? foundSubCat.value : null
                              );
                              setEditUsername(item.username);
                              setEditModalVisible(true);
                            }}
                          >
                            <MaterialCommunityIcons
                              name="pencil-outline"
                              size={20}
                              color="#fff"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={<Text>No judge users found.</Text>}
              />
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.addJudgeButton}
          onPress={() => setModalVisible(true)}
        >
          <AntDesign name="plus" size={25} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Modal for Creating Judge Account */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        aria-hidden={false}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
          setUsernameError(null);
          setPasswordError(null);
          setConfirmPasswordError(null);
          setCategoryError(null);
          setSubcategoryError(null);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.headerTextModal}>Create Judge Account</Text>
              <Text style={styles.headerSubTextModal}>
                Create Judge's account and edit access
              </Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                placeholder="Name"
                autoCapitalize="none"
                onChangeText={(text) => {
                  setUsername(text);
                  setUsernameError(null); // Clear error on change
                }}
                style={styles.textinput}
              />
              {usernameError && (
                <Text style={styles.errorText}>{usernameError}</Text>
              )}
              <TextInput
                placeholder="Password"
                secureTextEntry={true}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(null);
                }}
                style={styles.textinput}
              />
              {passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={true}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError(null);
                }}
                style={styles.textinput}
              />
              {confirmPasswordError && (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              )}
              <Dropdown
                style={styles.dropdown}
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
                  setCategoryError(null);
                  // Reset subcategory if not Robomission or Future Innovators
                  if (!item.subcategories) setSubcategory(null);
                }}
              />
              {categoryError && (
                <Text style={styles.errorText}>{categoryError}</Text>
              )}
              {["Robomission", "Future Innovators"].includes(
                categorydata.find((cat: any) => cat.value === category)
                  ?.label || ""
              ) && (
                <>
                  <Dropdown
                    style={styles.dropdown}
                    data={
                      categorydata.find((cat: any) => cat.value === category)
                        ?.subcategories || []
                    }
                    labelField="label"
                    valueField="value"
                    placeholder="Select Subcategory"
                    value={subcategory}
                    onChange={(item) => {
                      setSubcategory(item.value);
                      setSubcategoryError(null);
                    }}
                  />
                  {categoryError && (
                    <Text style={styles.errorText}>{categoryError}</Text>
                  )}
                </>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.modalCreateButton}
                onPress={createJudgeAccount}
              >
                <Text style={styles.buttonText}>{"Create"}</Text>
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

      {/* Modal for editing judge account */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          setUsernameError(null);
          setPasswordError(null);
          setConfirmPasswordError(null);
          setCategoryError(null);
          setSubcategoryError(null);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.headerTextModal}>Edit Judge Account</Text>
              <Text style={styles.headerSubTextModal}>
                Update judge's information
              </Text>
            </View>
            <View style={styles.formContainer}>
              <TextInput
                placeholder="Name"
                value={editUsername}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setEditUsername(text);
                  setEditUsernameError(null);
                }}
                style={styles.textinput}
              />
              {editUsernameError && (
                <Text style={styles.errorText}>{editUsernameError}</Text>
              )}
              <Dropdown
                style={styles.dropdown}
                data={categorydata}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Category"
                searchPlaceholder="Search..."
                value={editCategory}
                onChange={(item) => {
                  setEditCategory(item.value);
                  setEditCategoryError(null);
                  if (!item.subcategories) setEditSubcategory(null);
                }}
              />
              {editCategoryError && (
                <Text style={styles.errorText}>{editCategoryError}</Text>
              )}

              {["Robomission", "Future Innovators"].includes(
                categorydata.find((cat: any) => cat.value === editCategory)
                  ?.label || ""
              ) && (
                <>
                  <Dropdown
                    style={styles.dropdown}
                    data={
                      categorydata.find(
                        (cat: any) => cat.value === editCategory
                      )?.subcategories || []
                    }
                    labelField="label"
                    valueField="value"
                    placeholder="Select Subcategory"
                    value={editSubcategory}
                    onChange={(item) => {
                      setEditSubcategory(item.value);
                      setEditSubcategoryError(null);
                    }}
                  />
                  {editSubcategoryError && (
                    <Text style={styles.errorText}>{editSubcategoryError}</Text>
                  )}
                </>
              )}
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.modalCreateButton}
                onPress={updateJudgeAccount}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text>Cancel</Text>
              </Pressable>
            </View>
            <View style={styles.buttonDisableContainer}>
              <Pressable
                style={styles.modalDisableButton}
                onPress={() => setDisableModalVisible(true)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#AA0003", fontWeight: "bold" },
                  ]}
                >
                  Disable Account
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Disable Judge Account Confirmation Modal */}
      <Modal
        visible={disableModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDisableModalVisible(false)}
      >
        <View style={styles.modalOverlayDisable}>
          <View style={styles.modalContentDisable}>
            <Text style={styles.modalTitle}>
              Are you sure you want to disable this judge account?
            </Text>
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, { borderColor: "#432344" }]}
                onPress={() => setDisableModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#432344" }]}>
                  Back
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: "#AA3D3F", borderColor: "#AA3D3F" },
                ]}
                onPress={async () => {
                  if (!editJudge) return;
                  try {
                    await updateDoc(doc(db, "judge-users", editJudge.id), {
                      disabled: true,
                    });
                    setJudgeUsers((prev) =>
                      prev.map((j) =>
                        j.id === editJudge.id ? { ...j, disabled: true } : j
                      )
                    );
                    setDisableModalVisible(false);
                    setEditModalVisible(false);
                  } catch (e) {
                    Alert.alert("Error", "Failed to disable judge.");
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { fontWeight: "bold" }]}>
                  Yes
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
    </SafeAreaProvider>
  );
  // setEditJudge is now handled by useState above, so this function is not needed and can be removed.
}
