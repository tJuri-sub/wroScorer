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
  getDoc,
} from "firebase/firestore";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import styles from "../components/styles/judgeStyles/ScorerStyling";
import { Feather } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

export default function ScorerScreen({ navigation }: any) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  const user = FIREBASE_AUTH.currentUser;
  const [judgeCategory, setJudgeCategory] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event states
  const [assignedEvents, setAssignedEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Status filtering (for RoboMission and Future Engineers)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Modal state
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [scoringTeam, setScoringTeam] = useState<any>(null);
  const [scoringStep, setScoringStep] = useState<1 | 2>(1);
  const [inputScore, setInputScore] = useState("");
  const [inputMinute, setInputMinute] = useState("");
  const [inputSecond, setInputSecond] = useState("");
  const [inputMs, setInputMs] = useState("");
  const [search, setSearch] = useState("");
  
  // Error states for Future Innovators
  const [projectError, setProjectError] = useState(false);
  const [roboticError, setRoboticError] = useState(false);
  const [presentationError, setPresentationError] = useState(false);  

  // Inline error message
  const [submitError, setSubmitError] = useState("");

  // Future Engineers states
  const [feRoundType, setFeRoundType] = useState<"open" | "obstacle">("open");
  const [inputDocScore, setInputDocScore] = useState("");
  const [fePill, setFePill] = useState<"open" | "obstacle">("open");

  function parseTimeStringToMs(timeStr: string) {
    if (!timeStr) return Infinity;
    const [mm, rest] = timeStr.split(":");
    const [ss, ms] = rest.split(".");
    return (Number(mm) || 0) * 60000 + (Number(ss) || 0) * 1000 + (Number(ms) || 0) * 10;
  }

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

  // Fetch judge's assigned category and events
  useEffect(() => {
    const fetchJudgeData = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        try {
          // Get judge info
          const userDoc = await getDoc(doc(FIREBASE_DB, "judge-users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const category = data.category || null;
            setJudgeCategory(category);

            // Fetch events where this judge is assigned to this category
            const eventsRef = collection(FIREBASE_DB, "events");
            const eventsSnapshot = await getDocs(eventsRef);
            
            const judgeEvents: any[] = [];
            eventsSnapshot.forEach((eventDoc) => {
              const eventData = eventDoc.data();
              const categoryData = eventData.categoryData;
              
              // Check if judge is assigned to this event's category
              if (categoryData && categoryData[category] && categoryData[category].judges) {
                const assignedJudges = categoryData[category].judges || [];
                if (assignedJudges.includes(user.uid)) {
                  judgeEvents.push({
                    id: eventDoc.id,
                    title: eventData.title || "Untitled Event",
                    date: eventData.date || "",
                    ...eventData
                  });
                }
              }
            });

            // Sort by date (newest first)
            judgeEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setAssignedEvents(judgeEvents);
            
            // Auto-select first event if available
            if (judgeEvents.length > 0) {
              setSelectedEvent(judgeEvents[0].id);
            }
          }
        } catch (err) {
          console.log("Error fetching judge data:", err);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchJudgeData();
  }, [user]);

  // Fetch teams and scores for selected event
  useEffect(() => {
    let unsubscribeTeams: (() => void) | undefined;
    let unsubscribeScores: (() => void) | undefined;

    const fetchTeamsAndScores = async () => {
  if (!judgeCategory || !selectedEvent) {
    setLoading(false);
    return;
  }

  setLoading(true);

     try {
        // Get event document
        const eventDoc = await getDoc(doc(FIREBASE_DB, "events", selectedEvent));
        if (!eventDoc.exists()) {
          setTeams([]);
          setLoading(false);
          return;
        }
        const eventData = eventDoc.data();
        const categoryTeams = eventData?.categoryData?.[judgeCategory]?.teams || [];

        // Fetch team data from categories/{category}/teams
        const teamDocs = await Promise.all(
          categoryTeams.map(async (teamId: string) => {
            const teamDoc = await getDoc(doc(FIREBASE_DB, "categories", judgeCategory, "teams", teamId));
            return teamDoc.exists() ? { id: teamDoc.id, ...teamDoc.data() } : null;
          })
        );
        const teamList = teamDocs.filter(Boolean);

        // Fetch scores for this event and category
        const scoresRef = collection(FIREBASE_DB, "events", selectedEvent, "scores");
        const scoresSnap = await getDocs(scoresRef);
        const scoresMap: Record<string, any> = {};
        scoresSnap.forEach((doc) => {
          const score = doc.data();
          scoresMap[score.teamId] = score;
        });

        // Merge scores into teams
        const mergedTeams = teamList.map((team) => ({
          ...team,
          ...scoresMap[team.id],
        }));

        setTeams(mergedTeams);
        setLoading(false);
      } catch (err) {
        console.log("Error fetching teams or scores:", err);
        setLoading(false);
      }
    };

    fetchTeamsAndScores();

    return () => {
      if (unsubscribeTeams) unsubscribeTeams();
      if (unsubscribeScores) unsubscribeScores();
    };
  }, [judgeCategory, selectedEvent]);

  // Card status helpers
  const getCardStatus = (team: any) => {
    // RoboMission: two rounds
    if (
      judgeCategory === "robo-elem" ||
      judgeCategory === "robo-junior" ||
      judgeCategory === "robo-senior"
    ) {
      const hasR1 = team.round1Score !== null && team.round1Score !== undefined;
      const hasR2 = team.round2Score !== null && team.round2Score !== undefined;
      if (!hasR1 && !hasR2) return "no-score";
      if (hasR1 && !hasR2) return "round1-only";
      if (hasR1 && hasR2) return "complete";
      return "no-score";
    }

    // Robosports: placeholder logic (update when implemented)
    if (judgeCategory === "robosports") {
      return team.robosportsScore ? "complete" : "no-score";
    }

    // Future Innovators: one score set
    if (
      judgeCategory === "fi-elem" ||
      judgeCategory === "fi-junior" ||
      judgeCategory === "fi-senior"
    ) {
      return team.totalScore ? "complete" : "no-score";
    }

    // Future Engineers: two rounds with open/obstacle
    if (judgeCategory === "future-eng") {
      if (fePill === "open") {
        const hasR1 = team.openScore1 !== null && team.openScore1 !== undefined;
        const hasR2 = team.openScore2 !== null && team.openScore2 !== undefined;
        if (!hasR1 && !hasR2) return "no-score";
        if (hasR1 && !hasR2) return "round1-only";
        if (hasR1 && hasR2) return "complete";
        return "no-score";
      } else if (fePill === "obstacle") {
        const hasOpen1 = team.openScore1 !== null && team.openScore1 !== undefined;
        const hasOpen2 = team.openScore2 !== null && team.openScore2 !== undefined;
        if (!hasOpen1 || !hasOpen2) return "not-qualified";
        const hasR1 = team.obstacleScore1 !== null && team.obstacleScore1 !== undefined;
        const hasR2 = team.obstacleScore2 !== null && team.obstacleScore2 !== undefined;
        if (!hasR1 && !hasR2) return "no-score";
        if (hasR1 && !hasR2) return "round1-only";
        if (hasR1 && hasR2) return "complete";
        return "no-score";
      }
    }

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

  // Get status filter options based on category
  const getStatusFilterOptions = () => {
    const isRoboMissionOrFE = 
      judgeCategory === "robo-elem" ||
      judgeCategory === "robo-junior" ||
      judgeCategory === "robo-senior" ||
      judgeCategory === "future-eng";

    if (!isRoboMissionOrFE) {
      return [{ label: "All Teams", value: "all" }];
    }

    return [
      { label: "All Teams", value: "all" },
      { label: "No Scores Yet", value: "no-score" },
      { label: "Round 1 Done", value: "round1-only" },
      { label: "Complete", value: "complete" },
    ];
  };

  // Filter teams by status
  const filterTeamsByStatus = (teams: any[]) => {
    if (statusFilter === "all") return teams;
    return teams.filter(team => getCardStatus(team) === statusFilter);
  };

  // Get status counts for display
  const getStatusCounts = () => {
    const filteredTeams = teams.filter((team) => !team.disabled);
    const counts = {
      total: filteredTeams.length,
      "no-score": 0,
      "round1-only": 0,
      complete: 0,
    };

    filteredTeams.forEach(team => {
      const status = getCardStatus(team);
      if (counts.hasOwnProperty(status)) {
        counts[status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  // Scoring Modal content based on category
  function renderScorerModalContent() {
    if (!scoringTeam) return null;

    switch (judgeCategory) {
      case "robo-elem":
      case "robo-junior":
      case "robo-senior": {
        return (
          <>
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
                maxLength={3}
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
                maxLength={3}
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
                maxLength={3}
              />
            </View>
          </>
        ); 
      }
      case "robosports":
        return (
          <Text style={{ marginVertical: 20, textAlign: "center" }}>
            Robosports scoring coming soon!
          </Text>
        );
      case "fi-elem":
      case "fi-junior":
      case "fi-senior": {
        let maxProject = 75, maxRobotic = 70, maxPresentation = 55;
        if (judgeCategory === "fi-elem") {
          maxProject = 70;
          maxRobotic = 65;
          maxPresentation = 65;
        }

        return (
          <>
            <Text style={styles.scoreinputTitle}>Project & Innovation</Text>
            <TextInput
              style={[
                styles.scoreinput,
                projectError && { borderColor: "red", borderWidth: 2 }
              ]}
              placeholder={`${maxProject}pts max`}
              placeholderTextColor={projectError ? "red" : "#999"}
              keyboardType="numeric"
              value={inputScore}
              onChangeText={(text) => {
                const val = text.replace(/[^0-9]/g, "");
                setInputScore(val);
                setProjectError(Number(val) > maxProject);
              }}
              maxLength={2}
            />
            <Text style={styles.scoreinputTitle}>Robotic Solution</Text>
            <TextInput
              style={[
                styles.scoreinput,
                roboticError && { borderColor: "red", borderWidth: 2 }
              ]}
              placeholder={`${maxRobotic}pts max`}
              placeholderTextColor={roboticError ? "red" : "#999"}
              keyboardType="numeric"
              value={inputMinute}
              onChangeText={(text) => {
                const val = text.replace(/[^0-9]/g, "");
                setInputMinute(val);
                setRoboticError(Number(val) > maxRobotic);
              }}
              maxLength={2}
            />
            <Text style={styles.scoreinputTitle}>Presentation & Team Spirit</Text>
            <TextInput
              style={[
                styles.scoreinput,
                presentationError && { borderColor: "red", borderWidth: 2 }
              ]}
              placeholder={`${maxPresentation}pts max`}
              placeholderTextColor={presentationError ? "red" : "#999"}
              keyboardType="numeric"
              value={inputSecond}
              onChangeText={(text) => {
                const val = text.replace(/[^0-9]/g, "");
                setInputSecond(val);
                setPresentationError(Number(val) > maxPresentation);
              }}
              maxLength={2}
            />
            <Text style={{ marginTop: 10, fontStyle: "italic" }}>
              Total Score: {Number(inputScore) + Number(inputMinute) + Number(inputSecond)}
            </Text>
          </>
        );
      }
      case "future-eng": {
        const isObstacleRound2 =
          feRoundType === "obstacle" &&
          scoringTeam &&
          scoringTeam.obstacleScore1 != null &&
          (scoringTeam.obstacleScore2 == null || scoringStep === 2);

        const roundStep =
          feRoundType === "open"
            ? (scoringTeam.openScore1 == null ? 1 : 2)
            : (scoringTeam.obstacleScore1 == null ? 1 : 2);

        return (
          <>
            <Text style={styles.scoreinputTitle}>
              {feRoundType === "open" ? "Open - Qualifying" : "Obstacles - Final"}
            </Text>
            
            <TextInput
              style={styles.scoreinput}
              placeholder={`Enter ${feRoundType === "open" ? "Open" : "Obstacle"} Round ${roundStep} Score`}
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
                maxLength={1}
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
                maxLength={3}
              />
            </View>
            {isObstacleRound2 && (
              <>
                <Text style={styles.scoreinputTitle}>Documentation / Github (optional, max 30)</Text>
                <TextInput
                  style={styles.scoreinput}
                  placeholder="Documentation / Github"
                  keyboardType="numeric"
                  value={inputDocScore}
                  onChangeText={(text) => setInputDocScore(text.replace(/[^0-9]/g, ""))}
                  maxLength={2}
                />
              </>
            )}
          </>
        );
      }
    }
  }

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

  // Modal open for scoring
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
    setSubmitError("");
    setIsSubmitting(true);
    
     if (!scoringTeam || !selectedEvent) {
      setIsSubmitting(false); // Stop loading on early return
      return;
    }

    // RoboMission categories (updated to use new structure)
    if (
      judgeCategory === "robo-elem" ||
      judgeCategory === "robo-junior" ||
      judgeCategory === "robo-senior"
    ) {
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
        setSubmitError("Please input both score and time.");
        setIsSubmitting(false);
        return;
      }

      try {
        const update: any = {
          teamName: scoringTeam.teamName,
          teamId: scoringTeam.id,
          eventId: selectedEvent,
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
          update.round1ScoredAt = now.toISOString();
        } else {
          update.round2Score = Number(inputScore);
          update.time2 = inputTime;
          update.round2ScoredAt = now.toISOString();
        }

        setScoreModalVisible(false);
        setScoringTeam(null);

        // Save to new structure
        const scoresRef = doc(
          FIREBASE_DB,
          "events",
          selectedEvent,
          "scores",
          scoringTeam.id
        );
        await setDoc(scoresRef, update, { merge: true });

        setTeams((teams) =>
          teams.map((t) => (t.id === scoringTeam.id ? { ...t, ...update } : t))
        );

        setInputScore("");
        setInputMinute("");
        setInputSecond("");
        setInputMs("");
      } catch (e) {
        console.error("Score submission error:", e);
        Alert.alert("Error", "Failed to submit score. Please try again.");
      } finally {
        setIsSubmitting(false); // Always stop loading when done
      }
    };

    // Future Innovators (updated structure)
    if (
      judgeCategory === "fi-elem" ||
      judgeCategory === "fi-junior" ||
      judgeCategory === "fi-senior"
    ) {
      if (
        inputScore.trim() === "" ||
        inputMinute.trim() === "" ||
        inputSecond.trim() === ""
      ) {
        setSubmitError("Please input all scores.");
        return;
      }
      if (projectError || roboticError || presentationError) {
        setSubmitError("One or more scores exceed the maximum allowed.");
        return;
      }

      try {
        const update: any = {
          teamName: scoringTeam.teamName,
          teamId: scoringTeam.id,
          eventId: selectedEvent,
          category: judgeCategory,
          projectInnovation: Number(inputScore),
          roboticSolution: Number(inputMinute),
          presentationSpirit: Number(inputSecond),
          totalScore:
            Number(inputScore) +
            Number(inputMinute) +
            Number(inputSecond),
          scoredAt: new Date().toISOString(),
        };

        setScoreModalVisible(false);
        setScoringTeam(null);

        const scoresRef = doc(
          FIREBASE_DB,
          "events",
          selectedEvent,
          "scores",
          scoringTeam.id
        );
        await setDoc(scoresRef, update, { merge: true });

        setTeams((teams) =>
          teams.map((t) => (t.id === scoringTeam.id ? { ...t, ...update } : t))
        );

        setInputScore("");
        setInputMinute("");
        setInputSecond("");
      } catch (e) {
        console.error("Score submission error:", e);
        Alert.alert("Error", "Failed to submit score. Please try again.");
      }
      return;
    }

    // Future Engineers (updated structure)
    if (judgeCategory === "future-eng") {
      if (inputScore.trim() === "") {
        setSubmitError("Please input the score.");
        return;
      }
      if (inputMinute.trim() === "" && inputSecond.trim() === "" && inputMs.trim() === "") {
        setSubmitError("Please input the time.");
        return;
      }

      let mm = Number(inputMinute) || 0;
      let ss = Number(inputSecond) || 0;
      let ms = Number(inputMs) || 0;
      let totalMs = mm * 60000 + ss * 1000 + ms;
      const maxMs = 3 * 60 * 1000;
      if (totalMs > maxMs) totalMs = maxMs;

      const cappedMm = Math.floor(totalMs / 60000);
      const cappedSs = Math.floor((totalMs % 60000) / 1000);
      const cappedMs = Math.floor((totalMs % 1000) / 10);
      const inputTime = `${String(cappedMm).padStart(2, "0")}:${String(cappedSs).padStart(2, "0")}.${String(cappedMs).padStart(2, "0")}`;

      const docScoreVal = inputDocScore.trim() === "" ? 0 : Number(inputDocScore);

      try {
        const update: any = {
          teamName: scoringTeam.teamName,
          teamId: scoringTeam.id,
          eventId: selectedEvent,
          category: judgeCategory,
          docScore: docScoreVal,
        };

        if (feRoundType === "open") {
          if (
            scoringTeam.openScore1 === null ||
            scoringTeam.openScore1 === undefined
          ) {
            update.openScore1 = Number(inputScore);
            update.openTime1 = inputTime;
          } else {
            update.openScore2 = Number(inputScore);
            update.openTime2 = inputTime;
          }
        } else {
          if (
            scoringTeam.obstacleScore1 === null ||
            scoringTeam.obstacleScore1 === undefined
          ) {
            update.obstacleScore1 = Number(inputScore);
            update.obstacleTime1 = inputTime;
          } else {
            update.obstacleScore2 = Number(inputScore);
            update.obstacleTime2 = inputTime;
          }
        }

        const openScores = [
          update.openScore1 ?? scoringTeam.openScore1,
          update.openScore2 ?? scoringTeam.openScore2,
        ].filter((v) => v !== undefined && v !== null);
        
        const obstacleScores = [
          update.obstacleScore1 ?? scoringTeam.obstacleScore1,
          update.obstacleScore2 ?? scoringTeam.obstacleScore2,
        ].filter((v) => v !== undefined && v !== null);

        update.totalScore =
          Math.max(...openScores, 0) +
          Math.max(...obstacleScores, 0) +
          update.docScore;

        setScoreModalVisible(false);
        setScoringTeam(null);

        const scoresRef = doc(
          FIREBASE_DB,
          "events",
          selectedEvent,
          "scores",
          scoringTeam.id
        );
        await setDoc(scoresRef, update, { merge: true });

        setTeams((teams) =>
          teams.map((t) => (t.id === scoringTeam.id ? { ...t, ...update } : t))
        );

        setInputScore("");
        setInputMinute("");
        setInputDocScore("");
      } catch (e) {
        console.error("Score submission error:", e);
        setSubmitError("Failed to submit score. Please try again.");
      }
      return;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show message if no events assigned
  if (assignedEvents.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ textAlign: "center", fontSize: 16, color: "#666" }}>
          No events assigned to you yet. Please contact the administrator.
        </Text>
      </View>
    );
  }

  // Filter and Sort Teams
  let filteredTeams = teams
    .filter((team) => !team.disabled)
    .filter((team) =>
      team.teamName?.toLowerCase().includes(search.toLowerCase())
    );

  // Apply status filter
  filteredTeams = filterTeamsByStatus(filteredTeams);

  // Future Engineers pill filtering
  if (judgeCategory === "future-eng") {
    if (fePill === "obstacle") {
      filteredTeams = filteredTeams.filter((team) => {
        const hasOpen1 = team.openScore1 !== null && team.openScore1 !== undefined;
        const hasOpen2 = team.openScore2 !== null && team.openScore2 !== undefined;
        return hasOpen1 && hasOpen2;
      });
    }
  }

  // Sorting (by team number)
  filteredTeams = filteredTeams.sort((a, b) => {
    const aNum = Number(a.teamNumber) || 0;
    const bNum = Number(b.teamNumber) || 0;
    return aNum - bNum;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeams = filteredTeams.slice(startIndex, startIndex + itemsPerPage);

  const statusCounts = getStatusCounts();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ padding: 15, zIndex: 1000 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Score Teams</Text>
          <Text style={styles.headerSubtitle}>Tap a team card to score</Text>
        </View>

        {/* Event Selector */}
        <View style={{ marginBottom: 15, zIndex: 1000 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
            Select Event:
          </Text>
          <DropDownPicker
            open={eventDropdownOpen}
            setOpen={setEventDropdownOpen}
            value={selectedEvent}
            setValue={setSelectedEvent}
            items={assignedEvents.map(event => ({
              label: `${event.title}${event.date ? ` (${event.date})` : ''}`,
              value: event.id,
            }))}
            placeholder="Select Event"
            style={{
              borderWidth: 1,
              borderColor: "#e0e0e0",
              backgroundColor: "#fafafa",
              minHeight: 40,
            }}
            textStyle={{ fontSize: 14 }}
            dropDownContainerStyle={{
              borderWidth: 1,
              borderColor: "#e0e0e0",
              backgroundColor: "#fafafa",
            }}
          />
        </View>

        {/* Current Event Info */}
        {selectedEvent && (
          <View style={{ marginBottom: 15, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              Current Event: {assignedEvents.find(e => e.id === selectedEvent)?.title}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }}>
              Category: {judgeCategory} • {assignedEvents.find(e => e.id === selectedEvent)?.date}
            </Text>
          </View>
        )}

        {/* Status Filter (only for RoboMission and Future Engineers) */}
        {(judgeCategory === "robo-elem" || judgeCategory === "robo-junior" || 
          judgeCategory === "robo-senior" || judgeCategory === "future-eng") && (
          <View style={{ marginBottom: 15, zIndex: 999 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
              Filter by Status:
            </Text>
            <DropDownPicker
              open={statusDropdownOpen}
              setOpen={setStatusDropdownOpen}
              value={statusFilter}
              setValue={setStatusFilter}
              items={getStatusFilterOptions().map(option => ({
                ...option,
                label: `${option.label}${option.value !== "all" ? ` (${statusCounts[option.value as keyof typeof statusCounts] || 0})` : ` (${statusCounts.total})`}`
              }))}
              style={{
                borderWidth: 1,
                borderColor: "#e0e0e0",
                backgroundColor: "#fafafa",
                minHeight: 40,
              }}
              textStyle={{ fontSize: 14 }}
              dropDownContainerStyle={{
                borderWidth: 1,
                borderColor: "#e0e0e0",
                backgroundColor: "#fafafa",
              }}
              onChangeValue={() => setCurrentPage(1)} // Reset to first page when filter changes
            />
          </View>
        )}

        {/* Search Bar */}
        <TextInput
          style={styles.searchbar}
          placeholder="Search team name..."
          placeholderTextColor="#999999"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />

        {/* Future Engineers Pills */}
        {judgeCategory === "future-eng" && (
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <TouchableOpacity
              style={[
                styles.fePill,
                fePill === "open" && styles.fePillActive,
              ]}
              onPress={() => setFePill("open")}
            >
              <Text style={[
                styles.fePillText,
                fePill === "open" && styles.fePillTextActive,
              ]}> Open - Qualifying</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.fePill,
                fePill === "obstacle" && styles.fePillActive,
              ]}
              onPress={() => setFePill("obstacle")}
            >
              <Text style={[
                styles.fePillText,
                fePill === "obstacle" && styles.fePillTextActive,
                ]}>Obstacles - Final</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 15 }}>
            <TouchableOpacity
              style={[
                { padding: 8, marginHorizontal: 5, borderRadius: 5, backgroundColor: "#e0e0e0" },
                currentPage === 1 && { opacity: 0.5 }
              ]}
              onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <Text>Previous</Text>
            </TouchableOpacity>
            
            <Text style={{ marginHorizontal: 15, fontSize: 16 }}>
              Page {currentPage} of {totalPages} ({filteredTeams.length} teams)
            </Text>
            
            <TouchableOpacity
              style={[
                { padding: 8, marginHorizontal: 5, borderRadius: 5, backgroundColor: "#e0e0e0" },
                currentPage === totalPages && { opacity: 0.5 }
              ]}
              onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <Text>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Teams List */}
        <FlatList
          data={paginatedTeams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const status = getCardStatus(item);
            const isComplete = status === "complete";
            const { bestScore, bestTime, bestRound } = getBestScoreAndTime(item);

            // RoboMission: current UI
            if (
              judgeCategory === "robo-elem" ||
              judgeCategory === "robo-junior" ||
              judgeCategory === "robo-senior"
            ) {
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
            }

            // Robosports: placeholder
            if (judgeCategory === "robosports") {
              return (
                <View style={styles.teamCard}>
                  <Text style={styles.teamCardTitle}>{item.teamName}</Text>
                  <Text style={{ fontStyle: "italic", color: "#888" }}>
                    Robosports scoring coming soon!
                  </Text>
                </View>
              );
            }

            // Future Innovators: show individual scores
            if (
              judgeCategory === "fi-elem" ||
              judgeCategory === "fi-junior" ||
              judgeCategory === "fi-senior"
            ) {
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
                  <View style={{ marginVertical: 10 }}>
                    <Text style={styles.teamData}>
                      Project & Innovation:{" "}
                      <Text style={{ fontWeight: "bold", color: "#432344" }}>
                        {item.projectInnovation ?? "—"}
                      </Text>
                    </Text>
                    <Text style={styles.teamData}>
                      Robotic Solution:{" "}
                      <Text style={{ fontWeight: "bold", color: "#432344" }}>
                        {item.roboticSolution ?? "—"}
                      </Text>
                    </Text>
                    <Text style={styles.teamData}>
                      Presentation & Team Spirit:{" "}
                      <Text style={{ fontWeight: "bold", color: "#432344" }}>
                        {item.presentationSpirit ?? "—"}
                      </Text>
                    </Text>
                    <Text style={[styles.teamData, { marginTop: 6, fontStyle: "italic" }]}>
                      Total Score:{" "}
                      <Text style={{ fontWeight: "bold", color: "#388e3c" }}>
                        {item.totalScore ?? "—"}
                      </Text>
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "inter_400Regular",
                      fontStyle: "italic",
                      color: "#6B7280",
                    }}
                  >
                    Status:{" "}
                    {item.totalScore ? "Scored" : "No Score yet"}
                  </Text>
                </Pressable>
              );
            }

            // Future Engineers
            if (judgeCategory === "future-eng") {
              const status = getCardStatus(item);
              const isComplete = status === "complete";
              const isNotQualified = status === "not-qualified";
              let cardStatusText = "";
              if (fePill === "open") {
                cardStatusText =
                  status === "no-score"
                    ? "No Score yet"
                    : status === "round1-only"
                    ? "Round 1 Done"
                    : "Complete";
              } else {
                cardStatusText = isNotQualified
                  ? "Not qualified yet"
                  : status === "no-score"
                  ? "No Score yet"
                  : status === "round1-only"
                  ? "Round 1 Done"
                  : "Complete";
              }

              // For obstacle, disable if not qualified or complete
              const isCardDisabled =
                (fePill === "obstacle" && (isNotQualified || isComplete)) ||
                (fePill === "open" && isComplete);

              // For open, show openScore/time; for obstacle, show obstacleScore/time
              const score1 = fePill === "open" ? item.openScore1 : item.obstacleScore1;
              const score2 = fePill === "open" ? item.openScore2 : item.obstacleScore2;
              const time1 = fePill === "open" ? item.openTime1 : item.obstacleTime1;
              const time2 = fePill === "open" ? item.openTime2 : item.obstacleTime2;

              // For open rounds
              const openScores = [
                { score: item.openScore1, time: item.openTime1 },
                { score: item.openScore2, time: item.openTime2 }
              ].filter(v => v.score != null);

              let maxOpenScore: any | null = null;
              let minOpenTime = null;
              if (openScores.length) {
                maxOpenScore = Math.max(...openScores.map(v => v.score));
                // Find all rounds with max score, pick the one with the lowest time
                const tied = openScores.filter(v => v.score === maxOpenScore);
                minOpenTime = tied.length > 1
                  ? tied.reduce((min, curr) =>
                      parseTimeStringToMs(curr.time) < parseTimeStringToMs(min.time) ? curr : min, tied[0]
                    ).time
                  : tied[0].time;
              }

              // For obstacle rounds
              const obsScores = [
                { score: item.obstacleScore1, time: item.obstacleTime1 },
                { score: item.obstacleScore2, time: item.obstacleTime2 }
              ].filter(v => v.score != null);

              let maxObsScore: any | null = null;
              let minObsTime = null;
              if (obsScores.length) {
                maxObsScore = Math.max(...obsScores.map(v => v.score));
                const tied = obsScores.filter(v => v.score === maxObsScore);
                minObsTime = tied.length > 1
                  ? tied.reduce((min, curr) =>
                      parseTimeStringToMs(curr.time) < parseTimeStringToMs(min.time) ? curr : min, tied[0]
                    ).time
                  : tied[0].time;
              }

              return (
                <Pressable
                  disabled={isCardDisabled}
                  onPress={() => {
                    setFeRoundType(fePill);
                    openScoreModal(item);
                  }}
                  style={({ pressed }) => [
                    styles.teamCard,
                    {
                      backgroundColor: getCardColor(status),
                      opacity: isCardDisabled ? 0.7 : 1,
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
                      {/* Round column in fe */}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.teamData}>
                          Round 1:{" "}
                          <Text
                            style={
                              score1 != null &&
                              (
                                (fePill === "open" && score1 === maxOpenScore && time1 === minOpenTime) ||
                                (fePill === "obstacle" && score1 === maxObsScore && time1 === minObsTime)
                              )
                                ? { color: "#388e3c", fontWeight: "bold", textDecorationLine: "underline" }
                                : {}
                            }
                          >
                            {score1 ? score1 : "—"}
                          </Text>
                        </Text>
                        <Text style={styles.teamData}>
                          Round 2:{" "}
                          <Text
                            style={
                              score2 != null &&
                              (
                                (fePill === "open" && score2 === maxOpenScore && time2 === minOpenTime) ||
                                (fePill === "obstacle" && score2 === maxObsScore && time2 === minObsTime)
                              )
                                ? { color: "#388e3c", fontWeight: "bold", textDecorationLine: "underline" }
                                : {}
                            }
                          >
                            {score2 ? score2 : "—"}
                          </Text>
                        </Text>
                      </View>
                      {/* Time column in fe*/}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.teamData}>
                          Time 1:{" "}
                          <Text
                            style={
                              time1 != null
                                ? { color: "#1976d2", fontWeight: "bold" }
                                : {}
                            }
                          >
                            {time1 ? time1 : "—"}
                          </Text>
                        </Text>
                        <Text style={styles.teamData}>
                          Time 2:{" "}
                          <Text
                            style={
                              time2 != null
                                ? { color: "#1976d2", fontWeight: "bold" }
                                : {}
                            }
                          > 
                            {time2 ? time2 : "—"}
                          </Text>
                        </Text>
                      </View>
                    </View>
                    {/* Documentation only for obstacle */}
                    {fePill === "obstacle" && (
                      <Text style={styles.teamData}>
                        Documentation:{" "}
                        <Text style={{ fontWeight: "bold", color: "#432344" }}>
                          {item.docScore ?? "—"}
                        </Text>
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: "inter_400Regular",
                      fontStyle: "italic",
                      color: "#6B7280",
                    }}
                  >
                    Status: {cardStatusText}
                  </Text>
                </Pressable>
              );
            }

            // Default fallback
            return (
              <View style={styles.teamCard}>
                <Text style={styles.teamCardTitle}>{item.teamName}</Text>
                <Text style={{ fontStyle: "italic", color: "#888" }}>
                  No Teams in this category.
                </Text>
              </View>
            );
          }}
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
              {renderScorerModalContent()}
              {submitError ? (
                <Text style={{ color: "red", marginVertical: 8 }}>
                  {submitError}
                </Text>
              ) : null}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, isSubmitting && { opacity: 0.5 }]}
                  onPress={() => {
                    setScoreModalVisible(false);
                    setSubmitError(""); 
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.buttonText, { color: "#432344" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
               
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                  onPress={handleScoreSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Submitting...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}