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
    left: 20, // Position the icon on the left
    top: 25, // Position the icon at the top
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
    elevation: 4, // Add shadow for dropdown
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  dropdownText: {
    fontSize: 16,
    color: "#432344", // Text color
    fontWeight: "bold",
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
    marginTop: 20,
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
    // backgroundColor: "#E79300",
    display: "flex",
    flexDirection: "row",
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
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
    marginLeft: 5,
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
    letterSpacing: 2,
    flexWrap: "wrap",
    textAlign: "left",
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
