import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },

  addEventButton: {
    backgroundColor: "#48caf6ff",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },

  textButton: {
    fontSize: 16,
    textAlign: "center",
  },

  eventCard: {
    width: "100%",
    backgroundColor: "#fff",
  },

  eventTitle: {
    fontWeight: "bold",
  },

  headerModal: {
    borderBottomWidth: 1,
    borderColor: "#999999",
    paddingVertical: 10,
    marginBottom: 10,
  },

  headerTextModal: {
    fontSize: 20,
  },

  modal: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    width: "80%",
  },

  label: {
    marginBottom: 5,
  },

  textModalInput: {
    borderColor: "#999999",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 5,

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  // EVENT STYLES
  eventContainer: {
    flex: 1,
    width: "100%",
  },
});
