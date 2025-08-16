import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

// Pass required props to the component
export const LogoutModal = ({
  show,
  close,
  navigation,
  FIREBASE_AUTH,
  styles,
  loginScreen = "LoginJudge",
}) => {
  return (
    <>
      {/* Logout Modal */}
      <Modal
        visible={show}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#432344",
                  },
                ]}
                onPress={close}
              >
                <Text style={[styles.modalButtonText, { color: "#432344" }]}>
                  Back
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#D32F2F" }]}
                onPress={() => {
                  FIREBASE_AUTH.signOut();
                  navigation.replace(loginScreen);
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
