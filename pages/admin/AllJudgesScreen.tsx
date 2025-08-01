import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseconfig";
import { Dropdown } from "react-native-element-dropdown";
import { getAuth } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";

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
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  const [judges, setJudges] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const [editJudge, setEditJudge] = useState<any | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editSubcategory, setEditSubcategory] = useState<string | null>(null);

  // Initialize Firebase
  const auth = getAuth();
  const db = getFirestore();
  const user = FIREBASE_AUTH.currentUser;

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
    const unsubscribe = onSnapshot(
      collection(FIREBASE_DB, "judge-users"),
      (snapshot) => {
        const allJudges: Judge[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Judge, "id">),
        }));
        // Sort alphabetically
        allJudges.sort((a, b) => a.username.localeCompare(b.username));
        setJudges(allJudges);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filter and search client-side
  const getCategoryValues = (catValue: string | null) => {
    if (!catValue) return null;
    const mainCat = categorydata.find((cat) => cat.value === catValue);
    if (mainCat?.subcategories) {
      // Return an array of subcategory values + the main category value itself (if needed)
      return mainCat.subcategories.map((sub) => sub.value);
    }
    return [catValue];
  };

  const filteredJudges = judges.filter((judge) => {
    let matchesCategory = true;
    if (category) {
      const catValues = getCategoryValues(category);
      matchesCategory = catValues
        ? catValues.includes(judge.category)
        : judge.category === category;
    }
    const matchesSearch = judge.username
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredJudges.length / PAGE_SIZE);
  const paginatedJudges = filteredJudges.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function getCategoryDisplayLabel(categoryValue: string) {
    for (const mainCat of categorydata) {
      if (mainCat.value === categoryValue) {
        return mainCat.label;
      }
      if (mainCat.subcategories) {
        const sub = mainCat.subcategories.find(
          (subcat) => subcat.value === categoryValue
        );
        if (sub) {
          return `${mainCat.label} ${sub.label}`;
        }
      }
    }

    return categoryValue;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.headerSection}>
          <Text style={styles.headerText}>
            All Judges ({filteredJudges.length})
          </Text>
          <TextInput
            placeholder="Search by name"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                category === null && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === null && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categorydata.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  category === cat.value && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat.value && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" style={styles.loadingIndicator} />
          ) : (
            <FlatList
              contentContainerStyle={styles.listContent}
              data={paginatedJudges}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const categoryLabel = getCategoryDisplayLabel(item.category);
                const isDisabled = item.disabled;

                return (
                  <View
                    style={[
                      styles.judgeCard,
                      isDisabled && {
                        backgroundColor: "#f0f0f0",
                        borderColor: "#ccc",
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        opacity: isDisabled ? 0.5 : 1,
                      }}
                    >
                      <Image
                        source={{
                          uri: item.avatarUrl,
                        }}
                        style={styles.avatar}
                      />
                      <View style={{ flex: 1, justifyContent: "center" }}>
                        <Text style={styles.judgeName}>{item.username}</Text>
                        <Text style={styles.judgeEmail}>{item.email}</Text>
                        <Text style={styles.judgeCategory}>
                          {categoryLabel}
                        </Text>
                      </View>
                    </View>
                    {/* Restore or Edit button and Disabled text */}
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        minWidth: 70,
                        marginLeft: 8,
                        height: "100%",
                      }}
                    >
                      {isDisabled ? (
                        <>
                          <TouchableOpacity
                            style={[
                              styles.editButton,
                              { backgroundColor: "#35A22F", opacity: 1 },
                            ]}
                            onPress={async () => {
                              try {
                                await updateDoc(
                                  doc(FIREBASE_DB, "judge-users", item.id),
                                  { disabled: false }
                                );
                                setJudges((prev) =>
                                  prev.map((j) =>
                                    j.id === item.id
                                      ? { ...j, disabled: false }
                                      : j
                                  )
                                );
                                Alert.alert(
                                  "Restored!",
                                  "Judge account has been restored."
                                );
                              } catch (e) {
                                Alert.alert(
                                  "Error",
                                  "Failed to restore judge."
                                );
                              }
                            }}
                          >
                            <MaterialCommunityIcons
                              name="restore"
                              size={20}
                              color="#fff"
                            />
                          </TouchableOpacity>
                          <Text
                            style={{
                              color: "#AA0003",
                              fontWeight: "bold",
                              marginTop: 8,
                              opacity: 1,
                              alignSelf: "center",
                            }}
                          >
                            Account Disabled
                          </Text>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => {
                              setEditJudge(item);

                              // Find if the category is a subcategory
                              let foundMainCat = null;
                              let foundSubCat = null;
                              for (const mainCat of categorydata) {
                                if (mainCat.value === item.category) {
                                  foundMainCat = mainCat;
                                  break;
                                }
                                if (mainCat.subcategories) {
                                  const sub = mainCat.subcategories.find(
                                    (subcat) => subcat.value === item.category
                                  );
                                  if (sub) {
                                    foundMainCat = mainCat;
                                    foundSubCat = sub;
                                    break;
                                  }
                                }
                              }

                              setEditCategory(
                                foundMainCat
                                  ? foundMainCat.value
                                  : item.category
                              );
                              setEditSubcategory(
                                foundSubCat ? foundSubCat.value : null
                              );
                              setEditUsername(item.username);
                              setEditModalVisible(true);
                            }}
                          >
                            <MaterialCommunityIcons
                              name="pencil-outline"
                              size={20}
                              color="#fff"
                            />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No judges found.</Text>
              }
              scrollEnabled={paginatedJudges.length > PAGE_SIZE}
            />
          )}
        </View>

        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={() => setPage(page - 1)}
            disabled={page === 1}
            style={[
              styles.paginationButton,
              page === 1 && styles.paginationButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.paginationText,
                page === 1 && styles.paginationTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>
          <Text style={styles.paginationInfo}>
            Page {page} of {totalPages === 0 ? 1 : totalPages}
          </Text>
          <TouchableOpacity
            onPress={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
            style={[
              styles.paginationButton,
              (page === totalPages || totalPages === 0) &&
                styles.paginationButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.paginationText,
                (page === totalPages || totalPages === 0) &&
                  styles.paginationTextDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.headerTextModal}>Edit Judge Account</Text>
              <Text style={styles.headerSubTextModal}>
                Update judge's information
              </Text>
            </View>
            <View style={styles.formContainer}>
              <TextInput
                placeholder="Name"
                value={editUsername}
                autoCapitalize="none"
                onChangeText={setEditUsername}
                style={styles.textinput}
              />
              <Dropdown
                style={styles.dropdown}
                data={categorydata}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Category"
                searchPlaceholder="Search..."
                value={editCategory}
                onChange={(item) => {
                  setEditCategory(item.value);
                  if (!item.subcategories) setEditSubcategory(null);
                }}
              />
              {["Robomission", "Future Innovators"].includes(
                categorydata.find((cat: any) => cat.value === editCategory)
                  ?.label || ""
              ) && (
                <Dropdown
                  style={styles.dropdown}
                  data={
                    categorydata.find((cat: any) => cat.value === editCategory)
                      ?.subcategories || []
                  }
                  labelField="label"
                  valueField="value"
                  placeholder="Select Subcategory"
                  value={editSubcategory}
                  onChange={(item) => setEditSubcategory(item.value)}
                />
              )}
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.modalCreateButton}
                onPress={async () => {
                  if (!editJudge) return;
                  try {
                    await updateDoc(doc(db, "judge-users", editJudge.id), {
                      username: editUsername,
                      category: editSubcategory || editCategory || "",
                    });
                    setJudges((prev) =>
                      prev.map((j) =>
                        j.id === editJudge.id
                          ? {
                              ...j,
                              username: editUsername,
                              category: editSubcategory || editCategory || "",
                            }
                          : j
                      )
                    );
                    setEditModalVisible(false);
                  } catch (e) {
                    Alert.alert("Error", "Failed to update judge.");
                  }
                }}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text>Cancel</Text>
              </Pressable>
            </View>
            <View style={styles.buttonDisableContainer}>
              <Pressable
                style={styles.modalDisableButton}
                onPress={() => setDisableModalVisible(true)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#AA0003", fontWeight: "bold" },
                  ]}
                >
                  Disable Account
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Disable Judge Account Confirmation Modal */}
      <Modal
        visible={disableModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDisableModalVisible(false)}
      >
        <View style={styles.modalOverlayDisable}>
          <View style={styles.modalContentDisable}>
            <Text style={styles.modalTitle}>
              Are you sure you want to disable this judge account?
            </Text>
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, { borderColor: "#432344" }]}
                onPress={() => setDisableModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#432344" }]}>
                  Back
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: "#AA3D3F", borderColor: "#AA3D3F" },
                ]}
                onPress={async () => {
                  if (!editJudge) return;
                  try {
                    await updateDoc(doc(db, "judge-users", editJudge.id), {
                      disabled: true,
                    });
                    setJudges((prev) =>
                      prev.map((j) =>
                        j.id === editJudge.id ? { ...j, disabled: true } : j
                      )
                    );
                    setDisableModalVisible(false);
                    setEditModalVisible(false);
                  } catch (e) {
                    Alert.alert("Error", "Failed to disable judge.");
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { fontWeight: "bold" }]}>
                  Yes
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    fontFamily: "inter_400Regular",
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
    fontFamily: "inter_400Regular",
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
    fontFamily: "inter_400Regular",
    color: "#333",
    fontWeight: "bold",
  },

  categoryChipTextActive: {
    fontFamily: "inter_400Regular",
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
    boxShadow: "0px 2px 2px rgba(0,0,0,0.3)",
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
    fontFamily: "inter_400Regular",
    fontSize: 16,
    marginBottom: 2,
  },

  judgeEmail: {
    color: "#555",
    fontFamily: "inter_400Regular",
    fontSize: 14,
  },

  judgeCategory: {
    color: "#bcbcbcff",
    fontFamily: "inter_400Regular",
    fontSize: 12,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontFamily: "inter_400Regular",
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
    fontFamily: "inter_400Regular",
    fontSize: 16,
  },

  paginationTextDisabled: {
    fontFamily: "inter_400Regular",
    color: "#aaa",
  },

  paginationInfo: {
    marginHorizontal: 10,
    fontFamily: "inter_400Regular",
    fontSize: 16,
    color: "#333",
  },

  // Modal styles
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    boxShadow: "0px 2px 3px rgba(0,0,0,0.3)",
  },

  modalHeader: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
    marginBottom: 18,
    alignItems: "flex-start",
  },

  headerTextModal: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#222",
    fontFamily: "inter_400Regular",
  },

  headerSubTextModal: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
    fontFamily: "inter_400Regular",
  },

  formContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 22,
  },

  textinput: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "100%",
    fontSize: 17,
    marginBottom: 2,
    fontFamily: "inter_400Regular",
  },

  dropdown: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "100%",
    fontSize: 16,
    marginBottom: 2,
    fontFamily: "inter_400Regular",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    gap: 12,
  },

  buttonDisableContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    gap: 5,
  },

  modalCreateButton: {
    flex: 1,
    backgroundColor: "#432344",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 6,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "inter_400Regular",
    textAlign: "center",
  },

  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#432344",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 6,
    backgroundColor: "#fff",
  },

  modalDisableButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#AA0003",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: "#fff",
  },

  modalOverlayCat: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContentCat: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 300,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },

  modalCloseIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the close icon is above other elements
  },

  modalTitleCat: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#432344",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "inter_400Regular",
  },

  modalButtonCat: {
    backgroundColor: "#E79300",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5, // Space between buttons
    alignItems: "center",
    width: "100%", // Full width button
    boxShadow: "0px 2px 3px rgba(0,0,0,0.4)",
  },

  modalButtonTextCat: {
    fontSize: 16,
    color: "#fff", // White text for contrast
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "inter_400Regular",
  },

  editButton: {
    backgroundColor: "#432344",
    borderRadius: 20,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // Disable Confirmation Modal Styles
  modalOverlayDisable: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContentDisable: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    width: 300,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "semibold",
    color: "#432344",
    marginBottom: 25,
    textAlign: "center",
    fontFamily: "inter_400Regular",
  },

  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%", // Adjust width to fit two buttons side by side
    elevation: 2,
    borderWidth: 1,
  },

  modalButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "semibold",
    letterSpacing: 1,
    fontFamily: "inter_400Regular",
  },
});
