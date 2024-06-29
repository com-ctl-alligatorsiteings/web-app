document.addEventListener('DOMContentLoaded', () => {
    loadStylesheet('scripts/styles.css');
    loadScript('scripts/firebaseConfig.js', checkAuth);
    loadScript('scripts/login.js');
    loadScript('scripts/register.js');
    loadScript('scripts/addSighting.js');
    loadScript('scripts/settings/settingsModal.js');
    loadScript('scripts/settings/deleteAccount.js');
    loadScript('scripts/settings/resetPassword.js');
    loadScript('scripts/settings/signOut.js');

    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function loadStylesheet(url) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    }

    function checkAuth() {
        loadScript('scripts/auth.js', () => {
            auth.onAuthStateChanged(user => {
                if (user) {
                    showMainContainer();
                } else {
                    showLogin();
                }
            });
        });
    }

    function showMainContainer() {
        loadScript('scripts/mainContainer.js');
    }

    function showLogin() {
        loadScript('scripts/login.js');
    }

    let map;
    let currentLocation = null;

    window.initMap = function() {
        map = new google.maps.Map(document.getElementById('map-container'), {
            center: { lat: 0, lng: 0 },
            zoom: 2,
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                map.setCenter(pos);
                addUserLocationMarker(pos);
            }, () => {
                console.error('Error getting location.');
            });
        } else {
            console.error('Browser doesn\'t support Geolocation');
        }
    }

    function addUserLocationMarker(location) {
        new google.maps.Marker({
            position: location,
            map: map,
            title: 'Your Location',
        });
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
        document.getElementById('nav-menu').style.display = 'none';
    }

    function closeNavMenuOnClickOutside(event) {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu.contains(event.target) && !event.target.matches('.hamburger-menu')) {
            closeNavMenu();
        }
    }

    document.addEventListener('click', closeNavMenuOnClickOutside);

    function loadScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        document.head.appendChild(script);
    }
});
