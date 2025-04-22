import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error: any) {
            console.log(error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    const signUp = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert('Check your email!');
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <TextInput 
            style={styles.input}
            value={email}
            placeholder="Email"
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}> 
            </TextInput>
            <TextInput 
            style={styles.input}
            secureTextEntry={true}
            value={password}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}> 
            </TextInput>

            {loading ? (
                <ActivityIndicator size="large" color="#0000f"/> 
            ): (
            <>
                <Button 
                    title="Login" 
                    onPress={signIn}/>
            </>
            )}
        </View>
    );
};

export default Login;

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

    }
});