import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Button, Image, FlatList } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

export default function HomeScreen({ navigation }: any) {
  const user = FIREBASE_AUTH.currentUser;
  const [judgeName, setJudgeName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);

  const categorydata = [
  { label: 'Robomission Elementary', value: 'robo-elem' },
  { label: 'Robomission Junior', value: 'robo-junior' },
  { label: 'Robomission Senior', value: 'robo-senior' },
  { label: 'Future Innovators', value: 'future-innov' },
  { label: 'Future Engineers', value: 'future-eng' },
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
          setAvatarUrl(
            data.avatarUrl ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || "default")}`
          );
        } else {
          setJudgeName(user.email);
          setAvatarUrl(
            `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || "default")}`
          );
        }
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <SafeAreaProvider>
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
              {judgeCategory
                ? `${
                    categorydata.find((cat) => cat.value === judgeCategory)?.label || judgeCategory
                  }`
                : "No category assigned"}
            </Text>
          </View>
        </View>
        <View>
          <FlatList
            data={categorydata}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Button
                  title={item.label}
                  onPress={() => {
                    navigation.navigate("CategoryScreen", {
                      category: item.value,
                      label: item.label,
                      judgeCategory: judgeCategory, // Pass judge's assigned category
                    });
                  }}
                />
              </View>
            )}
          />
        </View>
        <View style={styles.container}>
          <Button
            title="Logout"
            onPress={() => {
              FIREBASE_AUTH.signOut();
              navigation.navigate("LoginJudge"); // Navigate to Login after logout
            }}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
    marginLeft: 20,
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
  },
  categoryAssigned: {
  fontSize: 14,
  color: "#666",
  marginTop: 2,
},
});