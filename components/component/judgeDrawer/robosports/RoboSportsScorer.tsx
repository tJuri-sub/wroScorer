import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { FIREBASE_DB } from '../../../../firebaseconfig';
import {
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import styles from '../../../styles/judgeStyles/RobosportsStyling';
import { TournamentManager } from './TournamentManager';
import { Tournament} from './TournamentTypes';


interface MatchResult {
  match: number;
  team1Score: number;
  team2Score: number;
  winner: string | null;
  winnerName: string;
  violation: boolean;
  violationType?: string;
  team1Balls: { orange: number; purple: number };
  team2Balls: { orange: number; purple: number };
}

interface GameData {
  id: string;
  gameNumber: number;
  eventId: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  status: 'created' | 'in-progress' | 'finished';
  currentMatch: number;
  matchResults: MatchResult[];
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

interface RoboSportsMatchScorerProps {
  game: GameData;
  visible: boolean;
  onClose: () => void;
  selectedEvent: string;
}

const RoboSportsMatchScorer: React.FC<RoboSportsMatchScorerProps> = ({
  game,
  visible,
  onClose,
  selectedEvent,
}) => {
  // Ball counter states
  const [team1Balls, setTeam1Balls] = useState({ orange: 4, purple: 1 });
  const [team2Balls, setTeam2Balls] = useState({ orange: 4, purple: 1 });
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);

  // Load saved ball state when game changes
  useEffect(() => {
    if (game?.currentMatchState) {
      setTeam1Balls(game.currentMatchState.team1Balls);
      setTeam2Balls(game.currentMatchState.team2Balls);
    } else {
      setTeam1Balls({ orange: 4, purple: 1 });
      setTeam2Balls({ orange: 4, purple: 1 });
    }
  }, [game]);

  const saveBallState = async () => {
    if (!game) return;
    
    try {
      const gameRef = doc(FIREBASE_DB, 'events', selectedEvent, 'robosports-games', game.id);
      await updateDoc(gameRef, {
        currentMatchState: {
          team1Balls,
          team2Balls,
        },
      });
    } catch (error) {
      console.error('Error saving ball state:', error);
    }
  };

  const calculateBallScore = (balls: { orange: number; purple: number }) => {
    return balls.orange * 1 + balls.purple * (-2);
  };

  const validateBallCount = () => {
    const totalOrange = team1Balls.orange + team2Balls.orange;
    const totalPurple = team1Balls.purple + team2Balls.purple;
    return totalOrange === 8 && totalPurple === 2;
  };

  const handleViolation = async (teamId: string, violationType: string) => {
    if (!game) return;

    // Set ball distribution for violation
    let violationTeam1Balls = { orange: 4, purple: 1 };
    let violationTeam2Balls = { orange: 4, purple: 1 };
    
    if (teamId === game.team1Id) {
        // Team 1 violates - Team 1 gets 8 orange, 0 purple; Team 2 gets 0 orange, 2 purple
        violationTeam1Balls = { orange: 8, purple: 0 };
        violationTeam2Balls = { orange: 0, purple: 2 };
    } else {
        // Team 2 violates - Team 2 gets 8 orange, 0 purple; Team 1 gets 0 orange, 2 purple  
        violationTeam1Balls = { orange: 0, purple: 2 };
        violationTeam2Balls = { orange: 8, purple: 0 };
    }

    const team1Score = calculateBallScore(violationTeam1Balls);
    const team2Score = calculateBallScore(violationTeam2Balls);
    
    const result: MatchResult = {
      match: game.currentMatch,
      team1Score,
      team2Score,
      winner: teamId === game.team1Id ? game.team2Id : game.team1Id,
      winnerName: teamId === game.team1Id ? game.team2Name : game.team1Name,
      violation: true,
      violationType,
      team1Balls: violationTeam1Balls, // Use violation balls instead of current balls
      team2Balls: violationTeam2Balls, // Use violation balls instead of current balls
    };

    const newResults = [...game.matchResults, result];
    
    if (game.currentMatch < 3) {
      // Move to next match
      await updateGameAfterMatch(game.id, newResults, game.currentMatch + 1);
      setTeam1Balls({ orange: 4, purple: 1 });
      setTeam2Balls({ orange: 4, purple: 1 });
      onClose();
    } else {
      // Finish game
      await finishGame(game.id, newResults);
    }
  };

  const finishCurrentMatch = async () => {
    if (!game || !validateBallCount()) {
      if (!validateBallCount()) {
        Alert.alert('Invalid Ball Count', 'Total balls must be 8 orange and 2 purple');
      }
      return;
    }

    setIsSubmittingMatch(true);

    try {
      const team1Score = calculateBallScore(team1Balls);
      const team2Score = calculateBallScore(team2Balls);
      
      let winner: string | null = null;
      let winnerName = '';
      
      if (team1Score < team2Score) {
        winner = game.team1Id;
        winnerName = game.team1Name;
      } else if (team2Score < team1Score) {
        winner = game.team2Id;
        winnerName = game.team2Name;
      }

      const result: MatchResult = {
        match: game.currentMatch,
        team1Score,
        team2Score,
        winner,
        winnerName,
        violation: false,
        team1Balls: { ...team1Balls },
        team2Balls: { ...team2Balls },
      };

      const newResults = [...game.matchResults, result];
      
      if (game.currentMatch < 3) {
        await updateGameAfterMatch(game.id, newResults, game.currentMatch + 1);
        setTeam1Balls({ orange: 4, purple: 1 });
        setTeam2Balls({ orange: 4, purple: 1 });
        onClose();
      } else {
        await finishGame(game.id, newResults);
      }

    } catch (error) {
      console.error('Error finishing match:', error);
      Alert.alert('Error', 'Failed to finish match');
    } finally {
      setIsSubmittingMatch(false);
    }
  };

  const updateGameAfterMatch = async (gameId: string, matchResults: MatchResult[], nextMatch: number) => {
    try {
      const gameRef = doc(FIREBASE_DB, 'events', selectedEvent, 'robosports-games', gameId);
      await updateDoc(gameRef, {
        matchResults,
        currentMatch: nextMatch,
        currentMatchState: {
          team1Balls: { orange: 4, purple: 1 },
          team2Balls: { orange: 4, purple: 1 },
        },
      });
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const finishGame = async (gameId: string, finalResults: MatchResult[]) => {
    try {
      // Calculate game winner (existing logic)
      const team1Wins = finalResults.filter(r => r.winner === game.team1Id).length;
      const team2Wins = finalResults.filter(r => r.winner === game.team2Id).length;
      
      let gameWinner: string | null = null;
      let team1Points = 0;
      let team2Points = 0;
      
      if (team1Wins > team2Wins) {
        gameWinner = game.team1Id;
        team1Points = 3;
        team2Points = 0;
      } else if (team2Wins > team1Wins) {
        gameWinner = game.team2Id;
        team1Points = 0;
        team2Points = 3;
      } else {
        team1Points = 1;
        team2Points = 1;
      }

      const gameRef = doc(FIREBASE_DB, 'events', selectedEvent, 'robosports-games', gameId);
      await updateDoc(gameRef, {
        status: 'finished',
        matchResults: finalResults,
        gameWinner,
        team1Points,
        team2Points,
        completedAt: new Date().toISOString(),
        currentMatchState: null,
      });

      // NEW: Handle tournament bracket update if this is a tournament game
      if (game.tournamentId && game.bracketId) {
        const tournamentRef = doc(FIREBASE_DB, 'events', selectedEvent, 'tournaments', game.tournamentId);
        const tournamentDoc = await getDoc(tournamentRef);
        
        if (tournamentDoc.exists()) {
          const tournament = tournamentDoc.data() as Tournament;
          
          // Update brackets with game result
          const gameResult = {
            gameId,
            winnerId: gameWinner,
            winnerName: gameWinner === game.team1Id ? game.team1Name : game.team2Name,
          };
          
          const updatedBrackets = TournamentManager.updateBracketAfterGame(
            tournament.brackets,
            gameResult,
            tournament.type
          );
          
          // Check if tournament is complete
          const isComplete = TournamentManager.isTournamentComplete(updatedBrackets);
          const champion = isComplete ? TournamentManager.getTournamentChampion(updatedBrackets) : null;
          
          await updateDoc(tournamentRef, {
            brackets: updatedBrackets,
            status: isComplete ? 'completed' : 'in-progress',
            championId: champion,
            completedAt: isComplete ? new Date().toISOString() : undefined,
          });
          
          if (isComplete) {
            Alert.alert('Tournament Complete!', 'Check the tournament results!');
          }
        }
      }

      onClose();

    } catch (error) {
      console.error('Error finishing game:', error);
      Alert.alert('Error', 'Failed to finish game');
    }
  };

  const renderBallCounter = (
    teamName: string, 
    balls: { orange: number; purple: number }, 
    setBalls: React.Dispatch<React.SetStateAction<{ orange: number; purple: number }>>
  ) => (
    <View style={styles.teamSection}>
      <Text style={styles.teamName}>{teamName}</Text>
      
      <View style={styles.ballCounterRow}>
        <View style={styles.ballCounter}>
          <Text style={styles.ballLabel}>Orange</Text>
          <Text style={styles.ballCount}>{balls.orange}</Text>
          <View style={styles.counterButtons}>
            <TouchableOpacity 
              onPress={() => {
                setBalls(prev => ({ ...prev, orange: Math.max(0, prev.orange - 1) }));
                saveBallState();
              }}
              style={styles.counterButton}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                setBalls(prev => ({ ...prev, orange: Math.min(8, prev.orange + 1) }));
                saveBallState();
              }}
              style={styles.counterButton}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.ballCounter}>
          <Text style={styles.ballLabel}>Purple</Text>
          <Text style={styles.ballCount}>{balls.purple}</Text>
          <View style={styles.counterButtons}>
            <TouchableOpacity 
              onPress={() => {
                setBalls(prev => ({ ...prev, purple: Math.max(0, prev.purple - 1) }));
                saveBallState();
              }}
              style={styles.counterButton}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                setBalls(prev => ({ ...prev, purple: Math.min(2, prev.purple + 1) }));
                saveBallState();
              }}
              style={styles.counterButton}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <Text style={styles.ballScore}>
        Score: {calculateBallScore(balls)} {calculateBallScore(balls) < 0 ? '(Lower wins)' : ''}
      </Text>
    </View>
  );

  if (!game) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Game #{game.gameNumber} - Match {game.currentMatch}/3
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.subtitle}>
            {game.team1Name} vs {game.team2Name}
          </Text>

          {renderBallCounter(game.team1Name, team1Balls, setTeam1Balls)}
          {renderBallCounter(game.team2Name, team2Balls, setTeam2Balls)}

          {!validateBallCount() && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Warning: Total must be 8 orange + 2 purple
              </Text>
              <Text style={styles.warningText}>
                Current: {team1Balls.orange + team2Balls.orange} orange, {team1Balls.purple + team2Balls.purple} purple
              </Text>
            </View>
          )}

          <View style={styles.violationSection}>
            <Text style={styles.sectionTitle}>Violations (8:-4 Result)</Text>
            <View style={styles.violationButtons}>
              <TouchableOpacity 
                style={styles.violationButton}
                onPress={() => handleViolation(game.team1Id, 'Rule Violation')}
              >
                <Text style={styles.violationButtonText}>{game.team1Name} Violation</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.violationButton}
                onPress={() => handleViolation(game.team2Id, 'Rule Violation')}
              >
                <Text style={styles.violationButtonText}>{game.team2Name} Violation</Text>
              </TouchableOpacity>
            </View>
          </View>

          {game.matchResults.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>Previous Results</Text>
              {game.matchResults.map((result, index) => (
                <Text key={index} style={styles.resultText}>
                  Match {result.match}: {result.winner ? result.winnerName : 'Tie'} 
                  ({result.team1Score} - {result.team2Score}){result.violation && ' - Violation'}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={[styles.finishButton, (!validateBallCount() || isSubmittingMatch) && styles.disabledButton]}
            onPress={finishCurrentMatch}
            disabled={!validateBallCount() || isSubmittingMatch}
          >
            {isSubmittingMatch ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {game.currentMatch === 3 ? 'Finish Game' : `Finish Match ${game.currentMatch}`}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default RoboSportsMatchScorer;