import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, Button, Alert, Pressable, Modal, TextInput, FlatList } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore";

export default function HomeScreenAdmin({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState(null);
  const [confirmpassword, setConfirmPassword] = useState('');
  interface JudgeUser {
    id: string;
    username: string;
    category: string;
  }

  const [judgeUsers, setJudgeUsers] = useState<JudgeUser[]>([]); // State to store judge users

  // Initialize Firebase
  const auth = getAuth();
  const db = getFirestore();

  const categorydata = [
    { label: 'Robomission Elementary', value: 'robo-elem' },
    { label: 'Robomission Junior', value: 'robo-junior' },
    { label: 'Robomission Senior', value: 'robo-senior' },
    { label: 'Future Innovators', value: 'future-innov' },
    { label: 'Future Engineers', value: 'future-eng' },
  ];

  // Fetch judge users from Firestore
  useEffect(() => {
    const fetchJudgeUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "judge-users"));
        const users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username || '',
          category: doc.data().category || '',
        })) as JudgeUser[];
        setJudgeUsers(users);
      } catch (error) {
        console.error("Error fetching judge users:", error);
      }
    };

    fetchJudgeUsers();
  }, []);

  const createJudgeAccount = async () => {
    try {
      // Validate input fields
      if (!username.trim()) {
        Alert.alert("Error", "Username cannot be empty!");
        return;
      }
      if (!password.trim()) {
        Alert.alert("Error", "Password cannot be empty!");
        return;
      }
      if (password !== confirmpassword) {
        Alert.alert("Error", "Passwords do not match!");
        return;
      }
      if (!category) {
        Alert.alert("Error", "Please select a category!");
        return;
      }

      console.log("Selected category:", category);

      // Generate a fake email from username
      const email = `judge_${username}@felta.org`;

      // Save the currently logged-in admin user
      const currentAdmin = FIREBASE_AUTH.currentUser;

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Store username and category in Firestore
      const user = userCredential.user;
      await setDoc(doc(db, "judge-users", user.uid), {
        username,
        role: "judge", // Example: Assigning a 'judge' role
        category: category, // Store the selected category
        email,
      });

      // Sign out the newly created judge account
      await FIREBASE_AUTH.signOut();

      // Re-authenticate the admin user
      if (currentAdmin) {
        await FIREBASE_AUTH.updateCurrentUser(currentAdmin);
      }

      // Show success alert
      Alert.alert("Success", "Judge account created successfully!");

      // Reset form fields and close modal
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setCategory(null);
      setModalVisible(false);

      // Refresh the judge users list
      const querySnapshot = await getDocs(collection(db, "judge-users"));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username || '',
        category: doc.data().category || '',
      })) as JudgeUser[];
      setJudgeUsers(users);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
        console.error("Error creating judge account:", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred.");
        console.error("Error creating judge account:", error);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.text}>Hello Admin!</Text>

           {/* Manage Categories */}
           <FlatList
              data={categorydata}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() => navigation.navigate("CategoryScreen", { category: item.value, label: item.label })}
                >
                  <Text style={styles.cardText}>{item.label}</Text>
                </Pressable>
              )}
              ListEmptyComponent={<Text>No categories found.</Text>}
            />

          {/* Modal for Creating Judge Account */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.modal}>
              <View style={styles.modalContent}>
                <Text>Create User Judge</Text>
                <TextInput
                  placeholder="Username"
                  autoCapitalize="none"
                  onChangeText={(text) => setUsername(text)}
                  style={styles.textinput}
                />
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  data={categorydata}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Category"
                  searchPlaceholder="Search..."
                  value={category}
                  onChange={item => {
                    console.log("Dropdown selected:", item.value);
                    setCategory(item.value);
                  }}
                />
                <TextInput
                  placeholder="Password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={(text) => setPassword(text)}
                  style={styles.textinput}
                />
                <TextInput
                  placeholder="Confirm Password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={(text) => setConfirmPassword(text)}
                  style={styles.textinput}
                />
                <Button
                  title="Create Judge Account"
                  onPress={createJudgeAccount}
                />
                <Pressable
                  style={{ marginTop: 20 }}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={{ color: 'blue' }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Manage Judge Users */}
          <View>
            <FlatList
              data={judgeUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                  // Find the label for the stored category value
                  const categoryLabel = categorydata.find((cat) => cat.value === item.category)?.label || item.category;

                  return (
                      <View style={styles.card}>
                          <Text style={styles.cardText}>Username: {item.username}</Text>
                          <Text style={styles.cardText}>Category: {categoryLabel}</Text>
                      </View>
                  );
              }}
              ListEmptyComponent={<Text>No judge users found.</Text>}
              style={{ marginTop: 20 }}
          />
          <Button onPress={() => setModalVisible(true)} title="+" />
          </View>

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  textinput: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
  },
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    height: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
  },
});