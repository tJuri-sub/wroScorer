import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, TouchableOpacity, } from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import LoginAdmin from "./LoginScreenAdmin";


type RootStackParamList = {
    SignUp: undefined;
    JudgeScreen: undefined; // Add HomeAdmin to the route list
    LoginAdmin: undefined; // Add LoginAdmin to the route list
    // Add other screens here if needed
};

const LoginJudge = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');``
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);
        try {
          const response = await signInWithEmailAndPassword(auth, email, password);
          console.log(response);
      
          // 🧭 Navigate to Admin Home Screen after successful login
          navigation.reset({
            index: 0,
            routes: [{ name: 'JudgeScreen' }], // this should match the route name in App.tsx
          });
        } catch (error: any) {
          console.log(error);
          alert('Login failed: ' + error.message);
        } finally {
          setLoading(false);
        }
      };
      
    const loginAdmin = () => {
        console.log('Navigating to SignUpScreenAdmin');// Debugging line
        navigation.navigate('LoginAdmin'); // Ensure this matches the route name in App.tsx
    };

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 30, textAlign: 'center', marginBottom: 20 }}>Judge Login</Text>

            {/* Username */}
            {/* Email */}
            <TextInput 
            style={styles.input}
            value={email}
            placeholder="Email"
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}> 
            </TextInput>

            {/* Password */}
            <TextInput 
            style={styles.input}
            secureTextEntry={true}
            value={password}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}> 
            </TextInput>

            {/* Login Button */}
            {loading ? (
                <ActivityIndicator size="large" color="#0000f"/> 
            ): (
            <>
                <Button 
                    title="Login" 
                    onPress={signIn}/>
            </>
            )}

            {/* Navigate to Admin */}
            <TouchableOpacity onPress={loginAdmin}>
                <Text style={styles.textlink}>
                    Login as Admin
                </Text>
            </TouchableOpacity>


        </View>
    );
};

export default LoginJudge;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        height: 50,
        margin: 12,
        padding: 10,
        backgroundColor: '#f7f7f7',
        borderRadius: 5,
        borderColor: '#f7f7f7',
        borderWidth: 1,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1},
        shadowOpacity: 0.10,
        shadowRadius: 3,
    },
    textlink: {
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
        
    }
});
