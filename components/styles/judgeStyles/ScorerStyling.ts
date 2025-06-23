import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 12,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    marginHorizontal: 3,
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "inter_400Regular",
  },

  headerSubtitle: {
    fontSize: 16,
    fontFamily: "inter_400Regular",
    color: "rgba(0,0,0,0.5)",
  },

  searchbar: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#919191",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    marginHorizontal: 3,
  },

  teamCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    boxShadow: "0px 3px 4px rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "#919191",
    marginHorizontal: 3,
  },

  teamCardTeamNumber: {
    fontSize: 16,
    fontFamily: "inter_400Regular",
  },

  teamCardTeamNumberHighlight: {
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "inter_400Regular",
  },

  teamCardTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: "inter_400Regular",
  },

  teamData: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: "inter_400Regular",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },

  scoreinput: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 17,
    marginBottom: 18,
    width: "100%",
  },

  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    width: "100%",
    gap: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 17,
    width: 60,
    textAlign: "center",
    marginRight: 2,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    width: "100%",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#432344",
    marginRight: 8,
  },

  submitButton: {
    flex: 1,
    backgroundColor: "#432344",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
