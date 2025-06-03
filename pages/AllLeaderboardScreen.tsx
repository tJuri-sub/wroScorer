import React, { useEffect, useState } from "react";
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default function AllLeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10; // Limit to 10 records per page
  const db = getFirestore();

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "scores"));
        const teamMap: Record<string, any> = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!teamMap[data.teamId]) {
            teamMap[data.teamId] = {
              teamName: data.teamName,
              overallScore: 0,
              teamId: data.teamId,
            };
          }
          teamMap[data.teamId].overallScore += data.overallScore;
        });
        const leaderboardArr = Object.values(teamMap).sort(
          (a: any, b: any) => b.overallScore - a.overallScore
        );
        setLeaderboard(leaderboardArr);
      } catch (e) {
        setLeaderboard([]);
      }
      setLoading(false);
    };
    fetchScores();
  }, []);

  // Pagination logic
  const totalRecords = leaderboard.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = leaderboard.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
      <FlatList
        data={currentRecords}
        keyExtractor={(item) => item.teamId}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{startIndex + index + 1}.</Text>
            <Text style={styles.teamName}>{item.teamName}</Text>
            <Text style={styles.score}>{item.overallScore} pts</Text>
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