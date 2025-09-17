import { StyleSheet } from "react-native";

export default StyleSheet.create({
  eventButtonContainer: {
    backgroundColor: "#c8c8c8ff",
    padding: 10,
    borderRadius: 15,
    width: "100%",
    display: "flex",
    gap: 8,
    boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.6)",
  },

  catHeaderText: {
    fontFamily: "inter_400Regular",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
  },

  categoryListEvents: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    boxShadow: "1px 1px 3px rgba(0,0,0,0.6)",
  },

  eventText: {
    fontFamily: "inter_400Regular",
    color: "#000",
    fontSize: 16,
  },
});
