document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const registerModalHTML = `
        <div id="register-container" class="register-modal" style="display: none;">
            <h2 class="modal-header">Register To Post Alligators</h2>
            <input class="input" type="email" id="register-email" placeholder="Enter Email To Sign Up">
            <br>
            <div class="password-container">
                <input class="input" type="password" id="register-password" placeholder="Create A Safe Password">
                <span class="password-toggle" onclick="togglePasswordVisibility('register-password')">👁️</span>
            </div>
            <br>
            <div class="password-container">
                <input class="input" type="password" id="confirm-password" placeholder="Confirm Password">
                <span class="password-toggle" onclick="togglePasswordVisibility('confirm-password')">👁️</span>
            </div>
            <br>
            <button id="register-button" class="button">Submit To Register</button>
            <br>
            <button id="go-to-login" class="button">Login</button> 
        </div>
    `;

    app.insertAdjacentHTML('beforeend', registerModalHTML);

    const registerButton = document.getElementById('register-button');
    const goToLoginButton = document.getElementById('go-to-login');

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
                    document.getElementById('login-container').style.display = 'flex';
                    document.getElementById('register-container').style.display = 'none';
                });
            })
            .catch(error => {
                console.error(error);
                alert(error.message);
            });
    });

    goToLoginButton.addEventListener('click', () => {
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('register-container').style.display = 'none';
    });
});
