document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const goToRegisterButton = document.getElementById('go-to-register');
    const registerButton = document.getElementById('register-button');
    const goToLoginButton = document.getElementById('go-to-login');
    const signOutButton = document.getElementById('sign-out-button');

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

    goToRegisterButton.addEventListener('click', () => {
        showElement(registerContainer);
        hideElement(loginContainer);
    });

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

    goToLoginButton.addEventListener('click', () => {
        showElement(loginContainer);
        hideElement(registerContainer);
    });

    signOutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            hideElement(mainContainer);
            showElement(loginContainer);
        });
    });

    checkUserStatus();
});
