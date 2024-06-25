import { db, auth } from './firebaseConfig.js';
import { hideElement } from './ui.js';

export let notificationRadius = 0;
export let backgroundLocationCheck = false;

export function saveSettings() {
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
}

export function startBackgroundLocationCheck() {
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
