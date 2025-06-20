import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseconfig";

const categorydata = [
    {
      label: "Robomission",
      value: "robomission",
      image: require("../../assets/images/RoboMissionLogo.png"),
      categoryDesc:
        "Build and program a robot that solves tasks on playing field",
      subcategories: [
        { label: "Elementary", value: "robo-elem" },
        { label: "Junior", value: "robo-junior" },
        { label: "Senior", value: "robo-senior" },
      ],
    },
    {
      label: "Robosports",
      value: "robosports",
      image: require("../../assets/images/RoboSportsLogo.png"),
      categoryDesc: "Teams compete with 2 robots in an exciting game",
    },

    {
      label: "Future Innovators",
      value: "future-innovators",
      image: require("../../assets/images/FutureILogo.png"),
      categoryDesc: "Work on project and design and build a robot",
      subcategories: [
        { label: "Elementary", value: "fi-elem" },
        { label: "Junior", value: "fi-junior" },
        { label: "Senior", value: "fi-senior" },
      ],
    },
    {
      label: "Future Engineers",
      value: "future-eng",
      image: require("../../assets/images/FutureELogo.png"),
      categoryDesc: "Advanced robotics following current research trends",
    },
  ];

export default function AllJudgesScreen() {
  const [judges, setJudges] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  type Judge = {
  id: string;
  username: string;
  email: string;
  category: string;
  avatarUrl: string;
  createdAt?: { seconds: number; nanoseconds: number }; // Firestore Timestamp
};


  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    const fetchJudges = async () => {
        setLoading(true);
        const snap = await getDocs(collection(FIREBASE_DB, "judge-users"));
        const allJudges = snap.docs.map(doc => {
          const { id, ...data } = doc.data() as Judge;
          return {
            id: doc.id,
            ...data,
          };
        });
        // Sort by createdAt descending (latest first)
        allJudges.sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
        });
        setJudges(allJudges);
        setLoading(false);
    };
    fetchJudges();
   }, []);

  // Filter and search client-side
  const getCategoryValues = (catValue: string | null) => {
  if (!catValue) return null;
  const mainCat = categorydata.find(cat => cat.value === catValue);
  if (mainCat?.subcategories) {
    // Return an array of subcategory values + the main category value itself (if needed)
    return mainCat.subcategories.map(sub => sub.value);
  }
  return [catValue];
};

const filteredJudges = judges.filter(judge => {
  let matchesCategory = true;
  if (category) {
    const catValues = getCategoryValues(category);
    matchesCategory = catValues ? catValues.includes(judge.category) : judge.category === category;
  }
  const matchesSearch = judge.username?.toLowerCase().includes(search.toLowerCase());
  return matchesCategory && matchesSearch;
});

const totalPages = Math.ceil(filteredJudges.length / PAGE_SIZE);
const paginatedJudges = filteredJudges.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

function getCategoryDisplayLabel(categoryValue: string) {
  for (const mainCat of categorydata) {
    if (mainCat.value === categoryValue) {
      return mainCat.label;
    }
    if (mainCat.subcategories) {
      const sub = mainCat.subcategories.find(subcat => subcat.value === categoryValue);
      if (sub) {
        return `${mainCat.label} ${sub.label}`;
      }
    }
  }
  return categoryValue;
}

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>All Judges ({filteredJudges.length})</Text>
        <TextInput
          placeholder="Search by name"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={[styles.categoryChip, category === null && styles.categoryChipActive]}
            onPress={() => setCategory(null)}
          >
            <Text style={[styles.categoryChipText, category === null && styles.categoryChipTextActive]}>All</Text>
          </TouchableOpacity>
          {categorydata.map(cat => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.categoryChip, category === cat.value && styles.categoryChipActive]}
              onPress={() => setCategory(cat.value)}
            >
              <Text style={[styles.categoryChipText, category === cat.value && styles.categoryChipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={paginatedJudges}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.judgeCard}>
              <Image
                source={{ uri: item.avatarUrl }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.judgeName}>{item.username}</Text>
                <Text style={styles.judgeEmail}>{item.email}</Text>
                <Text style={styles.judgeCategory}>
                    {getCategoryDisplayLabel(item.category)}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No judges found.</Text>}
          scrollEnabled={paginatedJudges.length > PAGE_SIZE}
        />
      )}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
            onPress={() => setPage(page - 1)}
            disabled={page === 1}
            style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
        >
            <Text style={[styles.paginationText, page === 1 && styles.paginationTextDisabled]}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.paginationInfo}>
            Page {page} of {totalPages === 0 ? 1 : totalPages}
        </Text>
        <TouchableOpacity
            onPress={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
            style={[styles.paginationButton, (page === totalPages || totalPages === 0) && styles.paginationButtonDisabled]}
        >
            <Text style={[styles.paginationText, (page === totalPages || totalPages === 0) && styles.paginationTextDisabled]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 0,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    marginBottom: 12,
    fontSize: 16,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  categoryChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },
  categoryChipActive: {
    backgroundColor: "#6c63ff",
  },
  categoryChipText: {
    color: "#333",
    fontWeight: "bold",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  loadingIndicator: {
    marginTop: 40,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  judgeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  judgeName: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 2,
  },
  judgeEmail: {
    color: "#555",
    fontSize: 15,
  },
  judgeCategory: {
    color: "#888",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#aaa",
  },
  // Add to your StyleSheet
paginationContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 10,
},
paginationButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
},
paginationButtonDisabled: {
  opacity: 0.4,
},
paginationText: {
  color: "#6c63ff",
  fontWeight: "bold",
  fontSize: 16,
},
paginationTextDisabled: {
  color: "#aaa",
},
paginationInfo: {
  marginHorizontal: 10,
  fontSize: 16,
  color: "#333",
},
});