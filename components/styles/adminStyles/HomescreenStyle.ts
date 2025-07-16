import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    marginLeft: 10,
    marginRight: 10,
    paddingLeft: 5,
    paddingRight: 5,
  },

  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 15,
    width: "100%",
    padding: 15,
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    boxShadow: "0px 1px 2px rgba(0,0,0,0.3)",
  },

  avatar: {
    height: "100%",
    aspectRatio: 1 / 1,
    borderRadius: "50%",
    borderWidth: 1,
  },

  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
  },

  email: {
    fontSize: 16,
    color: "#852B88",
    fontFamily: "inter_400Regular",
  },

  headerTexts: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 15,
    fontFamily: "inter_400Regular",
  },

  card: {
    height: 120,
    width: screenWidth * 0.9,
    borderRadius: 10,
    backgroundColor: "#E79300",
    display: "flex",
    flexDirection: "row",
    marginVertical: 5,
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },

  cardHeader: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the icon is above other elements
  },

  sideImage: {
    height: "100%",
    aspectRatio: 1 / 1,
    borderRadius: 10,
    resizeMode: "cover",
  },

  text: {
    flex: 1,
    padding: 10,
    flexShrink: 1,
    flexWrap: "wrap",
    fontFamily: "inter_400Regular",
  },

  cardTextThin: {
    fontSize: 20,
    color: "#ffffff",
    textTransform: "uppercase",
    fontWeight: "ultralight",
    letterSpacing: 3,
    fontFamily: "inter_400Regular",
  },

  cardText: {
    fontSize: 20,
    color: "#ffffff",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 3,
    fontFamily: "inter_400Regular",
  },

  cardDesc: {
    marginTop: 2,
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "inter_400Regular",
  },

  judgesCard: {
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
    padding: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
  },

  judgesImage: {
    width: "15%",
    aspectRatio: 1 / 1,
    borderWidth: 1,
    borderRadius: "50%",
  },

  judgesName: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
  },

  judgesEmail: {
    fontSize: 14,
    fontFamily: "inter_400Regular",
  },

  judgesCategory: {
    fontSize: 12,
    fontFamily: "inter_400Regular",
    color: "#999999",
  },

  addJudgeButton: {
    backgroundColor: "#432344",
    width: "15%",
    aspectRatio: 1 / 1,
    borderRadius: "50%",
    zIndex: 2,
    position: "absolute",
    bottom: 15,
    right: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 3px rgba(0,0,0,0.5)",
  },

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
    elevation: 6,
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
      elevation: 2,
      borderWidth: 1,
    },
  
    modalButtonText: {
      fontSize: 14,
      color: "#fff",
      fontWeight: "semibold",
      letterSpacing: 1,
      fontFamily: "inter_400Regular",
    },
  


});
