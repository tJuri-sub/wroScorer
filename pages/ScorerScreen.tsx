import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function ScorerScreen({ navigation }: any) {
  const user = FIREBASE_AUTH.currentUser;
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Scoring form
  const [round1Score, setRound1Score] = useState("");
  const [round2Score, setRound2Score] = useState("");
  const [time1Minutes, setTime1Minutes] = useState("");
  const [time1Seconds, setTime1Seconds] = useState("");
  const [time1Milliseconds, setTime1Milliseconds] = useState("");
  const [time2Minutes, setTime2Minutes] = useState("");
  const [time2Seconds, setTime2Seconds] = useState("");
  const [time2Milliseconds, setTime2Milliseconds] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch judge's assigned category and teams
  useEffect(() => {
    const fetchJudgeAndTeams = async () => {
      setLoading(true);
      if (user) {
        try {
          const docSnap = await getDocs(
            query(
              collection(FIREBASE_DB, "judge-users"),
              where("email", "==", user.email?.toLowerCase())
            )
          );
          if (!docSnap.empty) {
            const data = docSnap.docs[0].data();
            setJudgeCategory(data.category);

            // Fetch teams in judge's category
            const teamsSnap = await getDocs(
              collection(FIREBASE_DB, `categories/${data.category}/teams`)
            );
            const teamList = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeams(teamList);
            setFilteredTeams(teamList); // Initialize filtered teams
          }
        } catch (err) {
          console.log("Error fetching judge or teams:", err);
        }
      }
      setLoading(false);
    };
    fetchJudgeAndTeams();
  }, [user]);

  // Fetch scoring history
  const fetchHistory = async () => {
    if (user && judgeCategory) {
      try {
        const q = query(
          collection(FIREBASE_DB, "scores"),
          where("judge", "==", user.email),
          where("category", "==", judgeCategory),
          orderBy("timestamp", "desc")
        );
        const snap = await getDocs(q);
        setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.log("Error fetching history:", err);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, judgeCategory]);

  // Handle scoring submit
  const handleSubmit = async () => {
    if (!selectedTeam) {
      Alert.alert("Please select a team.");
      return;
    }
    try {
      const overallScore = Number(round1Score) + Number(round2Score);
      const formattedTime1 = `${(time1Minutes || "0").padStart(2, "0")}:${(time1Seconds || "0").padStart(2, "0")}:${(time1Milliseconds || "0").padStart(3, "0")}`;
      const formattedTime2 = `${(time2Minutes || "0").padStart(2, "0")}:${(time2Seconds || "0").padStart(2, "0")}:${(time2Milliseconds || "0").padStart(3, "0")}`;
      // Get Philippine Time
      const now = new Date();
      const philippineTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

      if (!user) {
        Alert.alert("User not authenticated.");
        return;
      }
      await addDoc(collection(FIREBASE_DB, "scores"), {
        teamId: selectedTeam.id,
        teamName: selectedTeam.teamName,
        coachName: selectedTeam.coachName,
        round1Score: Number(round1Score),
        round2Score: Number(round2Score),
        time1: formattedTime1,
        time2: formattedTime2,
        overallScore,
        judge: user.email,
        category: judgeCategory,
        timestamp: philippineTime.toISOString(),
      });

      // Clear form
      setRound1Score("");
      setRound2Score("");
      setTime1Minutes("");
      setTime1Seconds("");
      setTime1Milliseconds("");
      setTime2Minutes("");
      setTime2Seconds("");
      setTime2Milliseconds("");
      setSelectedTeam(null);

      // Show success notification
      Alert.alert("Success", "Score submitted!");

      // Refresh history immediately
      fetchHistory();
    } catch (e) {
      Alert.alert("Error", "Error submitting score.");
    }
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
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scorer</Text>
      </View>

      {/* History */}
      <View style={styles.historyHeader}>
        <Text style={styles.seeAllText}>Score History</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllScoresScreen", { history })}>
          <Text style={styles.historyText}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={history.slice(0, 5)} // Limit to 5 items
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <Text style={styles.historyText}>Team Name: {item.teamName}</Text>
            <Text style={styles.historyText}>Round 1: {item.round1Score} points</Text>
            <Text style={styles.historyText}>Time 1: {item.time1}</Text>
            <Text style={styles.historyText}>Round 2: {item.round2Score} points</Text>
            <Text style={styles.historyText}>Time 2: {item.time2}</Text>
            <Text style={styles.historyText}>Overall Score: {item.overallScore}</Text>
            <Text style={styles.historyText}>
              Scored At: {new Date(item.timestamp).toUTCString().replace("GMT", "PHT")}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ margin: 10 }}>No history yet.</Text>}
        style={{ marginBottom: 10 }}
      />

      {/* Scorer Calculator */}
      <Text style={styles.sectionTitle}>Scorer Calculator</Text>
      <View style={styles.scorerCard}>
        {/* Searchable Dropdown */}
        <TextInput
          style={styles.dropdown}
          placeholder="Select Team"
          value={searchQuery}
          onFocus={() => setShowDropdown(true)} // Show dropdown when focused
          onChangeText={(text) => {
            setSearchQuery(text);
            const filtered = teams.filter((team) =>
              team.teamName.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredTeams(filtered);
          }}
        />
        {showDropdown && (
          <View style={styles.dropdownList}>
            {filteredTeams.length === 0 && (
              <Text style={{ padding: 10, color: "#888" }}>No teams available</Text>
            )}
            {filteredTeams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedTeam(team);
                  setSearchQuery(team.teamName); // Set the selected team's name in the input
                  setShowDropdown(false); // Close dropdown
                }}
              >
                <Text>{team.teamName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Round 1 Score Input */}
        <Text style={{ fontSize: 16, fontWeight: "bold", marginVertical: 8 }}>Round 1</Text>

        <TextInput
          style={styles.input}
          placeholder="Round 1 Score"
          keyboardType="numeric"
          value={round1Score}
          onChangeText={(text) => setRound1Score(text.replace(/[^0-9]/g, ""))}
        />

        {/* Round 1 Time Input */}
        <View style={styles.timeInputRow}>
          <TextInput
            style={styles.timeInput}
            placeholder="00"
            keyboardType="numeric"
            value={time1Minutes}
            onChangeText={(text) => {
              const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
              setTime1Minutes(formatted.length > 2 ? formatted.slice(0, 2) : formatted); // Limit to 2 digits
            }}
          />
          <Text style={styles.timeLabel}>m :</Text>
          <TextInput
            style={styles.timeInput}
            placeholder="00"
            keyboardType="numeric"
            value={time1Seconds}
            onChangeText={(text) => {
              const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
              if (Number(formatted) <= 59) {
                setTime1Seconds(formatted.length > 2 ? formatted.slice(0, 2) : formatted); // Limit to 2 digits
              }
            }}
          />
          <Text style={styles.timeLabel}>s :</Text>
          <TextInput
            style={styles.timeInput}
            placeholder="000"
            keyboardType="numeric"
            value={time1Milliseconds}
            onChangeText={(text) => {
              const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
              if (Number(formatted) <= 999) {
                setTime1Milliseconds(formatted.length > 3 ? formatted.slice(0, 3) : formatted); // Limit to 3 digits
              }
            }}
          />
          <Text style={styles.timeLabel}>ms</Text>
        </View>


        {/* Round 2 Score Input */}
        <Text style={{ fontSize: 16, fontWeight: "bold", marginVertical: 8 }}>Round 2</Text>

        <TextInput
          style={styles.input}
          placeholder="Round 2 Score"
          keyboardType="numeric"
          value={round2Score}
          onChangeText={(text) => setRound2Score(text.replace(/[^0-9]/g, ""))}
        />

        {/* Round 2 Time Input */}
        <View style={styles.timeInputRow}>
          <TextInput
            style={styles.timeInput}
            placeholder="00"
            keyboardType="numeric"
            value={time2Minutes}
            onChangeText={(text) => {
              const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
              setTime2Minutes(formatted.length > 2 ? formatted.slice(0, 2) : formatted); // Limit to 2 digits
            }}
          />
          <Text style={styles.timeLabel}>m :</Text>
          <TextInput
            style={styles.timeInput}
            placeholder="00"
            keyboardType="numeric"
            value={time2Seconds}
            onChangeText={(text) => {
              const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
              if (Number(formatted) <= 59) {
                setTime2Seconds(formatted.length > 2 ? formatted.slice(0, 2) : formatted); // Limit to 2 digits
              }
            }}
          />
          <Text style={styles.timeLabel}>s :</Text>
          <TextInput
            style={styles.timeInput}
            placeholder="000"
            keyboardType="numeric"
            value={time2Milliseconds}
            onChangeText={(text) => {
              const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
              if (Number(formatted) <= 999) {
                setTime2Milliseconds(formatted.length > 3 ? formatted.slice(0, 3) : formatted); // Limit to 3 digits
              }
            }}
          />
          <Text style={styles.timeLabel}>ms</Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <Button title="Submit" onPress={handleSubmit} />
          <View style={{ width: 10 }} />
          <Button
            title="Clear"
            onPress={() => {
              setRound1Score("");
              setRound2Score("");
              setTime1Minutes("");
              setTime1Seconds("");
              setTime1Milliseconds("");
              setTime2Minutes("");
              setTime2Seconds("");
              setTime2Milliseconds("");
              setSelectedTeam(null);
            }}
            color="#888"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4", padding: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: "bold", marginLeft: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 8 },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    minWidth: 180,
    elevation: 2,
  },
  historyText: { fontSize: 14, marginBottom: 2 },
  historyHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "bold",
  },
  scorerCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    elevation: 2,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 8,
    maxHeight: 200,
    zIndex: 100,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    width: 80,
    textAlign: "center",
    backgroundColor: "#f9f9f9",
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "normal",
    marginHorizontal: 5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});