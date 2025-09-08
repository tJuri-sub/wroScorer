import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import styles from "../components/styles/judgeStyles/CategoryStyling";
import { AntDesign, Feather } from "@expo/vector-icons";

export default function CategoryScreenJudge({ route, navigation }: any) {
  const { category, label, judgeCategory } = route.params;
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and pagination state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const db = getFirestore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `${label} Teams`,
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
        const querySnapshot = await getDocs(
          collection(db, `categories/${category}/teams`)
        );
        const teamList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            category: category,
            ...data,
            teamNumber: data.teamNumber ?? 0, // Ensure teamNumber exists
          };
        });
        // Sort by team number ascending
        teamList.sort((a, b) => (a.teamNumber ?? 0) - (b.teamNumber ?? 0));
        setTeams(teamList);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [category]);

  // Filter teams by search and not disabled
  const filteredTeams = teams
    .filter((item) => !item.disabled)
    .filter((item) => {
      const searchLower = search.toLowerCase();
      return (
        item.teamName?.toLowerCase().includes(searchLower) ||
        String(item.teamNumber).includes(searchLower)
      );
    });

  // Pagination logic
  const totalRecords = filteredTeams.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredTeams.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          borderColor: "#e0e0e0",
          backgroundColor: "#fafafa",
          marginBottom: 12,
          fontSize: 16,
        }}
        placeholder="Search team name"
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setCurrentPage(1); // Reset to first page on search
        }}
      />

      <FlatList
        data={currentRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
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
            <View style={styles.teamCard}>
              {/* Header Row */}
              <View style={styles.teamCardHeader}>
                <Text style={[styles.teamCardHeaderText, { flex: 1 }]}>
                  Team Number: {item.teamNumber}
                </Text>
                <Text style={styles.teamCardHeaderText}>
                  Table Number: {item.podNumber}
                </Text>
              </View>
              {/* Country and Team Name Row */}
              <View style={styles.teamCardRow}>
                <Text style={styles.teamCardTeamName}>{item.teamName}</Text>
                <Text style={styles.teamCardCountry}>
                  {item.countryName || item.country || "N/A"}
                </Text>
              </View>
              {/* Members */}
              <View style={{ marginBottom: 6 }}>
                {item.members &&
                  item.members.map((member: string, index: number) => (
                    <Text style={styles.teamCardMember} key={index}>
                      Member {index + 1}: {member || "-"}
                    </Text>
                  ))}
              </View>
              {/* Coach */}
              <Text style={styles.teamCardCoach}>
                Team Coach: {item.coachName || "-"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No teams found.
          </Text>
        }
      />

      {/* Pagination Controls */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <TouchableOpacity
          onPress={handlePreviousPage}
          disabled={currentPage === 1}
          style={{
            padding: 8,
            marginHorizontal: 8,
            backgroundColor: currentPage === 1 ? "#eee" : "#432344",
            borderRadius: 6,
          }}
        >
          <Text style={{ color: currentPage === 1 ? "#aaa" : "#fff" }}>
            Previous
          </Text>
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
            backgroundColor: currentPage === totalPages ? "#eee" : "#432344",
            borderRadius: 6,
          }}
        >
          <Text style={{ color: currentPage === totalPages ? "#aaa" : "#fff" }}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
      {/* Records summary */}
      <Text
        style={{
          marginBottom: 5,
          marginTop: 5,
          color: "#555",
          textAlign: "center",
        }}
      >
        Showing {currentRecords.length} of {filteredTeams.length} teams
      </Text>
    </View>
  );
}
