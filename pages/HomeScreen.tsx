import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import styles from "../components/styles/judgeStyles/HomepageStyle";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";

export default function HomeScreen({ navigation }: any) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  const user = FIREBASE_AUTH.currentUser;
  const [judgeName, setJudgeName] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [robomissionModalVisible, setRobomissionModalVisible] = useState(false);
  const [futureInnovatorsModalVisible, setFutureInnovatorsModalVisible] =
    useState(false);
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setMenuVisible(!menuVisible)}
          style={{ marginLeft: 15 }}
        >
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, menuVisible]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        // If not logged in, redirect to login screen
        navigation.replace("LoginScreen");
      }
      // else, user is logged in, do nothing
    });
    return unsubscribe;
  }, []);

  const categorydata = [
    {
      label: "Robomission",
      image: require("../assets/images/RoboMissionLogo.png"),
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
      image: require("../assets/images/RoboSportsLogo.png"),
      categoryDesc: "Teams compete with 2 robots in an exciting game",
    },

    {
      label: "Future Innovators",
      image: require("../assets/images/FutureILogo.png"),
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
      image: require("../assets/images/FutureELogo.png"),
      categoryDesc: "Advanced robotics following current research trends",
    },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    const greetings = ["Hello", "Good day", "Hi"];
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);

    const fetchProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(FIREBASE_DB, "judge-users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setJudgeName(data.username);
          setJudgeCategory(data.category || null);
          setAvatarUrl(
            data.avatarUrl ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                user.email || "default"
              )}`
          );
        } else {
          setJudgeName(user.email);
          setAvatarUrl(
            `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
              user.email || "default"
            )}`
          );
        }
      }
    };
    fetchProfile();
  }, [user]);

  const getAssignedCategoryLabel = () => {
    if (!judgeCategory) return "No category assigned";
    const top = categorydata.find((cat) => cat.value === judgeCategory);
    if (top) return top.label;
    for (const cat of categorydata) {
      if (cat.subcategories) {
        const sub = cat.subcategories.find(
          (sub) => sub.value === judgeCategory
        );
        if (sub) return `${cat.label} ${sub.label}`;
      }
    }
    return judgeCategory;
  };

  return (
    <SafeAreaProvider>
      <ScrollView>
        <SafeAreaView style={[styles.safeArea, { flex: 1 }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <View style={styles.profileCard}>
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
                <View style={styles.nameContainer}>
                  <Text style={styles.greeting}>{greeting}!</Text>
                  <Text style={styles.name}>Judge {judgeName}</Text>
                </View>
              </View>
              <Text style={styles.categoryAssigned}>
                {getAssignedCategoryLabel()}
              </Text>
            </View>

            <View style={styles.categoryContainer}>
              <Text style={styles.categorytitleText}>
                Competition Categories
              </Text>
            </View>

            <FlatList
              data={categorydata}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => {
                const categoryColors: Record<string, string> = {
                  Robomission: "#E79300", // Orange
                  Robosports: "#35A22F", // Green
                  "Future Innovators": "#B01956", // Pink
                  "Future Engineers": "#0270AA", // Blue
                };

                const cardColor = categoryColors[item.label] || "#333"; // Default to black if no match
                const [firstWord, ...restWords] = item.label.split(" ");
                const rest = restWords.join(" ");

                return (
                  <Pressable
                    style={[styles.card, { backgroundColor: cardColor }]}
                    onPress={() => {
                      if (item.label === "Robomission") {
                        setRobomissionModalVisible(true);
                      } else if (item.label === "Future Innovators") {
                        setFutureInnovatorsModalVisible(true);
                      } else {
                        navigation.navigate("CategoryScreen", {
                          category: item.value,
                          label: item.label,
                          judgeCategory,
                        });
                      }
                    }}
                  >
                    {/* Add three dots icon */}
                    <View style={styles.cardHeader}>
                      <MaterialCommunityIcons
                        name="dots-vertical"
                        size={24}
                        color="white"
                      />
                    </View>
                    <Image source={item.image} style={styles.sideImage} />
                    <View style={styles.ContainerCategory}>
                      <Text>
                        {item.label === "Robomission" ? (
                          <>
                            <Text
                              style={styles.cardTextThin}
                              adjustsFontSizeToFit
                            >
                              Robo
                            </Text>
                            <Text style={styles.cardText} adjustsFontSizeToFit>
                              mission
                            </Text>
                          </>
                        ) : item.label === "Robosports" ? (
                          <>
                            <Text
                              style={styles.cardTextThin}
                              adjustsFontSizeToFit
                            >
                              Robo
                            </Text>
                            <Text style={styles.cardText} adjustsFontSizeToFit>
                              sports
                            </Text>
                          </>
                        ) : (
                          item.label.split(" ").map((word, index) => (
                            <Text
                              key={index}
                              style={
                                index === 0
                                  ? styles.cardTextThin
                                  : styles.cardText
                              }
                              numberOfLines={2}
                              adjustsFontSizeToFit
                            >
                              {word}{" "}
                            </Text>
                          ))
                        )}
                      </Text>
                      <Text
                        style={styles.cardDesc}
                        numberOfLines={3}
                        adjustsFontSizeToFit
                        ellipsizeMode="tail"
                      >
                        {item.categoryDesc}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
              contentContainerStyle={{ paddingBottom: 1 }}
            />
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* ================================= */}
      {/* --------------  MODALS  -------------- */}
      {/* ================================= */}

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
                  navigation.navigate("CategoryScreen", {
                    category: sub.value,
                    label: `Robomission ${sub.label}`,
                    judgeCategory,
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
                  navigation.navigate("CategoryScreen", {
                    category: sub.value,
                    label: `Future Innovators ${sub.label}`,
                    judgeCategory,
                  });
                }}
              >
                <Text style={styles.modalButtonTextCat}>{sub.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Dropdown Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)} // Close dropdown on request
      >
        <View style={styles.modalmenuOverlay}>
          <View style={styles.dropdownContent}>
            <Pressable
              style={styles.dropdownItem}
              onPress={() => {
                setMenuVisible(false);
                setLogoutModalVisible(true);
              }}
            >
              <Text style={styles.dropdownText}>Logout</Text>
            </Pressable>
            <Pressable
              style={styles.dropdownItem}
              onPress={() => setMenuVisible(false)} // Close dropdown
            >
              <Text style={styles.dropdownText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#432344",
                  },
                ]}
                onPress={() => setLogoutModalVisible(false)} // Close the modal
              >
                <Text style={[styles.modalButtonText, { color: "#432344" }]}>
                  Back
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#D32F2F" }]} // Red button for "Yes"
                onPress={() => {
                  FIREBASE_AUTH.signOut();
                  navigation.replace("LoginJudge");
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}
