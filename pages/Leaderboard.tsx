import React, { useEffect, useLayoutEffect, useState } from "react";
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
  doc,
  getDoc,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import styles from "../components/styles/judgeStyles/LeaderboardStyling";
import { Feather } from "@expo/vector-icons";

// Helper to parse "mm:ss:ms" to milliseconds
function parseTimeString(timeStr: string) {
  if (!timeStr) return Infinity;
  const [mm, ss, ms] = timeStr.split(":").map(Number);
  return (mm || 0) * 60000 + (ss || 0) * 1000 + (ms || 0);
}

export default function Leaderboard({ navigation }: any) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);

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

  useEffect(() => {
    // Fetch judge's assigned category
    const fetchJudgeCategory = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(FIREBASE_DB, "judge-users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setJudgeCategory(data.category || null);
        }
      }
    };
    fetchJudgeCategory();
  }, []);

  useEffect(() => {
    if (!judgeCategory) return; // Wait for judgeCategory to load

    let unsubscribeScores: (() => void) | undefined;
    let unsubTeams: (() => void) | undefined;

    const db = getFirestore();

    // Fetch all teams and build a disabled lookup
    const fetchTeamsAndListen = async () => {
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const disabledMap: Record<string, boolean> = {};
      teamsSnapshot.forEach((doc) => {
        const data = doc.data();
        disabledMap[doc.id] = !!data.disabled;
      });

      // Now listen to scores
      const scoresRef = collection(db, "scores");
      unsubscribeScores = onSnapshot(
        scoresRef,
        (querySnapshot) => {
          const teamMap: Record<string, any> = {};
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Only include if not disabled AND category matches
            if (!disabledMap[data.teamId] && data.category === judgeCategory) {
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
            }
          });

          // ...rest of your leaderboard logic...
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
            .slice(0, 5);

          setLeaderboard(leaderboardArr);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching scores:", error);
          setLeaderboard([]);
          setLoading(false);
        }
      );
    };

    fetchTeamsAndListen();

    return () => {
      if (unsubscribeScores) unsubscribeScores();
      if (unsubTeams) unsubTeams();
    };
  }, [judgeCategory]);

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
        <Text
          style={{
            color: "#888",
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          Ranking is based on the best score; if tied, the best time wins!
        </Text>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.navigate("AllLeaderboardScreen")}
        >
          <Text
            style={{
              color: "blue",
              fontFamily: "Inter_400Regular",
              marginBottom: 10,
            }}
          >
            View All Rankings
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
              const rankIcons = ["🥇", "🥈", "🥉"];
              const rankDisplay = isTopThree
                ? rankIcons[index]
                : `${index + 1}.`;

              return (
                <View
                  style={[styles.containerCard, { backgroundColor: cardBg }]}
                >
                  <Text
                    style={{
                      width: 25,
                      textAlign: "center",
                      fontFamily: "Inter_400Regular",
                      fontWeight: isTopThree ? "700" : "500",
                      fontSize: isTopThree ? 20 : 16, // Enlarged medal icon
                      color: textColor,
                      marginRight: 5,
                      marginVertical: "auto",
                      textShadowColor: "rgba(0,0,0,0.5)",
                      textShadowRadius: 2,
                    }}
                  >
                    {rankDisplay}
                  </Text>

                  <Text
                    style={{
                      flex: 1,
                      fontFamily: "Inter_400Regular",
                      color: textColor,
                      marginRight: 5,
                      marginLeft: 5,
                    }}
                  >
                    {item.teamName}
                  </Text>

                  <Text
                    style={{
                      color: textColor,
                      fontFamily: "Inter_400Regular",
                      fontWeight: "bold",
                      marginRight: 5,
                      marginLeft: 5,
                      marginVertical: "auto",
                    }}
                  >
                    {item.bestScore} pts
                  </Text>

                  <Text
                    style={{
                      color: textColor,
                      fontFamily: "Inter_400Regular",
                      marginLeft: 5,
                      marginVertical: "auto",
                    }}
                  >
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
