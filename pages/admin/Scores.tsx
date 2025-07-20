import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import styles from "../../components/styles/ScoreCard"; 
import ScoreCard from "../../components/component/ScoreCard"; // Adjust path if needed

type ScoreData = {
  teamId: string;
  teamName: string;
  round1Score?: number;
  round2Score?: number;
  time1?: string;
  time2?: string;
  round1ScoredAt?: string;
  round2ScoredAt?: string;
  [key: string]: any;
};

function formatDate(iso?: string) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function ScoresScreen({ route, navigation }: any) {
  const { teamId, teamName } = route.params;
  const [scores, setScores] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const q = query(collection(db, "scores"), where("teamId", "==", teamId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setScores({
            teamId: doc.data().teamId ?? teamId,
            teamName: doc.data().teamName ?? teamName,
            ...doc.data(),
          });
        }
      } catch (e) {
        setScores(null);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [teamId]);

  if (loading) return <ActivityIndicator />;
  if (!scores) return <Text style={{ textAlign: "center", marginTop: 40 }}>No scores found for this team.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.teamName}>{teamName}</Text>
      <ScoreCard score={scores} />
    </View>
  );
}