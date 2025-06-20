import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },

  backButton: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: "#432344",
    borderWidth: 1,
    borderRadius: 5,
  },

  backButtonText: {
    fontSize: 14,
    color: "#432344",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  title: {
    flex: 1, // Center the title
    fontSize: 18,
    fontWeight: "bold",
    color: "#432344",
    textAlign: "center",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },

  scoreText: { fontSize: 14, marginBottom: 2 },

  teamCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#919191",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
    flexDirection: "column",
    minWidth: 0,
  },
  teamCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  teamCardHeaderText: {
    fontSize: 15,
    color: "#888",
    fontStyle: "italic",
    fontWeight: "500",
  },
  teamCardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  teamCardFlag: {
    width: 24,
    height: 16,
    marginRight: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#ccc",
  },
  teamCardCountry: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    marginRight: 8,
    textAlign: "right",
  },
  teamCardTeamName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#432344",
    flex: 1,
    textAlign: "left",
  },
  teamCardMember: {
    fontSize: 15,
    color: "#333",
    marginLeft: 30,
    marginBottom: 2,
  },
  teamCardCoach: {
    fontSize: 15,
    color: "#432344",
    fontStyle: "italic",
    marginTop: 4,
    marginLeft: 2,
  },
});
