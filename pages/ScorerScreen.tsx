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
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import styles from "../components/styles/judgeStyles/ScorerStyling";
import robostyles from "../components/styles/judgeStyles/RobosportsStyling";
import { Feather } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import RoboSportsMatchScorer from "../components/component/judgeDrawer/robosports/RoboSportsScorer";
// Add these imports
import {
  Tournament,
  TournamentBracket,
} from "../components/component/judgeDrawer/robosports/TournamentTypes";
import { TournamentManager } from "../components/component/judgeDrawer/robosports/TournamentManager";
import TournamentSetup from "../components/component/judgeDrawer/robosports/TournamentSetup";

interface GameData {
  id: string;
  gameNumber: number;
  eventId: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  status: "created" | "in-progress" | "finished";
  currentMatch: number;
  matchResults: any[];
  gameWinner: string | null;
  team1Points: number;
  team2Points: number;
  createdAt: string;
  completedAt?: string;
  tournamentId?: string;
  bracketId?: string;
  currentMatchState?: {
    team1Balls: { orange: number; purple: number };
    team2Balls: { orange: number; purple: number };
  };
}

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
  const [scoringStep, setScoringStep] = useState<1 | 2 | 3>(1);
  const [inputScore, setInputScore] = useState("");
  const [inputMinute, setInputMinute] = useState("");
  const [inputSecond, setInputSecond] = useState("");
  const [inputMs, setInputMs] = useState("");
  const [fiElemModalStep, setFiElemModalStep] = useState<1 | 2>(1);
  const [projectIdeaScore, setProjectIdeaScore] = useState("");
  const [projectResearchScore, setProjectResearchScore] = useState("");
  const [projectUsageScore, setProjectUsageScore] = useState("");
  const [projectInnovationScore, setProjectInnovationScore] = useState("");
  const [roboticSolutionScore, setRoboticSolutionScore] = useState("");
  const [engineeringConceptsScore, setEngineeringConceptsScore] = useState("");
  const [codeEfficiencyScore, setCodeEfficiencyScore] = useState("");
  const [roboticDemoScore, setRoboticDemoScore] = useState("");
  const [presentationBoothScore, setPresentationBoothScore] = useState("");
  const [technicalUnderstandingScore, setTechnicalUnderstandingScore] =
    useState("");
  const [teamSpiritScore, setTeamSpiritScore] = useState("");
  const [search, setSearch] = useState("");

  const [extraEntrepreneurshipScore, setExtraEntrepreneurshipScore] =
    useState("");
  const [nextStepsScore, setNextStepsScore] = useState(""); // senior only

  const [scoresheetNumber, setScoresheetNumber] = useState<number | null>(null);

  const fiScoreFields: Record<string, [string, (v: string) => void]> = {
    projectIdeaScore: [projectIdeaScore, setProjectIdeaScore],
    projectResearchScore: [projectResearchScore, setProjectResearchScore],
    projectUsageScore: [projectUsageScore, setProjectUsageScore],
    projectInnovationScore: [projectInnovationScore, setProjectInnovationScore],
    extraEntrepreneurshipScore: [
      extraEntrepreneurshipScore,
      setExtraEntrepreneurshipScore,
    ],
    nextStepsScore: [nextStepsScore, setNextStepsScore],
    roboticSolutionScore: [roboticSolutionScore, setRoboticSolutionScore],
    engineeringConceptsScore: [
      engineeringConceptsScore,
      setEngineeringConceptsScore,
    ],
    codeEfficiencyScore: [codeEfficiencyScore, setCodeEfficiencyScore],
    roboticDemoScore: [roboticDemoScore, setRoboticDemoScore],
    presentationBoothScore: [presentationBoothScore, setPresentationBoothScore],
    technicalUnderstandingScore: [
      technicalUnderstandingScore,
      setTechnicalUnderstandingScore,
    ],
    teamSpiritScore: [teamSpiritScore, setTeamSpiritScore],
  };

  const scaleFiGroup = (
    group: { key: string; max: number }[],
    rawScores: Record<string, any>,
  ) =>
    group.reduce(
      (sum, { key, max }) =>
        sum + parseFloat(((Number(rawScores[key] || 0) / 10) * max).toFixed(2)),
      0,
    );

  // Works for fi-elem, fi-junior, fi-senior — replaces scaleFiElemScores
  const scaleFiScores = (category: string, rawScores: Record<string, any>) => {
    const config = getFiConfig(category);
    const projectTotal = parseFloat(
      scaleFiGroup(config.project, rawScores).toFixed(2),
    );
    const roboticTotal = parseFloat(
      scaleFiGroup(config.robotic, rawScores).toFixed(2),
    );
    const presentationTotal = parseFloat(
      scaleFiGroup(config.presentation, rawScores).toFixed(2),
    );
    const total = parseFloat(
      (projectTotal + roboticTotal + presentationTotal).toFixed(2),
    );
    return { projectTotal, roboticTotal, presentationTotal, total };
  };

  const renderFiScoreGroup = (
    group: { key: string; label: string; max: number; description?: string }[],
  ) =>
    group.map(({ key, label, max, description }) => {
      const [value, onChange] = fiScoreFields[key];
      return (
        <View key={key}>
          <FiElemDropdownRow
            label={`${label} (max ${max})`}
            value={value}
            onChange={onChange}
          />
          {description ? (
            <Text
              style={{
                fontSize: 11,
                color: "#888",
                marginTop: -6,
                marginBottom: 10,
              }}
            >
              {description}
            </Text>
          ) : null}
        </View>
      );
    });

  const resetFiElemForm = () => {
    setProjectIdeaScore("");
    setProjectResearchScore("");
    setProjectUsageScore("");
    setProjectInnovationScore("");
    setExtraEntrepreneurshipScore("");
    setNextStepsScore("");
    setRoboticSolutionScore("");
    setEngineeringConceptsScore("");
    setCodeEfficiencyScore("");
    setRoboticDemoScore("");
    setPresentationBoothScore("");
    setTechnicalUnderstandingScore("");
    setTeamSpiritScore("");
  };

  const fiElemScoreItems = Array.from({ length: 10 }, (_, index) => ({
    label: String(index + 1),
    value: String(index + 1),
  }));

  const FiElemDropdownRow = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text style={{ flex: 1, marginRight: 12, fontSize: 13 }}>{label}</Text>
        <DropDownPicker
          open={open}
          value={value || null}
          items={fiElemScoreItems}
          setOpen={setOpen}
          setValue={(callback) => {
            const newValue =
              typeof callback === "function"
                ? callback(value || null)
                : callback;
            onChange(String(newValue ?? ""));
          }}
          placeholder="0"
          style={{
            width: 90,
            minHeight: 40,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
          }}
          containerStyle={{ width: 90 }}
          textStyle={{ fontSize: 13 }}
          listMode="MODAL"
          modalTitle={label}
          modalContentContainerStyle={{ backgroundColor: "#fff" }}
          modalAnimationType="slide"
        />
      </View>
    );
  };

  // Error states for Future Innovators
  const [projectError, setProjectError] = useState(false);
  const [roboticError, setRoboticError] = useState(false);
  const [presentationError, setPresentationError] = useState(false);

  // Inline error message
  const [submitError, setSubmitError] = useState("");

  // Robomission states
  const [selectedDay, setSelectedDay] = useState<1 | 2>(1);

  // RoboSports states
  const [games, setGames] = useState<GameData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam1, setSelectedTeam1] = useState<string>("");
  const [selectedTeam2, setSelectedTeam2] = useState<string>("");
  const [team1DropdownOpen, setTeam1DropdownOpen] = useState(false);
  const [team2DropdownOpen, setTeam2DropdownOpen] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [activeGame, setActiveGame] = useState<GameData | null>(null);
  const [showScorerModal, setScorerModal] = useState(false);

  // Robosports Tournament states
  const [tournamentMode, setTournamentMode] = useState<
    "regular" | "tournament"
  >("regular");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [showTournamentSetup, setShowTournamentSetup] = useState(false);

  // Future Engineers states
  const [feRoundType, setFeRoundType] = useState<"open" | "obstacle">("open");
  const [inputDocScore, setInputDocScore] = useState("");
  const [fePill, setFePill] = useState<"open" | "obstacle">("open");

  function parseTimeStringToMs(timeStr: string) {
    if (!timeStr) return Infinity;
    const [mm, rest] = timeStr.split(":");
    const [ss, ms] = rest.split(".");
    return (
      (Number(mm) || 0) * 60000 +
      (Number(ss) || 0) * 1000 +
      (Number(ms) || 0) * 10
    );
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
          const userDoc = await getDoc(
            doc(FIREBASE_DB, "judge-users", user.uid),
          );
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
              if (
                categoryData &&
                categoryData[category] &&
                categoryData[category].judges
              ) {
                const assignedJudges = categoryData[category].judges || [];
                if (assignedJudges.includes(user.uid)) {
                  judgeEvents.push({
                    id: eventDoc.id,
                    title: eventData.title || "Untitled Event",
                    date: eventData.date || "",
                    ...eventData,
                  });
                }
              }
            });

            // Sort by date (newest first)
            judgeEvents.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
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

  // Load RoboSports games when category is robosports
  useEffect(() => {
    if (judgeCategory !== "robosports" || !selectedEvent) return;

    const gamesRef = collection(
      FIREBASE_DB,
      "events",
      selectedEvent,
      "robosports-games",
    );
    const gamesQuery = query(gamesRef, orderBy("gameNumber", "asc"));

    const unsubscribe = onSnapshot(gamesQuery, (snapshot) => {
      const loadedGames: GameData[] = [];
      snapshot.forEach((doc) => {
        loadedGames.push({ id: doc.id, ...doc.data() } as GameData);
      });
      setGames(loadedGames);
    });

    return () => unsubscribe();
  }, [judgeCategory, selectedEvent]);

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
        const eventDoc = await getDoc(
          doc(FIREBASE_DB, "events", selectedEvent),
        );
        if (!eventDoc.exists()) {
          setTeams([]);
          setLoading(false);
          return;
        }
        const eventData = eventDoc.data();
        const categoryTeams =
          eventData?.categoryData?.[judgeCategory]?.teams || [];

        // Fetch team data from categories/{category}/teams
        const teamDocs = await Promise.all(
          categoryTeams.map(async (teamId: string) => {
            const teamDoc = await getDoc(
              doc(FIREBASE_DB, "categories", judgeCategory, "teams", teamId),
            );
            return teamDoc.exists()
              ? { id: teamDoc.id, ...teamDoc.data() }
              : null;
          }),
        );
        const teamList = teamDocs.filter(Boolean);

        // Fetch scores for this event and category
        const scoresRef = collection(
          FIREBASE_DB,
          "events",
          selectedEvent,
          "scores",
        );
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

  // RoboSports functions
  const getNextGameNumber = () => {
    if (games.length === 0) return 1;
    return Math.max(...games.map((g) => g.gameNumber)) + 1;
  };

  const createNewGame = async () => {
    if (!selectedTeam1 || !selectedTeam2) {
      Alert.alert("Error", "Please select both teams");
      return;
    }

    if (selectedTeam1 === selectedTeam2) {
      Alert.alert("Error", "Please select different teams");
      return;
    }

    // Check if these teams already have an ongoing game
    const existingGame = games.find(
      (g) =>
        g.status !== "finished" &&
        ((g.team1Id === selectedTeam1 && g.team2Id === selectedTeam2) ||
          (g.team1Id === selectedTeam2 && g.team2Id === selectedTeam1)),
    );

    if (existingGame) {
      Alert.alert("Error", "These teams already have an ongoing game");
      return;
    }

    setIsCreatingGame(true);

    try {
      const gameNumber = getNextGameNumber();
      const gameData: Omit<GameData, "id"> = {
        gameNumber,
        eventId: selectedEvent,
        team1Id: selectedTeam1,
        team2Id: selectedTeam2,
        team1Name: teams.find((t) => t.id === selectedTeam1)?.teamName || "",
        team2Name: teams.find((t) => t.id === selectedTeam2)?.teamName || "",
        status: "created",
        currentMatch: 1,
        matchResults: [],
        gameWinner: null,
        team1Points: 0,
        team2Points: 0,
        createdAt: new Date().toISOString(),
        currentMatchState: {
          team1Balls: { orange: 4, purple: 1 },
          team2Balls: { orange: 4, purple: 1 },
        },
      };

      const gameRef = doc(
        collection(FIREBASE_DB, "events", selectedEvent, "robosports-games"),
      );
      await setDoc(gameRef, gameData);

      setSelectedTeam1("");
      setSelectedTeam2("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating game:", error);
      Alert.alert("Error", "Failed to create game");
    } finally {
      setIsCreatingGame(false);
    }
  };

  const openGameScorer = (game: GameData) => {
    if (game.status === "finished") return;

    setActiveGame(game);
    setScorerModal(true);

    // Mark game as in-progress if it was just created
    if (game.status === "created") {
      const gameRef = doc(
        FIREBASE_DB,
        "events",
        selectedEvent,
        "robosports-games",
        game.id,
      );
      updateDoc(gameRef, { status: "in-progress" });
    }
  };

  const updateRoboSportsStandings = async () => {
    if (!selectedEvent || judgeCategory !== "robosports") return;

    try {
      // Fetch all completed games
      const gamesRef = collection(
        FIREBASE_DB,
        "events",
        selectedEvent,
        "robosports-games",
      );
      const gamesSnapshot = await getDocs(gamesRef);

      // Calculate standings
      const standings: Record<string, any> = {};

      // Initialize all teams
      teams.forEach((team) => {
        standings[team.id] = {
          teamId: team.id,
          teamName: team.teamName,
          totalPoints: 0,
          violations: 0,
          opponentBallScore: 0,
          gamesPlayed: 0,
        };
      });

      // Process each game
      gamesSnapshot.forEach((doc) => {
        const game = doc.data();

        // Update team 1
        if (standings[game.team1Id]) {
          standings[game.team1Id].totalPoints += game.team1Points;
          standings[game.team1Id].gamesPlayed += 1;

          // Count violations for team 1
          const team1Violations = game.matchResults.filter(
            (match: any) => match.violation && match.winner !== game.team1Id,
          ).length;
          standings[game.team1Id].violations += team1Violations;

          // Calculate opponent ball scores for tie-breaking
          game.matchResults.forEach((match: any) => {
            standings[game.team1Id].opponentBallScore += match.team2Score;
          });
        }

        // Update team 2
        if (standings[game.team2Id]) {
          standings[game.team2Id].totalPoints += game.team2Points;
          standings[game.team2Id].gamesPlayed += 1;

          // Count violations for team 2
          const team2Violations = game.matchResults.filter(
            (match: any) => match.violation && match.winner !== game.team2Id,
          ).length;
          standings[game.team2Id].violations += team2Violations;

          // Calculate opponent ball scores for tie-breaking
          game.matchResults.forEach((match: any) => {
            standings[game.team2Id].opponentBallScore += match.team1Score;
          });
        }
      });

      // Update teams state with standings data
      setTeams((prevTeams) =>
        prevTeams.map((team) => ({
          ...team,
          ...standings[team.id],
        })),
      );
    } catch (error) {
      console.error("Error updating RoboSports standings:", error);
    }
  };

  //function to handle creating tournament games
  const createTournamentGame = async (bracket: TournamentBracket) => {
    if (!bracket.team1Id || !bracket.team2Id) return;

    try {
      const gameNumber = getNextGameNumber();
      const gameData: Omit<GameData, "id"> = {
        gameNumber,
        eventId: selectedEvent,
        team1Id: bracket.team1Id,
        team2Id: bracket.team2Id,
        team1Name: bracket.team1Name,
        team2Name: bracket.team2Name,
        status: "created",
        currentMatch: 1,
        matchResults: [],
        gameWinner: null,
        team1Points: 0,
        team2Points: 0,
        createdAt: new Date().toISOString(),
        tournamentId: bracket.tournamentId, // NEW: Link to tournament
        bracketId: bracket.id, // NEW: Link to bracket
        currentMatchState: {
          team1Balls: { orange: 4, purple: 1 },
          team2Balls: { orange: 4, purple: 1 },
        },
      };

      const gameRef = doc(
        collection(FIREBASE_DB, "events", selectedEvent, "robosports-games"),
      );
      await setDoc(gameRef, gameData);

      // Update bracket status to in-progress
      const tournamentRef = doc(
        FIREBASE_DB,
        "events",
        selectedEvent,
        "tournaments",
        bracket.tournamentId,
      );
      const tournamentDoc = await getDoc(tournamentRef);

      if (tournamentDoc.exists()) {
        const tournament = tournamentDoc.data() as Tournament;
        const updatedBrackets = tournament.brackets.map((b) =>
          b.id === bracket.id
            ? { ...b, status: "in-progress" as const, gameId: gameRef.id }
            : b,
        );

        await updateDoc(tournamentRef, { brackets: updatedBrackets });
      }

      // Open the game scorer
      setActiveGame({ id: gameRef.id, ...gameData });
      setScorerModal(true);
    } catch (error) {
      console.error("Error creating tournament game:", error);
      Alert.alert("Error", "Failed to create tournament game");
    }
  };

  // Add this useEffect to load tournaments
  useEffect(() => {
    if (judgeCategory !== "robosports" || !selectedEvent) return;

    const tournamentsRef = collection(
      FIREBASE_DB,
      "events",
      selectedEvent,
      "tournaments",
    );
    const tournamentsQuery = query(
      tournamentsRef,
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(tournamentsQuery, (snapshot) => {
      const loadedTournaments: Tournament[] = [];
      snapshot.forEach((doc) => {
        loadedTournaments.push({ id: doc.id, ...doc.data() } as Tournament);
      });
      setTournaments(loadedTournaments);
    });

    return () => unsubscribe();
  }, [judgeCategory, selectedEvent]);

  // Call this function when teams or selectedEvent changes for robosports
  useEffect(() => {
    if (judgeCategory === "robosports" && selectedEvent) {
      updateRoboSportsStandings();
    }
  }, [selectedEvent, judgeCategory]);

  // Card status helpers
  const getCardStatus = (team: any) => {
    // RoboMission: two rounds only
    if (
      judgeCategory === "robo-elem" ||
      judgeCategory === "robo-junior" ||
      judgeCategory === "robo-senior"
    ) {
      // Only check day1Round1 and day1Round2 (no day selector, no round 3)
      const hasR1 =
        team.day1Round1Score !== null && team.day1Round1Score !== undefined;
      const hasR2 =
        team.day1Round2Score !== null && team.day1Round2Score !== undefined;

      if (!hasR1 && !hasR2) return "no-score";
      if ((hasR1 && !hasR2) || (!hasR1 && hasR2)) return "partial";
      if (hasR1 && hasR2) return "complete";
      return "no-score";
    }

    // Robosports: placeholder logic (update when implemented)
    if (judgeCategory === "robosports") {
      return team.robosportsScore ? "complete" : "no-score";
    }

    // Future Innovators: one score sheet per judge, up to 3 judges per team
    if (
      judgeCategory === "fi-elem" ||
      judgeCategory === "fi-junior" ||
      judgeCategory === "fi-senior"
    ) {
      const judgeScores = team?.judgeScores || {};
      const currentJudgeId = FIREBASE_AUTH.currentUser?.uid || "";
      const hasCurrentJudgeScore = !!judgeScores[currentJudgeId];
      const judgeCount = Object.keys(judgeScores).length;

      if (hasCurrentJudgeScore || judgeCount >= 3) {
        return "complete";
      }

      return "no-score";
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
        const hasOpen1 =
          team.openScore1 !== null && team.openScore1 !== undefined;
        const hasOpen2 =
          team.openScore2 !== null && team.openScore2 !== undefined;
        if (!hasOpen1 || !hasOpen2) return "not-qualified";
        const hasR1 =
          team.obstacleScore1 !== null && team.obstacleScore1 !== undefined;
        const hasR2 =
          team.obstacleScore2 !== null && team.obstacleScore2 !== undefined;
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
      case "partial":
      case "round1-only":
        return "#fff9c4";
      case "complete":
        return "#c8e6c9";
      case "day1-incomplete":
        return "#ffcccb"; // Light red for day 1 incomplete
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

    // For robo categories (no day selector, just 2 rounds)
    if (
      judgeCategory === "robo-elem" ||
      judgeCategory === "robo-junior" ||
      judgeCategory === "robo-senior"
    ) {
      return [
        { label: "All Teams", value: "all" },
        { label: "No Scores Yet", value: "no-score" },
        { label: "Partially Scored", value: "partial" },
        { label: "Complete", value: "complete" },
      ];
    }

    // For future engineers
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
    return teams.filter((team) => getCardStatus(team) === statusFilter);
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

    filteredTeams.forEach((team) => {
      const status = getCardStatus(team);
      if (counts.hasOwnProperty(status)) {
        counts[status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const FI_ELEM_CONFIG = {
    project: [
      { key: "projectIdeaScore", label: "Idea, Quality & Creativity", max: 30 },
      { key: "projectResearchScore", label: "Research & Report", max: 15 },
      { key: "projectUsageScore", label: "Usage of the Idea", max: 15 },
      {
        key: "projectInnovationScore",
        label: "Key Innovation & Slogan",
        max: 10,
      },
    ],
    robotic: [
      { key: "roboticSolutionScore", label: "Robotic Solution", max: 30 },
      {
        key: "engineeringConceptsScore",
        label: "Meaningful Use of Engineering Concepts",
        max: 10,
      },
      {
        key: "codeEfficiencyScore",
        label: "Code Efficiency & Software Automation",
        max: 10,
      },
      {
        key: "roboticDemoScore",
        label: "Demonstration of Robotic Solution",
        max: 15,
      },
    ],
    presentation: [
      {
        key: "presentationBoothScore",
        label: "Presentation & Project Booth",
        max: 30,
      },
      {
        key: "technicalUnderstandingScore",
        label: "Technical Understanding & Quick Thinking",
        max: 15,
      },
      { key: "teamSpiritScore", label: "Team Spirit", max: 20 },
    ],
  };

  const FI_JUNIOR_ROBOTIC = [
    { key: "roboticSolutionScore", label: "Robotic Solution", max: 30 },
    {
      key: "engineeringConceptsScore",
      label: "Meaningful Use of Engineering Concepts",
      max: 15,
    },
    {
      key: "codeEfficiencyScore",
      label: "Code Efficiency & Software Automation",
      max: 10,
    },
    {
      key: "roboticDemoScore",
      label: "Demonstration of Robotic Solution",
      max: 15,
    },
  ];

  const FI_JUNIOR_PRESENTATION = [
    {
      key: "presentationBoothScore",
      label: "Presentation & Project Booth",
      max: 25,
    },
    {
      key: "technicalUnderstandingScore",
      label: "Technical Understanding & Quick Thinking",
      max: 15,
    },
    { key: "teamSpiritScore", label: "Team Spirit", max: 15 },
  ];

  const FI_JUNIOR_CONFIG = {
    project: [
      { key: "projectIdeaScore", label: "Idea, Quality & Creativity", max: 30 },
      { key: "projectResearchScore", label: "Research & Report", max: 15 },
      { key: "projectUsageScore", label: "Social Impact & Need", max: 10 },
      {
        key: "projectInnovationScore",
        label: "Key Innovation & Slogan",
        max: 10,
      },
      {
        key: "extraEntrepreneurshipScore",
        label: "Extra Element of Entrepreneurship",
        max: 10,
        description:
          "Consider: cost structure, revenue stream, key resources, and partners.",
      },
    ],
    robotic: FI_JUNIOR_ROBOTIC,
    presentation: FI_JUNIOR_PRESENTATION,
  };

  const FI_SENIOR_CONFIG = {
    project: [
      { key: "projectIdeaScore", label: "Idea, Quality & Creativity", max: 20 },
      { key: "projectResearchScore", label: "Research & Report", max: 15 },
      { key: "projectUsageScore", label: "Social Impact & Need", max: 10 },
      {
        key: "projectInnovationScore",
        label: "Key Innovation & Slogan",
        max: 10,
      },
      {
        key: "extraEntrepreneurshipScore",
        label: "Extra Element of Entrepreneurship",
        max: 10,
        description:
          "Consider: cost structure, revenue stream, key resources, and partners.",
      },
      {
        key: "nextStepsScore",
        label: "Next Steps & Prototype Development",
        max: 10,
      },
    ],
    robotic: FI_JUNIOR_ROBOTIC,
    presentation: FI_JUNIOR_PRESENTATION,
  };

  const getFiConfig = (category: string) => {
    if (category === "fi-junior") return FI_JUNIOR_CONFIG;
    if (category === "fi-senior") return FI_SENIOR_CONFIG;
    return FI_ELEM_CONFIG;
  };

  const getFutureInnovatorsScoreConfig = () => ({
    projectMax: 70,
    roboticMax: 65,
    boothMax: 30,
    technicalMax: 15,
    teamSpiritMax: 20,
  });

  const scaleFiElemScores = (scores: any) => {
    const projectTotal = parseFloat(
      (
        (scores.projectIdeaScore / 10) * 30 +
        (scores.projectResearchScore / 10) * 15 +
        (scores.projectUsageScore / 10) * 15 +
        (scores.projectInnovationScore / 10) * 10
      ).toFixed(2),
    );

    const roboticTotal = parseFloat(
      (
        (scores.roboticSolutionScore / 10) * 30 +
        (scores.engineeringConceptsScore / 10) * 10 +
        (scores.codeEfficiencyScore / 10) * 10 +
        (scores.roboticDemoScore / 10) * 15
      ).toFixed(2),
    );

    const presentationTotal = parseFloat(
      (
        (scores.presentationBoothScore / 10) * 30 +
        (scores.technicalUnderstandingScore / 10) * 15 +
        (scores.teamSpiritScore / 10) * 20
      ).toFixed(2),
    );

    return {
      projectTotal,
      roboticTotal,
      presentationTotal,
      total: parseFloat(
        (projectTotal + roboticTotal + presentationTotal).toFixed(2),
      ),
    };
  };

  const computeFiElemAggregate = (judgeScores: Record<string, any>) => {
    const judgeEntries = Object.values(judgeScores);
    const judgeCount = judgeEntries.length;
    if (judgeCount === 0) {
      return {
        projectInnovation: 0,
        roboticSolution: 0,
        presentationSpirit: 0,
        totalScore: 0,
        judgeCount,
      };
    }

    const totals = judgeEntries.reduce(
      (acc, scores: any) => {
        const scaled = scaleFiElemScores(scores);
        return {
          project: acc.project + scaled.projectTotal,
          robotic: acc.robotic + scaled.roboticTotal,
          presentation: acc.presentation + scaled.presentationTotal,
          total: acc.total + scaled.total,
        };
      },
      { project: 0, robotic: 0, presentation: 0, total: 0 },
    );

    const averagePoints = Number((totals.total / judgeCount).toFixed(2));
    return {
      projectInnovation: Number((totals.project / judgeCount).toFixed(2)),
      roboticSolution: Number((totals.robotic / judgeCount).toFixed(2)),
      presentationSpirit: Number((totals.presentation / judgeCount).toFixed(2)),
      totalScore: averagePoints,
      averagePoints,
      judgeCount,
    };
  };

  const renderFiElemScoreRow = (
    label: string,
    value: string,
    onChange: (value: string) => void,
  ) => (
    <FiElemDropdownRow
      key={`${scoringTeam?.id ?? "new"}-${fiElemModalStep}-${label}`}
      label={label}
      value={value}
      onChange={onChange}
    />
  );

  useEffect(() => {
    if (!scoreModalVisible) {
      resetFiElemForm();
      setFiElemModalStep(1);
      setSubmitError("");
    }
  }, [scoreModalVisible]);

  // Scoring Modal content based on category
  function renderScorerModalContent() {
    if (!scoringTeam) return null;

    switch (judgeCategory) {
      case "robo-elem":
      case "robo-junior":
      case "robo-senior": {
        return (
          <>
            <Text style={styles.scoreinputTitle}>Round {scoringStep}</Text>
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
                onChangeText={(text) => setInputMs(text.replace(/[^0-9]/g, ""))}
                maxLength={3}
              />
            </View>
          </>
        );
      }
      case "robosports":
        return null; // Handled in separate component
      case "fi-elem": {
        if (fiElemModalStep === 2) {
          const projectIdea = parseFloat(
            ((Number(projectIdeaScore || 0) / 10) * 30).toFixed(2),
          );
          const projectResearch = parseFloat(
            ((Number(projectResearchScore || 0) / 10) * 15).toFixed(2),
          );
          const projectUsage = parseFloat(
            ((Number(projectUsageScore || 0) / 10) * 15).toFixed(2),
          );
          const projectInnovation = parseFloat(
            ((Number(projectInnovationScore || 0) / 10) * 10).toFixed(2),
          );
          const projectTotal = parseFloat(
            (
              projectIdea +
              projectResearch +
              projectUsage +
              projectInnovation
            ).toFixed(2),
          );

          const roboticSolution = parseFloat(
            ((Number(roboticSolutionScore || 0) / 10) * 30).toFixed(2),
          );
          const engineeringConcepts = parseFloat(
            ((Number(engineeringConceptsScore || 0) / 10) * 10).toFixed(2),
          );
          const codeEfficiency = parseFloat(
            ((Number(codeEfficiencyScore || 0) / 10) * 10).toFixed(2),
          );
          const roboticDemo = parseFloat(
            ((Number(roboticDemoScore || 0) / 10) * 15).toFixed(2),
          );
          const roboticTotal = parseFloat(
            (
              roboticSolution +
              engineeringConcepts +
              codeEfficiency +
              roboticDemo
            ).toFixed(2),
          );

          const presentationBooth = parseFloat(
            ((Number(presentationBoothScore || 0) / 10) * 30).toFixed(2),
          );
          const technicalUnderstanding = parseFloat(
            ((Number(technicalUnderstandingScore || 0) / 10) * 15).toFixed(2),
          );
          const teamSpirit = parseFloat(
            ((Number(teamSpiritScore || 0) / 10) * 20).toFixed(2),
          );
          const presentationTotal = parseFloat(
            (presentationBooth + technicalUnderstanding + teamSpirit).toFixed(
              2,
            ),
          );

          const overallTotal = parseFloat(
            (projectTotal + roboticTotal + presentationTotal).toFixed(2),
          );

          return (
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.scoreinputTitle}>Review Scores</Text>
              <Text style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                Raw judge score shown as 1–10. Scaled points are shown after the
                arrow.
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "600", marginTop: 12 }}>
                Project & Innovation
              </Text>
              <Text style={{ marginTop: 4 }}>
                Idea, Quality & Creativity: {projectIdeaScore || "0"}/10 →{" "}
                {projectIdea.toFixed(2)}/30
              </Text>
              <Text>
                Research & Report: {projectResearchScore || "0"}/10 →{" "}
                {projectResearch.toFixed(2)}/15
              </Text>
              <Text>
                Usage of the Idea: {projectUsageScore || "0"}/10 →{" "}
                {projectUsage.toFixed(2)}/15
              </Text>
              <Text>
                Key Innovation & Slogan: {projectInnovationScore || "0"}/10 →{" "}
                {projectInnovation.toFixed(2)}/10
              </Text>
              <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                Subtotal: {projectTotal.toFixed(2)}/70
              </Text>

              <Text style={{ fontSize: 14, fontWeight: "600", marginTop: 12 }}>
                Robotic Solution
              </Text>
              <Text style={{ marginTop: 4 }}>
                Robotic Solution: {roboticSolutionScore || "0"}/10 →{" "}
                {roboticSolution.toFixed(2)}/30
              </Text>
              <Text>
                Meaningful Use of Engineering Concepts:{" "}
                {engineeringConceptsScore || "0"}/10 →{" "}
                {engineeringConcepts.toFixed(2)}/10
              </Text>
              <Text>
                Code Efficiency & Software Automation:{" "}
                {codeEfficiencyScore || "0"}/10 → {codeEfficiency.toFixed(2)}/10
              </Text>
              <Text>
                Demonstration of Robotic Solution: {roboticDemoScore || "0"}/10
                → {roboticDemo.toFixed(2)}/15
              </Text>
              <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                Subtotal: {roboticTotal.toFixed(2)}/65
              </Text>

              <Text style={{ fontSize: 14, fontWeight: "600", marginTop: 12 }}>
                Presentation & Team Spirit
              </Text>
              <Text style={{ marginTop: 4 }}>
                Presentation & Project Booth: {presentationBoothScore || "0"}/10
                → {presentationBooth.toFixed(2)}/30
              </Text>
              <Text>
                Technical Understanding & Quick Thinking:{" "}
                {technicalUnderstandingScore || "0"}/10 →{" "}
                {technicalUnderstanding.toFixed(2)}/15
              </Text>
              <Text>
                Team Spirit: {teamSpiritScore || "0"}/10 →{" "}
                {teamSpirit.toFixed(2)}/20
              </Text>
              <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                Subtotal: {presentationTotal.toFixed(2)}/65
              </Text>

              <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 12 }}>
                Overall Points: {overallTotal.toFixed(2)}/200
              </Text>
            </ScrollView>
          );
        }

        return (
          <ScrollView style={{ maxHeight: 420 }}>
            <Text style={styles.scoreinputTitle}>
              First Criteria: Project & Innovation
            </Text>
            {renderFiElemScoreRow(
              "Idea, Quality & Creativity (max 30)",
              projectIdeaScore,
              setProjectIdeaScore,
            )}
            {renderFiElemScoreRow(
              "Research & Report (max 15)",
              projectResearchScore,
              setProjectResearchScore,
            )}
            {renderFiElemScoreRow(
              "Usage of the Idea (max 15)",
              projectUsageScore,
              setProjectUsageScore,
            )}
            {renderFiElemScoreRow(
              "Key Innovation & Slogan (max 10)",
              projectInnovationScore,
              setProjectInnovationScore,
            )}

            <Text style={{ marginTop: 16, fontWeight: "600" }}>
              Second Criteria: Robotic Solution
            </Text>
            {renderFiElemScoreRow(
              "Robotic Solution (max 30)",
              roboticSolutionScore,
              setRoboticSolutionScore,
            )}
            {renderFiElemScoreRow(
              "Meaningful Use of Engineering Concepts (max 10)",
              engineeringConceptsScore,
              setEngineeringConceptsScore,
            )}
            {renderFiElemScoreRow(
              "Code Efficiency & Software Automation (max 10)",
              codeEfficiencyScore,
              setCodeEfficiencyScore,
            )}
            {renderFiElemScoreRow(
              "Demonstration of Robotic Solution (max 15)",
              roboticDemoScore,
              setRoboticDemoScore,
            )}

            <Text style={{ marginTop: 16, fontWeight: "600" }}>
              Third Criteria: Presentation & Team Spirit
            </Text>
            {renderFiElemScoreRow(
              "Presentation & Project Booth (max 30)",
              presentationBoothScore,
              setPresentationBoothScore,
            )}
            {renderFiElemScoreRow(
              "Technical Understanding & Quick Thinking (max 15)",
              technicalUnderstandingScore,
              setTechnicalUnderstandingScore,
            )}
            {renderFiElemScoreRow(
              "Team Spirit (max 20)",
              teamSpiritScore,
              setTeamSpiritScore,
            )}

            {/* <Text style={{ marginTop: 10, fontStyle: "italic" }}>Overall Points: {Number(projectIdeaScore) + Number(projectResearchScore) + Number(projectUsageScore) + Number(projectInnovationScore) + Number(roboticSolutionScore) + Number(engineeringConceptsScore) + Number(codeEfficiencyScore) + Number(roboticDemoScore) + Number(presentationBoothScore) + Number(technicalUnderstandingScore) + Number(teamSpiritScore)}/200</Text> */}
          </ScrollView>
        );
      }
      case "fi-junior":
      case "fi-senior": {
        const config = getFiConfig(judgeCategory);

        if (fiElemModalStep === 2) {
          const raw = Object.fromEntries(
            Object.entries(fiScoreFields).map(([key, [value]]) => [key, value]),
          );
          const { projectTotal, roboticTotal, presentationTotal, total } =
            scaleFiScores(judgeCategory, raw);

          const renderReviewGroup = (
            group: { key: string; label: string; max: number }[],
          ) =>
            group.map(({ key, label, max }) => {
              const [value] = fiScoreFields[key];
              const scaled = parseFloat(
                ((Number(value || 0) / 10) * max).toFixed(2),
              );
              return (
                <Text key={key} style={{ marginTop: 4 }}>
                  {label}: {value || "0"}/10 → {scaled.toFixed(2)}/{max}
                </Text>
              );
            });

          const projectMax = config.project.reduce((s, c) => s + c.max, 0);
          const roboticMax = config.robotic.reduce((s, c) => s + c.max, 0);
          const presentationMax = config.presentation.reduce(
            (s, c) => s + c.max,
            0,
          );

          return (
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.scoreinputTitle}>Review Scores</Text>
              <Text style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                Raw judge score shown as 1–10. Scaled points are shown after the
                arrow.
              </Text>

              <Text style={{ fontSize: 14, fontWeight: "600", marginTop: 12 }}>
                Project & Innovation
              </Text>
              {renderReviewGroup(config.project)}
              <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                Subtotal: {projectTotal.toFixed(2)}/{projectMax}
              </Text>

              <Text style={{ fontSize: 14, fontWeight: "600", marginTop: 12 }}>
                Robotic Solution
              </Text>
              {renderReviewGroup(config.robotic)}
              <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                Subtotal: {roboticTotal.toFixed(2)}/{roboticMax}
              </Text>

              <Text style={{ fontSize: 14, fontWeight: "600", marginTop: 12 }}>
                Presentation & Team Spirit
              </Text>
              {renderReviewGroup(config.presentation)}
              <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                Subtotal: {presentationTotal.toFixed(2)}/{presentationMax}
              </Text>

              <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 12 }}>
                Overall Points: {total.toFixed(2)}/200
              </Text>
            </ScrollView>
          );
        }

        return (
          <ScrollView style={{ maxHeight: 420 }}>
            <Text style={styles.scoreinputTitle}>
              First Criteria: Project & Innovation
            </Text>
            {renderFiScoreGroup(config.project)}

            <Text style={{ marginTop: 16, fontWeight: "600" }}>
              Second Criteria: Robotic Solution
            </Text>
            {renderFiScoreGroup(config.robotic)}

            <Text style={{ marginTop: 16, fontWeight: "600" }}>
              Third Criteria: Presentation & Team Spirit
            </Text>
            {renderFiScoreGroup(config.presentation)}
          </ScrollView>
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
            ? scoringTeam.openScore1 == null
              ? 1
              : 2
            : scoringTeam.obstacleScore1 == null
              ? 1
              : 2;

        return (
          <>
            <Text style={styles.scoreinputTitle}>
              {feRoundType === "open"
                ? "Open - Qualifying"
                : "Obstacles - Final"}
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
                onChangeText={(text) => setInputMs(text.replace(/[^0-9]/g, ""))}
                maxLength={3}
              />
            </View>
            {isObstacleRound2 && (
              <>
                <Text style={styles.scoreinputTitle}>
                  Documentation / Github (optional, max 30)
                </Text>
                <TextInput
                  style={styles.scoreinput}
                  placeholder="Documentation / Github"
                  keyboardType="numeric"
                  value={inputDocScore}
                  onChangeText={(text) =>
                    setInputDocScore(text.replace(/[^0-9]/g, ""))
                  }
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
    const scores = [
      { score: team.day1Round1Score, time: team.day1Round1Time, round: 1 },
      { score: team.day1Round2Score, time: team.day1Round2Time, round: 2 },
    ].filter((r) => r.score != null);

    if (scores.length === 0)
      return {
        bestScore: null,
        bestTime: null,
        bestScoreRound: null,
        bestTimeRound: null,
      };

    // Find best score (highest)
    const bestScoreRound = scores.reduce((best, current) =>
      current.score > best.score ? current : best,
    ).round;

    // Find best time (lowest)
    const bestTimeRound = scores.reduce((best, current) =>
      parseTimeString(current.time) < parseTimeString(best.time)
        ? current
        : best,
    ).round;

    const bestScoreValue = Math.max(...scores.map((s) => s.score));
    const bestTimeValue = scores.find((s) => s.round === bestTimeRound)?.time;

    return {
      bestScore: bestScoreValue,
      bestTime: bestTimeValue,
      bestScoreRound,
      bestTimeRound,
    };
  }

  // Helper function to parse time string
  function parseTimeString(timeStr: string) {
    if (!timeStr) return Infinity;
    const parts = timeStr.split(":");
    if (parts.length < 2) return Infinity;
    const [mm, rest] = parts;
    const [ss, ms] = rest.split(".");
    return (
      (Number(mm) || 0) * 60000 +
      (Number(ss) || 0) * 1000 +
      (Number(ms) || 0) * 10
    );
  }

  // Modal open for scoring
  const openScoreModal = async (team: any) => {
    if (getCardStatus(team) === "complete") return;

    setScoringTeam(team);

    // Determine which round to score next (only 2 rounds for RoboMission)
    if (team.day1Round1Score === null || team.day1Round1Score === undefined) {
      setScoringStep(1);
    } else if (
      team.day1Round2Score === null ||
      team.day1Round2Score === undefined
    ) {
      setScoringStep(2);
    } else {
      // All rounds completed
      setScoringStep(1);
    }

    setInputScore("");
    setInputMinute("");
    setInputSecond("");
    setInputMs("");
    setFiElemModalStep(1);
    resetFiElemForm();
    setSubmitError("");
    setScoreModalVisible(true);

    const isFiCategory =
      judgeCategory === "fi-elem" ||
      judgeCategory === "fi-junior" ||
      judgeCategory === "fi-senior";
    if (isFiCategory) {
      try {
        const scoresRef = doc(
          FIREBASE_DB,
          "events",
          selectedEvent,
          "scores",
          team.id,
        );
        const scoreDoc = await getDoc(scoresRef);
        const existing = scoreDoc.exists()
          ? scoreDoc.data()?.scoresheets || {}
          : {};
        const existingCount = Object.keys(existing).length;

        if (existingCount >= 3) {
          Alert.alert(
            "Complete",
            "This team already has 3 scoresheets submitted.",
          );
          return;
        }

        setScoresheetNumber(existingCount + 1);
      } catch (e) {
        console.error("Failed to check existing scoresheets:", e);
        setScoresheetNumber(1);
      }
    }

    setScoreModalVisible(true);
  };

  const handleScoreSubmit = async () => {
    setSubmitError("");
    setIsSubmitting(true);

    if (!scoringTeam || !selectedEvent) {
      setIsSubmitting(false);
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
          category: judgeCategory,
          // Preserve existing scores
          day1Round1Score: scoringTeam.day1Round1Score ?? null,
          day1Round1Time: scoringTeam.day1Round1Time ?? null,
          day1Round2Score: scoringTeam.day1Round2Score ?? null,
          day1Round2Time: scoringTeam.day1Round2Time ?? null,
        };

        const now = new Date();
        // Always use day1 for RoboMission (no day selector)
        const roundField = `day1Round${scoringStep}Score`;
        const timeField = `day1Round${scoringStep}Time`;
        const timestampField = `day1Round${scoringStep}ScoredAt`;

        update[roundField] = Number(inputScore);
        update[timeField] = inputTime;
        update[timestampField] = now.toISOString();

        setScoreModalVisible(false);
        setScoringTeam(null);

        // Save to new structure
        const scoresRef = doc(
          FIREBASE_DB,
          "events",
          selectedEvent,
          "scores",
          scoringTeam.id,
        );
        await setDoc(scoresRef, update, { merge: true });

        setTeams((teams) =>
          teams.map((t) => (t.id === scoringTeam.id ? { ...t, ...update } : t)),
        );

        setInputScore("");
        setInputMinute("");
        setInputSecond("");
        setInputMs("");
      } catch (e) {
        console.error("Score submission error:", e);
        Alert.alert("Error", "Failed to submit score. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }

    // Future Innovators
    if (
      judgeCategory === "fi-elem" ||
      judgeCategory === "fi-junior" ||
      judgeCategory === "fi-senior"
    ) {
      const config = getFiConfig(judgeCategory);
      const allFields = [
        ...config.project,
        ...config.robotic,
        ...config.presentation,
      ];

      // Treat empty sub-criteria as zero so judges can submit without filling every field.
      const rawScores = Object.fromEntries(
        allFields.map(({ key }) => [key, Number(fiScoreFields[key][0]) || 0]),
      );

      // Still validate that no score exceeds the max of 10
      const exceedsMax = Object.values(rawScores).some((v) => Number(v) > 10);
      if (exceedsMax) {
        setSubmitError("One or more scores exceed the maximum allowed.");
        setIsSubmitting(false);
        return;
      }

      try {
        const scoresRef = doc(
          FIREBASE_DB,
          "events",
          selectedEvent,
          "scores",
          scoringTeam.id,
        );
        const scoreDoc = await getDoc(scoresRef);
        const existingData = scoreDoc.exists() ? scoreDoc.data() : {};
        const existingScoresheets = existingData?.scoresheets || {};
        const existingCount = Object.keys(existingScoresheets).length;

        if (existingCount >= 3) {
          setSubmitError("This team already has 3 scoresheets submitted.");
          setIsSubmitting(false);
          return;
        }

        const nextSlot = String(existingCount + 1);

        const totalPoints = scaleFiScores(judgeCategory, rawScores).total;
        const judgeId = FIREBASE_AUTH.currentUser?.uid || null;

        const scoresheetEntry = {
          ...rawScores,
          totalPoints,
          submittedBy: judgeId, // kept for reference only, not used for limiting anymore
          submittedAt: new Date().toISOString(),
        };

        const updatedScoresheets = {
          ...existingScoresheets,
          [nextSlot]: scoresheetEntry,
        };

        const totals = Object.values(updatedScoresheets).map(
          (s: any) => s.totalPoints,
        );
        const averagePoints =
          updatedScoresheets && Object.keys(updatedScoresheets).length === 3
            ? parseFloat(
                (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(2),
              )
            : null;

        const update: any = {
          teamName: scoringTeam.teamName,
          teamId: scoringTeam.id,
          eventId: selectedEvent,
          category: judgeCategory,
          scoresheets: updatedScoresheets,
          scoresheetCount: Object.keys(updatedScoresheets).length,
          averagePoints,
          scoredAt: new Date().toISOString(),
        };

        setScoreModalVisible(false);
        setScoringTeam(null);
        setFiElemModalStep(1);
        setScoresheetNumber(null);

        await setDoc(scoresRef, update, { merge: true });

        setTeams((teams) =>
          teams.map((t) => (t.id === scoringTeam.id ? { ...t, ...update } : t)),
        );

        resetFiElemForm();
      } catch (e) {
        console.error("Score submission error:", e);
        Alert.alert("Error", "Failed to submit score. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Future Engineers (updated structure)
    if (judgeCategory === "future-eng") {
      if (inputScore.trim() === "") {
        setSubmitError("Please input the score.");
        setIsSubmitting(false);
        return;
      }
      if (
        inputMinute.trim() === "" &&
        inputSecond.trim() === "" &&
        inputMs.trim() === ""
      ) {
        setSubmitError("Please input the time.");
        setIsSubmitting(false);
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

      const docScoreVal =
        inputDocScore.trim() === "" ? 0 : Number(inputDocScore);

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
          scoringTeam.id,
        );
        await setDoc(scoresRef, update, { merge: true });

        setTeams((teams) =>
          teams.map((t) => (t.id === scoringTeam.id ? { ...t, ...update } : t)),
        );

        setInputScore("");
        setInputMinute("");
        setInputDocScore("");
      } catch (e) {
        console.error("Score submission error:", e);
        setSubmitError("Failed to submit score. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  // RoboSports game card renderer
  const renderGameCard = ({ item: game }: { item: GameData }) => {
    const getStatusColor = () => {
      switch (game.status) {
        case "created":
          return "#faf9f6";
        case "in-progress":
          return "#fff9c4";
        case "finished":
          return "#c8e6c9";
        default:
          return "#faf9f6";
      }
    };

    const getStatusText = () => {
      switch (game.status) {
        case "created":
          return "Ready to Start";
        case "in-progress":
          return `In Progress (Match ${game.currentMatch}/3)`;
        case "finished":
          return "Finished";
        default:
          return "Unknown";
      }
    };

    return (
      <TouchableOpacity
        style={[robostyles.gameCard, { backgroundColor: getStatusColor() }]}
        onPress={() => openGameScorer(game)}
        disabled={game.status === "finished"}
      >
        <Text style={robostyles.gameNumber}>Game #{game.gameNumber}</Text>
        <Text style={robostyles.teamsText}>
          {game.team1Name} vs {game.team2Name}
        </Text>

        <View style={robostyles.gameDetails}>
          <Text style={robostyles.statusText}>Status: {getStatusText()}</Text>

          {game.matchResults.length > 0 && (
            <View style={robostyles.matchResults}>
              <Text style={robostyles.resultsTitle}>Match Results:</Text>
              {game.matchResults.map((result: any, index: number) => (
                <Text key={index} style={robostyles.resultText}>
                  M{result.match}: {result.winner ? result.winnerName : "Tie"} (
                  {result.team1Score} - {result.team2Score})
                </Text>
              ))}
            </View>
          )}

          {game.status === "finished" && (
            <Text style={robostyles.finalResult}>
              Winner:{" "}
              {game.gameWinner
                ? game.gameWinner === game.team1Id
                  ? game.team1Name
                  : game.team2Name
                : "Tie"}{" "}
              ({game.team1Points} - {game.team2Points} pts)
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Create Game Modal
  const renderCreateGameModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Game</Text>

          <View style={{ marginBottom: 20, zIndex: 1000 }}>
            <Text style={robostyles.label}>Team 1:</Text>
            <DropDownPicker
              open={team1DropdownOpen}
              setOpen={setTeam1DropdownOpen}
              value={selectedTeam1}
              setValue={setSelectedTeam1}
              items={teams.map((team) => ({
                label: `${team.teamNumber} - ${team.teamName}`,
                value: team.id,
              }))}
              placeholder="Select Team 1"
              style={robostyles.dropdown}
              onOpen={() => setTeam2DropdownOpen(false)}
            />
          </View>

          <View style={{ marginBottom: 30, zIndex: 999 }}>
            <Text style={robostyles.label}>Team 2:</Text>
            <DropDownPicker
              open={team2DropdownOpen}
              setOpen={setTeam2DropdownOpen}
              value={selectedTeam2}
              setValue={setSelectedTeam2}
              items={teams
                .filter((t) => t.id !== selectedTeam1)
                .map((team) => ({
                  label: `${team.teamNumber} - ${team.teamName}`,
                  value: team.id,
                }))}
              placeholder="Select Team 2"
              style={robostyles.dropdown}
              onOpen={() => setTeam1DropdownOpen(false)}
            />
          </View>

          <View style={robostyles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={robostyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                robostyles.createButton,
                isCreatingGame && robostyles.disabledButton,
              ]}
              onPress={createNewGame}
              disabled={isCreatingGame || !selectedTeam1 || !selectedTeam2}
            >
              {isCreatingGame ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Game</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
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
      team.teamName?.toLowerCase().includes(search.toLowerCase()),
    );

  // Apply status filter
  filteredTeams = filterTeamsByStatus(filteredTeams);

  // Future Engineers pill filtering
  if (judgeCategory === "future-eng") {
    if (fePill === "obstacle") {
      filteredTeams = filteredTeams.filter((team) => {
        const hasOpen1 =
          team.openScore1 !== null && team.openScore1 !== undefined;
        const hasOpen2 =
          team.openScore2 !== null && team.openScore2 !== undefined;
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
  const paginatedTeams = filteredTeams.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const statusCounts = getStatusCounts();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ padding: 15, zIndex: 1000 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Score Teams</Text>
          <Text style={styles.headerSubtitle}>
            {judgeCategory === "robosports"
              ? "Create and manage games"
              : "Tap a team card to score"}
          </Text>
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
            items={assignedEvents.map((event) => ({
              label: `${event.title}${event.date ? ` (${event.date})` : ""}`,
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
          <View
            style={{
              marginBottom: 15,
              padding: 10,
              backgroundColor: "#f0f0f0",
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              Current Event:{" "}
              {assignedEvents.find((e) => e.id === selectedEvent)?.title}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }}>
              Category: {judgeCategory} •{" "}
              {assignedEvents.find((e) => e.id === selectedEvent)?.date}
            </Text>
          </View>
        )}

        {/* RoboSports Content */}
        {judgeCategory === "robosports" && (
          <View style={{ flex: 1 }}>
            {/* Tournament Mode Toggle */}
            <View style={robostyles.modeToggle}>
              <TouchableOpacity
                style={[
                  robostyles.modeButton,
                  tournamentMode === "regular" && robostyles.modeButtonActive,
                ]}
                onPress={() => setTournamentMode("regular")}
              >
                <Text
                  style={[
                    robostyles.modeButtonText,
                    tournamentMode === "regular" &&
                      robostyles.modeButtonTextActive,
                  ]}
                >
                  Regular Games
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  robostyles.modeButton,
                  tournamentMode === "tournament" &&
                    robostyles.modeButtonActive,
                ]}
                onPress={() => setTournamentMode("tournament")}
              >
                <Text
                  style={[
                    robostyles.modeButtonText,
                    tournamentMode === "tournament" &&
                      robostyles.modeButtonTextActive,
                  ]}
                >
                  Tournament Mode
                </Text>
              </TouchableOpacity>
            </View>

            {/* Regular Games Mode */}
            {tournamentMode === "regular" && (
              <View>
                <TouchableOpacity
                  style={styles.createGameButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={[styles.buttonText, { color: "white" }]}>
                    + Create New Game
                  </Text>
                </TouchableOpacity>

                <Text
                  style={[
                    robostyles.gamesHeader,
                    { marginVertical: 15, fontSize: 16, fontWeight: "bold" },
                  ]}
                >
                  Regular Games ({games.filter((g) => !g.tournamentId).length})
                </Text>

                <FlatList
                  data={games.filter((g) => !g.tournamentId)}
                  keyExtractor={(item) => item.id}
                  renderItem={renderGameCard}
                  ListEmptyComponent={
                    <Text style={robostyles.emptyText}>
                      No games created yet. Create your first game!
                    </Text>
                  }
                />
              </View>
            )}

            {/* Tournament Mode */}
            {tournamentMode === "tournament" && (
              <View>
                {/* Create Tournament Button */}
                <TouchableOpacity
                  style={styles.createGameButton}
                  onPress={() => setShowTournamentSetup(true)}
                >
                  <Text style={[styles.buttonText, { color: "white" }]}>
                    + Create Tournament
                  </Text>
                </TouchableOpacity>

                {/* Tournament Selection */}
                {tournaments.length > 0 && (
                  <View style={robostyles.tournamentSelector}>
                    <Text style={robostyles.selectorLabel}>
                      Active Tournaments:
                    </Text>
                    <FlatList
                      data={tournaments}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            robostyles.tournamentCard,
                            selectedTournament?.id === item.id &&
                              robostyles.tournamentCardSelected,
                          ]}
                          onPress={() => setSelectedTournament(item)}
                        >
                          <Text style={robostyles.tournamentName}>
                            {item.name}
                          </Text>
                          <Text style={robostyles.tournamentInfo}>
                            Single Elimination
                          </Text>
                          <Text style={robostyles.tournamentStatus}>
                            Status: {item.status} • {item.teams.length} teams
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {/* Ready Tournament Matches */}
                {selectedTournament && (
                  <View>
                    <Text
                      style={[
                        robostyles.gamesHeader,
                        {
                          marginVertical: 15,
                          fontSize: 16,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      Ready Tournament Matches
                    </Text>

                    <FlatList
                      data={TournamentManager.getReadyMatches(
                        selectedTournament.brackets,
                      )}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item: bracket }) => (
                        <TouchableOpacity
                          style={robostyles.tournamentMatchCard}
                          onPress={() => createTournamentGame(bracket)}
                        >
                          <Text style={robostyles.matchTitle}>
                            Round {bracket.roundNumber} - Match{" "}
                            {bracket.matchNumber}
                          </Text>

                          <Text style={robostyles.teamsText}>
                            {bracket.team1Name} vs {bracket.team2Name}
                          </Text>

                          <View style={robostyles.matchStatus}>
                            <Text style={robostyles.statusText}>
                              Ready to Play
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <Text style={robostyles.emptyText}>
                          {selectedTournament.status === "completed"
                            ? "Tournament completed!"
                            : "No matches ready to play."}
                        </Text>
                      }
                    />
                  </View>
                )}

                {/* Tournament Games History */}
                {selectedTournament && (
                  <View>
                    <Text
                      style={[
                        robostyles.gamesHeader,
                        {
                          marginVertical: 15,
                          fontSize: 16,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      Tournament Games
                    </Text>

                    <FlatList
                      data={games.filter(
                        (g) => g.tournamentId === selectedTournament.id,
                      )}
                      keyExtractor={(item) => item.id}
                      renderItem={renderGameCard}
                      ListEmptyComponent={
                        <Text style={robostyles.emptyText}>
                          No tournament games yet.
                        </Text>
                      }
                    />
                  </View>
                )}
              </View>
            )}

            {/* Tournament Setup Modal */}
            <TournamentSetup
              visible={showTournamentSetup}
              onClose={() => setShowTournamentSetup(false)}
              selectedEvent={selectedEvent}
              teams={teams}
              onTournamentCreated={(tournament) => {
                setTournaments((prev) => [...prev, tournament]);
                setSelectedTournament(tournament);
              }}
            />

            {/* Keep your existing modals */}
            {renderCreateGameModal()}

            {activeGame && (
              <RoboSportsMatchScorer
                game={activeGame}
                visible={showScorerModal}
                onClose={() => {
                  setScorerModal(false);
                  setActiveGame(null);
                }}
                selectedEvent={selectedEvent}
              />
            )}
          </View>
        )}

        {/* Non-RoboSports Content */}
        {judgeCategory !== "robosports" && (
          <>
            {/* Status Filter (only for RoboMission and Future Engineers) */}
            {(judgeCategory === "robo-elem" ||
              judgeCategory === "robo-junior" ||
              judgeCategory === "robo-senior" ||
              judgeCategory === "future-eng") && (
              <View style={{ marginBottom: 15, zIndex: 999 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}
                >
                  Filter by Status:
                </Text>
                <DropDownPicker
                  open={statusDropdownOpen}
                  setOpen={setStatusDropdownOpen}
                  value={statusFilter}
                  setValue={setStatusFilter}
                  items={getStatusFilterOptions().map((option) => ({
                    ...option,
                    label: `${option.label}${option.value !== "all" ? ` (${statusCounts[option.value as keyof typeof statusCounts] || 0})` : ` (${statusCounts.total})`}`,
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
                  onChangeValue={() => setCurrentPage(1)}
                />
              </View>
            )}

            {/* Day Tabs section removed - using only Round 1 and Round 2 for RoboMission */}

            {/* Search Bar */}
            <TextInput
              style={styles.searchbar}
              placeholder="Search team name..."
              placeholderTextColor="#999999"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setCurrentPage(1);
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
                  <Text
                    style={[
                      styles.fePillText,
                      fePill === "open" && styles.fePillTextActive,
                    ]}
                  >
                    {" "}
                    Open - Qualifying
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.fePill,
                    fePill === "obstacle" && styles.fePillActive,
                  ]}
                  onPress={() => setFePill("obstacle")}
                >
                  <Text
                    style={[
                      styles.fePillText,
                      fePill === "obstacle" && styles.fePillTextActive,
                    ]}
                  >
                    Obstacles - Final
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <TouchableOpacity
                  style={[
                    {
                      padding: 8,
                      marginHorizontal: 5,
                      borderRadius: 5,
                      backgroundColor: "#e0e0e0",
                    },
                    currentPage === 1 && { opacity: 0.5 },
                  ]}
                  onPress={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <Text>Previous</Text>
                </TouchableOpacity>

                <Text style={{ marginHorizontal: 15, fontSize: 16 }}>
                  Page {currentPage} of {totalPages} ({filteredTeams.length}{" "}
                  teams)
                </Text>

                <TouchableOpacity
                  style={[
                    {
                      padding: 8,
                      marginHorizontal: 5,
                      borderRadius: 5,
                      backgroundColor: "#e0e0e0",
                    },
                    currentPage === totalPages && { opacity: 0.5 },
                  ]}
                  onPress={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
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
                const { bestScore, bestTime, bestScoreRound, bestTimeRound } =
                  getBestScoreAndTime(item);

                // RoboMission: current UI
                if (
                  judgeCategory === "robo-elem" ||
                  judgeCategory === "robo-junior" ||
                  judgeCategory === "robo-senior"
                ) {
                  const currentDayScores = [
                    { score: item.day1Round1Score, time: item.day1Round1Time },
                    { score: item.day1Round2Score, time: item.day1Round2Time },
                  ];
                  return (
                    <Pressable
                      disabled={isComplete}
                      onPress={() => openScoreModal(item)}
                      style={({ pressed }) => [
                        styles.teamCard,
                        {
                          backgroundColor: getCardColor(status),
                          opacity: isComplete ? 0.7 : 1,
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
                            {currentDayScores.map((round, index) => (
                              <Text key={index} style={styles.teamData}>
                                Round {index + 1}:{" "}
                                <Text
                                  style={
                                    bestScoreRound === index + 1
                                      ? { color: "#388e3c", fontWeight: "bold" }
                                      : {}
                                  }
                                >
                                  {round.score ?? "—"}
                                </Text>
                              </Text>
                            ))}
                          </View>
                          {/* Time column */}
                          <View style={{ flex: 1 }}>
                            {currentDayScores.map((round, index) => (
                              <Text key={index} style={styles.teamData}>
                                Time {index + 1}:{" "}
                                <Text
                                  style={
                                    bestTimeRound === index + 1
                                      ? { color: "#1976d2", fontWeight: "bold" }
                                      : {}
                                  }
                                >
                                  {round.time ?? "—"}
                                </Text>
                              </Text>
                            ))}
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
                          : status === "partial"
                            ? "Partially Scored"
                            : status === "complete"
                              ? "Complete"
                              : "Complete"}
                      </Text>
                    </Pressable>
                  );
                }

                // Future Innovators: show current judge's own score sheet only
                if (
                  judgeCategory === "fi-elem" ||
                  judgeCategory === "fi-junior" ||
                  judgeCategory === "fi-senior"
                ) {
                  const scoresheets = item?.scoresheets || {};
                  const count = Object.keys(scoresheets).length;
                  const isFullyComplete = count >= 3;

                  const totals = [1, 2, 3].map(
                    (slot) => scoresheets[String(slot)]?.totalPoints ?? null,
                  );
                  const averageTotal = isFullyComplete
                    ? parseFloat(
                        (
                          totals.reduce((a: number, b: number) => a + b, 0) / 3
                        ).toFixed(2),
                      )
                    : null;

                  return (
                    <Pressable
                      disabled={isFullyComplete}
                      onPress={() => openScoreModal(item)}
                      style={({ pressed }) => [
                        styles.teamCard,
                        {
                          backgroundColor: isFullyComplete
                            ? "#c8e6c9"
                            : getCardColor(status),
                        },
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.teamCardTeamNumber}>
                        Team no. {item.teamNumber}
                      </Text>
                      <Text style={styles.teamCardTitle}>{item.teamName}</Text>
                      <View style={{ marginVertical: 10 }}>
                        {totals.map((total, i) => (
                          <Text key={i} style={styles.teamData}>
                            Scoresheet {i + 1}:{" "}
                            <Text
                              style={{ fontWeight: "bold", color: "#432344" }}
                            >
                              {total !== null ? total.toFixed(2) : "pending"}
                            </Text>
                          </Text>
                        ))}
                        <Text
                          style={[
                            styles.teamData,
                            { marginTop: 6, fontStyle: "italic" },
                          ]}
                        >
                          Average Total:{" "}
                          <Text
                            style={{ fontWeight: "bold", color: "#388e3c" }}
                          >
                            {averageTotal !== null
                              ? averageTotal.toFixed(2)
                              : "—"}
                          </Text>
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: "inter_400Regular",
                          fontStyle: "italic",
                          color: isFullyComplete ? "#2e7d32" : "#6B7280",
                        }}
                      >
                        Status:{" "}
                        {isFullyComplete ? "Complete" : `${count}/3 complete`}
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
                  const score1 =
                    fePill === "open" ? item.openScore1 : item.obstacleScore1;
                  const score2 =
                    fePill === "open" ? item.openScore2 : item.obstacleScore2;
                  const time1 =
                    fePill === "open" ? item.openTime1 : item.obstacleTime1;
                  const time2 =
                    fePill === "open" ? item.openTime2 : item.obstacleTime2;

                  // For open rounds
                  const openScores = [
                    { score: item.openScore1, time: item.openTime1 },
                    { score: item.openScore2, time: item.openTime2 },
                  ].filter((v) => v.score != null);

                  let maxOpenScore: any | null = null;
                  let minOpenTime = null;
                  if (openScores.length) {
                    maxOpenScore = Math.max(...openScores.map((v) => v.score));
                    // Find all rounds with max score, pick the one with the lowest time
                    const tied = openScores.filter(
                      (v) => v.score === maxOpenScore,
                    );
                    minOpenTime =
                      tied.length > 1
                        ? tied.reduce(
                            (min, curr) =>
                              parseTimeStringToMs(curr.time) <
                              parseTimeStringToMs(min.time)
                                ? curr
                                : min,
                            tied[0],
                          ).time
                        : tied[0].time;
                  }

                  // For obstacle rounds
                  const obsScores = [
                    { score: item.obstacleScore1, time: item.obstacleTime1 },
                    { score: item.obstacleScore2, time: item.obstacleTime2 },
                  ].filter((v) => v.score != null);

                  let maxObsScore: any | null = null;
                  let minObsTime = null;
                  if (obsScores.length) {
                    maxObsScore = Math.max(...obsScores.map((v) => v.score));
                    const tied = obsScores.filter(
                      (v) => v.score === maxObsScore,
                    );
                    minObsTime =
                      tied.length > 1
                        ? tied.reduce(
                            (min, curr) =>
                              parseTimeStringToMs(curr.time) <
                              parseTimeStringToMs(min.time)
                                ? curr
                                : min,
                            tied[0],
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
                                  ((fePill === "open" &&
                                    score1 === maxOpenScore &&
                                    time1 === minOpenTime) ||
                                    (fePill === "obstacle" &&
                                      score1 === maxObsScore &&
                                      time1 === minObsTime))
                                    ? {
                                        color: "#388e3c",
                                        fontWeight: "bold",
                                        textDecorationLine: "underline",
                                      }
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
                                  ((fePill === "open" &&
                                    score2 === maxOpenScore &&
                                    time2 === minOpenTime) ||
                                    (fePill === "obstacle" &&
                                      score2 === maxObsScore &&
                                      time2 === minObsTime))
                                    ? {
                                        color: "#388e3c",
                                        fontWeight: "bold",
                                        textDecorationLine: "underline",
                                      }
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
                            <Text
                              style={{ fontWeight: "bold", color: "#432344" }}
                            >
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
          </>
        )}

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
              {(judgeCategory === "fi-elem" ||
                judgeCategory === "fi-junior" ||
                judgeCategory === "fi-senior") &&
              scoresheetNumber ? (
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    fontStyle: "italic",
                    marginBottom: 8,
                  }}
                >
                  Scoresheet no. {scoresheetNumber}
                </Text>
              ) : null}
              {renderScorerModalContent()}
              {submitError ? (
                <Text style={{ color: "red", marginVertical: 8 }}>
                  {submitError}
                </Text>
              ) : null}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    isSubmitting && { opacity: 0.5 },
                  ]}
                  onPress={() => {
                    const isFiCategory =
                      judgeCategory === "fi-elem" ||
                      judgeCategory === "fi-junior" ||
                      judgeCategory === "fi-senior";
                    if (isFiCategory && fiElemModalStep === 2) {
                      setFiElemModalStep(1);
                      setSubmitError("");
                      return;
                    }

                    setScoreModalVisible(false);
                    setFiElemModalStep(1);
                    resetFiElemForm();
                    setSubmitError("");
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.buttonText, { color: "#432344" }]}>
                    {(judgeCategory === "fi-elem" ||
                      judgeCategory === "fi-junior" ||
                      judgeCategory === "fi-senior") &&
                    fiElemModalStep === 2
                      ? "Back"
                      : "Cancel"}
                  </Text>
                </TouchableOpacity>

                {(judgeCategory === "fi-elem" ||
                  judgeCategory === "fi-junior" ||
                  judgeCategory === "fi-senior") &&
                fiElemModalStep === 1 ? (
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isSubmitting && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      const config = getFiConfig(judgeCategory);
                      const allFields = [
                        ...config.project,
                        ...config.robotic,
                        ...config.presentation,
                      ];

                      // Allow proceeding even if some sub-criteria are empty — treat empty as 0.
                      const rawScoresPreview = Object.fromEntries(
                        allFields.map(({ key }) => [
                          key,
                          Number(fiScoreFields[key][0]) || 0,
                        ]),
                      );

                      const exceedsMax = Object.values(rawScoresPreview).some(
                        (v) => Number(v) > 10,
                      );
                      if (exceedsMax) {
                        setSubmitError(
                          "One or more scores exceed the maximum allowed.",
                        );
                        return;
                      }

                      setSubmitError("");
                      setFiElemModalStep(2);
                    }}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.buttonText}>Next</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isSubmitting && { opacity: 0.7 },
                    ]}
                    onPress={handleScoreSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <ActivityIndicator
                          size="small"
                          color="white"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.buttonText}>Submitting...</Text>
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}
