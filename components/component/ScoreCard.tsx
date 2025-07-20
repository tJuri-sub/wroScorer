import React from "react";
import { View, Text } from "react-native";
import styles from "../styles/ScoreCard"; // Adjust path as needed

function formatDate(iso?: string) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function ScoreCard({ score }: { score: any }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Round 1 Score:</Text>
        <Text style={styles.value}>{score.round1Score ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Time 1:</Text>
        <Text style={styles.value}>{score.time1 ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Scored At:</Text>
        <Text style={styles.value}>{formatDate(score.round1ScoredAt ?? score.timestamp)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Round 2 Score:</Text>
        <Text style={styles.value}>{score.round2Score ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Time 2:</Text>
        <Text style={styles.value}>{score.time2 ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Scored At:</Text>
        <Text style={styles.value}>{formatDate(score.round2ScoredAt)}</Text>
      </View>
      {score.overallScore !== undefined && (
        <View style={styles.row}>
          <Text style={styles.label}>Overall Score:</Text>
          <Text style={styles.value}>{score.overallScore}</Text>
        </View>
      )}
      {score.judge && (
        <View style={styles.row}>
          <Text style={styles.label}>Scored by:</Text>
          <Text style={styles.value}>{score.judge}</Text>
        </View>
      )}
    </View>
  );
}