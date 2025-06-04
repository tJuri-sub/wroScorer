import { StyleSheet } from "react-native";

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    margin: 10,
    padding: 5,
  },

  cardContainer: {
    width: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
    marginLeft: 20,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#eee",
  },

  greeting: {
    fontSize: 16,
    fontWeight: "600",
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  categoryAssigned: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },

  card: {
    height: 120,
    borderRadius: 10,
    backgroundColor: "#E79300",
    display: "flex",
    flexDirection: "row",
  },

  sideImage: {
    height: "100%",
    aspectRatio: 1 / 1,
    borderRadius: 10,
    resizeMode: "cover",
  },

  text: {
    flex: 1,
    padding: 10,
  },

  cardTextThin: {
    fontSize: 20,
    color: "#ffffff",
    textTransform: "uppercase",
    fontWeight: "ultralight",
    letterSpacing: 3,
  },

  cardText: {
    fontSize: 20,
    color: "#ffffff",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 3,
  },

  cardDesc: {
    marginTop: 2,
    fontSize: 14,
    color: "#ffffff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 300,
    alignItems: "center",
  },
});
