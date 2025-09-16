import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import styles from "../styles/ScoreCard"; // Adjust path as needed
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseconfig";

function formatDate(iso?: string) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function ScoreCard({
  score,
  userRole = "",
  onDeleted,
  category, // Add category prop
}: {
  score: any;
  userRole?: string;
  onDeleted?: () => void;
  category: string; // Define category prop type
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleDelete = async () => {
    try {
      // The current delete logic assumes scores are in 'scores' or 'scores2' collections.
      // If scores for different categories are stored in different collections or subcollections,
      // this logic will need to be updated to reflect that.
      // For example, if scores are stored under `events/${eventId}/scores`,
      // you might need `doc(FIREBASE_DB, `events/${score.eventId}/scores`, score.id)`
      const docRef1 = doc(FIREBASE_DB, "scores", score.id);
      const docRef2 = doc(FIREBASE_DB, "scores2", score.id);

      const [docSnap1, docSnap2] = await Promise.all([
        getDoc(docRef1),
        getDoc(docRef2),
      ]);

      if (docSnap1.exists()) {
        await deleteDoc(docRef1);
      } else if (docSnap2.exists()) {
        await deleteDoc(docRef2);
      } else {
        console.warn("Document not found in either collection.");
      }

      setModalVisible(false);
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error("Delete failed:", err);
      setModalVisible(false);
      // Optionally show error message
    }
  };

  const renderRoboCategoryScores = () => (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>Round 1 Score:</Text>
        <Text style={styles.value}>{score.round1Score ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { fontWeight: "normal" }]}>Time 1:</Text>
        <Text style={styles.value}>{score.time1 ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { fontWeight: "normal" }]}>Scored At:</Text>
        <Text style={styles.value}>
          {formatDate(score.round1ScoredAt ?? score.timestamp)}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Round 2 Score:</Text>
        <Text style={styles.value}>{score.round2Score ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { fontWeight: "normal" }]}>Time 2:</Text>
        <Text style={styles.value}>{score.time2 ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { fontWeight: "normal" }]}>Scored At:</Text>
        <Text style={styles.value}>{formatDate(score.round2ScoredAt)}</Text>
      </View>
    </>
  );

  const renderFICategoryScores = () => (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>Presentation & Spirit:</Text>
        <Text style={styles.value}>{score.presentationSpirit ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Project Innovation:</Text>
        <Text style={styles.value}>{score.projectInnovation ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Robotic Solution:</Text>
        <Text style={styles.value}>{score.roboticSolution ?? "N/A"}</Text>
      </View>
    </>
  );

  const renderFutureEngCategoryScores = () => (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>Open Score 1:</Text>
        <Text style={styles.value}>{score.openScore1 ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { fontWeight: "normal" }]}>Open Time 1:</Text>
        <Text style={styles.value}>{score.openTime1 ?? "N/A"}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Open Score 2:</Text>
        <Text style={styles.value}>{score.openScore2 ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { fontWeight: "normal" }]}>Open Time 2:</Text>
        <Text style={styles.value}>{score.openTime2 ?? "N/A"}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Obstacle Score 1:</Text>
        <Text style={styles.value}>{score.obstacleScore1 ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { fontWeight: "normal" }]}>Obstacle Time 1:</Text>
        <Text style={styles.value}>{score.obstacleTime1 ?? "N/A"}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Obstacle Score 2:</Text>
        <Text style={styles.value}>{score.obstacleScore2 ?? "N/A"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { fontWeight: "normal" }]}>Obstacle Time 2:</Text>
        <Text style={styles.value}>{score.obstacleTime2 ?? "N/A"}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Documentation Score:</Text>
        <Text style={styles.value}>{score.docScore ?? "N/A"}</Text>
      </View>
    </>
  );

  return (
    <View style={styles.card}>
      {/* Conditional rendering based on category */}
      {category.startsWith("robo") && renderRoboCategoryScores()}
      {category.startsWith("fi-") && renderFICategoryScores()}
      {category === "future-eng" && renderFutureEngCategoryScores()}
      {category === "robosports" && (
        <View style={styles.row}>
          <Text style={styles.label}>Robosports Scores:</Text>
          <Text style={styles.value}>Coming Soon</Text>
        </View>
      )}

      {/* Common fields */}
      {score.overallScore !== undefined && (
        <View style={styles.row}>
          <Text style={styles.label}>Overall Score:</Text>
          <Text style={styles.value}>{score.overallScore}</Text>
        </View>
      )}
      {score.totalScore !== undefined && ( // For FI and Future-Eng
        <View style={styles.row}>
          <Text style={styles.label}>Total Score:</Text>
          <Text style={styles.value}>{score.totalScore}</Text>
        </View>
      )}
      {score.judge && (
        <View style={styles.row}>
          <Text style={styles.label}>Scored by:</Text>
          <Text style={styles.value}>{score.judge}</Text>
        </View>
      )}

      {/* Delete button for admin */}
      {userRole === "admin" && (
        <>
          <TouchableOpacity
            style={{
              marginTop: 12,
              backgroundColor: "#AA3D3F",
              padding: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Delete Score
            </Text>
          </TouchableOpacity>
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  alignItems: "center",
                  minWidth: 250,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  Are you sure you want to delete this score?
                </Text>
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#eee",
                      padding: 10,
                      borderRadius: 8,
                      marginRight: 10,
                    }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: "#333" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#AA3D3F",
                      padding: 10,
                      borderRadius: 8,
                    }}
                    onPress={handleDelete}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}