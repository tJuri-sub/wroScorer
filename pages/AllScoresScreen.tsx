import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import styles from "../components/styles/AllScoreScreen";

export default function AllScoresScreen({ route }: any) {
  const { history } = route.params;

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Calculate pagination
  const totalRecords = history.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = history.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Score History</Text>
      <Text style={styles.subtitle}>
        Showing {currentRecords.length} of {totalRecords} records
      </Text>
      <FlatList
        data={currentRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <Text style={styles.historyMainText}>
              <Text style={{ fontWeight: "bold" }}>Team Name: </Text>
              {item.teamName}
            </Text>
            <View>
              <View style={styles.historyScoreContainer}>
                <Text style={styles.historyText}>
                  <Text style={{ fontWeight: "bold" }}>Round 1: </Text>
                  {item.round1Score} points
                </Text>
                <Text style={styles.historyText}>
                  <Text style={{ fontWeight: "bold" }}>Time 1: </Text>
                  {item.time1}
                </Text>
              </View>
              <View style={styles.historyScoreContainer}>
                <Text style={styles.historyText}>
                  <Text style={{ fontWeight: "bold" }}>Round 2: </Text>
                  {item.round2Score} points
                </Text>
                <Text style={styles.historyText}>
                  <Text style={{ fontWeight: "bold" }}>Time 2: </Text>
                  {item.time2}
                </Text>
              </View>
            </View>
            <Text style={styles.historyText}>
              <Text style={{ fontWeight: "bold" }}>Overall Score: </Text>
              {item.overallScore}
            </Text>
            <Text style={styles.historyTextCreated}>
              Scored At:{" "}
              {new Date(item.timestamp).toUTCString().replace("GMT", "PHT")}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ margin: 10 }}>No scores available.</Text>
        }
      />
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={handlePreviousPage}
          disabled={currentPage === 1}
          style={[
            styles.pageButton,
            currentPage === 1 && styles.disabledButton,
          ]}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
