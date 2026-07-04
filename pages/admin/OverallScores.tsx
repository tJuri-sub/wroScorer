import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  Image,
  Alert,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import styles from "../../components/styles/judgeStyles/LeaderboardStyling";
import { AntDesign, Feather } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import * as XLSX from "xlsx";

import { CategoryPills } from "../../components/component/categoryPillsAdmin";

const RECORDS_PER_PAGE = 10;
const windowHeight = Dimensions.get("window").height;

// Category-specific scoring logic (same as EventScores)
const getCategoryFields = (category: string) => {
  switch (category) {
    case 'future-eng':
      return {
        fields: ['openScore1', 'openScore2', 'obstacleScore1', 'obstacleScore2', 'docScore', 'openTime1', 'openTime2', 'obstacleTime1', 'obstacleTime2'],
        headers: ['Open R1', 'Open R2', 'Obstacle R1', 'Obstacle R2', 'Docs', 'Total'],
        calculator: (data: any) => {
          const openBest = Math.max(data.openScore1 || 0, data.openScore2 || 0);
          const obstacleBest = Math.max(data.obstacleScore1 || 0, data.obstacleScore2 || 0);
          const docs = data.docScore || 0;
          
          // Correct: on tie, pick the round with the smaller time
          const openScore1 = data.openScore1 || 0;
          const openScore2 = data.openScore2 || 0;
          const openTime1 = parseTimeToSeconds(data.openTime1);
          const openTime2 = parseTimeToSeconds(data.openTime2);

          const openBestTime = openScore1 > openScore2 ? openTime1
            : openScore2 > openScore1 ? openTime2
            : Math.min(openTime1, openTime2); // tie → smallest time

          const obstacleScore1 = data.obstacleScore1 || 0;
          const obstacleScore2 = data.obstacleScore2 || 0;
          const obstacleTime1 = parseTimeToSeconds(data.obstacleTime1);
          const obstacleTime2 = parseTimeToSeconds(data.obstacleTime2);

          const obstacleBestTime = obstacleScore1 > obstacleScore2 ? obstacleTime1
            : obstacleScore2 > obstacleScore1 ? obstacleTime2
            : Math.min(obstacleTime1, obstacleTime2); // tie → smallest time
          
          let totalTime = openBestTime + obstacleBestTime;
          if (totalTime > 180) totalTime = 180; // Cap at 180 seconds
          
          return {
            ...data,
            bestScore: openBest + obstacleBest + docs,
            totalTime,
            breakdown: {
            openBest,
            openBestTime,
            openSecondScore: openScore1 >= openScore2 ? openScore2 : openScore1,
            openSecondTime: openScore1 >= openScore2 ? openTime2 : openTime1,
            obstacleBest,
            obstacleBestTime,
            obstacleSecondScore: obstacleScore1 >= obstacleScore2 ? obstacleScore2 : obstacleScore1,
            obstacleSecondTime: obstacleScore1 >= obstacleScore2 ? obstacleTime2 : obstacleTime1,
            docs,
            totalScore: openBest + obstacleBest + docs
          }
          };
        }
      };
      
    case 'fi-elem':
case 'fi-junior':
case 'fi-senior':
  return {
    fields: ['scoresheets', 'totalPoints', 'averagePoints'],
    headers: ['Scoresheet 1', 'Scoresheet 2', 'Scoresheet 3', 'Total', 'Average'],
    calculator: (data: any) => {
      const scoresheets = data.scoresheets || {};
      const s1 = scoresheets['1']?.totalPoints ?? null;
      const s2 = scoresheets['2']?.totalPoints ?? null;
      const s3 = scoresheets['3']?.totalPoints ?? null;

      const submittedTotals = [s1, s2, s3].filter((v) => v !== null) as number[];
      const totalPoints = submittedTotals.reduce((sum, v) => sum + v, 0);
      const fallbackAverage = submittedTotals.length > 0
        ? parseFloat((totalPoints / submittedTotals.length).toFixed(2))
        : 0;

      return {
        ...data,
        bestScore: data.averagePoints ?? fallbackAverage,
        breakdown: {
          scoresheet1: s1,
          scoresheet2: s2,
          scoresheet3: s3,
          totalPoints,
          averagePoints: data.averagePoints ?? null,
        }
      };
    }
  };
      
    case 'robosports':
      // Placeholder for future implementation
      return {
        fields: ['round1Score', 'round2Score'],
        headers: ['Round 1', 'Round 2'],
        calculator: (data: any) => ({
          ...data,
          bestScore: Math.max(data.round1Score || 0, data.round2Score || 0)
        })
      };

    case 'robo-elem':
case 'robo-junior':
case 'robo-senior':
  return {
    fields: ['day1Round1Score', 'day1Round1Time', 'day1Round2Score', 'day1Round2Time'],
    headers: ['Round 1', 'Round 2'],
    calculator: (data: any) => {
      const s1 = data.day1Round1Score ?? 0;
      const s2 = data.day1Round2Score ?? 0;
      const t1 = parseTimeToSeconds(data.day1Round1Time);
      const t2 = parseTimeToSeconds(data.day1Round2Time);

      let bestScore: number;
      let bestRound: 1 | 2;
      let bestTimeSeconds: number;
      let bestTimeDisplay: string | null;

      if (s1 > s2) {
        bestScore = s1; bestRound = 1; bestTimeSeconds = t1; bestTimeDisplay = data.day1Round1Time;
      } else if (s2 > s1) {
        bestScore = s2; bestRound = 2; bestTimeSeconds = t2; bestTimeDisplay = data.day1Round2Time;
      } else {
        // Tie on score → least time wins
        bestScore = s1;
        if (t1 <= t2) {
          bestRound = 1; bestTimeSeconds = t1; bestTimeDisplay = data.day1Round1Time;
        } else {
          bestRound = 2; bestTimeSeconds = t2; bestTimeDisplay = data.day1Round2Time;
        }
      }

      return {
        ...data,
        bestScore,
        bestRound,          // 1 or 2 — which round wins the highlight/rank
        bestTime: bestTimeDisplay,
        combinedTime: bestTimeSeconds, // used by the sort tiebreaker
      };
    }
  };
      
    default: // fallback to legacy data
      return {
        fields: ['round1Score', 'round2Score'],
        headers: ['Round 1', 'Round 2'],
        calculator: (data: any) => ({
          ...data,
          bestScore: Math.max(data.round1Score || 0, data.round2Score || 0)
        })
      };
  }
};

const parseTimeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  // Handle mm:ss.ms format (new format)
  if (timeStr.includes('.')) {
    const [timepart, ms] = timeStr.split('.');
    const [mm, ss] = timepart.split(':').map(Number);
    return (mm || 0) * 60 + (ss || 0) + (parseInt(ms) || 0) / 100;
  }
  
  // Handle mm:ss:ms format (legacy format)  
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const [mm, ss, ms] = parts.map(Number);
    return (mm || 0) * 60 + (ss || 0) + (ms || 0) / 100;
  }
  
  return 0;
};


function parseTimeString(timeStr: string) {
  if (!timeStr) return Infinity;
  const [mm, ss, ms] = timeStr.split(":").map(Number);
  return (mm || 0) * 60000 + (ss || 0) * 1000 + (ms || 0);
}

export default function AdminOverallScores({ navigation }: any) {
  const [scoresLoading, setScoresLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<'rank' | 'alpha'>('rank');
  const [userRole, setUserRole] = useState<string>("");

  // Event filter states
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);

  const scrollRef = useRef<FlatList<any>>(null);

  // Get category-specific configuration
  const categoryConfig = getCategoryFields(selectedCategory);

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
      headerRight: () => (
        <TouchableOpacity
          onPress={() => exportOverallScores(selectedCategory)}
          style={{
            marginRight: 15,
          }}
        >
          <AntDesign name="export" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedCategory]);

  useEffect(() => {
    // Use hardcoded categories instead of fetching from database
    const categoryLabels: { [key: string]: string } = {
      "robo-elem": "Robomission Elementary",
      "robo-junior": "Robomission Junior",
      "robo-senior": "Robomission Senior",
      "robosports": "RoboSports",
      "fi-elem": "Future Innovators Elementary",
      "fi-junior": "Future Innovators Junior",
      "fi-senior": "Future Innovators Senior",
      "future-eng": "Future Engineers"
    };

    const order = ["robo-elem", "robo-junior", "robo-senior", "robosports", "fi-elem", "fi-junior", "fi-senior", "future-eng"];
    const cats = order.map((id) => ({
      id,
      label: categoryLabels[id] || id,
    }));

    setCategories(cats);
    if (cats.length > 0) setSelectedCategory(cats[0].id);
  }, []);

  // Fetch events for filtering
  useEffect(() => {
    const fetchEvents = async () => {
      const db = getFirestore();
      const eventsSnap = await getDocs(collection(db, "events"));
      const eventsList = eventsSnap.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "Untitled Event",
        date: doc.data().date || "",
      }));
      // Sort events by date (newest first)
      eventsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents([{ id: "all", title: "All Events", date: "" }, ...eventsList]);
    };
    fetchEvents();

    const fetchUserRole = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "admin-users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch admin role", error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setScoresLoading(true);

    const db = getFirestore();
    let teamsMap: Record<string, any> = {};

    // Listen to all teams (for team names, etc.)
    const teamsUnsub = onSnapshot(collection(db, "teams"), (teamsSnap) => {
      teamsMap = {};
      teamsSnap.forEach((doc) => {
        teamsMap[doc.id] = { id: doc.id, ...doc.data() };
      });
    });

    // Fetch scores based on event selection
    let scoresUnsub: (() => void) | undefined;

    if (selectedEvent === "all") {
      // For all events, aggregate scores from each event's subcollection
      (async () => {
        const eventsSnap = await getDocs(collection(db, "events"));
        let allScores: any[] = [];
        let unsubList: (() => void)[] = [];

        eventsSnap.forEach((eventDoc) => {
          const eventId = eventDoc.id;
          const scoresRef = collection(db, "events", eventId, "scores");
          const unsub = onSnapshot(scoresRef, (scoresSnap) => {
            scoresSnap.forEach((doc) => {
              const data = doc.data();
              if (data.category === selectedCategory) {
                allScores.push({ id: doc.id, ...data, eventId });
              }
            });

            // Build leaderboard
            const teamMap: Record<string, any> = {};
            allScores.forEach((score) => {
              const teamId = score.teamId;
              if (teamId && !teamsMap[teamId]?.disabled) {
                if (!teamMap[teamId]) {
                  teamMap[teamId] = {
                    teamName: score.teamName || teamsMap[teamId]?.teamName || "",
                    teamId: teamId,
                    ...score,
                  };
                }
              }
            });

            const leaderboardArr = Object.values(teamMap)
              .map((team: any) => categoryConfig.calculator(team))
              .filter((team: any) => team.bestScore !== undefined && team.bestScore >= 0)
              .sort((a: any, b: any) => {
                if ((selectedCategory === 'robo-elem' || selectedCategory === 'robo-junior' || selectedCategory === 'robo-senior') && 
                    a.combinedTime !== undefined && b.combinedTime !== undefined) {
                  if (b.bestScore !== a.bestScore) {
                    return b.bestScore - a.bestScore;
                  }
                  // If scores are equal, sort by combined time (less is better)
                  return (a.combinedTime || Infinity) - (b.combinedTime || Infinity);
                }

                // Full tiebreaker sort (10.8.1 → 10.8.10):
                if (selectedCategory === 'future-eng') {
                  const ab = a.breakdown, bb = b.breakdown;

                  // 10.8.1 — total score
                  if (bb.totalScore !== ab.totalScore) return bb.totalScore - ab.totalScore;
                  // 10.8.2 — best obstacle score
                  if (bb.obstacleBest !== ab.obstacleBest) return bb.obstacleBest - ab.obstacleBest;
                  // 10.8.3 — best obstacle time (lower is better)
                  if (ab.obstacleBestTime !== bb.obstacleBestTime) return ab.obstacleBestTime - bb.obstacleBestTime;
                  // 10.8.4 — second obstacle score
                  if (bb.obstacleSecondScore !== ab.obstacleSecondScore) return bb.obstacleSecondScore - ab.obstacleSecondScore;
                  // 10.8.5 — second obstacle time
                  if (ab.obstacleSecondTime !== bb.obstacleSecondTime) return ab.obstacleSecondTime - bb.obstacleSecondTime;
                  // 10.8.6 — doc score
                  if (bb.docs !== ab.docs) return bb.docs - ab.docs;
                  // 10.8.7 — best open score
                  if (bb.openBest !== ab.openBest) return bb.openBest - ab.openBest;
                  // 10.8.8 — second open score
                  if (bb.openSecondScore !== ab.openSecondScore) return bb.openSecondScore - ab.openSecondScore;
                  // 10.8.9 — best open time
                  if (ab.openBestTime !== bb.openBestTime) return ab.openBestTime - bb.openBestTime;
                    // 10.8.10 — second open time
                    return ab.openSecondTime - bb.openSecondTime;
                  }

                return b.bestScore - a.bestScore;
              });

            setLeaderboard(leaderboardArr);
            setCurrentPage(1);
            setScoresLoading(false);
          });
          unsubList.push(unsub);
        });

        scoresUnsub = () => {
          unsubList.forEach((unsub) => unsub());
        };
      })();
    } else {
      // Only fetch scores for the selected event
      const scoresRef = collection(db, "events", selectedEvent, "scores");
      scoresUnsub = onSnapshot(scoresRef, (scoresSnap) => {
        const scores: any[] = [];
        scoresSnap.forEach((doc) => {
          const data = doc.data();
          if (data.category === selectedCategory) {
            scores.push({ id: doc.id, ...data, eventId: selectedEvent });
          }
        });

        // Build leaderboard
        const teamMap: Record<string, any> = {};
        scores.forEach((score) => {
          const teamId = score.teamId;
          if (teamId && !teamsMap[teamId]?.disabled) {
            if (!teamMap[teamId]) {
              teamMap[teamId] = {
                teamName: score.teamName || teamsMap[teamId]?.teamName || "",
                teamId: teamId,
                ...score,
              };
            }
          }
        });

        const leaderboardArr = Object.values(teamMap)
          .map((team: any) => categoryConfig.calculator(team))
          .filter((team: any) => team.bestScore !== undefined && team.bestScore >= 0)
          .sort((a: any, b: any) => {
            if ((selectedCategory === 'robo-elem' || selectedCategory === 'robo-junior' || selectedCategory === 'robo-senior') && 
                a.combinedTime !== undefined && b.combinedTime !== undefined) {
              if (b.bestScore !== a.bestScore) {
                return b.bestScore - a.bestScore;
              }
              return (a.combinedTime || Infinity) - (b.combinedTime || Infinity);
            }

            if (selectedCategory === 'future-eng') {
              if (b.bestScore !== a.bestScore) {
                return b.bestScore - a.bestScore;
              }
              return (a.totalTime || Infinity) - (b.totalTime || Infinity);
            }
            return b.bestScore - a.bestScore;
          });

        setLeaderboard(leaderboardArr);
        setCurrentPage(1);
        setScoresLoading(false);
      });
    }

    return () => {
      teamsUnsub();
      if (scoresUnsub) scoresUnsub();
    };
  }, [selectedCategory, selectedEvent]);

  const exportOverallScores = (categoryLabel: string) => {
    if (leaderboard.length === 0) return;

    // Get event info for filename
    const eventInfo = selectedEvent === "all" ? "All_Events" : 
      events.find(e => e.id === selectedEvent)?.title?.replace(/\s+/g, "_") || selectedEvent;

    let data;
    
    if (selectedCategory === 'future-eng') {
      data = leaderboard.map((team, index) => ({
        Rank: index + 1,
        Team: team.teamName,
        "Open Round 1": team.openScore1 ?? "-",
        "Open Round 2": team.openScore2 ?? "-",
        "Obstacle Round 1": team.obstacleScore1 ?? "-",
        "Obstacle Round 2": team.obstacleScore2 ?? "-",
        "Documentation": team.docScore ?? "-",
        "Total Score": team.bestScore,
        "Total Time": team.totalTime ? `${team.totalTime}s` : "-",
      }));
    } else if (selectedCategory?.startsWith('fi-')) {
      data = leaderboard.map((team, index) => ({
        Rank: index + 1,
        Team: team.teamName,
        "Project & Innovation": team.projectInnovation ?? "-",
        "Robotic Solution": team.roboticSolution ?? "-",
        "Presentation & Team Spirit": team.presentationSpirit ?? "-",
        "Total Score": team.bestScore,
      }));
      } else if (selectedCategory === 'robo-elem' || selectedCategory === 'robo-junior' || selectedCategory === 'robo-senior') {
  data = leaderboard.map((team, index) => ({
    Rank: index + 1,
    Team: team.teamName,
    "Round 1 Score": team.day1Round1Score ?? "-",
    "Round 1 Time": team.day1Round1Time ?? "-",
    "Round 2 Score": team.day1Round2Score ?? "-",
    "Round 2 Time": team.day1Round2Time ?? "-",
    "Best Score": team.bestScore,
    "Best Time": team.bestTime ?? "-",
  }));
} else {
      // Default robomissions format
      data = leaderboard.map((team, index) => ({
        Rank: index + 1,
        Team: team.teamName,
        "Round 1 Score": team.round1Score ?? "-",
        "Round 2 Score": team.round2Score ?? "-",
        "Best Score": team.bestScore,
      }));
    }

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Overall Scores");

    // Export
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const catLabel =
      categories.find((c) => c.id === selectedCategory)?.label ||
      selectedCategory;

    a.download = `overall_scores_${catLabel.replace(/\s+/g, "_")}_${eventInfo}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter leaderboard by search
  const filteredLeaderboard = leaderboard.filter(
    (team) =>
      team.teamName &&
      team.teamName.toLowerCase().includes(search.trim().toLowerCase())
  );

  const sortedLeaderboard = sortMode === 'alpha'
    ? [...filteredLeaderboard].sort((a, b) =>
        (a.teamName || "").localeCompare(b.teamName || "")
      )
    : filteredLeaderboard;

  const totalRecords = sortedLeaderboard.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / RECORDS_PER_PAGE));
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentRecords = sortedLeaderboard.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Render different table headers based on category
  const renderTableHeader = () => {
    return (
      <View style={stickyStyles.header}>
        <Text style={stickyStyles.heading}>Team Name</Text>
        {categoryConfig.headers.map((header, index) => (
          <Text key={index} style={[stickyStyles.heading, stickyStyles.align]}>
            {header}
          </Text>
        ))}
      </View>
    );
  };

  // Render different table rows based on category
  const renderTableRow = (item: any, index: number) => {
    const overallRank = startIndex + index;
    const rankDisplay = `${overallRank + 1}.`;
    
    if (selectedCategory === 'future-eng') {
      return (
        <View style={stickyStyles.row}>
          <Text style={stickyStyles.cell}>
            {rankDisplay} {item.teamName}
          </Text>
          <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 12 }]}>
            {item.openScore1 ?? "N/A"}
          </Text>
          <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 12 }]}>
            {item.openScore2 ?? "N/A"}
          </Text>
          <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 12 }]}>
            {item.obstacleScore1 ?? "N/A"}
          </Text>
          <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 12 }]}>
            {item.obstacleScore2 ?? "N/A"}
          </Text>
          <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 12 }]}>
            {item.docScore ?? "N/A"}
          </Text>
          <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 14, fontWeight: "bold" }]}>
            {item.bestScore}
            {item.totalTime ? `\n(${item.totalTime}s)` : ''}
          </Text>
        </View>
      );
    } else if (selectedCategory?.startsWith('fi-')) {
        const scoresheets = item.scoresheets || {};
        const sheet1 = scoresheets['1']?.totalPoints;
        const sheet2 = scoresheets['2']?.totalPoints;
        const sheet3 = scoresheets['3']?.totalPoints;

        const submittedTotals = [sheet1, sheet2, sheet3].filter((v) => Number.isFinite(v)) as number[];
        const totalPoints = submittedTotals.reduce((sum, v) => sum + v, 0);
        const average = Number.isFinite(item.averagePoints)
          ? item.averagePoints
          : submittedTotals.length
          ? Number((totalPoints / submittedTotals.length).toFixed(2))
          : 0;

        return (
          <View style={stickyStyles.row}>
            <Text style={stickyStyles.cell}>
              {rankDisplay} {item.teamName}
            </Text>
            <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 14 }]}>
              {Number.isFinite(sheet1) ? sheet1 : "N/A"}
            </Text>
            <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 14 }]}>
              {Number.isFinite(sheet2) ? sheet2 : "N/A"}
            </Text>
            <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 14 }]}>
              {Number.isFinite(sheet3) ? sheet3 : "N/A"}
            </Text>
            <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 16, fontWeight: "600" }]}>
              {totalPoints}
            </Text>
            <Text style={[stickyStyles.cell, { textAlign: "center", fontSize: 16, fontWeight: "bold" }]}>
              {average}
            </Text>
          </View>
        );
      } else if (selectedCategory === 'robo-elem' || selectedCategory === 'robo-junior' || selectedCategory === 'robo-senior') {
        const round1Display = item.day1Round1Score != null
          ? `${item.day1Round1Score}${item.day1Round1Time ? ` (${item.day1Round1Time})` : ''}`
          : "N/A";
        const round2Display = item.day1Round2Score != null
          ? `${item.day1Round2Score}${item.day1Round2Time ? ` (${item.day1Round2Time})` : ''}`
          : "N/A";

        return (
          <View style={stickyStyles.row}>
            <Text style={stickyStyles.cell}>
              {rankDisplay} {item.teamName}
            </Text>
            <Text
              style={[
                stickyStyles.cell,
                {
                  textAlign: "center",
                  fontWeight: item.bestRound === 1 ? "bold" : "normal",
                  color: item.bestRound === 1 ? "#2d5a3d" : "#000",
                },
              ]}
            >
              {round1Display}
            </Text>
            <Text
              style={[
                stickyStyles.cell,
                {
                  textAlign: "center",
                  fontWeight: item.bestRound === 2 ? "bold" : "normal",
                  color: item.bestRound === 2 ? "#2d5a3d" : "#000",
                },
              ]}
            >
              {round2Display}
            </Text>
          </View>
        );
      }
        };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: 8 }}>
        <TextInput
          placeholder="Search teams..."
          placeholderTextColor="#999999"
          value={search}
          onChangeText={setSearch}
          style={[stickyStyles.searchInput, { maxWidth: 340, width: "100%" }]}
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ marginRight: 10, fontSize: 14, color: "#333" }}>Sort:</Text>
        <TouchableOpacity
          onPress={() => setSortMode('rank')}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
            backgroundColor: sortMode === 'rank' ? '#1976d2' : '#eee',
            marginRight: 8,
          }}
        >
          <Text style={{ color: sortMode === 'rank' ? '#fff' : '#333' }}>Ranking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortMode('alpha')}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
            backgroundColor: sortMode === 'alpha' ? '#1976d2' : '#eee',
          }}
        >
          <Text style={{ color: sortMode === 'alpha' ? '#fff' : '#333' }}>Alphabetical</Text>
        </TouchableOpacity>
      </View>

      {/* Event Filter Dropdown */}
      <View style={{ marginBottom: 8, zIndex: 1000 }}>
        <DropDownPicker
          open={eventDropdownOpen}
          setOpen={setEventDropdownOpen}
          value={selectedEvent}
          setValue={setSelectedEvent}
          items={events.map(event => ({
            label: event.id === "all" ? "All Events" : `${event.title}${event.date ? ` (${event.date})` : ''}`,
            value: event.id,
          }))}
          placeholder="Select Event"
          style={{
            borderWidth: 1,
            borderColor: "#e0e0e0",
            backgroundColor: "#fafafa",
            minHeight: 40,
          }}
          textStyle={{
            fontSize: 14,
          }}
          dropDownContainerStyle={{
            borderWidth: 1,
            borderColor: "#e0e0e0",
            backgroundColor: "#fafafa",
          }}
          listItemLabelStyle={{
            fontSize: 14,
          }}
        />
      </View>

      <View style={{ marginBottom: 8 }}>
        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </View>
      
      {/* Leaderboard List */}
      <View style={{ flex: 1, marginHorizontal: 10, marginTop: 0 }}>
        {renderTableHeader()}
        {currentRecords.length === 0 ? (
          <View
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ textAlign: "center" }}>
              {selectedEvent === "all" ? "No scores yet!" : "No scores for this event yet!"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentRecords}
            keyExtractor={(item) => item.teamId}
            contentContainerStyle={{ padding: 1 }}
            renderItem={({ item, index }) => renderTableRow(item, index)}
          />
        )}
      </View>
      
      {/* Sticky Pagination Controls */}
      <View style={stickyStyles.paginationContainer}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={handlePreviousPage}
            disabled={currentPage === 1}
            style={{
              padding: 8,
              marginHorizontal: 8,
              backgroundColor: currentPage === 1 ? "#eee" : "#999999",
              borderRadius: 6,
            }}
          >
            <AntDesign 
              name="left" 
              size={16} 
              color={currentPage === 1 ? "#aaa" : "white"} 
            />
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
              backgroundColor: currentPage === totalPages ? "#eee" : "#999999",
              borderRadius: 6,
            }}
          >
            <AntDesign 
              name="right" 
              size={16} 
              color={currentPage === totalPages ? "#aaa" : "white"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={{ color: "#555", marginLeft: 16 }}>
          Showing {currentRecords.length} of {leaderboard.length} teams
          {selectedEvent !== "all" && ` (${events.find(e => e.id === selectedEvent)?.title || 'Selected Event'})`}
        </Text>
      </View>
    </View>
);
}

const stickyStyles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: "#fafafa",
    paddingTop: 16,
    zIndex: 10,
    elevation: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingLeft: 16,
  },

  paginationContainer: {
    backgroundColor: "#fafafa",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    elevation: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#432344",
    borderBottomWidth: 1,
    borderColor: "#eee",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  heading: {
    flex: 1,
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },

  align: {
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1,
    marginHorizontal: 2,
    elevation: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  cell: {
    flex: 1,
    textAlign: "left",
    fontSize: 12,
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    marginBottom: 0,
    fontFamily: "inter_400Regular",
    fontSize: 16,
  },
});