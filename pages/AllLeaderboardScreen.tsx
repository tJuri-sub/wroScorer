import React, { useEffect, useState } from "react";
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";

function parseTimeString(timeStr: string) {
  if (!timeStr) return Infinity;
  const [mm, ss, ms] = timeStr.split(":").map(Number);
  return (mm || 0) * 60000 + (ss || 0) * 1000 + (ms || 0);
}

function getBestScoreAndTime(item: any) {
  const r1 = item.round1Score ?? null;
  const r2 = item.round2Score ?? null;
  const t1 = item.time1 ?? "";
  const t2 = item.time2 ?? "";
  if (r1 !== null && (r2 === null || r1 >= r2)) {
    return { bestScore: r1, bestTime: t1, bestTimeMs: parseTimeString(t1) };
  }
  if (r2 !== null && (r1 === null || r2 > r1)) {
    return { bestScore: r2, bestTime: t2, bestTimeMs: parseTimeString(t2) };
  }
  return { bestScore: null, bestTime: "", bestTimeMs: Infinity };
}

export default function AllLeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const db = getFirestore();

  useEffect(() => {
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
    if (!judgeCategory) return;
    const fetchScores = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "scores"));
        const teams: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category === judgeCategory) { // <-- Filter here
            teams.push({
              ...data,
              ...getBestScoreAndTime(data),
            });
          }
        });
        const leaderboardArr = teams
          .filter((t) => t.bestScore !== null)
          .sort((a, b) => {
            if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
            return a.bestTimeMs - b.bestTimeMs;
          });
        setLeaderboard(leaderboardArr);
      } catch (e) {
        setLeaderboard([]);
      }
      setLoading(false);
    };
    fetchScores();
  }, [judgeCategory]);

  // Pagination logic
  const totalRecords = leaderboard.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
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
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>All Rankings</Text>
      <Text style={{ marginBottom: 10 }}>
        Showing {currentRecords.length} of {totalRecords} records
      </Text>
      <Text style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>
        Ranking is based on the best score; if tied, the best time wins!
      </Text>
      <FlatList
        data={currentRecords}
        keyExtractor={(item) => item.teamId}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{startIndex + index + 1}.</Text>
            <Text style={styles.teamName}>{item.teamName}</Text>
            <Text style={styles.score}>{item.bestScore} pts</Text>
            <Text style={styles.time}>{item.bestTime}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No scores yet!</Text>}
      />
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={handlePreviousPage}
          disabled={currentPage === 1}
          style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
          style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#f4f4f4",
    borderRadius: 5,
  },
  rank: { width: 30, fontWeight: "bold" },
  teamName: { flex: 1 },
  score: { fontWeight: "bold" },
  time: { marginLeft: 10, color: "#1976d2", fontWeight: "bold" },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  pageButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pageInfo: {
    fontSize: 16,
  },
});