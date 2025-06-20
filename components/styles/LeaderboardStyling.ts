import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  containerCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#919191",
    borderRadius: 5,
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#432344",
    textAlign: "center",
  },
});
