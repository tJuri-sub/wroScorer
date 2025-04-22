import { Text, StyleSheet, View, Image, Pressable } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <View>
          <Text>Hello!</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
