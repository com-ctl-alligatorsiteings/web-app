const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const mainContainer = document.getElementById('main-container');
const addSightingModal = document.getElementById('add-sighting-modal');
const settingsModal = document.getElementById('settings-modal');
const mapContainer = document.getElementById('map-container');
const sightingsList = document.getElementById('sightings-list');
const nearbyListingModal = document.getElementById('nearby-listing-modal');

function showElement(element) {
    element.style.display = 'flex';
}

function hideElement(element) {
    element.style.display = 'none';
}

function toggleNavMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
    } else {
        navMenu.style.display = 'flex';
    }
}

function closeNavMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.style.display = 'none';
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}
