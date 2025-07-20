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
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: "100%",
    marginBottom: 0,
    borderColor: "#ddd",
    borderWidth: 1,
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
    backgroundColor: "#eee",
    marginVertical: 12,
  },
});