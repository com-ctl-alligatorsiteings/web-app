document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const addSightingModalHTML = `
        <div id="add-sighting-modal" class="add-sighting-modal" style="display: none;">
            <span class="close" onclick="hideElement(addSightingModal)">⬅</span>
            <h2 class="modal-header">Add Sighting</h2>
            <textarea class="input" id="description-input" placeholder="Description"></textarea>
            <br>
            <button class="button" id="use-current-location-button">Use Current Location</button>
            <div>
                <button class="button" id="upload-image-button">Upload Image</button>
            </div>
            <br>
            <button class="button" id="submit-sighting-button">Submit</button>
            <br>
            <button class="button" id="cancel-button">Cancel</button>
        </div>
    `;

    app.insertAdjacentHTML('beforeend', addSightingModalHTML);

    const addSightingButton = document.getElementById('add-sighting-button');
    const submitSightingButton = document.getElementById('submit-sighting-button');
    const useCurrentLocationButton = document.getElementById('use-current-location-button');
    const uploadImageButton = document.getElementById('upload-image-button');
    const cancelButton = document.getElementById('cancel-button');

    addSightingButton.addEventListener('click', () => {
        document.getElementById('add-sighting-modal').style.display = 'flex';
    });

    cancelButton.addEventListener('click', () => {
        document.getElementById('add-sighting-modal').style.display = 'none';
    });

    useCurrentLocationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                currentLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
                map.setCenter(currentLocation);
                addUserLocationMarker(currentLocation);
            }, error => {
                console.error('Error getting location:', error);
                alert('Error getting location.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
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
                        document.getElementById('add-sighting-modal').style.display = 'none';
                        document.getElementById('description-input').value = '';
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
});
