import { StyleSheet } from "react-native";

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f4f4" },
  profileCard: {
    margin: 16,
    marginTop: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    justifyContent: "center",
    alignItems: "center", 
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },

  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#211022",
    borderRadius: "50%",
    padding: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },

  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8e44ad",
    marginBottom: 6,
  },
  
  emailPill: {
    backgroundColor: "#E3B8FF",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 18,
  },

  emailText: {
    color: "#000000",
    fontSize: 14,
  },

  optionsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    marginTop: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 300,
  },
  
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },

    modalOverlayLogout: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
  
    modalContentLogout: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      paddingTop: 30,
      paddingBottom: 30,
      width: 300,
      alignItems: "center",
    },
  
    modalTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#432344",
      marginBottom: 25,
      textAlign: "center",
    },
  
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
  
    modalButton: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 5,
      marginTop: 10,
      borderRadius: 5,
      alignItems: "center",
      width: "100%", // Adjust width to fit two buttons side by side
      elevation: 2,
    },
  
    backButton: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#432344",
    },
  
    backButtonText: {
      color: "#432344",
    },
  
    yesButton: {
      backgroundColor: "#AA3D3F",
    },
  
    modalButtonText: {
      fontSize: 14,
      color: "#fff",
      fontWeight: "semibold",
      letterSpacing: 1,
      fontFamily: "Roboto",
    },
});
