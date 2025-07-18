import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import styles from "../components/styles/judgeStyles/CategoryStyling";
import { AntDesign, Feather } from "@expo/vector-icons";

export default function CategoryScreenJudge({ route, navigation }: any) {
  const { category, label, judgeCategory } = route.params;
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `${label} (${teams.length})`,
      headerTitleAlign: "center",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 15 }}
        >
          <AntDesign name="arrowleft" size={24} color="#432344" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, label, teams.length]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Adjust the collection path as needed for your Firestore structure
        const querySnapshot = await getDocs(
          collection(db, `categories/${category}/teams`)
        );
        const teamList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            category: category,
            ...data,
          };
        });
        setTeams(teamList);
      } catch (error) {
        console.error("Error fetching teams:", error);
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
      <FlatList
        data={teams.filter((item) => !item.disabled)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.teamCard}
            onPress={() => {
              if (
                item.category?.toLowerCase().trim() ===
                judgeCategory?.toLowerCase().trim()
              ) {
                navigation.navigate("TeamScoresScreen", {
                  team: item,
                  category,
                });
              }
            }}
          >
            {/* Header Row */}
            <View style={styles.teamCardHeader}>
              <Text style={styles.teamCardHeaderText}>
                Team Number {item.teamNumber}
              </Text>
              <Text style={styles.teamCardHeaderText}>
                Pod Number {item.podNumber}
              </Text>
            </View>

            {/* Country and Team Name Row */}
            <View style={styles.teamCardRow}>
              {/* If you want to add a flag, do it here */}
              <Text style={styles.teamCardTeamName} numberOfLines={1}>
                {item.teamName}
              </Text>
              <Text style={styles.teamCardCountry}>
                {item.countryName || item.country || "N/A"}
              </Text>
            </View>

            {/* Members */}
            {item.members &&
              item.members.map((member: string, index: number) => (
                <Text style={styles.teamCardMember} key={index}>
                  Member {index + 1}: {member || "N/A"}
                </Text>
              ))}

            {/* Coach */}
            <Text style={styles.teamCardCoach}>
              Coach Name: {item.coachName}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No teams found.
          </Text>
        }
      />
    </View>
  );
}
