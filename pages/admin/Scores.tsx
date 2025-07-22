import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import styles from "../../components/styles/ScoreCard"; 
import ScoreCard from "../../components/component/ScoreCard"; // Adjust path if needed
import { getAuth } from "firebase/auth";

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
  const [userRole, setUserRole] = useState<string>("");
  const { teamId, teamName } = route.params;
  const [scores, setScores] = useState<ScoreData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "admin-users", currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || "");
          }
        }
      } catch (e) {
        console.error("Failed to fetch user role", e);
      }
    };

    fetchUserRole();
  }, []);


  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const q1 = query(collection(db, "scores"), where("teamId", "==", teamId));
        const q2 = query(collection(db, "scores2"), where("teamId", "==", teamId));
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

        // Combine results
        const allDocs = [...snap1.docs, ...snap2.docs];
        if (allDocs.length > 0) {
          // If you want to show all scores, use an array:
          const allScores = allDocs.map(doc => ({
            id: doc.id,
            teamId: doc.data().teamId ?? teamId,
            teamName: doc.data().teamName ?? teamName,
            ...doc.data(),
          }));
          setScores(allScores); // Change state to array type
        } else {
          setScores(null);
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
      <ScrollView>
        {Array.isArray(scores) ? (
        scores.map((score, idx) => (
          <ScoreCard key={idx} score={score} userRole={userRole}/>
        ))
      ) : (
        <Text style={{ textAlign: "center", marginTop: 40 }}>No scores found for this team.</Text>
      )}
      </ScrollView>
    </View>
  );
}