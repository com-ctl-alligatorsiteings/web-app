const addSightingButton = document.getElementById('add-sighting-button');
const submitSightingButton = document.getElementById('submit-sighting-button');
const cancelButton = document.getElementById('cancel-button');
const useCurrentLocationButton = document.getElementById('use-current-location-button');
const uploadImageButton = document.getElementById('upload-image-button');
const myPostsButton = document.getElementById('my-posts-button');
const settingsButton = document.getElementById('settings-button');
const saveSettingsButton = document.getElementById('save-settings-button');
const deleteAccountButton = document.getElementById('delete-account-button');
const resetPasswordButton = document.getElementById('reset-password-button');
const nearbyListingCloseButton = document.getElementById('nearby-listing-close-button');

let fileUri;
let fileType;
let showingMyPosts = false;
let notificationRadius = 0;
let backgroundLocationCheck = false;
let notificationTimestamps = {};
let settingsChanged = false;

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
