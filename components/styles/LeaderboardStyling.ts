import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1, 
        padding: 20
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
});