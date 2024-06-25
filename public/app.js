// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCpT_uutermdqFY1IOZ5GVyyDYDPYpbkgQ",
    authDomain: "alligator-site-ings.firebaseapp.com",
    projectId: "alligator-site-ings",
    storageBucket: "alligator-site-ings.appspot.com",
    messagingSenderId: "373616160158",
    appId: "1:373616160158:web:9831b0f2bad27870283a8f",
    measurementId: "G-68ZPGX7YLC"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const mainContainer = document.getElementById('main-container');
const addSightingModal = document.getElementById('add-sighting-modal');
const settingsModal = document.getElementById('settings-modal');
const mapContainer = document.getElementById('map-container');
const sightingsList = document.getElementById('sightings-list');
const nearbyListingModal = document.getElementById('nearby-listing-modal');

const loginButton = document.getElementById('login-button');
const goToRegisterButton = document.getElementById('go-to-register');
const registerButton = document.getElementById('register-button');
const goToLoginButton = document.getElementById('go-to-login');
const addSightingButton = document.getElementById('add-sighting-button');
const toggleViewButton = document.getElementById('toggle-view-button');
const submitSightingButton = document.getElementById('submit-sighting-button');
const cancelButton = document.getElementById('cancel-button');
const useCurrentLocationButton = document.getElementById('use-current-location-button');
const uploadImageButton = document.getElementById('upload-image-button');
const myPostsButton = document.getElementById('my-posts-button');
const settingsButton = document.getElementById('settings-button');
const saveSettingsButton = document.getElementById('save-settings-button');
const deleteAccountButton = document.getElementById('delete-account-button');
const resetPasswordButton = document.getElementById('reset-password-button');
const signOutButton = document.getElementById('sign-out-button');
const nearbyListingCloseButton = document.getElementById('nearby-listing-close-button');

let map;
let currentLocation = null;
let fileUri;
let fileType;
let userIP;
let showingMyPosts = false;
let notificationRadius = 0;
let backgroundLocationCheck = false;
let notificationTimestamps = {};
let settingsChanged = false;

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

function checkUserStatus() {
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

async function initMap() {
    await google.maps.importLibrary("marker");

    map = new google.maps.Map(document.getElementById('map-container'), {
        center: { lat: 20.773, lng: -156.01 },
        zoom: 12,
        mapId: '4f505fee87ba6a0b', // Replace with your actual map ID
    });

    map.addListener('click', (event) => {
        const coordinates = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        currentLocation = { lat: coordinates.lat, lon: coordinates.lng };
        loadSightings();
    });

    // Attempt to get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const coordinates = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(coordinates);
                map.setZoom(13);
                addUserLocationMarker(coordinates);
                loadNearbySightings();
                currentLocation = coordinates;
            },
            error => {
                console.error('Error getting location: ', error);
                // Fallback center if user denies location access or there's an error
                const fallbackCenter = { lat: 20.773, lng: -156.01 };
                map.setCenter(fallbackCenter);
                map.setZoom(12);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        // Fallback center if geolocation is not supported
        const fallbackCenter = { lat: 20.773, lng: -156.01 };
        map.setCenter(fallbackCenter);
        map.setZoom(12);
    }

    // Add a feature layer for localities.
    localityLayer = map.getFeatureLayer('LOCALITY');

    // Subscribe to map capabilities changes.
    map.addListener('mapcapabilities_changed', () => {
        const mapCapabilities = map.getMapCapabilities();
        if (!mapCapabilities.isDataDrivenStylingAvailable) {
            // Data-driven styling is not available, add a fallback.
            // Existing feature layers are also unavailable.
        }
    });
}

function addUserLocationMarker(coordinates) {
    class PulsatingMarker extends google.maps.OverlayView {
        constructor(position) {
            super();
            this.position = position;
            this.div = null;
        }

        onAdd() {
            this.div = document.createElement('div');
            this.div.className = 'pulsating-marker';
            const panes = this.getPanes();
            panes.overlayLayer.appendChild(this.div);
        }

        draw() {
            const overlayProjection = this.getProjection();
            const position = overlayProjection.fromLatLngToDivPixel(this.position);
            const div = this.div;
            if (div) {
                div.style.left = position.x + 'px';
                div.style.top = position.y + 'px';
            }
        }

        onRemove() {
            if (this.div) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
            }
        }
    }

    const marker = new PulsatingMarker(new google.maps.LatLng(coordinates.lat, coordinates.lng));
    marker.setMap(map);
}


function addSightingMarker(coordinates) {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = '🐊';

    new google.maps.marker.AdvancedMarkerElement({
        position: coordinates,
        map: map,
        content: markerElement
    });
}

function centerMap(lat, lon) {
    const coordinates = { lat, lng: lon };
    map.setCenter(coordinates);
    map.setZoom(13);
    addUserLocationMarker(coordinates);
    hideElement(sightingsList);
    showElement(mapContainer);
}

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

addSightingButton.addEventListener('click', () => {
    showElement(addSightingModal);
});

cancelButton.addEventListener('click', () => {
    hideElement(addSightingModal);
});

useCurrentLocationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            currentLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
            map.setCenter(currentLocation);
            addUserLocationMarker(currentLocation);
        });
    }
});

uploadImageButton.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
        fileUri = e.target.files[0];
        fileType = 'image';
    };
    fileInput.click();
});

submitSightingButton.addEventListener('click', () => {
    const description = document.getElementById('description-input').value;

    if (!description || !fileUri || !currentLocation) {
        alert('All fields are required!');
        return;
    }

    const userId = auth.currentUser.uid;
    const fileName = `${userId}/images/${new Date().getTime()}_${fileUri.name}`;
    const storageRef = storage.ref().child(fileName);
    storageRef.put(fileUri).then(snapshot => {
        snapshot.ref.getDownloadURL().then(downloadURL => {
            const timestamp = Date.now();
            const sighting = {
                userId,
                description,
                downloadUrl: downloadURL,
                type: 'image',
                latitude: currentLocation.lat,
                longitude: currentLocation.lon,
                timestamp,
                likes: 0,
                views: 0
            };

            db.collection('sightings').add(sighting)
                .then(docRef => {
                    alert('You successfully added an alligator post!');
                    hideElement(addSightingModal);
                    addSightingModal.querySelector('textarea').value = '';
                    fileUri = null;
                    currentLocation = null;
                    loadSightings();
                })
                .catch(error => {
                    console.error(error);
                    alert('Failed to add sighting');
                });
        });
    }).catch(error => {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please check your permissions.');
    });
});

signOutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        hideElement(mainContainer);
        showElement(loginContainer);
    });
});

toggleViewButton.addEventListener('click', () => {
    if (mapContainer.style.display !== 'none') {
        hideElement(mapContainer);
        showElement(sightingsList);
        toggleViewButton.textContent = 'Show Map View';
    } else {
        hideElement(sightingsList);
        showElement(mapContainer);
        toggleViewButton.textContent = 'Show List View';
    }
});

myPostsButton.addEventListener('click', () => {
    showingMyPosts = !showingMyPosts;
    if (showingMyPosts) {
        hideElement(mapContainer);
        showElement(sightingsList);
        loadUserPosts();
    } else {
        loadSightings();
    }
});

settingsButton.addEventListener('click', () => {
    showElement(settingsModal);
});

saveSettingsButton.addEventListener('click', () => {
    notificationRadius = parseFloat(document.getElementById('radius-input').value);
    backgroundLocationCheck = document.getElementById('background-location-check-input').checked;

    const userId = auth.currentUser.uid;
    const userSettings = {
        notificationRadius: notificationRadius,
        backgroundLocationCheck: backgroundLocationCheck
    };

    db.collection('users').doc(userId).set(userSettings, { merge: true })
        .then(() => {
            console.log('Settings saved');
            hideElement(settingsModal);
            settingsChanged = false;
            if (backgroundLocationCheck) {
                startBackgroundLocationCheck();
            }
            checkNearbySightings();
        })
        .catch(error => {
            console.error('Error saving settings:', error);
        });
});

deleteAccountButton.addEventListener('click', () => {
    const user = auth.currentUser;
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        user.delete().then(() => {
            alert('Account deleted successfully');
            hideElement(mainContainer);
            showElement(loginContainer);
        }).catch(error => {
            console.error('Error deleting account:', error);
            alert('Failed to delete account');
        });
    }
});

resetPasswordButton.addEventListener('click', () => {
    const email = auth.currentUser.email;
    auth.sendPasswordResetEmail(email).then(() => {
        alert('Password reset email sent. Please check your inbox.');
    }).catch(error => {
        console.error('Error sending password reset email:', error);
        alert('Failed to send password reset email');
    });
});

document.getElementById('radius-input').addEventListener('input', function() {
    const value = parseFloat(this.value).toFixed(1);
    document.getElementById('radius-value-input').value = value;
    document.getElementById('radius-value').textContent = value;
    settingsChanged = true;
});

document.getElementById('radius-value-input').addEventListener('input', function() {
    const value = parseFloat(this.value).toFixed(1);
    document.getElementById('radius-input').value = value;
    document.getElementById('radius-value').textContent = value;
    settingsChanged = true;
});

document.getElementById('background-location-check-input').addEventListener('change', function() {
    settingsChanged = true;
});

function startBackgroundLocationCheck() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            checkNearbySightings(userLocation);
        }, error => {
            console.error('Error watching position:', error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

nearbyListingCloseButton.addEventListener('click', () => {
    hideElement(nearbyListingModal);
});

function loadUserPosts() {
    sightingsList.innerHTML = '';
    const userId = auth.currentUser.uid;
    db.collection('sightings').where('userId', '==', userId).get().then(querySnapshot => {
        if (querySnapshot.empty) {
            const noPostsElement = document.createElement('div');
            noPostsElement.classList.add('no-posts');
            noPostsElement.innerHTML = `
                <p>You have no posts yet. Click below to add a sighting.</p>
                <button class="button" onclick="showElement(addSightingModal)">Add Sighting</button>
            `;
            sightingsList.appendChild(noPostsElement);
        } else {
            querySnapshot.forEach(doc => {
                const sighting = doc.data();
                const sightingElement = document.createElement('div');
                sightingElement.classList.add('sighting');
                sightingElement.innerHTML = `
                    <div class="sighting-body">
                        <p>${sighting.description}</p>
                        <div class="sighting-media">
                            <img src="${sighting.downloadUrl}" alt="Sighting Image" onclick="viewFullScreen('${sighting.downloadUrl}')">
                        </div>
                    </div>
                    <div class="sighting-footer">
                        <span class="sighting-location">Location: (${sighting.latitude}, ${sighting.longitude})</span>
                        <span class="sighting-likes">Likes: ${sighting.likes}</span>
                        <span class="sighting-views">Views: ${sighting.views}</span>
                        <button class="like-button" data-id="${doc.id}">Like</button>
                        <button class="delete-button" data-id="${doc.id}">Delete</button>
                        <button class="map-button" onclick="openInGoogleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Google Maps</button>
                        <button class="map-button" onclick="openInAppleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Apple Maps</button>
                        <button class="map-button" onclick="centerMap(${sighting.latitude}, ${sighting.longitude})">View on Map</button>
                    </div>
                `;
                sightingsList.appendChild(sightingElement);

                const deleteButton = sightingElement.querySelector('.delete-button');
                deleteButton.addEventListener('click', () => {
                    deleteSighting(doc.id);
                });

                const likeButton = sightingElement.querySelector('.like-button');
                likeButton.addEventListener('click', () => {
                    likeSighting(doc.id);
                });
            });
        }
    });
}

function viewFullScreen(url) {
    const fullScreenModal = document.createElement('div');
    fullScreenModal.classList.add('full-screen-modal');
    fullScreenModal.innerHTML = `
        <span class="close" onclick="document.body.removeChild(this.parentNode)">←</span>
        <img src="${url}" class="full-screen-image">
    `;
    document.body.appendChild(fullScreenModal);
}

function deleteSighting(sightingId) {
    db.collection('sightings').doc(sightingId).delete().then(() => {
        alert('Sighting deleted');
        loadUserPosts();
    }).catch(error => {
        console.error(error);
        alert('Failed to delete sighting');
    });
}

function updateViewCount(sightingId) {
    getUserIP().then(ip => {
        const sightingDoc = db.collection('sightings').doc(sightingId);
        sightingDoc.get().then(doc => {
            if (doc.exists) {
                const lastViewTimestamp = doc.data().lastViewTimestamp || {};
                const currentTime = Date.now();
                const sixHours = 6 * 60 * 60 * 1000;

                if (!lastViewTimestamp[ip] || (currentTime - lastViewTimestamp[ip]) > sixHours) {
                    lastViewTimestamp[ip] = currentTime;
                    sightingDoc.update({
                        views: firebase.firestore.FieldValue.increment(1),
                        lastViewTimestamp: lastViewTimestamp
                    }).then(() => {
                        console.log('View count updated');
                    }).catch(error => {
                        console.error('Error updating view count:', error);
                    });
                }
            }
        });
    });
}

function likeSighting(sightingId) {
    const userId = auth.currentUser.uid;
    const userRef = db.collection('users').doc(userId);

    userRef.get().then(doc => {
        if (doc.exists) {
            const likedSightings = doc.data().likedSightings || [];
            if (!likedSightings.includes(sightingId)) {
                likedSightings.push(sightingId);
                userRef.update({
                    likedSightings: likedSightings
                }).then(() => {
                    db.collection('sightings').doc(sightingId).update({
                        likes: firebase.firestore.FieldValue.increment(1)
                    }).then(() => {
                        console.log('Like count updated');
                    }).catch(error => {
                        console.error('Error updating like count:', error);
                    });
                }).catch(error => {
                    console.error('Error updating user likes:', error);
                });
            } else {
                alert('You have already liked this sighting');
            }
        }
    }).catch(error => {
        console.error('Error getting user document:', error);
    });
}

function getUserIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(error => {
            console.error('Error getting IP address:', error);
            return 'UNKNOWN_IP';
        });
}

function openInGoogleMaps(lat, lng) {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
}

function openInAppleMaps(lat, lng) {
    const url = `http://maps.apple.com/?q=${lat},${lng}`;
    window.open(url, '_blank');
}

function centerMap(lat, lon) {
    const coordinates = { lat, lng: lon };
    map.setCenter(coordinates);
    map.setZoom(13);
    addUserLocationMarker(coordinates);
    hideElement(sightingsList);
    showElement(mapContainer);
}

function loadSightings() {
    sightingsList.innerHTML = '';
    db.collection('sightings').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const sighting = doc.data();
            const sightingElement = document.createElement('div');
            sightingElement.classList.add('sighting');
            sightingElement.innerHTML = `
                <div class="sighting-body">
                    <p>${sighting.description}</p>
                    <div class="sighting-media">
                        <img src="${sighting.downloadUrl}" alt="Sighting Image" onclick="viewFullScreen('${sighting.downloadUrl}')">
                    </div>
                </div>
                <div class="sighting-footer">
                    <span class="sighting-location">Location: (${sighting.latitude}, ${sighting.longitude})</span>
                    <span class="sighting-likes">Likes: ${sighting.likes}</span>
                    <span class="sighting-views">Views: ${sighting.views}</span>
                    <button class="like-button" data-id="${doc.id}">Like</button>
                    <button class="map-button" onclick="openInGoogleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Google Maps</button>
                    <button class="map-button" onclick="openInAppleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Apple Maps</button>
                    <button class="map-button" onclick="centerMap(${sighting.latitude}, ${sighting.longitude})">View on Map</button>
                </div>
            `;
            sightingsList.appendChild(sightingElement);

            const likeButton = sightingElement.querySelector('.like-button');
            likeButton.addEventListener('click', () => {
                likeSighting(doc.id);
            });

            addSightingMarker({ lat: sighting.latitude, lng: sighting.longitude });

            updateViewCount(doc.id);
        });
    });
}

document.getElementById('radius-input').addEventListener('input', function() {
    document.getElementById('radius-value').textContent = this.value;
});

function checkNearbySightings(userLocation) {
    db.collection('sightings').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const sighting = doc.data();
            const distance = getDistance(userLocation, [sighting.latitude, sighting.longitude]);
            const notificationKey = `${sighting.latitude},${sighting.longitude}`;
            const currentTime = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (distance <= notificationRadius && (!notificationTimestamps[notificationKey] || (currentTime - notificationTimestamps[notificationKey]) > twentyFourHours)) {
                notificationTimestamps[notificationKey] = currentTime;
                alert('New sighting nearby!');
            }
        });
    });
}

function getDistance(loc1, loc2) {
    const [lat1, lon1] = loc1;
    const [lat2, lon2] = loc2;
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
}

function loadNearbySightings() {
    sightingsList.innerHTML = '';
    const bounds = map.getBounds();
    const minX = bounds.getSouthWest().lng();
    const minY = bounds.getSouthWest().lat();
    const maxX = bounds.getNorthEast().lng();
    const maxY = bounds.getNorthEast().lat();

    db.collection('sightings').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const sighting = doc.data();
            if (sighting.longitude >= minX && sighting.longitude <= maxX && sighting.latitude >= minY && sighting.latitude <= maxY) {
                const sightingElement = document.createElement('div');
                sightingElement.classList.add('sighting');
                sightingElement.innerHTML = `
                    <div class="sighting-body">
                        <p>${sighting.description}</p>
                        <div class="sighting-media">
                            <img src="${sighting.downloadUrl}" alt="Sighting Image" onclick="viewFullScreen('${sighting.downloadUrl}')">
                        </div>
                    </div>
                    <div class="sighting-footer">
                        <span class="sighting-location">Location: (${sighting.latitude}, ${sighting.longitude})</span>
                        <span class="sighting-likes">Likes: ${sighting.likes}</span>
                        <span class="sighting-views">Views: ${sighting.views}</span>
                        <button class="like-button" data-id="${doc.id}">Like</button>
                        <button class="map-button" onclick="openInGoogleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Google Maps</button>
                        <button class="map-button" onclick="openInAppleMaps(${sighting.latitude}, ${sighting.longitude})">Open in Apple Maps</button>
                        <button class="map-button" onclick="centerMap(${sighting.latitude}, ${sighting.longitude})">View on Map</button>
                    </div>
                `;
                sightingsList.appendChild(sightingElement);

                const likeButton = sightingElement.querySelector('.like-button');
                likeButton.addEventListener('click', () => {
                    likeSighting(doc.id);
                });

                addSightingMarker({ lat: sighting.latitude, lng: sighting.longitude });

                updateViewCount(doc.id);
            }
        });
    });
}

window.addEventListener('beforeunload', function(event) {
    if (settingsChanged) {
        event.preventDefault();
        event.returnValue = 'You have unsaved settings. Do you want to leave without saving?';
    }
});

checkUserStatus();
initMap();
