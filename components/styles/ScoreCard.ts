import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    width: "100%",
    marginBottom: 10,
    borderWidth: 1,
    boxShadow: "0px 2px 3px rgba(0,0,0,0.5)",
  },

  teamName: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 12,
    color: "#432344",
    textAlign: "left",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontWeight: "500",
    color: "#432344",
    fontSize: 16,
  },

  value: {
    fontWeight: "bold",
    color: "#432344",
    fontSize: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#999",
    marginVertical: 12,
  },
});
