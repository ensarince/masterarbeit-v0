import { useEffect } from 'react'
import { auth, provider, signInWithPopup, signOut } from "../../firebase"; 
import { onAuthStateChanged, User } from "firebase/auth"; 

import styles from "./Authentication.module.scss"

type Props = {
    user: User | null;
    setUser: (user: User | null) => void;
}

export default function Authentication({
    user,
    setUser
}: Props) {

    const handleSignIn = () => {
        signInWithPopup(auth, provider)
            .then((result) => setUser(result.user))
            .catch((error) => console.error("Error signing in:", error));
    };

    const handleSignOut = () => {
        signOut(auth)
            .then(() => setUser(null))
            .catch((error) => console.error("Error signing out:", error));
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

  return (
    <div className={styles.auth}>
    {user ? (
        <>
            <p>Welcome, {user.displayName}</p>
            <button onClick={handleSignOut}>Sign Out</button>
        </>
    ) : (
        <button 
            onClick={handleSignIn}>
                Sign in with Google
        </button>
    )}
</div>
)
}