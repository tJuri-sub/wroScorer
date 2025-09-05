import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  headerText: {
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
    fontSize: 16,
    marginBottom: 10,
    marginVertical: "auto",
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    marginBottom: 12,
    fontFamily: "inter_400Regular",
    fontSize: 16,
  },

  categoryRow: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },

  categoryChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: "#d3d3d3ff",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },

  categoryChipActive: {
    backgroundColor: "#6c63ff",
  },

  categoryChipText: {
    fontFamily: "inter_400Regular",
    color: "#333",
    fontSize: 14,
  },

  categoryChipTextActive: {
    fontFamily: "inter_400Regular",
    color: "#fff",
  },

  loadingIndicator: {
    marginTop: 40,
  },

  listContent: {
    padding: 16,
  },

  judgeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0px 2px 2px rgba(0,0,0,0.3)",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  judgeName: {
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
    fontSize: 16,
    marginBottom: 2,
  },

  judgeEmail: {
    color: "#555",
    fontFamily: "inter_400Regular",
    fontSize: 14,
  },

  judgeCategory: {
    color: "#bcbcbcff",
    fontFamily: "inter_400Regular",
    fontSize: 12,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontFamily: "inter_400Regular",
    color: "#aaa",
  },

  // Add to your StyleSheet
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  paginationButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#777777",
  },

  paginationButtonDisabled: {
    opacity: 0.4,
  },

  paginationText: {
    fontWeight: "bold",
  },

  paginationTextDisabled: {
    fontFamily: "inter_400Regular",
    color: "#aaa",
  },

  paginationInfo: {
    marginHorizontal: 30,
    fontFamily: "inter_400Regular",
    fontSize: 14,
    color: "#333",
  },

  addJudgeButton: {
    backgroundColor: "#432344",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal styles
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    boxShadow: "0px 2px 3px rgba(0,0,0,0.3)",
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
    fontFamily: "inter_400Regular",
  },

  headerSubTextModal: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
    fontFamily: "inter_400Regular",
  },

  formContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 22,
  },

  textinput: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "100%",
    fontSize: 17,
    marginBottom: 2,
    fontFamily: "inter_400Regular",
  },

  dropdown: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "100%",
    fontSize: 16,
    marginBottom: 2,
    fontFamily: "inter_400Regular",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    gap: 12,
  },

  buttonDisableContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    gap: 5,
  },

  modalCreateButton: {
    flex: 1,
    backgroundColor: "#432344",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 6,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "inter_400Regular",
    textAlign: "center",
  },

  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#432344",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 6,
    backgroundColor: "#fff",
  },

  modalDisableButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#AA0003",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: "#fff",
  },

  modalOverlayCat: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContentCat: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 300,
    alignItems: "center",
    boxShadow: "0px 2px 3px rgba(0,0,0,0.5)",
  },

  modalCloseIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the close icon is above other elements
  },

  modalTitleCat: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#432344",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "inter_400Regular",
  },

  modalButtonCat: {
    backgroundColor: "#E79300",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5, // Space between buttons
    alignItems: "center",
    width: "100%", // Full width button
    boxShadow: "0px 2px 3px rgba(0,0,0,0.4)",
  },

  modalButtonTextCat: {
    fontSize: 16,
    color: "#fff", // White text for contrast
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "inter_400Regular",
  },

  editButton: {
    backgroundColor: "#432344",
    borderRadius: 20,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
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
  },

  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%", // Adjust width to fit two buttons side by side
    boxShadow: "0px 2px 3px rgba(0,0,0,0.5)",
    borderWidth: 1,
  },

  modalButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "semibold",
    letterSpacing: 1,
    fontFamily: "inter_400Regular",
  },

  errorText: {
    color: "#AA0003",
    marginBottom: 4,
  },
});
