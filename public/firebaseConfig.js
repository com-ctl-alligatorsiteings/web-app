import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCpT_uutermdqFY1IOZ5GVyyDYDPYpbkgQ",
    authDomain: "alligator-site-ings.firebaseapp.com",
    projectId: "alligator-site-ings",
    storageBucket: "alligator-site-ings.appspot.com",
    messagingSenderId: "373616160158",
    appId: "1:373616160158:web:9831b0f2bad27870283a8f",
    measurementId: "G-68ZPGX7YLC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
