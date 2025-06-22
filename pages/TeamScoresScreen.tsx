import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import styles from "../components/styles/judgeStyles/CategoryStyling";

export default function TeamScoresScreen({ route, navigation }: any) {
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scores for {team.teamName}</Text>
      </View>
      <FlatList
        data={scores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreText}>Round 1: {item.round1Score}</Text>
            <Text style={styles.scoreText}>Time 1: {item.time1}</Text>
            <Text style={styles.scoreText}>Round 2: {item.round2Score}</Text>
            <Text style={styles.scoreText}>Time 2: {item.time2}</Text>
            <Text style={styles.scoreText}>
              Overall Score: {item.overallScore}
            </Text>
            <Text style={styles.scoreText}>
              Time:{" "}
              {new Date(item.timestamp).toUTCString().replace("GMT", "PHT")}
            </Text>
            <Text style={styles.scoreText}>Scored by: {item.judge}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No scores found for this team.</Text>}
      />
    </View>
  );
}
