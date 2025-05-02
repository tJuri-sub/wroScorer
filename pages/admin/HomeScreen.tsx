import React, {useState} from 'react';
import { Text, StyleSheet, View, Button, Alert, Pressable, Modal, TextInput } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import Login from "../LoginScreenAdmin"; 


export default function HomeScreenAdmin({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  // Initialize Firebase
  const auth = getAuth();
  const db = getFirestore();

  const createJudgeAccount = async (username: string, password: string) => {
    try {
        // Generate a fake email from username
        const email = `judge_${username}@felta.org`;

        // Save the currently logged-in admin user
        const currentAdmin = FIREBASE_AUTH.currentUser;

        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Store username in Firestore
        const user = userCredential.user;
        await setDoc(doc(db, "judge-users", user.uid), {
            username,
            role: "judge", // Example: Assigning a 'judge' role
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
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setModalVisible(false);
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
                  onChangeText={(text) => setEmail(text)}
                  style={styles.textinput}>
                </TextInput>
                <TextInput
                  placeholder="Password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={(text) => setPassword(text)}
                  style={styles.textinput}>
                </TextInput>
                <TextInput
                  placeholder="Confirm Password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={(text) => setConfirmPassword(text)}
                  style={styles.textinput}>
                </TextInput>
                <Button
                  title="Create Judge Account"
                  onPress={() => createJudgeAccount(email, password)}
                />
                <Pressable
                  style={{marginTop: 20}}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={{color: 'blue'}}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Button onPress={() => setModalVisible(true)} title='+'/>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensure SafeAreaView takes up the full screen
  },
  container: {
    flex: 1, // Ensure the container fills the SafeAreaView
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    marginHorizontal: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20, // Add spacing between the text and the button
  },
  textinput: {
    borderWidth: 1, 
    marginBottom: 10, 
    padding: 5
  },
  modal:{
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  modalContent:{
    width: 300, 
    height: 300, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 20
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 50,
    padding: 10,
    elevation: 2,
  },
});