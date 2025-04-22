import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Image, Pressable } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Font from "expo-font";

export default function Leaderboard() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Inter: require("../assets/fonts/Inter-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={(styles.box, { flex: 1 })}>
        <View style={styles.container}>
          {/* Cup */}
          <Image
            source={require("../assets/images/champion-cup.png")}
            style={styles.image}
          />
          <Text style={styles.text}>Create your teams first!</Text>
        </View>
        {/* Create Button */}
        <View style={styles.containerButton}>
          <Pressable style={styles.createButton}>
            <AntDesign
              name="arrowright"
              size={24}
              color="white"
              style={{ paddingRight: 10 }}
            />
            <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
              Create Teams
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  box: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
  },

  text: {
    color: "black",
    fontWeight: "bold",
    fontFamily: "Inter",
    fontSize: 18,
  },

  container: {
    paddingTop: 10,
    paddingBottom: 50,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,

    // Android Shadow
    elevation: 5,
  },

  containerButton: {
    paddingTop: 10,
    paddingBottom: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
    marginTop: 300,
  },

  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },

  createButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#432344",
    width: 150,
    padding: 10,
    borderRadius: 5,
  },
});
