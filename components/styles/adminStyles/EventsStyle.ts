import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
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

  createButtonHeader: {
    marginBottom: 15,
  },

  eventCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    boxShadow: "1px 1px 2px rgba(0,0,0,0.5)",
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  eventDetail: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },

  eventList: {
    backgroundColor: "#cacacaff",
    paddingHorizontal: 5,
    paddingVertical: 5,
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    //boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.5)",
  },
});
