import { StyleSheet } from "react-native";

export default StyleSheet.create({
  catTitleText: {
    fontFamily: "inter_400Regular",
    fontSize: 16,
    color: "#fff",
  },

  navButtons: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: 20,
    color: "#fff",
  },

  buttonText: {
    fontFamily: "inter_400Regular",
    color: "#fff",
    fontWeight: "bold",
  },

  leaderboardButton: {
    backgroundColor: "#0081CC",
    padding: 12,
    borderRadius: 8,
    display: "flex",
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  overallScoresButton: {
    backgroundColor: "#3A9F6C",
    padding: 12,
    borderRadius: 8,
    display: "flex",
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  judgeListHeader: {
    fontFamily: "inter_400Regular",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },

  judgeNameList: {
    fontFamily: "inter_400Regular",
    fontSize: 14,
  },
});
