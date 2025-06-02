import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function ScorerScreen({ navigation }: any) {
  const user = FIREBASE_AUTH.currentUser;
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Scoring form
  const [round1Score, setRound1Score] = useState("");
  const [round2Score, setRound2Score] = useState("");
  const [time1, setTime1] = useState("");
  const [time2, setTime2] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch judge's assigned category and teams
  useEffect(() => {
    const fetchJudgeAndTeams = async () => {
      setLoading(true);
      console.log("ScorerScreen mounted. Current user:", user); // DEBUG
      if (user) {
        try {
          const docSnap = await getDocs(
            query(collection(FIREBASE_DB, "judge-users"), where("email", "==", user.email))
          );
          if (!docSnap.empty) {
            const data = docSnap.docs[0].data();
            setJudgeCategory(data.category);
            console.log("Judge category:", data.category); // DEBUG

            // Fetch teams in judge's category
            const teamsSnap = await getDocs(
              collection(FIREBASE_DB, `categories/${data.category}/teams`)
            );
            const teamList = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Fetched teams:", teamList); // DEBUG
            setTeams(teamList);
          } else {
            console.log("No judge-user found for this email.");
          }
        } catch (err) {
          console.log("Error fetching judge or teams:", err);
        }
      } else {
        console.log("No authenticated user.");
      }
      setLoading(false);
    };
    fetchJudgeAndTeams();
  }, [user]);

  // Fetch scoring history
  useEffect(() => {
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
        time1,
        time2,
        overallScore,
        judge: user.email,
        category: judgeCategory,
        timestamp: new Date().toISOString(),
      });
      setRound1Score("");
      setRound2Score("");
      setTime1("");
      setTime2("");
      setSelectedTeam(null);
      Alert.alert("Score submitted!");
      // Refresh history
      const q = query(
        collection(FIREBASE_DB, "scores"),
        where("judge", "==", user.email),
        where("category", "==", judgeCategory),
        orderBy("timestamp", "desc")
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      Alert.alert("Error submitting score.");
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
      <Text style={styles.sectionTitle}>History</Text>
      <FlatList
        data={history}
        horizontal
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <Text style={styles.historyText}>Team No. {item.teamId}</Text>
            <Text style={styles.historyText}>Coach: {item.coachName}</Text>
            <Text style={styles.historyText}>Team Name: {item.teamName}</Text>
            <Text style={styles.historyText}>Round 1: {item.round1Score}</Text>
            <Text style={styles.historyText}>Time 1: {item.time1}</Text>
            <Text style={styles.historyText}>Round 2: {item.round2Score}</Text>
            <Text style={styles.historyText}>Time 2: {item.time2}</Text>
            <Text style={styles.historyText}>Overall Score: {item.overallScore}</Text>
            <Text style={styles.historyText}>Time: {new Date(item.timestamp).toUTCString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ margin: 10 }}>No history yet.</Text>}
        style={{ marginBottom: 10 }}
      />

      {/* Scorer Calculator */}
      <Text style={styles.sectionTitle}>Scorer Calculator</Text>
      <View style={styles.scorerCard}>
        {/* Team Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text>
            {selectedTeam ? selectedTeam.teamName : "Select Team"}
          </Text>
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdownList}>
            {teams.length === 0 && (
              <Text style={{ padding: 10, color: "#888" }}>No teams available</Text>
            )}
            {teams.map(team => (
              <TouchableOpacity
                key={team.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedTeam(team);
                  setShowDropdown(false);
                }}
              >
                <Text>{team.teamName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* Score Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Round 1 Score"
          keyboardType="numeric"
          value={round1Score}
          onChangeText={setRound1Score}
        />
        <TextInput
          style={styles.input}
          placeholder="Input Time 1 (e.g. 1:23:45)"
          value={time1}
          onChangeText={setTime1}
        />
        <TextInput
          style={styles.input}
          placeholder="Round 2 Score"
          keyboardType="numeric"
          value={round2Score}
          onChangeText={setRound2Score}
        />
        <TextInput
          style={styles.input}
          placeholder="Input Time 2 (e.g. 0:54:00)"
          value={time2}
          onChangeText={setTime2}
        />
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <Button title="Submit" onPress={handleSubmit} />
          <View style={{ width: 10 }} />
          <Button
            title="Clear"
            onPress={() => {
              setRound1Score("");
              setRound2Score("");
              setTime1("");
              setTime2("");
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
    maxHeight: 120,
    zIndex: 100,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});