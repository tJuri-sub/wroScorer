import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.1, // For iOS shadow
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#432344",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },

  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    width: "100%",
    boxShadow: "0px 2px 3px rgba(0,0,0,0.2)",
  },

  historyTextContainer: {
    marginTop: 5,
    marginBottom: 5,
  },

  historyMainText: {
    fontSize: 16,
    marginBottom: 2,
  },

  historyText: {
    fontSize: 14,
    marginBottom: 2,
  },

  historyCreatedText: {
    fontSize: 12,
    marginBottom: 2,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  seeAllText: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "bold",
  },

  scorerCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    elevation: 2,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },

  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 8,
    maxHeight: 200,
    zIndex: 100,
  },

  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },

  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  timeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    width: 80,
    textAlign: "center",
    backgroundColor: "#f9f9f9",
  },

  timeLabel: {
    fontSize: 16,
    fontWeight: "normal",
    marginHorizontal: 5,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
