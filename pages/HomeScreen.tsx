import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function Ranks() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.text}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui
            ducimus impedit voluptatem doloribus nihil dicta, unde fugit nostrum
            porro temporibus totam tempora quas consectetur, aperiam repellendus
            amet laudantium beatae officiis.
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "black",
  },

  container: {
    padding: 10,
  },
});
