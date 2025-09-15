import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import styles from "../../components/styles/adminStyles/EventsStyle";

const EventsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Add null checks and default values
  const params = route.params as { eventId?: string; category?: string } || {};
  const { eventId, category } = params;

  /* EVENT STATES */
  const [event, setEvent] = useState<any>(null);

  /* JUDGES STATES */
  const [judges, setJudges] = useState<any[]>([]);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);
  const [judgesDropdownOpen, setJudgesDropdownOpen] = useState(false);

  /* TEAMS STATES */
  const [teams, setTeams] = useState<any[]>([]);
  const [assignTeamsModal, setAssignTeamsModal] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);

  /* LOADING STATES */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch event and judges - Remove assignModal from dependencies
useEffect(() => {
  // Add guard clause to prevent execution if eventId is undefined
  if (!eventId || !category) {
    console.error('EventId or category is undefined');
    setLoading(false);
    return;
  }

  const fetchEventAndJudges = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Fetch event details
      const eventRef = doc(db, "events", eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        console.error('Event not found');
        setLoading(false);
        return;
      }
      
      const eventData = eventDoc.data();
      setEvent(eventData);

      // Fetch judges matching event category
      const judgesSnapshot = await getDocs(collection(db, "judge-users"));
      const judgeList = judgesSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, category: data.category };
        })
        .filter(judge => {
            const judgeCat = judge.category || "";
            const eventCat = category || "";
            return judgeCat === eventCat;
        });
      setJudges(judgeList);

      // Load assigned judges for this specific category
      const categoryJudges = eventData?.categoryData?.[category]?.judges || [];
      setSelectedJudges(Array.isArray(categoryJudges) ? categoryJudges : []);
    } catch (error) {
      console.error('Error fetching event and judges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchEventAndJudges();
}, [eventId, category]); // Removed assignModal from dependencies

// Add a separate useEffect to update selectedJudges when event changes
useEffect(() => {
  if (event && category) {
    const categoryJudges = event?.categoryData?.[category]?.judges || [];
    setSelectedJudges(Array.isArray(categoryJudges) ? categoryJudges : []);
  }
}, [event, category]);

  const handleSaveJudges = async () => {
    if (!eventId || !category) return;
    
    try {
      setSaving(true);
      const db = getFirestore();
      
      // Get current event data
      const eventRef = doc(db, "events", eventId);
      const eventDoc = await getDoc(eventRef);
      const currentData = eventDoc.data() || {};
      
      // Update the category-specific judges data
      const updatedCategoryData = {
        ...currentData.categoryData,
        [category]: {
          ...currentData.categoryData?.[category],
          judges: selectedJudges
        }
      };
      
      await updateDoc(eventRef, {
        categoryData: updatedCategoryData,
      });
      setAssignModal(false);
    } catch (error) {
      console.error('Error saving judges:', error);
    } finally {
      setSaving(false);
    }
  };

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (!category || !event) return;
      
      try {
        const db = getFirestore();
        const teamsSnapshot = await getDocs(collection(db, "categories", category, "teams"));
        const teamList = teamsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamList);

        // Load assigned teams for this specific category
        const categoryTeams = event?.categoryData?.[category]?.teams || [];
        setSelectedTeams(Array.isArray(categoryTeams) ? categoryTeams : []);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    
    fetchTeams();
  }, [event, assignTeamsModal, category]);

  const handleSaveTeams = async () => {
  if (!eventId || !category) return;
  
  try {
    setSaving(true);
    const db = getFirestore();
    
    // Get current event data
    const eventRef = doc(db, "events", eventId);
    const eventDoc = await getDoc(eventRef);
    const currentData = eventDoc.data() || {};
    
    // Update the category-specific teams data
    const updatedCategoryData = {
      ...currentData.categoryData,
      [category]: {
        ...currentData.categoryData?.[category],
        teams: selectedTeams
      }
    };
    
    await updateDoc(eventRef, {
      categoryData: updatedCategoryData,
    });

    // Update the event state with the new data
    const updatedEvent = {
      ...currentData,
      categoryData: updatedCategoryData
    };
    setEvent(updatedEvent);
    
    setAssignTeamsModal(false);
  } catch (error) {
    console.error('Error saving teams:', error);
  } finally {
    setSaving(false);
  }
};

  // Navigation to Leaderboard and OverallScores
  const handleNavigateLeaderboard = () => {
    (navigation as any).navigate("EventLeaderboard", {
      category: category,
      date: event?.date,
      eventId,
    });
  };

  const handleNavigateOverallScores = () => {
    (navigation as any).navigate("EventScores", {
      category: category,
      date: event?.date,
      eventId,
    });
  };

  // Show error state if eventId or category is missing
  if (!eventId || !category) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red' }}>
          Error: Event ID or Category is missing. Please navigate back and try again.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", padding: 20 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#432344" />
      ) : (
        <>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            {event?.title}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>
            Date: {event?.date}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 15 }}>
            Category: {category}
          </Text>

          {/* Navigation Buttons */}
          <View style={{ flexDirection: "row", marginTop: 20, marginBottom: 10 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#0081CC",
                padding: 12,
                borderRadius: 8,
                marginRight: 12,
              }}
              onPress={handleNavigateLeaderboard}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Leaderboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#3A9F6C",
                padding: 12,
                borderRadius: 8,
              }}
              onPress={handleNavigateOverallScores}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Overall Scores</Text>
            </TouchableOpacity>
          </View>

          {/* ASSIGN JUDGES SECTION */}
          <View style={{ marginTop: 20, width: "100%" }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
              Assigned Judges for {category}:
            </Text>
            {selectedJudges.length === 0 ? (
              <Text>No judges assigned for this category.</Text>
            ) : (
              selectedJudges.map(judgeId => {
                const judge = judges.find(j => j.id === judgeId);
                return (
                  <Text key={judgeId} style={{ marginBottom: 2 }}>
                    {judge ? judge.username : judgeId}
                  </Text>
                );
              })
            )}
          </View>

          <TouchableOpacity
            style={{
              margin: 10,
              padding: 10,
              backgroundColor: "#432344",
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
            onPress={() => setAssignModal(true)}
          >
            <Text style={{ color: "#fff" }}>Assign Judges</Text>
          </TouchableOpacity>

          {/* Assign Judges Modal */}
          <Modal transparent visible={assignModal} animationType="slide">
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#00000055",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderRadius: 10,
                  width: 320,
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
                  Assign Judges for {category}
                </Text>
                <DropDownPicker
                  open={judgesDropdownOpen}
                  setOpen={setJudgesDropdownOpen}
                  multiple={true}
                  value={selectedJudges}
                  setValue={setSelectedJudges}
                  items={judges.map(j => ({
                    label: j.username,
                    value: j.id,
                  }))}
                  placeholder="Select Judges"
                  style={{
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 6,
                    padding: 8,
                  }}
                  searchable={true}
                  min={0}
                  max={100}
                />
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Selected Judges:</Text>
                  {selectedJudges.length === 0 ? (
                    <Text>No judges selected.</Text>
                  ) : (
                    selectedJudges.map(judgeId => {
                      const judge = judges.find(j => j.id === judgeId);
                      return (
                        <View key={judgeId} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                          <Text>{judge ? judge.username : judgeId}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              setSelectedJudges(selectedJudges.filter(id => id !== judgeId))
                            }
                            style={{ marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#eee", borderRadius: 4 }}
                          >
                            <Text style={{ color: "red" }}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )}
                </View>
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <TouchableOpacity
                    onPress={() => setAssignModal(false)}
                    style={{ marginRight: 20 }}
                  >
                    <Text style={{ color: "red" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveJudges}
                    disabled={saving}
                    style={{ backgroundColor: "#432344", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff" }}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* ASSIGN JUDGES SECTION ----------- ENDS*/}

          {/* TEAMS SECTION */}
          <View style={{ marginTop: 20, width: "100%" }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
              Assigned Teams for {category}:
            </Text>
            {selectedTeams.length === 0 ? (
              <Text>No teams assigned for this category.</Text>
            ) : (
              selectedTeams.map(teamId => {
                const team = teams.find(t => t.id === teamId);
                return (
                  <View key={teamId} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                    <Text>{team ? (team.teamName || team.name || teamId) : teamId}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedTeams(selectedTeams.filter(id => id !== teamId))
                      }
                      style={{ marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#eee", borderRadius: 4 }}
                    >
                      <Text style={{ color: "red" }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

          <TouchableOpacity
            style={{
              margin: 10,
              padding: 10,
              backgroundColor: "#432344",
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
            onPress={() => setAssignTeamsModal(true)}
          >
            <Text style={{ color: "#fff" }}>Assign Teams</Text>
          </TouchableOpacity>

          {/* Assign Teams Modal */}
          <Modal transparent visible={assignTeamsModal} animationType="slide">
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#00000055",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderRadius: 10,
                  width: 320,
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
                  Assign Teams for {category}
                </Text>
                <DropDownPicker
                  open={teamsDropdownOpen}
                  setOpen={setTeamsDropdownOpen}
                  multiple={true}
                  value={selectedTeams}
                  setValue={setSelectedTeams}
                  items={teams.map(t => ({
                    label: t.teamName || t.name || "Unnamed Team",
                    value: t.id,
                  }))}
                  placeholder="Select Teams"
                  style={{
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 6,
                    padding: 8,
                  }}
                  searchable={true}
                  min={0}
                  max={100}
                />
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Selected Teams:</Text>
                  {selectedTeams.length === 0 ? (
                    <Text>No teams selected.</Text>
                  ) : (
                    selectedTeams.map(teamId => {
                      const team = teams.find(t => t.id === teamId);
                      return (
                        <View key={teamId} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                          <Text>{team ? (team.teamName || team.name || teamId) : teamId}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              setSelectedTeams(selectedTeams.filter(id => id !== teamId))
                            }
                            style={{ marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#eee", borderRadius: 4 }}
                          >
                            <Text style={{ color: "red" }}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )}
                </View>
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <TouchableOpacity
                    onPress={() => setAssignTeamsModal(false)}
                    style={{ marginRight: 20 }}
                  >
                    <Text style={{ color: "red" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveTeams}
                    disabled={saving}
                    style={{ backgroundColor: "#432344", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff" }}>Save</Text>
                    )}
                  </TouchableOpacity>
                  </View>
              </View>
            </View>
          </Modal>
          {/* TEAMS SECTION ----------- ENDS*/}
        </>
      )}
    </ScrollView>
  );
};

export default EventsScreen;