// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCpT_uutermdqFY1IOZ5GVyyDYDPYpbkgQ",
    authDomain: "alligator-site-ings.firebaseapp.com",
    projectId: "alligator-site-ings",
    storageBucket: "alligator-site-ings.appspot.com",
    messagingSenderId: "373616160158",
    appId: "1:373616160158:web:9831b0f2bad27870283a8f",
    measurementId: "G-68ZPGX7YLC"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
