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
    padding: 10,
    marginTop: 10,
  },

  avatar: {
    height: "100%",
    aspectRatio: 1 / 1,
    borderRadius: "50%",
    borderWidth: 1,
  },

  greeting: {
    fontSize: 17,
    fontWeight: "bold",
  },

  name: {
    fontSize: 20,
    color: "#852B88",
    fontWeight: "bold",
  },

  headerTexts: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 15,
  },

  card: {
    height: 120,
    width: screenWidth * 0.9, // Responsive width (80% of screen)
    borderRadius: 10,
    backgroundColor: "#E79300",
    display: "flex",
    flexDirection: "row",
    marginRight: 16, // Gap between cards
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
  },

  cardTextThin: {
    fontSize: 20,
    color: "#ffffff",
    textTransform: "uppercase",
    fontWeight: "ultralight",
    letterSpacing: 3,
  },

  cardText: {
    fontSize: 20,
    color: "#ffffff",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 3,
  },

  cardDesc: {
    marginTop: 2,
    fontSize: 14,
    color: "#ffffff",
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
  },

  judgesEmail: {
    fontSize: 14,
  },

  judgesCategory: {
    fontSize: 14,
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
},

headerSubTextModal: {
  fontSize: 14,
  color: "#888",
  marginBottom: 2,
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
},

buttonContainer: {
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  width: "100%",
  marginTop: 10,
  gap: 12,
},

modalCreateButton: {
  backgroundColor: "#432344",
  borderRadius: 7,
  borderWidth: 1,
  borderColor: "#432344",
  flex: 1,
  alignItems: "center",
  paddingVertical: 10,
  marginLeft: 8,
},

buttonText: {
  color: "#ffffff",
  fontWeight: "bold",
  fontSize: 16,
},

modalCancelButton: {
  borderWidth: 1,
  borderColor: "#432344",
  borderRadius: 7,
  flex: 1,
  alignItems: "center",
  paddingVertical: 10,
  marginRight: 8,
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
    fontFamily: "Roboto",
  },

  modalButtonCat: {
    backgroundColor: "#E79300",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5, // Space between buttons
    alignItems: "center",
    width: "100%", // Full width button
    elevation: 2, // Add shadow for Android
  },

  modalButtonTextCat: {
    fontSize: 16,
    color: "#fff", // White text for contrast
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
