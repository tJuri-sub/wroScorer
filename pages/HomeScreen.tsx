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
      label: "Robo mission",
      image: require("../assets/images/RoboMissionLogo.png"),
      categoryDesc: "Autonomous robots solve challenges on competition field.",
      subcategories: [
        { label: "Elementary", value: "robo-elem" },
        { label: "Junior", value: "robo-junior" },
        { label: "Senior", value: "robo-senior" },
      ],
    },
    { label: "Robosports", value: "robosports" },
    {
      label: "Future Innovators",
      subcategories: [
        { label: "Elementary", value: "fi-elem" },
        { label: "Junior", value: "fi-junior" },
        { label: "Senior", value: "fi-senior" },
      ],
    },
    { label: "Future Engineers", value: "future-eng" },
  ];

  useEffect(() => {
    // Greeting logic
    const hour = new Date().getHours();
    const greetings = ["Hello", "Good day", "Hi"];
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);

    // Fetch judge profile info
    const fetchProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(FIREBASE_DB, "judge-users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setJudgeName(data.username);
          setJudgeCategory(data.category || null);
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

  // Helper to get assigned category label
  const getAssignedCategoryLabel = () => {
    if (!judgeCategory) return "No category assigned";
    // Check top-level
    const top = categorydata.find((cat) => cat.value === judgeCategory);
    if (top) return top.label;
    // Check subcategories
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
        animationType="slide"
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
        animationType="slide"
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
        <View style={styles.cardContainer}>
          <FlatList
            data={categorydata}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => {
              if (item.label === "Robo mission") {
                const [firstWord, ...restWords] = item.label.split(" ");
                const rest = restWords.join(" ");
                return (
                  <View style={styles.card}>
                    <Pressable
                      style={styles.card}
                      onPress={() => setRobomissionModalVisible(true)}
                    >
                      <Image source={item.image} style={styles.sideImage} />
                      <View style={styles.text}>
                        <Text>
                          <Text style={styles.cardTextThin}>{firstWord} </Text>
                          <Text style={styles.cardText}>{rest}</Text>
                        </Text>
                        <Text style={styles.cardDesc}>{item.categoryDesc}</Text>
                      </View>
                    </Pressable>
                  </View>
                );
              } else if (item.label === "Future Innovators") {
                return (
                  <View style={styles.card}>
                    <Button
                      title={item.label}
                      onPress={() => setFutureInnovatorsModalVisible(true)}
                    />
                  </View>
                );
              } else {
                return (
                  <View style={styles.card}>
                    <Button
                      title={item.label}
                      onPress={() => {
                        navigation.navigate("CategoryScreen", {
                          category: item.value,
                          label: item.label,
                          judgeCategory,
                        });
                      }}
                    />
                  </View>
                );
              }
            }}
          />
        </View>
        <View style={styles.container}>
          <Button
            title="Logout"
            onPress={() => {
              FIREBASE_AUTH.signOut();
              navigation.navigate("LoginJudge");
            }}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
