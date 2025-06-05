import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Image, FlatList, Modal, TouchableOpacity, Button } from "react-native";
import { Menu, Provider } from "react-native-paper"; // Import Menu from react-native-paper
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import style from "../components/styles/HomepageStyle";

export default function HomeScreen({ navigation }: any) {
  const user = FIREBASE_AUTH.currentUser;
  const [judgeName, setJudgeName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [robomissionModalVisible, setRobomissionModalVisible] = useState(false);
  const [futureInnovatorsModalVisible, setFutureInnovatorsModalVisible] = useState(false);
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false); // State for dropdown menu visibility

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        navigation.replace("LoginScreen");
      }
    });
    return unsubscribe;
  }, []);

  const categorydata = [
    {
      label: "Robomission",
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
        const sub = cat.subcategories.find((sub) => sub.value === judgeCategory);
        if (sub) return `${cat.label} ${sub.label}`;
      }
    }
    return judgeCategory;
  };

  return (
    <Provider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          {/* Header with Dropdown Menu */}
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
              <Text style={styles.categoryAssigned}>{getAssignedCategoryLabel()}</Text>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                  <Text style={styles.menuText}>⋮</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  FIREBASE_AUTH.signOut();
                  navigation.navigate("LoginJudge");
                }}
                title="Logout"
              />
            </Menu>
          </View>

          {/* Rest of the content */}
          <View>
            <FlatList
              data={categorydata}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) =>
                item.label === "Robomission" ? (
                  <View style={styles.card}>
                    <Button
                      title={item.label}
                      onPress={() => setRobomissionModalVisible(true)}
                    />
                  </View>
                ) : item.label === "Future Innovators" ? (
                  <View style={styles.card}>
                    <Button
                      title={item.label}
                      onPress={() => setFutureInnovatorsModalVisible(true)}
                    />
                  </View>
                ) : (
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
                )
              }
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Align items to the edges
    marginBottom: 20,
    marginTop: 30,
    marginHorizontal: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryAssigned: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  menuButton: {
    padding: 10,
  },
  menuText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});