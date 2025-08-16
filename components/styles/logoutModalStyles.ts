import { StyleSheet } from "react-native";

export default StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    width: 300,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#432344",
    marginBottom: 25,
    textAlign: "center",
  },

  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    boxShadow: "0px 2px 3px rgba(0,0,0,0.3)",
  },

  backButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#432344",
  },

  backButtonText: {
    color: "#432344",
  },

  yesButton: {
    backgroundColor: "#AA3D3F",
  },

  modalButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "semibold",
    letterSpacing: 1,
    fontFamily: "inter_400Regular",
  },
});
