import { StyleSheet } from "react-native";

export default StyleSheet.create({
  topBar: {
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

  topBarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#432344",
    textAlign: "center",
  },

  menuIcon: {
    position: "absolute",
    left: 20,
    top: 25,
  },

  modalmenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 60,
    paddingLeft: 20,
  },

  dropdownContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },

  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: "#fff",
  },

  dropdownItemPressed: {
    backgroundColor: "#EDEDED",
  },

  dropdownText: {
    fontSize: 16,
    color: "#432344",
    fontWeight: "bold",
    textAlign: "center",
  },

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
    width: "100%", // Adjust width to fit two buttons side by side
    elevation: 2,
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
    fontFamily: "Roboto",
  },

  safeArea: {
    flex: 1,
    margin: 10,
    padding: 10,
  },

  cardContainer: {
    width: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginRight: 20,
    backgroundColor: "#eee",
  },

  greeting: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Roboto",
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#852B88",
    fontFamily: "Roboto",
  },

  categoryAssigned: {
    fontSize: 14,
    color: "#852B88",
    marginTop: 2,
    fontWeight: "bold",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },

  categorytitle: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
    justifyContent: "center",
    fontFamily: "Roboto",
    color: "#432344",
  },

  categorytitleText: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Roboto",
    color: "#432344",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  card: {
    height: 130,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
  },

  cardHeader: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the icon is above other elements
  },

  cardOptionsIcon: {
    padding: 5,
    borderRadius: 15, // Rounded icon background
  },

  sideImage: {
    height: "100%",
    aspectRatio: 1 / 1,
    borderRadius: 10,
    resizeMode: "contain",
  },

  text: {
    flex: 1,
    padding: 10,
    marginLeft: 5,
    marginRight: 15,
    marginTop: 5,
    flexWrap: "wrap",
    flexShrink: 1,
  },

  cardTextThin: {
    fontSize: 20,
    color: "#ffffff",
    textTransform: "uppercase",
    fontWeight: "ultralight",
    letterSpacing: 3,
    fontFamily: "Roboto",
  },

  cardText: {
    fontSize: 20,
    color: "#ffffff",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 3,
    fontFamily: "Roboto",
  },

  cardDesc: {
    fontSize: 12,
    color: "#fff",
    marginVertical: 4,
    fontFamily: "Roboto",
    letterSpacing: 1.5,
    flexWrap: "wrap",
    textAlign: "left",
    flexShrink: 1,
    lineHeight: 16,
  },

  modalOverlayCat: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContentCat: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 300,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },

  modalCloseIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the close icon is above other elements
  },

  modalTitleCat: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#432344",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Roboto",
  },

  modalButtonCat: {
    backgroundColor: "#E79300",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5, // Space between buttons
    alignItems: "center",
    width: "100%", // Full width button
    elevation: 2, // Add shadow for Android
  },

  modalButtonTextCat: {
    fontSize: 16,
    color: "#fff", // White text for contrast
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
