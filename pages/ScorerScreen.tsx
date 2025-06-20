import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import styles from "../components/styles/ScorerStyling";

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
            const teamList = teamsSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
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
        setHistory(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
      const formattedTime1 = `${(time1Minutes || "0").padStart(2, "0")}:${(
        time1Seconds || "0"
      ).padStart(2, "0")}:${(time1Milliseconds || "0").padStart(3, "0")}`;
      const formattedTime2 = `${(time2Minutes || "0").padStart(2, "0")}:${(
        time2Seconds || "0"
      ).padStart(2, "0")}:${(time2Milliseconds || "0").padStart(3, "0")}`;
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View>
        {/* Header */}
        <View style={styles.container}>
          {/* History */}
          <View style={styles.historyHeader}>
            <Text style={styles.seeAllText}>Score History</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AllScoresScreen", { history })
              }
            >
              <Text style={styles.historyText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={history.slice(0, 5)} // Limit to 5 items
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <Text style={styles.historyMainText}>
                  <Text style={{ fontWeight: "bold" }}>Team Name: </Text>
                  {item.teamName}
                </Text>
                <View style={styles.historyTextContainer}>
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <Text style={styles.historyText}>
                      <Text style={{ fontWeight: "bold" }}>Round 1: </Text>
                      {item.round1Score} points
                    </Text>
                    <Text style={styles.historyText}>
                      <Text style={{ fontWeight: "bold" }}>Time 1: </Text>
                      {item.time1}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <Text style={styles.historyText}>
                      <Text style={{ fontWeight: "bold" }}>Round 2: </Text>
                      {item.round2Score} points
                    </Text>
                    <Text style={styles.historyText}>
                      <Text style={{ fontWeight: "bold" }}>Time 2: </Text>
                      {item.time2}
                    </Text>
                  </View>
                  <Text style={styles.historyText}>
                    <Text style={{ fontWeight: "bold" }}>Overall Score: </Text>
                    {item.overallScore}
                  </Text>
                </View>
                <Text style={styles.historyCreatedText}>
                  Scored At:{" "}
                  {new Date(item.timestamp).toUTCString().replace("GMT", "PHT")}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ margin: 10 }}>No history yet.</Text>
            }
            contentContainerStyle={{ paddingLeft: 8 }}
            style={{
              marginBottom: 10,
              padding: 4,
            }}
          />

          {/* Scorer Calculator */}
          <Text style={styles.sectionTitle}>Scorer Calculator</Text>
          <View style={styles.scorerCard}>
            {/* Searchable Dropdown */}
            {/* <TextInput
              style={styles.dropdown}
              placeholder="Select Team"
               placeholderTextColor="#a9a9a9"
              value={searchQuery}
              onFocus={() => setShowDropdown(true)} // Show dropdown when focused
              onChangeText={(text) => {
                setSearchQuery(text);
                const filtered = teams.filter((team) =>
                  team.teamName.toLowerCase().includes(text.toLowerCase())
                );
                setFilteredTeams(filtered);
              }}
            /> */}
            <View style={{ position: "relative", justifyContent: "center" }}>
              <TextInput
                style={[styles.dropdown, { paddingRight: 36 }]} // add right padding for the icon
                placeholder="Select Team"
                placeholderTextColor="#a9a9a9"
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  const filtered = teams.filter((team) =>
                    team.teamName.toLowerCase().includes(text.toLowerCase())
                  );
                  setFilteredTeams(filtered);
                }}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 10,
                  top: 0,
                  bottom: 4,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setShowDropdown((prev) => !prev)}
                activeOpacity={0.7}
              >
                <AntDesign name="down" size={24} color="black" />
              </TouchableOpacity>
            </View>
            {showDropdown && (
              <View style={[styles.dropdownList, { maxHeight: 48 * 5 }]}>
                {filteredTeams.length === 0 ? (
                  <Text style={{ padding: 10, color: "#888" }}>
                    No teams available
                  </Text>
                ) : (
                  <ScrollView>
                    {filteredTeams.map((team) => (
                      <TouchableOpacity
                        key={team.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedTeam(team);
                          setSearchQuery(team.teamName);
                          setShowDropdown(false);
                        }}
                      >
                        <Text>{team.teamName}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
            {/* Round 1 Score Input */}
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginVertical: 8 }}
            >
              Round 1
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Round 1 Score"
              placeholderTextColor="#a9a9a9"
              keyboardType="numeric"
              value={round1Score}
              onChangeText={(text) =>
                setRound1Score(text.replace(/[^0-9]/g, ""))
              }
            />
            {/* Round 1 Time Input */}
            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                placeholder="00"
                placeholderTextColor="#a9a9a9"
                keyboardType="numeric"
                value={time1Minutes}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
                  setTime1Minutes(
                    formatted.length > 2 ? formatted.slice(0, 2) : formatted
                  ); // Limit to 2 digits
                }}
              />
              <Text style={styles.timeLabel}>m</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="00"
                placeholderTextColor="#a9a9a9"
                keyboardType="numeric"
                value={time1Seconds}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
                  if (Number(formatted) <= 59) {
                    setTime1Seconds(
                      formatted.length > 2 ? formatted.slice(0, 2) : formatted
                    ); // Limit to 2 digits
                  }
                }}
              />
              <Text style={styles.timeLabel}>s</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="000"
                placeholderTextColor="#a9a9a9"
                keyboardType="numeric"
                value={time1Milliseconds}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
                  if (Number(formatted) <= 999) {
                    setTime1Milliseconds(
                      formatted.length > 3 ? formatted.slice(0, 3) : formatted
                    ); // Limit to 3 digits
                  }
                }}
              />
              <Text style={styles.timeLabel}>ms</Text>
            </View>
            {/* Round 2 Score Input */}
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginVertical: 8 }}
            >
              Round 2
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Round 2 Score"
              placeholderTextColor="#a9a9a9"
              keyboardType="numeric"
              value={round2Score}
              onChangeText={(text) =>
                setRound2Score(text.replace(/[^0-9]/g, ""))
              }
            />
            {/* Round 2 Time Input */}
            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                placeholder="00"
                placeholderTextColor="#a9a9a9"
                keyboardType="numeric"
                value={time2Minutes}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
                  setTime2Minutes(
                    formatted.length > 2 ? formatted.slice(0, 2) : formatted
                  ); // Limit to 2 digits
                }}
              />
              <Text style={styles.timeLabel}>m</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="00"
                placeholderTextColor="#a9a9a9"
                keyboardType="numeric"
                value={time2Seconds}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
                  if (Number(formatted) <= 59) {
                    setTime2Seconds(
                      formatted.length > 2 ? formatted.slice(0, 2) : formatted
                    ); // Limit to 2 digits
                  }
                }}
              />
              <Text style={styles.timeLabel}>s</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="000"
                placeholderTextColor="#a9a9a9"
                keyboardType="numeric"
                value={time2Milliseconds}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^0-9]/g, ""); // Allow only numbers
                  if (Number(formatted) <= 999) {
                    setTime2Milliseconds(
                      formatted.length > 3 ? formatted.slice(0, 3) : formatted
                    ); // Limit to 3 digits
                  }
                }}
              />
              <Text style={styles.timeLabel}>ms</Text>
            </View>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              {/* <Button title="Submit" onPress={handleSubmit} />
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
              /> */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#432344",
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  borderRadius: 6,
                  alignItems: "center",
                }}
                onPress={handleSubmit}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Submit
                </Text>
              </TouchableOpacity>

              <View style={{ width: 10 }} />

              <TouchableOpacity
                style={{
                  backgroundColor: "#eee",
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  borderRadius: 6,
                  alignItems: "center",
                }}
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
              >
                <Text style={{ color: "#888", fontWeight: "bold" }}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
