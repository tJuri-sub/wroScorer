import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Login from "./LoginScreenAdmin";
import VerifyEmailScreen from "./accountManage/VerifyEmailScreen";
import bcrypt from 'react-native-bcrypt'; //hashing passwords
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { NavigationProp } from "@react-navigation/native";
import { Alert } from "react-native";

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;
    
    type RootStackParamList = {
        Login: undefined;
        VerifyEmail: undefined;
        // Add other routes here if needed
    };
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const signIn = () => {
        navigation.navigate('Login' as never);
    };

    // Email Validation Functions
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const checkEmailDuplication = async (email: string) => {
        try {
            const methods = await fetchSignInMethodsForEmail(FIREBASE_AUTH, email);
            return methods.length > 0; // If methods exist, email is already in use
        } catch (error) {
            console.log('Error checking email duplication:', error);
            return false;
        }
    };

    // Password Validation Functions
    const isAtLeast8Characters = (password: string) => {
        return password.length >= 8;
    };

    const hasUppercase = (password: string) => {
        return /[A-Z]/.test(password);
    };

    const hasLowercase = (password: string) => {
        return /[a-z]/.test(password);
    };

    const hasNumber = (password: string) => {
        return /\d/.test(password);
    };

    const hasSpecialCharacter = (password: string) => {
        return /[@$!%*?&]/.test(password);
    };

    const validatePassword = (password: string) => {
        if (!isAtLeast8Characters(password)) {
            alert("Password must be at least 8 characters long.");
            return false;
        }
        if (!hasUppercase(password)) {
            alert("Password must include at least one uppercase letter.");
            return false;
        }
        if (!hasLowercase(password)) {
            alert("Password must include at least one lowercase letter.");
            return false;
        }
        if (!hasNumber(password)) {
            alert("Password must include at least one number.");
            return false;
        }
        if (!hasSpecialCharacter(password)) {
            alert("Password must include at least one special character (@$!%*?&).");
            return false;
        }
        return true;
    };

    const checkPasswordUniqueness = async (email: string, password: string) => {
        try {
            const userDocRef = doc(FIREBASE_DB, "admin-users", email); // Reference to the user's document
            const userDoc = await getDoc(userDocRef);
    
            if (userDoc.exists()) {
                const { previousPasswords } = userDoc.data();
                for (const hashedPassword of previousPasswords) {
                    if (bcrypt.compareSync(password, hashedPassword)) {
                        return false; // Password is not unique
                    }
                }
            }
            return true; // Password is unique
        } catch (error) {
            console.log("Error checking password uniqueness:", error);
            return false;
        }
    };

    const storePassword = async (email: string, password: string) => {
        try {
            const userDocRef = doc(FIREBASE_DB, "admin-users", email);
            const userDoc = await getDoc(userDocRef);
    
            const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password
    
            if (userDoc.exists()) {
                const { previousPasswords } = userDoc.data();
                // Update the list of previous passwords
                await updateDoc(userDocRef, {
                    previousPasswords: [...(previousPasswords || []), hashedPassword],
                });
            } else {
                // Create a new document for the user
                await setDoc(userDocRef, {
                    email,
                    previousPasswords: [hashedPassword],
                });
            }
        } catch (error) {
            console.log("Error storing password:", error);
        }
    };

    // Sign Up Function
    const signUp = async () => {
        // Email validation
        if (!email.trim()) {
            alert('Email cannot be empty!');
            return;
        }
        if (!validateEmail(email)) {
            alert('Invalid email format!');
            return;
        }
        if (await checkEmailDuplication(email)) {
            alert('Email is already in use!');
            return;
        }
        // Password validation
        if (!password.trim()) {
            alert('Password cannot be empty!');
            return;
        }
        if (!validatePassword(password)) {
            return;
        }
        if (!await checkPasswordUniqueness(email, password)) {
            alert('Password has been used before! Please choose a different password.');
            return;
        }
        if (password !== confirmpassword) {
            alert('Passwords do not match!');
            return;
        }
        if (password !== confirmpassword) {
            alert('Passwords do not match!');
            return;
        }

        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);

            // Store the new password in the database
            await storePassword(email, password);
            
            // Alert.alert(
            //     'Account created successfully!',
            //     '',
            //     [
            //         {
            //             text: 'OK',
            //             onPress: () => {
            //                 navigation.navigate('Login');
            //             }, 
            //         },
            //     ]
            // );
            // Send email verification
            if (response.user) {
                await sendEmailVerification(response.user);
                alert('Account created successfully! A verification email has been sent to your email address.');
            }

            // Navigate to VerifyEmailScreen
            navigation.navigate('VerifyEmail');
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
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

            {/* Confirm Password */}
            <TextInput 
            style={styles.input}
            secureTextEntry={true}
            value={confirmpassword}
            placeholder="Confirm Password"
            autoCapitalize="none"
            onChangeText={(text) => setConfirmPassword(text)}> 
            </TextInput>

            {/* Create User Button */}
            {loading ? (
                <ActivityIndicator size="large" color="#0000f"/> 
            ): (
            <>
                <Button 
                    title="Create Account"
                    onPress={signUp}/> 
            </>
            )}

            {/* Login In Link */}
            <TouchableOpacity onPress={signIn}>
                            <Text style={styles.textlink}>
                                Sign In
                            </Text>
            </TouchableOpacity>
            

        </View>
    );
};

export default SignUp;

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