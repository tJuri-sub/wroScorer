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
  Modal,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import styles from "../components/styles/judgeStyles/ScorerStyling";

export default function ScorerScreen({ navigation }: any) {
  const user = FIREBASE_AUTH.currentUser;
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [scoringTeam, setScoringTeam] = useState<any>(null);
  const [scoringStep, setScoringStep] = useState<1 | 2>(1);
  const [inputScore, setInputScore] = useState("");
  const [inputMinute, setInputMinute] = useState("");
  const [inputSecond, setInputSecond] = useState("");
  const [inputMs, setInputMs] = useState("");
  const [search, setSearch] = useState("");

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
          }
        } catch (err) {
          console.log("Error fetching judge or teams:", err);
        }
      }
      setLoading(false);
    };
    fetchJudgeAndTeams();
  }, [user]);

  // Card status helpers
  const getCardStatus = (team: any) => {
    if (!team.round1Score && !team.round2Score) return "no-score";
    if (team.round1Score && !team.round2Score) return "round1-only";
    if (team.round1Score && team.round2Score) return "complete";
    return "no-score";
  };

  const getCardColor = (status: string) => {
    switch (status) {
      case "no-score":
        return "#faf9f6";
      case "round1-only":
        return "#fff9c4";
      case "complete":
        return "#c8e6c9";
      default:
        return "#faf9f6";
    }
  };

  // Best score/time
  function getBestScoreAndTime(team: any) {
    const r1 = team.round1Score ?? null;
    const r2 = team.round2Score ?? null;
    if (r1 == null && r2 == null)
      return { bestScore: null, bestTime: null, bestRound: null };

    if (r2 == null || (r1 != null && r1 >= r2)) {
      return { bestScore: r1, bestTime: team.time1, bestRound: 1 };
    } else {
      return { bestScore: r2, bestTime: team.time2, bestRound: 2 };
    }
  }

  // Modal open
  const openScoreModal = (team: any) => {
    if (getCardStatus(team) === "complete") return;
    setScoringTeam(team);
    setScoringStep(!team.round1Score ? 1 : 2);
    setInputScore("");
    setInputMinute("");
    setInputSecond("");
    setInputMs("");
    setScoreModalVisible(true);
  };

  // Modal submit
  const handleScoreSubmit = async () => {
    if (!scoringTeam) return;
    const mm = (inputMinute || "0").padStart(2, "0");
    const ss = (inputSecond || "0").padStart(2, "0");
    const ms = (inputMs || "0").padStart(2, "0");
    const inputTime = `${mm}:${ss}:${ms}`;
    if (!inputScore || !inputMinute || !inputSecond || !inputMs) {
      Alert.alert("Please input both score and time.");
      return;
    }
    try {
      // Always include all relevant fields
      const update: any = {
        teamName: scoringTeam.teamName,
        teamId: scoringTeam.id,
        round1Score: scoringTeam.round1Score ?? null,
        time1: scoringTeam.time1 ?? null,
        round2Score: scoringTeam.round2Score ?? null,
        time2: scoringTeam.time2 ?? null,
      };
      if (scoringStep === 1) {
        update.round1Score = Number(inputScore);
        update.time1 = inputTime;
      } else {
        update.round2Score = Number(inputScore);
        update.time2 = inputTime;
      }
      setScoreModalVisible(false);
      setScoringTeam(null);

      // Update Firestore
      const teamRef = doc(FIREBASE_DB, "scores", scoringTeam.id);
      await setDoc(teamRef, update, { merge: true });

      // Update local state
      setTeams((teams) =>
        teams.map((t) => (t.id === scoringTeam.id ? { ...t, ...update } : t))
      );
      // Reset inputs
      setInputScore("");
      setInputMinute("");
      setInputSecond("");
      setInputMs("");
    } catch (e) {
      Alert.alert("Error", "Failed to submit score. Please try again.");
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 16,
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <Text style={styles.header}>Score Teams</Text>
          <Text style={{ marginLeft: 25, color: "#888", fontSize: 15 }}>
            Tap a team card to score
          </Text>
        </View>
        <View style={{ marginHorizontal: 16, marginBottom: 10 }}>
          <TextInput
            style={{
              backgroundColor: "#f3f3f3",
              borderWidth: 1,
              borderColor: "#A7A5AC",
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 16,
              fontSize: 16,
            }}
            placeholder="Search team name..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          data={teams.filter((team) =>
            team.teamName?.toLowerCase().includes(search.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const status = getCardStatus(item);
            const isComplete = status === "complete";
            const { bestScore, bestTime, bestRound } =
              getBestScoreAndTime(item);

            return (
              <TouchableOpacity
                disabled={isComplete}
                onPress={() => openScoreModal(item)}
                style={[
                  styles.teamCard,
                  {
                    backgroundColor: getCardColor(status),
                    opacity: isComplete ? 1 : 1,
                  },
                ]}
              >
                <Text style={[styles.teamCardTitle]}>{item.teamNumber}</Text>
                <Text style={styles.teamCardTitle}>{item.teamName}</Text>

                <View style={{ flexDirection: "row", marginBottom: 2 }}>
                  <Text style={styles.teamData}>
                    Round 1:{" "}
                    <Text
                      style={
                        bestRound === 1
                          ? { color: "#388e3c", fontWeight: "bold" }
                          : {}
                      }
                    >
                      {item.round1Score ?? "—"}
                    </Text>
                  </Text>
                  <View style={{ width: 24 }} /> {/* Spacer for more space */}
                  <Text style={styles.teamData}>
                    Time 1:{" "}
                    <Text
                      style={
                        bestRound === 1
                          ? { color: "#1976d2", fontWeight: "bold" }
                          : {}
                      }
                    >
                      {item.time1 ?? "—"}
                    </Text>
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <Text style={styles.teamData}>
                    Round 2:{" "}
                    <Text
                      style={
                        bestRound === 2
                          ? { color: "#388e3c", fontWeight: "bold" }
                          : {}
                      }
                    >
                      {item.round2Score ?? "—"}
                    </Text>
                  </Text>
                  <View style={{ width: 24 }} />
                  <Text style={styles.teamData}>
                    Time 2:{" "}
                    <Text
                      style={
                        bestRound === 2
                          ? { color: "#1976d2", fontWeight: "bold" }
                          : {}
                      }
                    >
                      {item.time2 ?? "—"}
                    </Text>
                  </Text>
                </View>
                <Text style={{ fontStyle: "italic", color: "#888" }}>
                  Status:{" "}
                  {status === "no-score"
                    ? "No Score yet"
                    : status === "round1-only"
                    ? "Round 1 Done"
                    : "Complete"}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ margin: 16 }}>No teams found.</Text>
          }
          contentContainerStyle={{ padding: 8 }}
        />

        {/* Score Calculator Modal */}
        <Modal
          visible={scoreModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setScoreModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{scoringTeam?.teamName}</Text>
              <TextInput
                style={styles.scoreinput}
                placeholder={`Enter Round ${scoringStep} Score`}
                keyboardType="numeric"
                value={inputScore}
                onChangeText={(text) =>
                  setInputScore(text.replace(/[^0-9]/g, ""))
                }
              />
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 4 }]}
                  placeholder="mm"
                  keyboardType="numeric"
                  value={inputMinute}
                  onChangeText={(text) =>
                    setInputMinute(text.replace(/[^0-9]/g, ""))
                  }
                  maxLength={2}
                />
                <Text style={{ fontSize: 18, color: "#888" }}>:</Text>
                <TextInput
                  style={[styles.input, { flex: 1, marginHorizontal: 4 }]}
                  placeholder="ss"
                  keyboardType="numeric"
                  value={inputSecond}
                  onChangeText={(text) =>
                    setInputSecond(text.replace(/[^0-9]/g, ""))
                  }
                  maxLength={2}
                />
                <Text style={{ fontSize: 18, color: "#888" }}>:</Text>
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 4 }]}
                  placeholder="ms"
                  keyboardType="numeric"
                  value={inputMs}
                  onChangeText={(text) =>
                    setInputMs(text.replace(/[^0-9]/g, ""))
                  }
                  maxLength={2}
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setScoreModalVisible(false)}
                >
                  <Text style={[styles.buttonText, { color: "#432344" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleScoreSubmit}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}
