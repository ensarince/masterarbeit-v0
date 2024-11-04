// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBI68OKQaoYIAQgYxvvVD_BhTqpdkVzCy8",
    authDomain: "my-first-gpt-5202f.firebaseapp.com",
    projectId: "my-first-gpt-5202f",
    storageBucket: "my-first-gpt-5202f.firebasestorage.app",
    messagingSenderId: "1073200356196",
    appId: "1:1073200356196:web:f63c396e68f888efcbb871",
    measurementId: "G-5TB7210778"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider, signInWithPopup, signOut };
