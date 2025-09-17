// components/component/judgeDrawer/TournamentSetup.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { FIREBASE_DB } from '../../../../firebaseconfig';
import {
  doc,
  setDoc,
  collection,
} from 'firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from '../../../styles/judgeStyles/RobosportsStyling';
import { Tournament } from './TournamentTypes';
import { TournamentManager } from './TournamentManager';

interface TournamentSetupProps {
  visible: boolean;
  onClose: () => void;
  selectedEvent: string;
  teams: any[];
  onTournamentCreated: (tournament: Tournament) => void;
}

const TournamentSetup: React.FC<TournamentSetupProps> = ({
  visible,
  onClose,
  selectedEvent,
  teams,
  onTournamentCreated,
}) => {
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentType, setTournamentType] = useState<'single-elimination' | 'double-elimination'>('single-elimination');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Dropdown states
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false);

  const createTournament = async () => {
    if (!tournamentName.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    if (selectedTeams.length < 2) {
      Alert.alert('Error', 'Please select at least 2 teams');
      return;
    }

    setIsCreating(true);

    try {
      const teamNames = teams.reduce((acc, team) => {
        acc[team.id] = team.teamName;
        return acc;
      }, {} as { [key: string]: string });

      // Generate tournament brackets (only single elimination for now)
      const brackets = TournamentManager.generateSingleEliminationBracket(selectedTeams, teamNames);

      const tournamentData: Tournament = {
        id: '',
        eventId: selectedEvent,
        name: tournamentName,
        type: tournamentType,
        status: 'setup',
        teams: selectedTeams,
        brackets,
        currentRound: 1,
        createdAt: new Date().toISOString(),
      };

      // Save to Firebase
      const tournamentRef = doc(collection(FIREBASE_DB, 'events', selectedEvent, 'tournaments'));
      tournamentData.id = tournamentRef.id;
      
      // Update bracket tournament IDs
      tournamentData.brackets = brackets.map(bracket => ({
        ...bracket,
        tournamentId: tournamentRef.id
      }));

      await setDoc(tournamentRef, tournamentData);

      onTournamentCreated(tournamentData);
      onClose();
      
      // Reset form
      setTournamentName('');
      setSelectedTeams([]);

    } catch (error) {
      console.error('Error creating tournament:', error);
      Alert.alert('Error', 'Failed to create tournament');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Tournament</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Tournament Name Input */}
          <View style={[styles.inputSection, { marginBottom: 20 }]}>
            <Text style={styles.tournalabel}>Tournament Name:</Text>
            <TextInput
              style={styles.textInput}
              value={tournamentName}
              onChangeText={setTournamentName}
              placeholder="Enter tournament name..."
            />
          </View>

          {/* Tournament Type Selection */}
          <View style={[styles.inputSection, { zIndex: 1000, marginBottom: 20 }]}>
            <Text style={styles.label}>Tournament Type:</Text>
            <DropDownPicker
              open={typeDropdownOpen}
              setOpen={setTypeDropdownOpen}
              value={tournamentType}
              setValue={setTournamentType}
              items={[
                { label: 'Single Elimination', value: 'single-elimination' },
                // { label: 'Double Elimination', value: 'double-elimination' }, // Disabled for now
              ]}
              style={styles.dropdown}
              onOpen={() => setTeamsDropdownOpen(false)}
            />
          </View>

          {/* Team Selection */}
          <View style={[styles.inputSection, { zIndex: 999, marginBottom: 20 }]}>
            <Text style={styles.label}>Select Teams:</Text>
            <DropDownPicker
              open={teamsDropdownOpen}
              setOpen={setTeamsDropdownOpen}
              value={selectedTeams}
              setValue={setSelectedTeams}
              items={teams.map(team => ({
                label: `${team.teamNumber} - ${team.teamName}`,
                value: team.id,
              }))}
              multiple={true}
              mode="BADGE"
              //badgeDotColor="#432344"
              style={styles.dropdown}
              onOpen={() => setTypeDropdownOpen(false)}
              placeholder="Select teams for tournament..."
            />
          </View>

          {/* Tournament Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Tournament Information:</Text>
            <Text style={styles.infoText}>
              Type: Single Elimination
            </Text>
            <Text style={styles.infoText}>Teams Selected: {selectedTeams.length}</Text>
            {selectedTeams.length > 0 && (
              <Text style={styles.infoText}>
                Total Matches: {selectedTeams.length - 1}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.finishButton, (isCreating || !tournamentName.trim() || selectedTeams.length < 2) && styles.disabledButton]}
            onPress={createTournament}
            disabled={isCreating || !tournamentName.trim() || selectedTeams.length < 2}
          >
            {isCreating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Create Tournament</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default TournamentSetup;