import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";
import React, { useRef, useState } from "react";
import { FlatList, TouchableOpacity, Text, ViewToken } from "react-native";

interface Category {
  id: string;
  label: string;
}

interface Props {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
}

export const CategoryPills: React.FC<Props> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });
  const scrollRef = useRef<FlatList<Category>>(null);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      setVisibleIds(viewableItems.map((v) => v.item.id));
    }
  );

  return (
    <FlatList
      ref={scrollRef}
      data={categories}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      renderItem={({ item, index }) => {
        const isSelected = selectedCategory === item.id;
        return (
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory(item.id);
              // ✅ only scroll if item is NOT already visible
              if (!visibleIds.includes(item.id)) {
                scrollRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }
            }}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 18,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: isSelected ? "#432344" : "#eee",
              borderWidth: isSelected ? 2 : 0,
              borderColor: "#432344",
            }}
          >
            <Text
              style={{
                color: isSelected ? "#fff" : "#432344,",
                fontWeight: isSelected ? "bold" : "normal",
                fontFamily: "inter_400Regular",
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      initialNumToRender={categories.length}
      extraData={selectedCategory}
    />
  );
};
