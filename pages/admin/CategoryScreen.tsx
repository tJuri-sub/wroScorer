import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import CountryPicker from 'rn-country-dropdown-picker'; // Import the new country picker
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

export default function CategoryScreen({ route }: any) {
  const { category, label } = route.params; // Get category and label from navigation params
  const [teams, setTeams] = useState<{ 
    id: string; 
    countryName: string;
    teamNumber: number;
    podNumber: number;
    teamName: string;
    coachName: string;
    members: string[];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1); // Track the current step
  const [formData, setFormData] = useState({
    countryName: '',
    teamNumber: 0,
    podNumber: 0,
    teamName: '',
    coachName: '',
    members: ['', '', ''], // Array for 3 members
  });

  const db = getFirestore();

  // Fetch teams for the selected category
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, `categories/${category}/teams`));
        const teamList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            countryName: data.country || 'Unknown Country',
            teamNumber: data.teamNumber || 0,
            podNumber: data.podNumber || 0,
            teamName: data.teamName || 'Unknown Team',
            coachName: data.coachName || 'Unknown Coach',
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
    if (step === 1 && (!formData.countryName || !formData.teamNumber || !formData.podNumber || !formData.teamName)) {
      Alert.alert('Error', 'Please fill out all fields in this step.');
      return;
    }
    if (step === 2 && (!formData.coachName || formData.members.some((member) => !member))) {
      Alert.alert('Error', 'Please fill out all fields in this step.');
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
      setTeams([...teams, {
          id: Date.now().toString(), ...newTeam,
          countryName: '',
          teamNumber: 0,
          podNumber: 0,
          teamName: '',
          coachName: '',
          members: ['', '', ''], // Array for 3 members
      }]); // Update local state
      Alert.alert('Success', 'Team created successfully!');
      setModalVisible(false); // Close the modal
      setStep(1); // Reset to step 1
      setFormData({
        countryName: '',
        teamNumber: 0,
        podNumber: 0,
        teamName: '',
        coachName: '',
        members: ['', '', ''],
      });
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.subtitle}>Teams in {label}</Text>
      {loading ? (
        <Text>Loading teams...</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>Country: {item.countryName || 'N/A'}</Text>
              <Text style={styles.cardText}>Team Number: {item.teamNumber || 'N/A'}</Text>
              <Text style={styles.cardText}>Pod Number: {item.podNumber || 'N/A'}</Text>
              <Text style={styles.cardText}>Team Name: {item.teamName || 'N/A'}</Text>
              <Text style={styles.cardText}>Coach Name: {item.coachName || 'N/A'}</Text>
              {item.members.map((member, index) => (
                <Text key={index} style={styles.cardText}>
                  Member {index + 1}: {member || 'N/A'}
                </Text>
              ))}
            </View>
          )}
          ListEmptyComponent={<Text>No teams found.</Text>}
        />
      )}
      <Button title="Create Team" onPress={() => setModalVisible(true)} />

      {/* Modal for Team Creation */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {step === 1 && (
              <>
                <Text style={styles.title}>Create Team</Text>
                <Text style={styles.label}>Country</Text>
                <CountryPicker
                    InputFieldStyle={styles.countryPicker}
                    Placeholder="Select a country"
                    flagSize={24}
                    selectedItem={(countryName) => {
                        console.log(countryName); // Debugging log
                        setFormData({ ...formData, countryName: countryName.country }); // Store the country label or adjust based on actual property
                    }}
                />
                <Text style={styles.label}>Team Number</Text>
                <TextInput
                  placeholder="Team Number"
                  value={String(formData.teamNumber)}
                  onChangeText={(text) => setFormData({ ...formData, teamNumber: parseInt(text) || 0 })}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <Text style={styles.label}>Pod Number</Text>
                <TextInput
                  placeholder="Pod Number"
                  value={String(formData.podNumber)}
                  onChangeText={(text) => setFormData({ ...formData, podNumber: parseInt(text) || 0 })}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Team Name"
                  value={formData.teamName}
                  onChangeText={(text) => setFormData({ ...formData, teamName: text })}
                  style={styles.input}
                />
                <View style={styles.buttonContainer}>
                  <Button title="Cancel" onPress={() => setModalVisible(false)} />
                  <Button title="Next" onPress={handleNext} />
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.title}>Add Team Members</Text>
                <TextInput
                  placeholder="Coach Name"
                  value={formData.coachName}
                  onChangeText={(text) => setFormData({ ...formData, coachName: text })}
                  style={styles.input}
                />
                {formData.members.map((member, index) => (
                  <TextInput
                    key={index}
                    placeholder={`Member ${index + 1} Name`}
                    value={member}
                    onChangeText={(text) => {
                      const updatedMembers = [...formData.members];
                      updatedMembers[index] = text;
                      setFormData({ ...formData, members: updatedMembers });
                    }}
                    style={styles.input}
                  />
                ))}
                <View style={styles.buttonContainer}>
                  <Button title="Back" onPress={handleBack} />
                  <Button title="Next" onPress={handleNext} />
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.title}>Review Team Details</Text>
                <Text>Country: {formData.countryName}</Text>
                <Text>Team Number: {formData.teamNumber}</Text>
                <Text>Pod Number: {formData.podNumber}</Text>
                <Text>Team Name: {formData.teamName}</Text>
                <Text>Coach Name: {formData.coachName}</Text>
                {formData.members.map((member, index) => (
                  <Text key={index}>Member {index + 1}: {member}</Text>
                ))}
                <View style={styles.buttonContainer}>
                  <Button title="Back" onPress={handleBack} />
                  <Button title="Create" onPress={handleSubmit} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  countryPicker: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
});