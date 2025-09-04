import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseconfig";
import { Dropdown } from "react-native-element-dropdown";
import { getAuth } from "firebase/auth";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";
import { SafeAreaProvider } from "react-native-safe-area-context";
import styles from "../../components/styles/adminStyles/AllJudgesscreenStyle";

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

export default function AllJudgesScreen({ navigation }: any) {
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

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [judgeToDelete, setJudgeToDelete] = useState<any | null>(null);

  // Initialize Firebase
  const auth = getAuth();
  const db = getFirestore();
  const user = FIREBASE_AUTH.currentUser;

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
    });
  }, [navigation]);

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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
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
                      <Text style={styles.judgeCategory}>{categoryLabel}</Text>
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
                      gap: 8,
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
                              Alert.alert("Error", "Failed to restore judge.");
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
                              foundMainCat ? foundMainCat.value : item.category
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

                    {/* Delete Button */}
                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        { backgroundColor: "#AA0003" },
                      ]}
                      onPress={() => {
                        setJudgeToDelete(item);
                        setDeleteModalVisible(true);
                      }}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={20}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListHeaderComponent={
              <View>
                <Text style={styles.headerText}>
                  All Judges ({filteredJudges.length})
                </Text>
                <TextInput
                  placeholder="Search judge name..."
                  placeholderTextColor="#999999"
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
                          category === cat.value &&
                            styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
            ListFooterComponent={
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
                    <AntDesign name="left" size={16} color="black" />
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
                    <AntDesign name="right" size={16} color="black" />
                  </Text>
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No judges found.</Text>
            }
            scrollEnabled={true}
          />
        )}
      </SafeAreaView>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlayDisable}>
          <View style={styles.modalContentDisable}>
            <Text style={styles.modalTitle}>
              Are you sure you want to permanently delete this judge?
            </Text>
            <View style={styles.modalButtonContainer}>
              {/* Cancel */}
              <Pressable
                style={[styles.modalButton, { borderColor: "#432344" }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#432344" }]}>
                  Cancel
                </Text>
              </Pressable>

              {/* Confirm Delete */}
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: "#AA0003", borderColor: "#AA0003" },
                ]}
                onPress={async () => {
                  if (!judgeToDelete) return;
                  try {
                    await deleteDoc(
                      doc(FIREBASE_DB, "judge-users", judgeToDelete.id)
                    );
                    setJudges((prev) =>
                      prev.filter((j) => j.id !== judgeToDelete.id)
                    );
                    setDeleteModalVisible(false);
                    setJudgeToDelete(null);
                  } catch (e) {
                    console.error("Error deleting judge:", e);
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { fontWeight: "bold" }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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

      <Modal
        visible={disableModalVisible}
        transparent
        animationType="none"
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
    </SafeAreaProvider>
  );
}
