// Authentication Context - provides auth state and helper functions app-wide
import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile } from '../firebase/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register new user with email and password
    async function register(email, password, displayName) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Set the display name on the Firebase Auth profile
        await updateProfile(result.user, { displayName });
        // Initialize user profile document in Firestore
        await getUserProfile(result.user.uid);
        return result;
    }

    // Login with email and password
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Login with Google OAuth (popup flow)
    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // Ensure Firestore profile exists
        await getUserProfile(result.user.uid);
        return result;
    }

    // Sign out the current user
    function logout() {
        return signOut(auth);
    }

    // Listen for auth state changes (runs once on mount)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = { currentUser, register, login, loginWithGoogle, logout };

    // Don't render children until Firebase auth state is known
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Custom hook to access auth context from any component
export function useAuth() {
    return useContext(AuthContext);
}
