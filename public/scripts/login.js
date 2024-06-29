document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const loginModalHTML = `
        <div id="login-container" class="login-modal" style="display: none;">
            <h2 class="modal-header">Login To See Alligator Site-ings On A Map</h2>
            <br>
            <input class="input" type="email" id="login-email" placeholder="Enter Email To Login">
            <br>
            <div class="password-container">
                <input class="input" type="password" id="login-password" placeholder="Enter Password To Login">
                <span class="password-toggle" onclick="togglePasswordVisibility('login-password')">👁️</span>
            </div>
            <br>
            <button id="login-button" class="button">Submit To Login</button>
            <br>
            <button id="go-to-register" class="button">Register</button>
            <br>
            <p class="modal-paragraph">
                Welcome To The Alligator Site-ing (Sighting, Site)Map
                Do Not Use This Map For Illegal Activities! This Map Is Meant To Be Used To Avoid Alligators Or Maybe Perchance See One!
                Please Use This App Responsibly! By Using This App You Agree To Claim Responsibility For Anything That May Happen Because Of Using This App. 
                The App Or Website Cannot Be Held Responsible For Anything You May See On This App Or Anything You Don't See On This App!
                The Website Or App Reserves The Right To Collect Users Data, That Data Includes, But Is Not Limited To "Photos, Videos, Email Addresses and User Location At Time Of Posting"
            </p>
        </div>
    `;

    app.insertAdjacentHTML('beforeend', loginModalHTML);

    const loginButton = document.getElementById('login-button');
    const goToRegisterButton = document.getElementById('go-to-register');

    loginButton.addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                document.getElementById('main-container').style.display = 'flex';
                document.getElementById('login-container').style.display = 'none';
            })
            .catch(error => {
                console.error(error);
                alert(error.message);
            });
    });

    goToRegisterButton.addEventListener('click', () => {
        document.getElementById('register-container').style.display = 'flex';
        document.getElementById('login-container').style.display = 'none';
    });
});

function togglePasswordVisibility(id) {
    const passwordInput = document.getElementById(id);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}
