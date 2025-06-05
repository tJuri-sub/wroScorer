import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Button,
  Image,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import styles from "../components/styles/HomepageStyle";

export default function HomeScreen({ navigation }: any) {
  const user = FIREBASE_AUTH.currentUser;
  const [judgeName, setJudgeName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [robomissionModalVisible, setRobomissionModalVisible] = useState(false);
  const [futureInnovatorsModalVisible, setFutureInnovatorsModalVisible] =
    useState(false);
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false); // State for dropdown menu visibility

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
      categoryDesc: "Build and program a robot that solves tasks on playing field",
      subcategories: [
        { label: "Elementary", value: "robo-elem" },
        { label: "Junior", value: "robo-junior" },
        { label: "Senior", value: "robo-senior" },
      ],
    },
    { 
      label: "Robosports", value: "robosports", 
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
      label: "Future Engineers", value: "future-eng",
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
      {/* Robomission Modal */}
      <Modal
        visible={robomissionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRobomissionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}
            >
              Robomission Category
            </Text>
            {categorydata[0].subcategories?.map((sub) => (
              <Button
                key={sub.value}
                title={sub.label}
                onPress={() => {
                  setRobomissionModalVisible(false);
                  navigation.navigate("CategoryScreen", {
                    category: sub.value,
                    label: `Robomission ${sub.label}`,
                    judgeCategory,
                  });
                }}
              />
            ))}
            <Button
              title="Cancel"
              onPress={() => setRobomissionModalVisible(false)}
            />
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}
            >
              Future Innovators Category
            </Text>
            {categorydata[2].subcategories?.map((sub) => (
              <Button
                key={sub.value}
                title={sub.label}
                onPress={() => {
                  setFutureInnovatorsModalVisible(false);
                  navigation.navigate("CategoryScreen", {
                    category: sub.value,
                    label: `Future Innovators ${sub.label}`,
                    judgeCategory,
                  });
                }}
              />
            ))}
            <Button
              title="Cancel"
              onPress={() => setFutureInnovatorsModalVisible(false)}
            />
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
                setMenuVisible(false); // Close dropdown
                FIREBASE_AUTH.signOut();
                navigation.replace("LoginScreen"); // Navigate to login screen
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

      <View style={styles.topBar}>
        <Icon
          name="menu" // Icon name for the menu
          size={35} // Icon size
          color="#432344" // Icon color
          style={styles.menuIcon}
          onPress={() => setMenuVisible(true)}
        />
        <Text style={styles.topBarText}>ScoreBotics</Text>
      </View>
      <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.name}>{judgeName}</Text>
            <Text style={styles.categoryAssigned}>
              {getAssignedCategoryLabel()}
            </Text>
          </View>
        </View>

        <View style={styles.categorytitle}>
          <Text style={styles.categorytitleText}>
            Competition Categories
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <FlatList
            data={categorydata}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => {
              // Define colors for each category
              const categoryColors: Record<string, string> = {
                Robomission: "#E79300", // Orange
                Robosports: "#35A22F", // Green
                "Future Innovators": "#B01956", // Pink
                "Future Engineers": "#0270AA", // Blue
              };

              // Get the color for the current category
              const cardColor = categoryColors[item.label] || "#333"; // Default to black if no match

              const [firstWord, ...restWords] = item.label.split(" ");
              const rest = restWords.join(" ");

              return (
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                  <Pressable
                    style={styles.card}
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
                    <Image source={item.image} style={styles.sideImage} />
                    <View style={styles.text}>
                      <Text>
                        <Text
                          style={styles.cardTextThin}
                          numberOfLines={2}
                          adjustsFontSizeToFit 
                        >
                          {firstWord}{" "}
                        </Text>
                        <Text
                          style={styles.cardText}
                          numberOfLines={2} 
                          adjustsFontSizeToFit 
                        >
                          {rest}
                        </Text>
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
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }} // Add padding for better scrolling experience
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
