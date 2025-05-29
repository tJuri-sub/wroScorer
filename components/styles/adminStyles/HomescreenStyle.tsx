import { StyleSheet } from "react-native";

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
    borderRadius: 10,
    backgroundColor: "#E79300",
    display: "flex",
    flexDirection: "row",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    alignItems: "center",
  },
});
