import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter",
  },

  topLeftBlob: {
    position: "absolute",
    top: -100,
    left: -50,
    width: "34%",
    height: "34%",
    backgroundColor: "#852B88",
    borderBottomRightRadius: 250,
    zIndex: -1,
  },

  bottomRightBlob: {
    position: "absolute",
    bottom: -50,
    right: -60,
    width: "34%",
    height: "34%",
    backgroundColor: "#852B88",
    borderTopLeftRadius: 200,
    zIndex: -1,
  },

  widthForm: {
    width: "80%",
  },

  innerContainer: {
    justifyContent: "flex-start",
  },

  backNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    marginBottom: 20,
  },

  backText: {
    color: "#852B88",
    fontSize: 16,
    marginLeft: 10,
  },

  spacing: {
    marginTop: 10,
    marginBottom: 10,
  },

  titleBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headtitle: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 16,
  },

  highlight: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#740D77",
  },

  containerForm: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
  },

  input: {
    height: 46,
    width: "100%",
    margin: 12,
    padding: 10,
    backgroundColor: "#f7f7f7",
    fontSize: 16,
    borderRadius: 5,
    borderColor: "#f7f7f7",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignSelf: "center",
  },

  forgotPass: {
    alignSelf: "flex-end",
    textDecorationLine: "underline",
    textDecorationColor: "#852B88",
    color: "#852B88",
    fontSize: 16,
  },

  signButton: {
    width: "100%",
    height: 47,
    backgroundColor: "#211022",
    borderRadius: 5,
    alignSelf: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
  },

  signUpbuttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  textlink: {
    color: "#852B88",
    fontSize: 16,
  },
});
