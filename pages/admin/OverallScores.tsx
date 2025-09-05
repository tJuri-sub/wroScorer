import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import styles from "../../components/styles/judgeStyles/LeaderboardStyling";
import { AntDesign, Feather } from "@expo/vector-icons";
import * as XLSX from "xlsx";

import { CategoryPills } from "../../components/component/categoryPillsAdmin";

const RECORDS_PER_PAGE = 10;
const windowHeight = Dimensions.get("window").height;

function parseTimeString(timeStr: string) {
  if (!timeStr) return Infinity;
  const [mm, ss, ms] = timeStr.split(":").map(Number);
  return (mm || 0) * 60000 + (ss || 0) * 1000 + (ms || 0);
}

export default function AdminLeaderboard({ navigation }: any) {
  const [scoresLoading, setScoresLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const scrollRef = useRef<FlatList<any>>(null);

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
      headerRight: () => (
        <TouchableOpacity
          onPress={() => exportOverallScores(selectedCategory)}
          style={{
            //   backgroundColor: "#0081CC",
            //   paddingVertical: 8,
            //   paddingHorizontal: 12,
            //   borderRadius: 8,
            marginRight: 15,
          }}
        >
          {/* <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Export Excel
          </Text> */}
          <AntDesign name="export" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedCategory]);

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
    setScoresLoading(true);

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
      setScoresLoading(false);
    });

    return () => {
      teamsUnsub();
      scoresUnsub();
    };
  }, [selectedCategory]);

  const exportOverallScores = (categoryLabel: string) => {
    if (leaderboard.length === 0) return;

    // 1. Prepare data
    const data = leaderboard.map((team) => ({
      Rank: team.overallRank,
      Team: team.teamName,
      "Round 1 Score": team.round1Score ?? "N/A",
      "Round 2 Score": team.round2Score ?? "N/A",
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");

    // Export
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const catLabel =
      categories.find((c) => c.id === selectedCategory)?.label ||
      selectedCategory;

    a.download = `leaderboard_${catLabel.replace(/\s+/g, "_")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter leaderboard by search
  const filteredLeaderboard = leaderboard.filter(
    (team) =>
      team.teamName &&
      team.teamName.toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalRecords = filteredLeaderboard.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / RECORDS_PER_PAGE));
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentRecords = filteredLeaderboard.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky Tabs */}
      <View style={stickyStyles.tabsContainer}>
        <View style={{ marginBottom: 8 }}>
          <TextInput
            placeholder="Search teams..."
            placeholderTextColor="#999999"
            value={search}
            onChangeText={setSearch}
            style={[stickyStyles.searchInput, { maxWidth: 340, width: "100%" }]}
          />
        </View>
        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </View>
      {/* Leaderboard List */}
      <View style={{ flex: 1 }}>
        <View style={stickyStyles.header}>
          <Text style={stickyStyles.heading}>Team Name</Text>
          <Text style={stickyStyles.heading}>Round 1 Score</Text>
          <Text style={stickyStyles.heading}>Round 2 Score</Text>
        </View>
        {scoresLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
          </View>
        ) : currentRecords.length === 0 ? (
          <Text style={{ textAlign: "center" }}>No scores yet!</Text>
        ) : (
          <FlatList
            data={currentRecords}
            keyExtractor={(item) => item.teamId}
            contentContainerStyle={{ padding: 1 }}
            renderItem={({ item, index }) => {
              const overallRank = startIndex + index;
              const rankDisplay = `${overallRank + 1}.`;
              return (
                <FlatList
                  data={[item]}
                  keyExtractor={(subItem) => subItem.teamId}
                  contentContainerStyle={{ paddingTop: 60, paddingBottom: 20 }}
                  renderItem={({ item: subItem }) => (
                    <View style={stickyStyles.row}>
                      <Text style={stickyStyles.cell}>
                        {rankDisplay} {subItem.teamName}
                      </Text>
                      <Text
                        style={[
                          stickyStyles.cell,
                          { textAlign: "center", fontSize: 18 },
                        ]}
                      >
                        {subItem.round1Score ?? "N/A"}
                      </Text>
                      <Text
                        style={[
                          stickyStyles.cell,
                          { textAlign: "center", fontSize: 18 },
                        ]}
                      >
                        {subItem.round2Score ?? "N/A"}
                      </Text>
                    </View>
                  )}
                />
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
    zIndex: 10,
    elevation: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingLeft: 16,
  },
  paginationContainer: {
    backgroundColor: "#fafafa",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#432344",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  heading: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1,
    marginHorizontal: 2,
    elevation: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  cell: {
    flex: 1,
    textAlign: "left",
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    marginBottom: 0,
    fontFamily: "inter_400Regular",
    fontSize: 16,
  },
});
