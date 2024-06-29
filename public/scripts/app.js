document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const mainContainerHTML = `
        <div id="main-container" class="main-container" style="display: none;">
            <nav>
                <div id="hamburger-menu" class="hamburger-menu" onclick="toggleNavMenu()">
                    ☰
                </div>
                <div id="nav-menu" class="nav-menu" style="display: none;">
                    <div id="hamburger-menu-back" class="hamburger-menu-back" onclick="toggleNavMenu()">
                        ⬅
                    </div>
                    <button id="add-sighting-button" class="nav-button">Add Sighting</button>
                    <button id="toggle-view-button" class="nav-button">Show List View</button>
                    <button id="my-posts-button" class="nav-button">My Posts</button>
                    <button id="settings-button" class="nav-button">Settings</button>
                </div>
            </nav>
            <div id="map-container" class="map-container" style="width: 100%; height: 500px;"></div>
            <div id="sightings-list" class="sightings-list" style="display: flex;"></div>
        </div>
    `;

    app.insertAdjacentHTML('beforeend', mainContainerHTML);

    loadScript('scripts/login.js');
    loadScript('scripts/register.js');
    loadScript('scripts/addSighting.js');
    loadScript('scripts/settings/settingsModal.js');
    loadScript('scripts/settings/deleteAccount.js');
    loadScript('scripts/settings/resetPassword.js');
    loadScript('scripts/settings/signOut.js');

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
