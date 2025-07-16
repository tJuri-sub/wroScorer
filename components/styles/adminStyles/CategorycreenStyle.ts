import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    marginBottom: 12,
    fontSize: 16,
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    color: "#432344",
    fontWeight: "bold",
    fontSize: 16,
  },
  paginationInfo: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },

  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "column",
    minWidth: 0,
  },
  teamCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  teamCardHeaderText: {
    fontSize: 15,
    color: "#888",
    fontStyle: "italic",
    fontWeight: "500",
  },
  teamCardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  teamCardFlag: {
    width: 24,
    height: 16,
    marginRight: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#ccc",
  },
  teamCardCountry: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    marginRight: 8,
    textAlign: "right",
  },
  teamCardTeamName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#432344",
    flex: 1,
    textAlign: "left",
  },
  teamCardMember: {
    fontSize: 15,
    color: "#333",
    marginLeft: 30,
    marginBottom: 2,
  },
  teamCardCoach: {
    fontSize: 15,
    color: "#432344",
    fontStyle: "italic",
    marginTop: 4,
    marginLeft: 2,
  },
  editIcon: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#432344",
    borderRadius: 20,
    padding: 8,
  },

  createTeamButton: {
    backgroundColor: "#432344",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  createTeamButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 8,
  },

  // Creation Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: "#fff",
    width: 340,
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 28,
    alignItems: "center",
    elevation: 8,
  },

  modalHeader: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
    marginBottom: 18,
    alignItems: "flex-start",
  },

  headerTextModal: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#222",
  },

  headerSubTextModal: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },

  modalLabel: {
    alignSelf: "flex-start",
    fontSize: 15,
    color: "#432344",
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "500",
  },

  modalInput: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
    width: "100%"
  },

  countryPicker: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },

  pageIndicatorContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 6,
  },

  pageIndicatorText: {
    color: "#6d5477",
    fontSize: 15,
    fontWeight: "500",
    margin: 3,
  },

  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 18,
    gap: 10,
  },
  modalButtonCreate: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 7,
    alignItems: "center",
    backgroundColor: "#432344",
  },
  modalButtonCreateText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#432344",
    paddingVertical: 12,
    borderRadius: 7,
    alignItems: "center",
  },
  modalButtonNext: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#432344",
    paddingVertical: 12,
    borderRadius: 7,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#432344",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },

  // Disable Confirmation Modal Styles
     modalOverlayDisable: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
  
    modalContentDisable: {
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
      fontWeight: "semibold",
      color: "#432344",
      marginBottom: 25,
      textAlign: "center",
      fontFamily: "inter_400Regular",
    },
  
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      gap: 10,
    },

});
