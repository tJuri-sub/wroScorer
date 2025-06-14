import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import styles from "../components/styles/CategoryStyling";

export default function CategoryScreenJudge({ route, navigation }: any) {
  const { category, label, judgeCategory } = route.params;
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Adjust the collection path as needed for your Firestore structure
        const querySnapshot = await getDocs(collection(db, `categories/${category}/teams`));
        const teamList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Fetched Team Data:", data); // Debugging log
        return {
          id: doc.id,
          category: category,
          ...data,
        };
      });
        setTeams(teamList);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [category]);

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{label}</Text>
      </View>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          console.log("Item Category:", item.category, "Judge Category:", judgeCategory); // Debugging log
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                if (item.category?.toLowerCase().trim() === judgeCategory?.toLowerCase().trim()) {
                  navigation.navigate("TeamScoresScreen", { team: item, category });
                }
              }}
            >
              <Text style={styles.cardText}>Team Name: {item.teamName || "N/A"}</Text>
              <Text style={styles.cardText}>Coach: {item.coachName || "N/A"}</Text>
              {item.category?.toLowerCase().trim() === judgeCategory?.toLowerCase().trim() && (
                <>
                  <Text style={styles.cardText}>Team Number: {item.teamNumber || "N/A"}</Text>
                  <Text style={styles.cardText}>Pod Number: {item.podNumber || "N/A"}</Text>
                  <Text style={styles.cardText}>Country: {item.country || "N/A"}</Text>
                  <Text style={styles.cardText}>
                    Members: {(item.members && item.members.join(", ")) || "N/A"}
                  </Text>
                  <Text style={styles.cardText}>Tap to view scores</Text>
                </>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No teams found.</Text>}
      />
    </View>
  );
}
