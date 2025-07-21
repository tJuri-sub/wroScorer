import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  containerCard: {
    padding: 12,
    borderColor: "#919191",
    borderRadius: 10,
    flexDirection: "row",
    marginVertical: 6,
    boxShadow: "0px 2px 3px rgba(0,0,0,0.2)",
    marginHorizontal: 5,
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
    fontFamily: "Inter_400Regular",
    fontSize: 22,
    fontWeight: "bold",
    color: "#432344",
    textAlign: "center",
  },
});
