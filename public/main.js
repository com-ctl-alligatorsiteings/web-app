import { checkUserStatus, loginUser, registerUser, signOutUser } from './auth.js';
import { initMap } from './map.js';
import { saveSettings, startBackgroundLocationCheck } from './settings.js';
import { loadSightings, loadNearbySightings } from './sightings.js';
import { showElement, hideElement, toggleNavMenu, togglePasswordVisibility } from './ui.js';

// Event listeners and initializations
document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    loginUser(email, password);
});

document.getElementById('go-to-register').addEventListener('click', () => {
    showElement(registerContainer);
    hideElement(loginContainer);
});

document.getElementById('register-button').addEventListener('click', () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    registerUser(email, password, confirmPassword);
});

document.getElementById('go-to-login').addEventListener('click', () => {
    showElement(loginContainer);
    hideElement(registerContainer);
});

document.getElementById('sign-out-button').addEventListener('click', () => {
    signOutUser();
});

document.getElementById('save-settings-button').addEventListener('click', saveSettings);

document.getElementById('radius-input').addEventListener('input', function() {
    document.getElementById('radius-value').textContent = this.value;
});

document.getElementById('radius-value-input').addEventListener('input', function() {
    document.getElementById('radius-input').value = this.value;
    document.getElementById('radius-value').textContent = this.value;
});

document.getElementById('background-location-check-input').addEventListener('change', function() {
    settingsChanged = true;
});

checkUserStatus();
initMap();
