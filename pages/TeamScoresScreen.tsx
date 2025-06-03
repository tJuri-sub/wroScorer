import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

export default function TeamScoresScreen({ route }: any) {
  const { team, category } = route.params;
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const q = query(
          collection(db, "scores"),
          where("teamId", "==", team.id),
          where("category", "==", category)
        );
        const querySnapshot = await getDocs(q);
        const scoreList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setScores(scoreList);
      } catch (error) {
        console.error("Error fetching scores:", error);
        Alert.alert("Error", "Failed to load scores.");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [team.id, category]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scores for {team.teamName}</Text>
      <FlatList
        data={scores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreText}>Round 1: {item.round1Score}</Text>
            <Text style={styles.scoreText}>Time 1: {item.time1}</Text>
            <Text style={styles.scoreText}>Round 2: {item.round2Score}</Text>
            <Text style={styles.scoreText}>Time 2: {item.time2}</Text>
            <Text style={styles.scoreText}>Overall Score: {item.overallScore}</Text>
            <Text style={styles.scoreText}>
              Time: {new Date(item.timestamp).toUTCString().replace("GMT", "PHT")}
            </Text>
            <Text style={styles.scoreText}>Scored by: {item.judge}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No scores found for this team.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  scoreText: { fontSize: 14, marginBottom: 2 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});