document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const settingsModalHTML = `
        <div id="settings-modal" class="settings-modal" style="display: none;">
            <span class="close" onclick="hideElement(settingsModal)">⬅</span>
            <h2 class="modal-header">Settings</h2>
            <div class="modal-paragraph">
                <span class="info-circle" title="Set the radius in miles within which you want to receive notifications about alligator sightings.">ℹ</span>
                <br>
                <label for="radius-input">Set the radius in miles within which you want to receive notifications about alligator sightings:</label>
                <br>
                <input class="input" type="range" id="radius-input" name="radius-input" min="0.1" max="400" step="0.1" value="0.1">
                <input class="input" type="number" id="radius-value-input" min="0.1" max="400" step="0.1" value="0.1">
            </div>
            <br>
            <div class="modal-paragraph">
                <span class="info-circle" title="Enable background location checking to receive notifications about alligator sightings within the set radius even when the app is not open.">ℹ</span>
                <br>
                <label for="background-location-check-input">Enable background location checking to receive notifications about alligator sightings within the set radius even when the app is not open:</label>
                <br>
                <label class="switch">
                    <input type="checkbox" id="background-location-check-input" name="background-location-check-input">
                    <span class="slider"></span>
                </label>
            </div>
            <br>
            <button class="button" id="delete-account-button">Delete Account</button>
            <br>
            <button class="button" id="reset-password-button">Reset Password</button>
            <br>
            <button class="button" id="sign-out-button">Sign Out</button>
            <br>
            <button class="button" id="save-settings-button">Save Settings</button>
        </div>
    `;

    app.insertAdjacentHTML('beforeend', settingsModalHTML);

    const settingsButton = document.getElementById('settings-button');
    const saveSettingsButton = document.getElementById('save-settings-button');

    settingsButton.addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'flex';
    });

    saveSettingsButton.addEventListener('click', () => {
        const notificationRadius = parseFloat(document.getElementById('radius-input').value);
        const backgroundLocationCheck = document.getElementById('background-location-check-input').checked;

        const userId = auth.currentUser.uid;
        const userSettings = {
            notificationRadius: notificationRadius,
            backgroundLocationCheck: backgroundLocationCheck
        };

        db.collection('users').doc(userId).set(userSettings, { merge: true })
            .then(() => {
                console.log('Settings saved');
                document.getElementById('settings-modal').style.display = 'none';
                if (backgroundLocationCheck) {
                    startBackgroundLocationCheck();
                }
                checkNearbySightings();
            })
            .catch(error => {
                console.error('Error saving settings:', error);
            });
    });

    document.getElementById('radius-input').addEventListener('input', function() {
        const value = parseFloat(this.value).toFixed(1);
        document.getElementById('radius-value-input').value = value;
        document.getElementById('radius-value').textContent = value;
    });

    document.getElementById('radius-value-input').addEventListener('input', function() {
        const value = parseFloat(this.value).toFixed(1);
        document.getElementById('radius-input').value = value;
        document.getElementById('radius-value').textContent = value;
    });

    document.getElementById('background-location-check-input').addEventListener('change', function() {
        // Handle the background location check change
    });
});
