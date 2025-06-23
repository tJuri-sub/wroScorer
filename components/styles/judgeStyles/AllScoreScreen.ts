import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4", padding: 12 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  subtitle: { fontSize: 16, marginBottom: 10 },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    boxShadow: "0px 2px 3px rgba(0,0,0,0.2)",
  },

  historyTextContainer: {
    marginTop: 5,
    marginBottom: 5,
  },

  historyText: { fontSize: 14, marginBottom: 4 },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  historyMainText: {
    fontSize: 16,
  },
  pageButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pageInfo: {
    fontSize: 16,
  },

  historyScoreContainer: {
    flexDirection: "row",
    gap: 5,
  },

  historyTextCreated: {
    fontSize: 12,
  },
});
