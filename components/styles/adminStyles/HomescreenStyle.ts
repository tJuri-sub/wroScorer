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
    width: "80%",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalHeader: {
    display: "flex",
    //flexDirection: "row",
    borderBottomWidth: 1,
    width: "100%",
    padding: 5,
    marginBottom: 10,
  },

  modalImage: {
    height: "100%",
    aspectRatio: 1 / 1,
    borderRadius: "50%",
    resizeMode: "cover",
    marginRight: 10,
    borderWidth: 1,
  },

  headerTextModal: {
    fontSize: 20,
    fontWeight: "bold",
  },

  headerSubTextModal: {
    fontSize: 13,
    opacity: 50,
  },

  formContainer: {
    display: "flex",
    width: "100%",
    gap: 20,
    marginBottom: 20,
  },

  textinput: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderRadius: 4,
    padding: 5,
    width: "100%",
    fontSize: 17,
  },

  dropdown: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderRadius: 4,
    padding: 5,
    width: "100%",
    fontSize: 16,
  },

  buttonContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },

  modalCreateButton: {
    backgroundColor: "#432344",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#432344",
    flex: 1,
    alignItems: "center",
    padding: 5,
  },

  buttonText: {
    color: "#ffffff",
  },

  modalCancelButton: {
    borderWidth: 1,
    borderColor: "#432344",
    borderRadius: 7,
    flex: 1,
    alignItems: "center",
    padding: 5,
  },
});
