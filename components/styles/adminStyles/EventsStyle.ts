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
});
