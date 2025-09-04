import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  title: {
    fontFamily: "inter_400Regular",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    fontFamily: "inter_400Regular",
    fontSize: 16,
    marginBottom: 10,
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    marginBottom: 10,
    fontFamily: "inter_400Regular",
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999999",
  },

  paginationButtonDisabled: {
    opacity: 0.4,
  },

  paginationButtonText: {
    color: "#432344",
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
    fontSize: 16,
  },

  paginationInfo: {
    marginHorizontal: 10,
    fontFamily: "inter_400Regular",
    fontSize: 14,
    color: "#333",
  },

  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    boxShadow: " 0px 2px 3px rgba(0,0,0,0.5)",
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
    fontFamily: "inter_400Regular",
    fontSize: 14,
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
    fontFamily: "inter_400Regular",
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    marginRight: 8,
    textAlign: "right",
  },

  teamCardTeamName: {
    fontFamily: "inter_400Regular",
    fontSize: 20,
    fontWeight: "bold",
    color: "#432344",
    flex: 1,
    textAlign: "left",
    flexWrap: "wrap",
  },

  teamCardMember: {
    fontFamily: "inter_400Regular",
    fontSize: 14,
    color: "#333",
    marginLeft: 30,
    marginBottom: 2,
  },

  teamCardCoach: {
    fontFamily: "inter_400Regular",
    fontSize: 14,
    color: "#432344",
    fontStyle: "italic",
    marginTop: 4,
    marginLeft: 2,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
    gap: 8, // RN 0.71+ supports "gap"; if not, use marginRight on children
  },

  editIcon: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#432344",
    borderRadius: 20,
    padding: 8,
    marginLeft: 6,
  },

  createTeamButton: {
    backgroundColor: "#432344",
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: "50%",
    width: "20%",
    aspectRatio: 1 / 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
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
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    boxShadow: "0px 2px 3px rgba(0,0,0,0.5)",
  },

  modalHeader: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },

  headerTextModal: {
    fontFamily: "inter_400Regular",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#222",
  },

  headerSubTextModal: {
    fontFamily: "inter_400Regular",
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },

  modalLabel: {
    alignSelf: "flex-start",
    fontFamily: "inter_400Regular",
    fontSize: 14,
    color: "#432344",
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "500",
    zIndex: -9999,
  },

  modalInput: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: "inter_400Regular",
    fontSize: 14,
    marginBottom: 8,
    width: "100%",
  },

  countryPicker: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: "inter_400Regular",
    fontSize: 14,
    marginBottom: 8,
  },

  pageIndicatorContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 6,
  },

  pageIndicatorText: {
    color: "#6d5477",
    fontFamily: "inter_400Regular",
    fontSize: 12,
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
    fontFamily: "inter_400Regular",
    fontSize: 16,
    letterSpacing: 1,
  },

  modalButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#432344",
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
  },

  modalButtonNext: {
    flex: 1,
    backgroundColor: "#432344",
    borderWidth: 1,
    borderColor: "#432344",
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
  },

  modalButtonTextNext: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
    fontSize: 16,
    letterSpacing: 1,
  },

  modalButtonText: {
    color: "#432344",
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
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
  errorText: {
    color: "#AA0003",
    marginBottom: 4,
    textAlign: "left",
    alignSelf: "flex-start",
  },
});
