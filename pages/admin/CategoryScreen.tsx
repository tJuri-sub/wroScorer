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
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import styles from "../../components/styles/adminStyles/CategorycreenStyle";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function CategoryScreen({ route }: any) {
  const { category, label } = route.params; // Get category and label from navigation params
  const [search, setSearch] = useState('');
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

  const db = getFirestore();

  // Filter teams by search (team name or coach)
  const filteredTeams = teams.filter(team =>
    team.teamName.toLowerCase().includes(search.toLowerCase()) ||
    team.coachName.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalRecords = filteredTeams.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
  const paginatedTeams = filteredTeams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        const teamList = querySnapshot.docs.map((doc) => {
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
    if (
      step === 1 &&
      (!formData.countryName ||
        !formData.teamNumber ||
        !formData.podNumber ||
        !formData.teamName)
    ) {
      Alert.alert("Error", "Please fill out all fields in this step.");
      return;
    }
    if (
      step === 2 &&
      (!formData.coachName || formData.members.some((member) => !member))
    ) {
      Alert.alert("Error", "Please fill out all fields in this step.");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const newTeam = {
        country: formData.countryName,
        teamNumber: formData.teamNumber,
        podNumber: formData.podNumber,
        teamName: formData.teamName,
        coachName: formData.coachName,
        members: formData.members,
      };

      await addDoc(collection(db, `categories/${category}/teams`), newTeam);

      const querySnapshot = await getDocs(
        collection(db, `categories/${category}/teams`)
      );
      const teamList = querySnapshot.docs.map((doc) => {
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
          style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
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
          style={[styles.paginationButton, (page === totalPages || totalPages === 0) && styles.paginationButtonDisabled]}
        >
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text>Loading teams...</Text>
      ) : (
        <FlatList
          data={paginatedTeams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.teamCard}>
              {/* Header Row */}
              <View style={styles.teamCardHeader}>
                <Text style={styles.teamCardHeaderText}>Team Number {item.teamNumber}</Text>
                <Text style={styles.teamCardHeaderText}>Pod Number {item.podNumber}</Text>
              </View>

              {/* Country and Team Name Row */}
              <View style={styles.teamCardRow}>
                {/* Replace with your flag component or Image */}
                {/* <Image source={require('../assets/flags/ph.png')} style={styles.teamCardFlag} /> */}
                <Text style={styles.teamCardTeamName} numberOfLines={1}>{item.teamName}</Text>
                <Text style={styles.teamCardCountry}>{item.countryName}</Text>
                
              </View>

              {/* Members */}
              {item.members.map((member, index) => (
                <Text style={styles.teamCardMember} key={index}>
                  Member {index + 1}: {member || "N/A"}
                </Text>
              ))}

              {/* Coach */}
              <Text style={styles.teamCardCoach}>Coach Name: {item.coachName}</Text>

              {/* Edit Icon (optional) */}
              {/* <TouchableOpacity style={styles.editIcon} onPress={() => onEdit(team)}>
                <MaterialIcons name="edit" size={22} color="#432344" />
              </TouchableOpacity> */}
            </View>
          )}
          ListEmptyComponent={<Text>No teams found.</Text>}
        />
      )}
      {/* <Button title="Create Team" onPress={() => setModalVisible(true)} /> */}
      <TouchableOpacity style={styles.createTeamButton} onPress={() => setModalVisible(true)}>
        <FontAwesome name="plus" size={18} color="#fff" />
        <Text style={styles.createTeamButtonText}>Add Team</Text>
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
                    Create Team
                  </Text>
                  <Text style={styles.headerSubTextModal}>
                    Enter team information
                  </Text>
                </View>
                <Text style={styles.modalLabel}>Country</Text>
                <CountryPicker
                  InputFieldStyle={styles.modalInput}
                  Placeholder="Enter Country"
                  flagSize={24}
                  selectedItem={(countryName) => {
                    console.log(countryName); // Debugging log
                    setFormData({
                      ...formData,
                      countryName: countryName.country,
                    }); // Store the country label or adjust based on actual property
                  }}
                />
                <Text style={styles.modalLabel}>Team Number</Text>
                <TextInput
                  placeholder="Enter Team Number"
                  value={String(formData.teamNumber)}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      teamNumber: parseInt(text) || 0,
                    })
                  }
                  style={styles.modalInput}
                  keyboardType="numeric"
                />
                <Text style={styles.modalLabel}>Pod Number</Text>
                <TextInput
                  placeholder="Enter Pod Number"
                  value={String(formData.podNumber)}
                  onChangeText={(text) =>
                    setFormData({ ...formData, podNumber: parseInt(text) || 0 })
                  }
                  style={styles.modalInput}
                  keyboardType="numeric"
                />
                <Text style={styles.modalLabel}>Team Name</Text>
                <TextInput
                  placeholder="Enter Team Name"
                  value={formData.teamName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, teamName: text })
                  }
                  style={styles.modalInput}
                />

                <View style={styles.pageIndicatorContainer}>
                  <Text style={styles.pageIndicatorText}>
                    Page 1 of 3
                  </Text>
                </View>
                
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButton]}>
                    <Text 
                      style={[styles.modalButtonText, styles.modalButtonText]}
                      onPress={() => setModalVisible(false)}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButtonNext}>
                    <Text 
                    style={styles.modalButtonText}
                    onPress={handleNext}>Next</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.headerTextModal}>
                    Create Team
                  </Text>
                  <Text style={styles.headerSubTextModal}>
                    Add team members and coach
                  </Text>
                </View>
                <Text style={styles.modalLabel}>Coach Name</Text>
                <TextInput
                  placeholder="Enter Coach Name"
                  value={formData.coachName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, coachName: text })
                  }
                  style={styles.modalInput}
                />
                <Text style={styles.modalLabel}>Team Members</Text>
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
                  <Text style={styles.pageIndicatorText}>
                    Page 2 of 3
                  </Text>
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButton]}>
                    <Text 
                      style={[styles.modalButtonText, styles.modalButtonText]}
                      onPress={handleBack}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButtonNext}>
                    <Text 
                    style={styles.modalButtonText}
                    onPress={handleNext}>Next</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.headerTextModal}>
                    Create Team
                  </Text>
                  <Text style={styles.headerSubTextModal}>
                    Review team details
                  </Text>
                </View>
                  <Text style={styles.modalLabel}>Country: {formData.countryName}</Text>
                  <Text style={styles.modalLabel}>Team Number: {formData.teamNumber}</Text>
                  <Text style={styles.modalLabel}>Pod Number: {formData.podNumber}</Text>
                  <Text style={styles.modalLabel}>Team Name: {formData.teamName}</Text>
                  <Text style={styles.modalLabel}>Coach Name: {formData.coachName}</Text>
                  {formData.members.map((member, index) => (
                    <Text key={index}>
                      Member {index + 1}: {member}
                    </Text>
                  ))}
                

                <View style={styles.pageIndicatorContainer}>
                  <Text style={styles.pageIndicatorText}>
                    Page 3 of 3
                  </Text>
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButton]}>
                    <Text 
                      style={[styles.modalButtonText, styles.modalButtonText]}
                     onPress={handleBack}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButtonCreate}>
                    <Text 
                    style={styles.modalButtonCreateText}
                    onPress={handleSubmit}>Create</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
