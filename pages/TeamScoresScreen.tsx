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
import ScoreCard from "../components/component/ScoreCard"; // Adjust path if needed

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
        <Text style={styles.title}>Scores for {team.teamName}</Text>
      </View>
      <FlatList
        data={scores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ScoreCard score={item} />}
        ListEmptyComponent={<Text>No scores found for this team.</Text>}
      />
    </View>
  );
}
