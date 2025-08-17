import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import CountryPicker from "rn-country-dropdown-picker"; // Import the new country picker
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import styles from "../../components/styles/adminStyles/CategoryscreenStyle";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export default function CategoryScreen({ route, navigation }: any) {
  const { category, label } = route.params; // Get category and label from navigation params
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const [teams, setTeams] = useState<
    {
      id: string;
      countryName: string;
      teamNumber: number;
      podNumber: number;
      teamName: string;
      coachName: string;
      members: string[];
      disabled?: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1); // Track the current step
  const [formData, setFormData] = useState({
    countryName: "",
    teamNumber: 0,
    podNumber: 0,
    teamName: "",
    coachName: "",
    members: ["", "", ""], // Array for 3 members
  });
  const [countryError, setCountryError] = useState<string | null>(null);
  const [teamNumberError, setTeamNumberError] = useState<string | null>(null);
  const [podNumberError, setPodNumberError] = useState<string | null>(null);
  const [teamNameError, setTeamNameError] = useState<string | null>(null);

  const db = getFirestore();

  const [editMode, setEditMode] = useState(false);
  const [editTeamId, setEditTeamId] = useState<string | null>(null);

  const [disableModalVisible, setDisableModalVisible] = useState(false);

  // Filter teams by search (team name or coach)
  const filteredTeams = teams.filter(
    (team) =>
      team.teamName.toLowerCase().includes(search.toLowerCase()) ||
      team.coachName.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalRecords = filteredTeams.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
  const paginatedTeams = filteredTeams.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Fetch teams for the selected category
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, `categories/${category}/teams`)
        );
        const teamList = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              countryName: data.country || "Unknown Country",
              teamNumber: data.teamNumber || 0,
              podNumber: data.podNumber || 0,
              teamName: data.teamName || "Unknown Team",
              coachName: data.coachName || "Unknown Coach",
              members: data.members || [],
              disabled: data.disabled || false,
            };
          })
          .sort((a, b) => a.teamNumber - b.teamNumber);

        setTeams(teamList);
      } catch (error) {
        console.error("Error fetching teams:", error);
        Alert.alert("Error", "Failed to load teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [category]);

  const handleNext = () => {
    let hasError = false;
    if (!formData.countryName) {
      setCountryError("Country is required.");
      hasError = true;
    } else {
      setCountryError(null);
    }
    if (!formData.teamNumber) {
      setTeamNumberError("Team number is required.");
      hasError = true;
    } else {
      // Check for duplicate team number
      const duplicate = teams.some(
        (team) =>
          team.teamNumber === formData.teamNumber &&
          (!editMode || team.id !== editTeamId)
      );
      if (duplicate) {
        setTeamNumberError("Team number already exists.");
        hasError = true;
      } else {
        setTeamNumberError(null);
      }
    }
    if (!formData.podNumber) {
      setPodNumberError("Pod number is required.");
      hasError = true;
    } else {
      setPodNumberError(null);
    }
    if (!formData.teamName) {
      setTeamNameError("Team name is required.");
      hasError = true;
    } else {
      setTeamNameError(null);
    }
    if (hasError) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      // Check for duplication
      const teamsRef = collection(db, `categories/${category}/teams`);
      const q = query(teamsRef, where("teamName", "==", formData.teamName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert("Error", "A team with this name already exists.");
        return;
      }

      // Create new team document
      const newTeam = {
        country: formData.countryName,
        teamNumber: formData.teamNumber,
        podNumber: formData.podNumber,
        teamName: formData.teamName,
        coachName: formData.coachName,
        members: formData.members,
      };

      await addDoc(teamsRef, newTeam);

      const allTeamsSnapshot = await getDocs(
        collection(db, `categories/${category}/teams`)
      );
      const teamList = allTeamsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          countryName: data.country || "Unknown Country",
          teamNumber: data.teamNumber || 0,
          podNumber: data.podNumber || 0,
          teamName: data.teamName || "Unknown Team",
          coachName: data.coachName || "Unknown Coach",
          members: data.members || [],
        };
      });
      setTeams(teamList);

      Alert.alert("Success", "Team created successfully!");
      setModalVisible(false); // Close the modal
      setStep(1); // Reset to step 1
      setFormData({
        countryName: "",
        teamNumber: 0,
        podNumber: 0,
        teamName: "",
        coachName: "",
        members: ["", "", ""],
      });
    } catch (error) {
      console.error("Error creating team:", error);
      Alert.alert("Error", "Failed to create team.");
    }
  };

  const handleEditSubmit = async () => {
    if (!editTeamId) return;
    try {
      const teamRef = collection(db, `categories/${category}/teams`);
      // Check for duplicate team name (exclude current team)
      const q = query(teamRef, where("teamName", "==", formData.teamName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].id !== editTeamId) {
        Alert.alert("Error", "A team with this name already exists.");
        return;
      }
      // Update team document
      await updateDoc(doc(teamRef, editTeamId), {
        country: formData.countryName,
        teamNumber: formData.teamNumber,
        podNumber: formData.podNumber,
        teamName: formData.teamName,
        coachName: formData.coachName,
        members: formData.members,
      });
      // Refresh teams
      const allTeamsSnapshot = await getDocs(teamRef);
      const teamList = allTeamsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          countryName: data.country || "Unknown Country",
          teamNumber: data.teamNumber || 0,
          podNumber: data.podNumber || 0,
          teamName: data.teamName || "Unknown Team",
          coachName: data.coachName || "Unknown Coach",
          members: data.members || [],
        };
      });
      setTeams(teamList);
      Alert.alert("Success", "Team updated successfully!");
      setModalVisible(false);
      setEditMode(false);
      setEditTeamId(null);
      setStep(1);
      setFormData({
        countryName: "",
        teamNumber: 0,
        podNumber: 0,
        teamName: "",
        coachName: "",
        members: ["", "", ""],
      });
    } catch (error) {
      console.error("Error updating team:", error);
      Alert.alert("Error", "Failed to update team.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.subtitle}>Teams in {label}</Text>
      <TextInput
        placeholder="Search team"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setPage(page - 1)}
          disabled={page === 1}
          style={[
            styles.paginationButton,
            page === 1 && styles.paginationButtonDisabled,
          ]}
        >
          <Text style={styles.paginationButtonText}>Previous</Text>
        </TouchableOpacity>
        {totalRecords === 0 ? (
          <Text style={styles.paginationInfo}>No teams</Text>
        ) : (
          <Text style={styles.paginationInfo}>
            Page {page} of {totalPages} | {totalRecords} teams
          </Text>
        )}
        <TouchableOpacity
          onPress={() => setPage(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          style={[
            styles.paginationButton,
            (page === totalPages || totalPages === 0) &&
              styles.paginationButtonDisabled,
          ]}
        >
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text>Loading teams...</Text>
      ) : (
        <View style={{ marginBottom: 20, flex: 1 }}>
          <FlatList
            data={paginatedTeams}
            scrollEnabled={true}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.teamCard,
                  item.disabled && {
                    backgroundColor: "#f0f0f0",
                    borderColor: "#c6c6c6ff",
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  navigation.navigate("TeamScores", {
                    teamId: item.id,
                    teamName: item.teamName,
                  });
                }}
                disabled={item.disabled}
              >
                <View
                  style={[
                    item.disabled && {
                      opacity: 0.5,
                      backgroundColor: "#f0f0f0",
                    },
                  ]}
                >
                  {/* Header Row */}
                  <View style={styles.teamCardHeader}>
                    <Text style={styles.teamCardHeaderText}>
                      Team Number {item.teamNumber}
                    </Text>
                    <Text style={styles.teamCardHeaderText}>
                      Pod Number {item.podNumber}
                    </Text>
                  </View>

                  {/* Country and Team Name Row */}
                  <View style={styles.teamCardRow}>
                    {/* Replace with your flag component or Image */}
                    {/* <Image source={require('../assets/flags/ph.png')} style={styles.teamCardFlag} /> */}
                    <Text style={styles.teamCardTeamName}>{item.teamName}</Text>
                    <Text style={styles.teamCardCountry}>
                      {item.countryName}
                    </Text>
                  </View>

                  {/* Members */}
                  {item.members.map((member, index) => (
                    <Text style={styles.teamCardMember} key={index}>
                      Member {index + 1}: {member || "N/A"}
                    </Text>
                  ))}

                  {/* Coach */}
                  <Text style={styles.teamCardCoach}>
                    Coach Name: {item.coachName}
                  </Text>
                </View>

                <View>
                  {item.disabled ? (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.editIcon,
                          { backgroundColor: "#35A22F", opacity: 1 },
                        ]}
                        onPress={async () => {
                          try {
                            await updateDoc(
                              doc(db, `categories/${category}/teams`, item.id),
                              { disabled: false }
                            );
                            setTeams((prev) =>
                              prev.map((t) =>
                                t.id === item.id ? { ...t, disabled: false } : t
                              )
                            );
                            Alert.alert("Restored!", "Team has been restored.");
                          } catch (e) {
                            Alert.alert("Error", "Failed to restore team.");
                          }
                        }}
                      >
                        <MaterialIcons name="restore" size={20} color="#fff" />
                      </TouchableOpacity>
                      <Text
                        style={{
                          color: "#AA0003",
                          fontWeight: "bold",
                          marginTop: 8,
                        }}
                      >
                        Disabled
                      </Text>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.editIcon}
                      onPress={() => {
                        setEditMode(true);
                        setEditTeamId(item.id);
                        setFormData({
                          countryName: item.countryName,
                          teamNumber: item.teamNumber,
                          podNumber: item.podNumber,
                          teamName: item.teamName,
                          coachName: item.coachName,
                          members: item.members.length
                            ? item.members
                            : ["", "", ""],
                        });
                        setStep(1);
                        setModalVisible(true);
                      }}
                    >
                      <MaterialIcons name="edit" size={18} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text>No teams found.</Text>}
          />
        </View>
      )}

      {/* <Button title="Create Team" onPress={() => setModalVisible(true)} /> */}
      <TouchableOpacity
        style={styles.createTeamButton}
        onPress={() => {
          setEditMode(false); // <-- Reset edit mode
          setEditTeamId(null); // <-- Reset edit team id
          setStep(1); // <-- Reset to first step
          setFormData({
            countryName: "",
            teamNumber: 0,
            podNumber: 0,
            teamName: "",
            coachName: "",
            members: ["", "", ""],
          }); // <-- Reset form data
          setModalVisible(true); // <-- Open modal
        }}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal for Team Creation */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {step === 1 && (
              <>
                <View style={styles.modalHeader}>
                  {/* <Image
                    source={require("../../assets/images/user.png")}
                    style={styles.modalImage}
                  /> */}
                  <Text style={styles.headerTextModal}>
                    {editMode ? "Edit Team" : "Create Team"}
                  </Text>
                  <Text style={styles.headerSubTextModal}>
                    {editMode
                      ? "Update team information"
                      : "Enter team information"}
                  </Text>
                </View>
                <Text style={styles.modalLabel}>Country</Text>
                {formData.countryName ? (
                  <Text style={{ marginBottom: 4, color: "#888" }}>
                    Current Country: {formData.countryName}
                  </Text>
                ) : null}
                <CountryPicker
                  InputFieldStyle={styles.modalInput}
                  Placeholder="Enter Country"
                  flagSize={24}
                  selectedItem={(countryName) => {
                    setFormData({
                      ...formData,
                      countryName: countryName.country,
                    });
                    setCountryError(null); // Clear error when country is selected
                  }}
                />
                {countryError && (
                  <Text style={styles.errorText}>{countryError}</Text>
                )}
                <Text style={styles.modalLabel}>Team Number</Text>
                <TextInput
                  placeholder="Enter Team Number"
                  value={String(formData.teamNumber)}
                  onChangeText={(text) => {
                    setFormData({
                      ...formData,
                      teamNumber: parseInt(text) || 0,
                    });
                    setTeamNumberError(null);
                  }}
                  style={styles.modalInput}
                  keyboardType="numeric"
                />
                {teamNumberError && (
                  <Text style={styles.errorText}>{teamNumberError}</Text>
                )}
                <Text style={styles.modalLabel}>Pod Number</Text>
                <TextInput
                  placeholder="Enter Pod Number"
                  value={String(formData.podNumber)}
                  onChangeText={(text) => {
                    setFormData({
                      ...formData,
                      podNumber: parseInt(text) || 0,
                    });
                    setPodNumberError(null);
                  }}
                  style={styles.modalInput}
                  keyboardType="numeric"
                />
                {podNumberError && (
                  <Text style={styles.errorText}>{podNumberError}</Text>
                )}
                <Text style={styles.modalLabel}>Team Name</Text>
                <TextInput
                  placeholder="Enter Team Name"
                  value={formData.teamName}
                  onChangeText={(text) => {
                    setFormData({ ...formData, teamName: text });
                    setTeamNameError(null);
                  }}
                  style={styles.modalInput}
                />
                {teamNameError && (
                  <Text style={styles.errorText}>{teamNameError}</Text>
                )}

                <View style={styles.pageIndicatorContainer}>
                  <Text style={styles.pageIndicatorText}>Page 1 of 3</Text>
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={[styles.modalButtonText, styles.modalButtonText]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonNext}
                    onPress={handleNext}
                  >
                    <Text style={styles.modalButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>

                {editMode && (
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity
                      style={[
                        styles.modalButtonNext,
                        { borderColor: "#AA3D3F" },
                      ]}
                      onPress={() => setDisableModalVisible(true)}
                    >
                      <Text
                        style={[styles.modalButtonText, { color: "#AA3D3F" }]}
                      >
                        Disable Team
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.headerTextModal}>
                    {editMode ? "Edit Team" : "Create Team"}
                  </Text>
                  <Text style={styles.headerSubTextModal}>
                    {editMode
                      ? "Enter updated coach and team members"
                      : "Add coach and team members"}
                  </Text>
                </View>
                <Text style={styles.modalLabel}>Coach Name (optional)</Text>
                <TextInput
                  placeholder="Enter Coach Name"
                  value={formData.coachName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, coachName: text })
                  }
                  style={styles.modalInput}
                />
                <Text style={styles.modalLabel}>Team Members (optional)</Text>
                {formData.members.map((member, index) => (
                  <TextInput
                    key={index}
                    placeholder={`Enter Member ${index + 1} Name`}
                    value={member}
                    onChangeText={(text) => {
                      const updatedMembers = [...formData.members];
                      updatedMembers[index] = text;
                      setFormData({ ...formData, members: updatedMembers });
                    }}
                    style={styles.modalInput}
                  />
                ))}

                <View style={styles.pageIndicatorContainer}>
                  <Text style={styles.pageIndicatorText}>Page 2 of 3</Text>
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButton]}
                    onPress={handleBack}
                  >
                    <Text
                      style={[styles.modalButtonText, styles.modalButtonText]}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonNext}
                    onPress={handleNext}
                  >
                    <Text style={styles.modalButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.headerTextModal}>
                    {editMode ? "Edit Team" : "Create Team"}
                  </Text>
                  <Text style={styles.headerSubTextModal}>
                    Review team details
                  </Text>
                </View>
                <Text style={styles.modalLabel}>
                  Country: {formData.countryName}
                </Text>
                <Text style={styles.modalLabel}>
                  Team Number: {formData.teamNumber}
                </Text>
                <Text style={styles.modalLabel}>
                  Pod Number: {formData.podNumber}
                </Text>
                <Text style={styles.modalLabel}>
                  Team Name: {formData.teamName}
                </Text>
                <Text style={styles.modalLabel}>
                  Coach Name: {formData.coachName}
                </Text>
                {formData.members.map((member, index) => (
                  <Text key={index}>
                    Member {index + 1}: {member}
                  </Text>
                ))}

                <View style={styles.pageIndicatorContainer}>
                  <Text style={styles.pageIndicatorText}>Page 3 of 3</Text>
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButton]}
                    onPress={handleBack}
                  >
                    <Text
                      style={[styles.modalButtonText, styles.modalButtonText]}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonCreate}
                    onPress={editMode ? handleEditSubmit : handleSubmit}
                  >
                    <Text style={styles.modalButtonCreateText}>
                      {editMode ? "Update" : "Create"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Disable Judge Account Confirmation Modal */}
      <Modal
        visible={disableModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDisableModalVisible(false)}
      >
        <View style={styles.modalOverlayDisable}>
          <View style={styles.modalContentDisable}>
            <Text style={styles.modalTitle}>
              Are you sure you want to disable this team?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: "#432344" }]}
                onPress={() => setDisableModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#432344" }]}>
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { borderColor: "#AA3D3F", backgroundColor: "#AA3D3F" },
                ]}
                onPress={async () => {
                  if (!editTeamId) return;
                  try {
                    await updateDoc(
                      doc(db, `categories/${category}/teams`, editTeamId),
                      { disabled: true }
                    );
                    // Refresh teams
                    const allTeamsSnapshot = await getDocs(
                      collection(db, `categories/${category}/teams`)
                    );
                    const teamList = allTeamsSnapshot.docs.map((doc) => {
                      const data = doc.data();
                      return {
                        id: doc.id,
                        countryName: data.country || "Unknown Country",
                        teamNumber: data.teamNumber || 0,
                        podNumber: data.podNumber || 0,
                        teamName: data.teamName || "Unknown Team",
                        coachName: data.coachName || "Unknown Coach",
                        members: data.members || [],
                        disabled: data.disabled ?? false,
                      };
                    });
                    setTeams(teamList);
                    setDisableModalVisible(false);
                    setModalVisible(false);
                    setEditMode(false);
                    setEditTeamId(null);
                    setCountryError(null);
                    setTeamNumberError(null);
                    setPodNumberError(null);
                    setTeamNameError(null);
                  } catch (e) {
                    Alert.alert("Error", "Failed to disable team.");
                  }
                }}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { fontWeight: "bold", color: "#fff" },
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
