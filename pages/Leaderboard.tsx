import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import styles from "../components/styles/LeaderboardStyling";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Define navigation types
  type RootStackParamList = {
    Leaderboard: undefined;
    AllLeaderboardScreen: undefined;
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const db = getFirestore();

  useEffect(() => {
    // Use Firestore's onSnapshot for real-time updates
    const scoresRef = collection(db, "scores");
    const unsubscribe = onSnapshot(
      scoresRef,
      (querySnapshot) => {
        const teamMap: Record<
          string,
          { teamName: string; overallScore: number; teamId: string }
        > = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!teamMap[data.teamId]) {
            teamMap[data.teamId] = {
              teamName: data.teamName,
              overallScore: 0,
              teamId: data.teamId,
            };
          }
          teamMap[data.teamId].overallScore += data.overallScore; // Sum scores for each team
        });
        const leaderboardArr = Object.values(teamMap)
          .sort((a, b) => b.overallScore - a.overallScore) // Sort by total score
          .slice(0, 5); // Limit to top 5
        setLeaderboard(leaderboardArr);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching scores:", error);
        setLeaderboard([]);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.navigate("AllLeaderboardScreen")}
        >
          <Text style={{ color: "blue", marginBottom: 10 }}>See All</Text>
        </TouchableOpacity>
        {leaderboard.length === 0 ? (
          <Text>No scores yet!</Text>
        ) : (
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.teamId}
            renderItem={({ item, index }) => {
              const rankColors = ["#F8AA0C", "#3A9F6C", "#0081CC"];
              const isTopThree = index < 3;
              const cardBg = rankColors[index] || "#fff";
              const textColor = isTopThree ? "#fff" : "#000";
              return (
                <View
                  style={[styles.containerCard, { backgroundColor: cardBg }]}
                >
                  <Text
                    style={{ width: 30, color: textColor, fontWeight: "bold" }}
                  >
                    {index + 1}.
                  </Text>
                  <Text style={{ flex: 1, color: textColor }}>
                    {item.teamName}
                  </Text>
                  <Text style={{ color: textColor }}>
                    {item.overallScore} pts
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
