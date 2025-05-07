import React from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { sendEmailVerification } from "firebase/auth";

const VerifyEmail = ({ navigation }: any) => {
    // Function to resend the verification email
    const handleResendEmail = async () => {
        try {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                await sendEmailVerification(user);
                Alert.alert("Success", "Verification email resent!");
            } else {
                Alert.alert("Error", "No user is currently signed in.");
            }
        } catch (error: any) {
            console.error("Error resending verification email:", error);
            Alert.alert("Error", "Failed to resend verification email.");
        }
    };

    // Function to check if the email is verified
    const handleCheckVerification = async () => {
        try {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                await user.reload(); // Reload user data
                if (user.emailVerified) {
                    Alert.alert(
                        "Success",
                        "Email verified!",
                        [
                            {
                                text: "OK",
                                onPress: () => navigation.navigate("Inside"), // Navigate to HomeScreen or Inside
                            },
                        ]
                    );
                } else {
                    Alert.alert("Not Verified", "Email is not verified yet. Please check your inbox.");
                }
            } else {
                Alert.alert("Error", "No user is currently signed in.");
            }
        } catch (error: any) {
            console.error("Error checking email verification:", error);
            Alert.alert("Error", "Failed to check email verification.");
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                A verification email has been sent to your email address. Please verify your email to continue.
            </Text>
            <Button title="Resend Email" onPress={handleResendEmail} />
            <Button title="Check Verification" onPress={handleCheckVerification} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    text: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
});

export default VerifyEmail;