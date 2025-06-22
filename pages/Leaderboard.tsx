import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  getFirestore,
  collection,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import styles from "../components/styles/judgeStyles/LeaderboardStyling";

// Helper to parse "mm:ss:ms" to milliseconds
function parseTimeString(timeStr: string) {
  if (!timeStr) return Infinity;
  const [mm, ss, ms] = timeStr.split(":").map(Number);
  return (mm || 0) * 60000 + (ss || 0) * 1000 + (ms || 0);
}

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
          {
            teamName: string;
            teamId: string;
            round1Score?: number;
            round2Score?: number;
            time1?: string;
            time2?: string;
            bestScore?: number;
            bestTime?: string;
            bestTimeMs?: number;
          }
        > = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!teamMap[data.teamId]) {
            teamMap[data.teamId] = {
              teamName: data.teamName,
              teamId: data.teamId,
              round1Score: data.round1Score,
              round2Score: data.round2Score,
              time1: data.time1,
              time2: data.time2,
            };
          }
        });

        // Calculate best score and best time for each team
        Object.values(teamMap).forEach((team) => {
          const r1 = team.round1Score ?? null;
          const r2 = team.round2Score ?? null;
          const t1 = team.time1 ?? "";
          const t2 = team.time2 ?? "";
          if (r1 !== null && (r2 === null || r1 >= r2)) {
            team.bestScore = r1;
            team.bestTime = t1;
            team.bestTimeMs = parseTimeString(t1);
          }
          if (r2 !== null && (r1 === null || r2 > r1)) {
            team.bestScore = r2;
            team.bestTime = t2;
            team.bestTimeMs = parseTimeString(t2);
          }
        });

        const leaderboardArr = Object.values(teamMap)
          .filter((team) => team.bestScore !== undefined)
          .sort((a, b) => {
            const aScore = a.bestScore ?? -Infinity;
            const bScore = b.bestScore ?? -Infinity;
            if (bScore !== aScore) return bScore - aScore;
            return (a.bestTimeMs ?? Infinity) - (b.bestTimeMs ?? Infinity);
          })
          .slice(0, 5); // Top 5

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
        {/* Help text for ranking logic */}
        <Text style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>
          Ranking is based on the best score; if tied, the best time wins!
        </Text>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.navigate("AllLeaderboardScreen")}
        >
          <Text style={{ color: "blue", marginBottom: 10 }}>
            See All Ranking
          </Text>
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
                  <Text style={{ color: textColor, fontWeight: "bold" }}>
                    {item.bestScore} pts
                  </Text>
                  <Text style={{ color: textColor, marginLeft: 10 }}>
                    {item.bestTime}
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
