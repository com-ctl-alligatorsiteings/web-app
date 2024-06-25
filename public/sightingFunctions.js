document.addEventListener('DOMContentLoaded', () => {
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

    if (addSightingButton) {
        addSightingButton.addEventListener('click', () => {
            showElement(addSightingModal);
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            hideElement(addSightingModal);
        });
    }

    if (useCurrentLocationButton) {
        useCurrentLocationButton.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    currentLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
                    map.setCenter(currentLocation);
                    addUserLocationMarker(currentLocation);
                });
            }
        });
    }

    if (uploadImageButton) {
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
    }

    if (submitSightingButton) {
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
    }

    if (myPostsButton) {
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
    }

    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            showElement(settingsModal);
        });
    }

    if (saveSettingsButton) {
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
    }

    if (deleteAccountButton) {
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
    }

    if (resetPasswordButton) {
        resetPasswordButton.addEventListener('click', () => {
            const email = auth.currentUser.email;
            auth.sendPasswordResetEmail(email).then(() => {
                alert('Password reset email sent. Please check your inbox.');
            }).catch(error => {
                console.error('Error sending password reset email:', error);
                alert('Failed to send password reset email');
            });
        });
    }

    if (nearbyListingCloseButton) {
        nearbyListingCloseButton.addEventListener('click', () => {
            hideElement(nearbyListingModal);
        });
    }
});
