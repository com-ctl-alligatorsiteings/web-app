import { auth, db } from './firebaseConfig.js';
import { showElement, hideElement } from './ui.js';

export function checkUserStatus() {
    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            if (!user.emailVerified) {
                alert("Please verify your email address to access the app.");
                auth.signOut();
                return;
            }
            db.collection('users').doc(userId).get()
                .then(doc => {
                    if (doc.exists) {
                        const userSettings = doc.data();
                        // Load user settings and apply them
                    }
                    showElement(mainContainer);
                    hideElement(loginContainer);
                    hideElement(registerContainer);
                })
                .catch(error => {
                    console.error('Error loading settings:', error);
                });
        } else {
            hideElement(mainContainer);
            showElement(loginContainer);
        }
    });
}

export function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showElement(mainContainer);
            hideElement(loginContainer);
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

export function registerUser(email, password, confirmPassword) {
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            auth.currentUser.sendEmailVerification().then(() => {
                alert('Verification email sent. Please check your inbox.');
                showElement(loginContainer);
                hideElement(registerContainer);
            });
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
        });
}

export function signOutUser() {
    auth.signOut().then(() => {
        hideElement(mainContainer);
        showElement(loginContainer);
    });
}
