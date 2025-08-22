import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import styles from "../../components/styles/judgeStyles/LeaderboardStyling";
import { AntDesign, Feather } from "@expo/vector-icons";

const RECORDS_PER_PAGE = 10;
const windowHeight = Dimensions.get("window").height;

function parseTimeString(timeStr: string) {
  if (!timeStr) return Infinity;
  const [mm, ss, ms] = timeStr.split(":").map(Number);
  return (mm || 0) * 60000 + (ss || 0) * 1000 + (ms || 0);
}

export default function AdminLeaderboard({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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
    const fetchCategories = async () => {
      const db = getFirestore();
      const categoriesSnap = await getDocs(collection(db, "categories"));
      let cats = categoriesSnap.docs.map((doc) => ({
        id: doc.id,
        label: doc.data().label || doc.id,
      }));

      // Custom sort order
      const order = ["robo-elem", "robo-junior", "robo-senior", "robosports"];
      cats = [
        ...(order
          .map((catId) => cats.find((cat) => cat.id === catId))
          .filter(Boolean) as { id: string; label: any }[]),
        ...cats.filter((cat) => !order.includes(cat.id)),
      ];

      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0].id);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);

    const db = getFirestore();
    let teamsMap: Record<string, any> = {};

    const teamsUnsub = onSnapshot(collection(db, "teams"), (teamsSnap) => {
      teamsMap = {};
      teamsSnap.forEach((doc) => {
        teamsMap[doc.id] = { id: doc.id, ...doc.data() };
      });
    });

    const scoresUnsub = onSnapshot(collection(db, "scores2"), (scoresSnap) => {
      const scores = scoresSnap.docs
        .map((doc) => {
          const data = doc.data() as {
            round1Score?: number;
            round2Score?: number;
            time1?: string;
            time2?: string;
            category?: string;
            teamId?: string;
            teamName?: string;
            [key: string]: any;
          };
          return { id: doc.id, ...data };
        })
        .filter((score) => score.category === selectedCategory);

      const teamMap: Record<string, any> = {};
      scores.forEach((score) => {
        const teamId = score.teamId;
        if (teamId && !teamsMap[teamId]?.disabled) {
          if (!teamMap[teamId]) {
            teamMap[teamId] = {
              teamName: score.teamName || teamsMap[teamId]?.teamName || "",
              teamId: teamId,
              round1Score: score.round1Score,
              round2Score: score.round2Score,
              time1: score.time1,
              time2: score.time2,
            };
          }
        }
      });

      Object.values(teamMap).forEach((team: any) => {
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
        .filter((team: any) => team.bestScore !== undefined)
        .sort((a: any, b: any) => {
          const aScore = a.bestScore ?? -Infinity;
          const bScore = b.bestScore ?? -Infinity;
          if (bScore !== aScore) return bScore - aScore;
          return (a.bestTimeMs ?? Infinity) - (b.bestTimeMs ?? Infinity);
        });

      setLeaderboard(leaderboardArr);
      setCurrentPage(1);
      setLoading(false);
    });

    return () => {
      teamsUnsub();
      scoresUnsub();
    };
  }, [selectedCategory]);

  const totalRecords = leaderboard.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / RECORDS_PER_PAGE));
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentRecords = leaderboard.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky Tabs */}
      <View style={stickyStyles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 18,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedCategory === cat.id ? "#432344" : "#eee",
                borderWidth: selectedCategory === cat.id ? 2 : 0,
                borderColor: "#432344",
              }}
            >
              <Text
                style={{
                  color: selectedCategory === cat.id ? "#fff" : "#432344",
                }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Leaderboard List */}
      <View style={{ flex: 1 }}>
        {currentRecords.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No scores yet!
          </Text>
        ) : (
          <FlatList
            data={currentRecords}
            keyExtractor={(item) => item.teamId}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item, index }) => {
              const overallRank = startIndex + index;
              const rankColors = ["#F8AA0C", "#3A9F6C", "#0081CC"];
              const isTopThree = overallRank < 3;
              const cardBg = isTopThree ? rankColors[overallRank] : "#fff";
              const textColor = isTopThree ? "#fff" : "#000";
              const rankIcons = ["🥇", "🥈", "🥉"];
              const rankDisplay = isTopThree
                ? rankIcons[overallRank]
                : `${overallRank + 1}.`;
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
                      fontSize: isTopThree ? 22 : 12, // Enlarged medal icon
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
                      marginVertical: "auto",
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
      {/* Sticky Pagination Controls */}
      <View style={stickyStyles.paginationContainer}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={handlePreviousPage}
            disabled={currentPage === 1}
            style={{
              padding: 8,
              marginHorizontal: 8,
              backgroundColor: currentPage === 1 ? "#eee" : "#999999",
              borderRadius: 6,
            }}
          >
            <Text style={{ color: currentPage === 1 ? "#aaa" : "#fff" }}>
              <AntDesign name="left" size={16} color="black" />
            </Text>
          </TouchableOpacity>
          <Text style={{ alignSelf: "center", fontSize: 16 }}>
            Page {currentPage} of {totalPages}
          </Text>
          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: 8,
              marginHorizontal: 8,
              backgroundColor: currentPage === totalPages ? "#eee" : "#999999",
              borderRadius: 6,
            }}
          >
            <Text
              style={{ color: currentPage === totalPages ? "#aaa" : "#fff" }}
            >
              <AntDesign name="right" size={16} color="black" />
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: "#555", marginLeft: 16 }}>
          Showing {currentRecords.length} of {leaderboard.length} teams
        </Text>
      </View>
    </View>
  );
}

const stickyStyles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: "#fafafa",
    paddingTop: 16,
    paddingBottom: 0,
    zIndex: 10,
    elevation: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingLeft: 16,
  },
  paginationContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fafafa",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    zIndex: 10,
    boxShadow: "0px 2px 3px rgba(0,0,0,0.5)",
  },
});
