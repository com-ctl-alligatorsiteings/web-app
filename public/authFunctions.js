document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const goToRegisterButton = document.getElementById('go-to-register');
    const registerButton = document.getElementById('register-button');
    const goToLoginButton = document.getElementById('go-to-login');
    const signOutButton = document.getElementById('sign-out-button');
    const mainContainer = document.getElementById('main-container');
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    showElement(mainContainer);
                    hideElement(loginContainer);
                })
                .catch(error => {
                    console.error(error);
                    alert(error.message);
                });
        });
    }

    if (goToRegisterButton) {
        goToRegisterButton.addEventListener('click', () => {
            showElement(registerContainer);
            hideElement(loginContainer);
        });
    }

    if (registerButton) {
        registerButton.addEventListener('click', () => {
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

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
        });
    }

    if (goToLoginButton) {
        goToLoginButton.addEventListener('click', () => {
            showElement(loginContainer);
            hideElement(registerContainer);
        });
    }

    if (signOutButton) {
        signOutButton.addEventListener('click', () => {
            auth.signOut().then(() => {
                hideElement(mainContainer);
                showElement(loginContainer);
            });
        });
    }

    checkUserStatus();
});

function checkUserStatus() {
    auth.onAuthStateChanged(user => {
        const mainContainer = document.getElementById('main-container');
        const loginContainer = document.getElementById('login-container');
        const registerContainer = document.getElementById('register-container');

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
                        notificationRadius = userSettings.notificationRadius || 0;
                        backgroundLocationCheck = userSettings.backgroundLocationCheck || false;

                        document.getElementById('radius-input').value = notificationRadius;
                        document.getElementById('radius-value-input').value = notificationRadius;
                        document.getElementById('background-location-check-input').checked = backgroundLocationCheck;

                        if (backgroundLocationCheck) {
                            startBackgroundLocationCheck();
                        }
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
