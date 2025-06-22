import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 12,
  },
  
   centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 10,
    textAlign: "left",
  },

  teamCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  teamCardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },

  teamData: {
    fontSize: 16,
    marginBottom: 4,
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
  }

});
