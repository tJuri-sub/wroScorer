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

card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
},

cardText: {
    fontSize: 16,
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
});