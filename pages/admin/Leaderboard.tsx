import React, { useLayoutEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Leaderboard({ navigation }: any) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{ marginLeft: 15 }}
        >
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRight: () => null,
    });
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Feather name="tool" size={48} color="#999" style={{ marginBottom: 16 }} />
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 8 }}>
        Under Maintenance
      </Text>
      <Text style={{ fontSize: 14, color: "#777", textAlign: "center" }}>
        The leaderboard is temporarily unavailable while we make some updates.{"\n"}Please check back soon.
      </Text>
    </View>
  );
}