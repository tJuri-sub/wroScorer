import React, { useEffect, useLayoutEffect, useState } from "react";
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
  Pressable,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import styles from "../components/styles/judgeStyles/ScorerStyling";
import { Feather } from "@expo/vector-icons";

export default function ScorerScreen({ navigation }: any) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{ marginLeft: 15 }}
        >
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fetch judge's assigned category and teams
  useEffect(() => {
    let unsubscribeTeams: (() => void) | undefined;
    let unsubscribeScores: (() => void) | undefined;

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

            // Listen to teams in judge's category
            const teamsRef = collection(
              FIREBASE_DB,
              `categories/${data.category}/teams`
            );
            unsubscribeTeams = onSnapshot(teamsRef, (teamsSnap) => {
              const teamList = teamsSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              // Listen to scores and merge with teams
              const scoresRef = collection(FIREBASE_DB, "scores2");
              unsubscribeScores = onSnapshot(scoresRef, (scoresSnap) => {
                const scoresMap: Record<string, any> = {};
                scoresSnap.forEach((doc) => {
                  const score = doc.data();
                  if (score.category === data.category) {
                    scoresMap[score.teamId] = score;
                  }
                });

                // Merge scores into teams
                const mergedTeams = teamList.map((team) => ({
                  ...team,
                  ...scoresMap[team.id],
                }));
                setTeams(mergedTeams);
                setLoading(false);
              });
            });
          }
        } catch (err) {
          console.log("Error fetching judge or teams:", err);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchJudgeAndTeams();

    return () => {
      if (unsubscribeTeams) unsubscribeTeams();
      if (unsubscribeScores) unsubscribeScores();
    };
  }, [user]);

  // Card status helpers
  const getCardStatus = (team: any) => {
    const hasR1 = team.round1Score !== null && team.round1Score !== undefined;
    const hasR2 = team.round2Score !== null && team.round2Score !== undefined;

    if (!hasR1 && !hasR2) return "no-score";
    if (hasR1 && !hasR2) return "round1-only";
    if (hasR1 && hasR2) return "complete";
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
    setScoringStep(
      team.round1Score === null || team.round1Score === undefined ? 1 : 2
    );
    setInputScore("");
    setInputMinute("");
    setInputSecond("");
    setInputMs("");
    setScoreModalVisible(true);
  };

  const handleScoreSubmit = async () => {
    if (!scoringTeam) return;

    const mm = (inputMinute || "0").padStart(2, "0");
    const ss = (inputSecond || "0").padStart(2, "0");
    const ms = (inputMs || "0").padStart(2, "0");
    const inputTime = `${mm}:${ss}.${ms}`;

    if (
      inputScore.trim() === "" ||
      inputMinute.trim() === "" ||
      inputSecond.trim() === "" ||
      inputMs.trim() === ""
    ) {
      Alert.alert("Please input both score and time.");
      return;
    }

    try {
      const update: any = {
        teamName: scoringTeam.teamName,
        teamId: scoringTeam.id,
        round1Score: scoringTeam.round1Score ?? null,
        time1: scoringTeam.time1 ?? null,
        round2Score: scoringTeam.round2Score ?? null,
        time2: scoringTeam.time2 ?? null,
        category: judgeCategory,
      };

      const now = new Date();
      if (scoringStep === 1) {
        update.round1Score = Number(inputScore);
        update.time1 = inputTime;
        update.round1ScoredAt = now.toISOString(); // Store date/time for round 1
      } else {
        update.round2Score = Number(inputScore);
        update.time2 = inputTime;
        update.round2ScoredAt = now.toISOString(); // Store date/time for round 2
      }

      setScoreModalVisible(false);
      setScoringTeam(null);

      // 🔥 1. Update team inside its category
      // const categoryRef = doc(
      //   FIREBASE_DB,
      //   `categories/${judgeCategory}/teams/${scoringTeam.id}`
      // );
      // await setDoc(categoryRef, update, { merge: true });

      // 🔥 2. Also update or create a mirrored entry in "scores"
      const scoresRef = doc(FIREBASE_DB, "scores2", scoringTeam.id);
      await setDoc(scoresRef, update, { merge: true });

      // Update local UI state
      setTeams((teams) =>
        teams.map((t) => (t.id === scoringTeam.id ? { ...t, ...update } : t))
      );

      // Reset input fields
      setInputScore("");
      setInputMinute("");
      setInputSecond("");
      setInputMs("");
    } catch (e) {
      console.error("Score submission error:", e);
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
      <View style={{ padding: 15 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Score Teams</Text>
          <Text style={styles.headerSubtitle}>Tap a team card to score</Text>
        </View>
        {/* Search Bar */}
        <TextInput
          style={styles.searchbar}
          placeholder="Search team name..."
          placeholderTextColor="#999999"
          value={search}
          onChangeText={setSearch}
        />
        {/* Scoring Team Card */}
        <FlatList
          data={teams
            .filter((team) => !team.disabled)
            .filter((team) =>
              team.teamName?.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => {
              const aNum = Number(a.teamNumber) || 0;
              const bNum = Number(b.teamNumber) || 0;
              return aNum - bNum;
            })}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const status = getCardStatus(item);
            const isComplete = status === "complete";
            const { bestScore, bestTime, bestRound } =
              getBestScoreAndTime(item);

            return (
              <Pressable
                disabled={isComplete}
                onPress={() => openScoreModal(item)}
                style={({ pressed }) => [
                  styles.teamCard,
                  {
                    backgroundColor: getCardColor(status),
                    opacity: isComplete ? 1 : 1,
                  },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.teamCardTeamNumber}>
                  Team no. {item.teamNumber}
                </Text>

                <Text style={styles.teamCardTitle}>{item.teamName}</Text>

                <View
                  style={{
                    borderBottomWidth: 1,
                    borderColor: "#bcbcbcff",
                    paddingVertical: 10,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    {/* Round column */}
                    <View style={{ flex: 1 }}>
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
                    </View>
                    {/* Time column */}
                    <View style={{ flex: 1 }}>
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
                  </View>
                </View>

                <Text
                  style={{
                    fontFamily: "inter_400Regular",
                    fontStyle: "italic",
                    color: "#6B7280",
                  }}
                >
                  Status:{" "}
                  {status === "no-score"
                    ? "No Score yet"
                    : status === "round1-only"
                    ? "Round 1 Done"
                    : "Complete"}
                </Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={{ margin: 16 }}>No teams found.</Text>
          }
        />

        {/* Scorer Modal */}
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
                <Text style={{ fontSize: 18, color: "#888" }}>.</Text>
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
