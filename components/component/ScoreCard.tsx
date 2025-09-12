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
}: {
  score: any;
  userRole?: string;
  onDeleted?: () => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleDelete = async () => {
    try {
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

  return (
    <View style={styles.card}>
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
