import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import styles from "../../components/styles/judgeStyles/LeaderboardStyling";
import { AntDesign } from "@expo/vector-icons";
import * as XLSX from "xlsx";
import { useRoute } from "@react-navigation/native";

const RECORDS_PER_PAGE = 10;

export default function EventScores({ navigation }: any) {
  const route = useRoute();
  const params = route.params as { eventId?: string; category?: string; date?: string } || {};
  const { eventId, category, date } = params;

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${category} - Event Scores`,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 15 }}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => exportOverallScores()}
          style={{ marginRight: 15 }}
        >
          <AntDesign name="export" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, category]);

  useEffect(() => {
    if (!eventId || !category) {
      setScoresLoading(false);
      return;
    }

    // Fetch event title
    const fetchEventTitle = async () => {
      try {
        const db = getFirestore();
        const eventDoc = await getDocs(query(
          collection(db, "events"),
          where("__name__", "==", eventId)
        ));
        if (!eventDoc.empty) {
          const eventData = eventDoc.docs[0].data();
          setEventTitle(eventData.title || "Event");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchEventTitle();
    setScoresLoading(true);

    const db = getFirestore();
    
    // Query scores for specific event and category
    const scoresQuery = query(
      collection(db, "scores"),
      where("eventId", "==", eventId),
      where("category", "==", category)
    );

    const unsubscribe = onSnapshot(scoresQuery, (scoresSnap) => {
      const teamMap: Record<string, any> = {};
      
      scoresSnap.docs.forEach((doc) => {
        const data = doc.data() as {
          round1Score?: number;
          round2Score?: number;
          time1?: string;
          time2?: string;
          teamId?: string;
          teamName?: string;
          [key: string]: any;
        };
        
        const teamId = data.teamId;
        if (teamId) {
          if (!teamMap[teamId]) {
            teamMap[teamId] = {
              teamName: data.teamName || "",
              teamId: teamId,
              round1Score: data.round1Score,
              round2Score: data.round2Score,
              time1: data.time1,
              time2: data.time2,
            };
          }
        }
      });

      // Calculate best scores for sorting but show individual round scores
      Object.values(teamMap).forEach((team: any) => {
        const r1 = team.round1Score ?? null;
        const r2 = team.round2Score ?? null;
        
        if (r1 !== null && (r2 === null || r1 >= r2)) {
          team.bestScore = r1;
        }
        if (r2 !== null && (r1 === null || r2 > r1)) {
          team.bestScore = r2;
        }
      });

      const leaderboardArr = Object.values(teamMap)
        .filter((team: any) => team.bestScore !== undefined)
        .sort((a: any, b: any) => {
          const aScore = a.bestScore ?? -Infinity;
          const bScore = b.bestScore ?? -Infinity;
          return bScore - aScore;
        });

      setLeaderboard(leaderboardArr);
      setCurrentPage(1);
      setScoresLoading(false);
    });

    return () => unsubscribe();
  }, [eventId, category]);

  const exportOverallScores = () => {
    if (leaderboard.length === 0) return;

    const data = leaderboard.map((team, index) => ({
      Rank: index + 1,
      Team: team.teamName,
      "Round 1 Score": team.round1Score ?? "-",
      "Round 2 Score": team.round2Score ?? "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Event Scores");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event_scores_${category}_${date || 'unknown'}.xlsx`;
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

  if (!eventId || !category) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, color: 'red' }}>
          Error: Event ID or Category is missing.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header Info */}
      <View style={stickyStyles.headerContainer}>
        <Text style={stickyStyles.eventTitle}>{eventTitle}</Text>
        <Text style={stickyStyles.eventInfo}>
          {category} • {date}
        </Text>
      </View>

      {/* Search */}
      <View style={stickyStyles.tabsContainer}>
        <TextInput
          placeholder="Search teams..."
          placeholderTextColor="#999999"
          value={search}
          onChangeText={setSearch}
          style={stickyStyles.searchInput}
        />
      </View>

      {/* Scores List */}
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <View style={stickyStyles.header}>
          <Text style={stickyStyles.heading}>Team Name</Text>
          <Text style={[stickyStyles.heading, stickyStyles.align]}>Round 1</Text>
          <Text style={[stickyStyles.heading, stickyStyles.align]}>Round 2</Text>
        </View>

        {scoresLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        ) : currentRecords.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ textAlign: "center" }}>No scores yet for this event!</Text>
          </View>
        ) : (
          <FlatList
            data={currentRecords}
            keyExtractor={(item) => item.teamId}
            renderItem={({ item, index }) => {
              const overallRank = startIndex + index;
              const rankDisplay = `${overallRank + 1}.`;
              
              return (
                <View style={stickyStyles.row}>
                  <Text style={stickyStyles.cell}>
                    {rankDisplay} {item.teamName}
                  </Text>
                  <Text
                    style={[
                      stickyStyles.cell,
                      { textAlign: "center", fontSize: 18 }
                    ]}
                  >
                    {item.round1Score ?? "N/A"}
                  </Text>
                  <Text
                    style={[
                      stickyStyles.cell,
                      { textAlign: "center", fontSize: 18 }
                    ]}
                  >
                    {item.round2Score ?? "N/A"}
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Pagination Controls */}
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
            <AntDesign 
              name="left" 
              size={16} 
              color={currentPage === 1 ? "#aaa" : "white"} 
            />
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
            <AntDesign 
              name="right" 
              size={16} 
              color={currentPage === totalPages ? "#aaa" : "white"} 
            />
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
  headerContainer: {
    backgroundColor: "#432344",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  eventInfo: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  tabsContainer: {
    backgroundColor: "#fafafa",
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  heading: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  align: {
    textAlign: "center",
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
    fontFamily: "inter_400Regular",
    fontSize: 16,
    width: "100%",
  },
});